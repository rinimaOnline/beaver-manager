<script lang="ts">
import type { IEventInfo, IBucketInfo } from "@/types/api/track"
import type { IApiResponse } from "@/types/auth"

import { ElMessage } from "element-plus"
import {
  getBucketListApi,
  getEventListApi
} from "@/api/track"
import { TimeInterval } from "@/types/api/track"

export default defineComponent({
  setup() {
    // 响应式数据
    const loading = ref(false)
    const eventList = ref<IEventInfo[]>([])
    const bucketList = ref<IBucketInfo[]>([])
    const statsData = ref<any[]>([])

    // 搜索表单
    const searchForm = reactive({
      bucketId: "",
      eventName: "",
      action: "",
      userFilter: "",
      platform: "",
      timeRange: [] as string[]
    })

    // 统计查询表单
    const statsForm = reactive({
      bucketId: "",
      eventNames: [] as string[],
      actions: [] as string[],
      timeRange: [] as string[],
      interval: TimeInterval.HOUR,
      platform: ""
    })

    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 20,
      total: 0
    })

    // 当前标签页
    const activeTab = ref("events")

    // 获取 Bucket 列表
    const fetchBucketList = async () => {
      try {
        const response: IApiResponse<any> = await getBucketListApi({
          page: 1,
          pageSize: 100
        })

        if (response.code === 0) {
          bucketList.value = response.result.list
        }
      } catch (error) {
        console.error("获取 Bucket 列表失败:", error)
      }
    }

    // 获取事件列表
    const fetchEventList = async () => {
      if (!searchForm.bucketId || !searchForm.timeRange || searchForm.timeRange.length !== 2) {
        ElMessage.warning("请选择 Bucket 和时间范围")
        return
      }

      try {
        loading.value = true
        
        // 转换时间为毫秒级时间戳
        const startTime = new Date(searchForm.timeRange[0]).getTime()
        const endTime = new Date(searchForm.timeRange[1]).getTime()
        
        const response: IApiResponse<any> = await getEventListApi({
          page: pagination.page,
          pageSize: pagination.pageSize,
          bucketId: searchForm.bucketId,
          eventName: searchForm.eventName || undefined,
          action: searchForm.action || undefined,
          userFilter: searchForm.userFilter || undefined,
          platform: searchForm.platform || undefined,
          startTime: startTime,
          endTime: endTime
        })

        if (response.code === 0) {
          eventList.value = response.result.list
          pagination.total = response.result.total
        } else {
          ElMessage.error(response.msg || "获取事件列表失败")
        }
      } catch (error) {
        ElMessage.error((error as any)?.message || "获取事件列表失败")
      } finally {
        loading.value = false
      }
    }

    // 查询统计数据
    const fetchStats = async () => {
      ElMessage.warning("统计功能暂未实现")
    }

    // 工具函数
    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleString()
    }

    const formatDuration = (duration: number) => {
      return `${duration}ms`
    }

    const getBucketName = (bucketId: string) => {
      const bucket = bucketList.value.find(b => b.uuid === bucketId)
      return bucket?.name || bucketId
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchEventList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        bucketId: "",
        eventName: "",
        action: "",
        userFilter: "",
        platform: "",
        timeRange: []
      })
      eventList.value = []
      pagination.total = 0
    }

    const handleSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchEventList()
    }

    const handleCurrentChange = (page: number) => {
      pagination.page = page
      fetchEventList()
    }

    const handleStatsReset = () => {
      Object.assign(statsForm, {
        bucketId: "",
        eventNames: [],
        actions: [],
        timeRange: [],
        interval: TimeInterval.HOUR,
        platform: ""
      })
      statsData.value = []
    }

    const handleTabChange = (tabName: string) => {
      activeTab.value = tabName
      if (tabName === "events") {
        fetchEventList()
      }
    }

    // 导出数据
    const exportData = () => {
      if (activeTab.value === "events" && eventList.value.length > 0) {
        const csv = [
          ["事件名称", "操作", "用户ID", "Bucket", "平台", "设备ID", "时间戳", "创建时间"].join(","),
          ...eventList.value.map(event => [
            event.eventName,
            event.action,
            event.userId,
            event.bucketName,
            event.platform,
            event.deviceId,
            event.timestamp,
            event.createdAt
          ].join(","))
        ].join("\n")

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `events_${new Date().getTime()}.csv`
        link.click()
      } else if (activeTab.value === "stats" && statsData.value.length > 0) {
        const csv = [
          ["时间", "事件名称", "操作", "平台", "计数", "平均持续时间"].join(","),
          ...statsData.value.map(stat => [
            stat.timeKey,
            stat.eventName,
            stat.action,
            stat.platform,
            stat.count,
            stat.avgDuration
          ].join(","))
        ].join("\n")

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `stats_${new Date().getTime()}.csv`
        link.click()
      }
    }

    // 初始化
    onMounted(() => {
      fetchBucketList()
    })

    return {
      loading,
      eventList,
      bucketList,
      statsData,
      searchForm,
      statsForm,
      pagination,
      activeTab,
      TimeInterval,
      fetchEventList,
      fetchStats,
      formatDate,
      formatDuration,
      getBucketName,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleStatsReset,
      handleTabChange,
      exportData
    }
  }
})
</script>

<template>
  <div class="track-stats">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 事件列表标签页 -->
      <el-tab-pane label="事件列表" name="events">
        <!-- 搜索区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline>
            <el-form-item label="Bucket" required>
              <el-select
                v-model="searchForm.bucketId"
                placeholder="请选择 Bucket"
                style="width: 200px"
              >
                <el-option
                  v-for="bucket in bucketList"
                  :key="bucket.uuid"
                  :label="bucket.name"
                  :value="bucket.uuid"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="事件名称">
              <el-input
                v-model="searchForm.eventName"
                placeholder="请输入事件名称"
                clearable
                style="width: 150px"
              />
            </el-form-item>
            <el-form-item label="操作">
              <el-input
                v-model="searchForm.action"
                placeholder="请输入操作"
                clearable
                style="width: 120px"
              />
            </el-form-item>
            <el-form-item label="用户ID">
              <el-input
                v-model="searchForm.userFilter"
                placeholder="请输入用户ID"
                clearable
                style="width: 150px"
              />
            </el-form-item>
            <el-form-item label="平台">
              <el-input
                v-model="searchForm.platform"
                placeholder="请输入平台"
                clearable
                style="width: 120px"
              />
            </el-form-item>
            <el-form-item label="时间范围" required>
              <el-date-picker
                v-model="searchForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 360px"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                :shortcuts="[
                  {
                    text: '最近1小时',
                    value: () => {
                      const end = new Date()
                      const start = new Date(end.getTime() - 60 * 60 * 1000)
                      return [start, end]
                    }
                  },
                  {
                    text: '最近24小时',
                    value: () => {
                      const end = new Date()
                      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
                      return [start, end]
                    }
                  },
                  {
                    text: '最近7天',
                    value: () => {
                      const end = new Date()
                      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
                      return [start, end]
                    }
                  },
                  {
                    text: '最近30天',
                    value: () => {
                      const end = new Date()
                      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
                      return [start, end]
                    }
                  }
                ]"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                搜索
              </el-button>
              <el-button @click="handleReset">
                重置
              </el-button>
              <el-button @click="exportData">
                导出
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
          <el-table
            v-loading="loading"
            :data="eventList"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="eventName" label="事件名称" width="120" />
            <el-table-column prop="action" label="操作" width="100" />
            <el-table-column prop="userId" label="用户ID" width="120" />
            <el-table-column prop="bucketName" label="Bucket" width="120" />
            <el-table-column prop="platform" label="平台" width="100" />
            <el-table-column prop="deviceId" label="设备ID" width="150" show-overflow-tooltip />
            <el-table-column label="时间戳" width="160">
              <template #default="{ row }">
                {{ formatDate(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(new Date(row.createdAt).getTime()) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页区域 -->
        <div class="pagination-section">
          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.pageSize"
            :page-sizes="[20, 50, 100, 200]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>

      <!-- 统计数据标签页 -->
      <el-tab-pane label="统计分析" name="stats">
        <!-- 统计查询区域 -->
        <div class="search-section">
          <el-form :model="statsForm" inline>
            <el-form-item label="Bucket" required>
              <el-select
                v-model="statsForm.bucketId"
                placeholder="请选择 Bucket"
                style="width: 200px"
              >
                <el-option
                  v-for="bucket in bucketList"
                  :key="bucket.uuid"
                  :label="bucket.name"
                  :value="bucket.uuid"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="事件名称">
              <el-select
                v-model="statsForm.eventNames"
                placeholder="请选择事件名称"
                multiple
                clearable
                style="width: 200px"
              >
                <!-- 这里需要根据选中的 Bucket 动态加载事件名称 -->
              </el-select>
            </el-form-item>
            <el-form-item label="操作">
              <el-select
                v-model="statsForm.actions"
                placeholder="请选择操作"
                multiple
                clearable
                style="width: 150px"
              >
                <!-- 这里需要根据选中的 Bucket 动态加载操作 -->
              </el-select>
            </el-form-item>
            <el-form-item label="平台">
              <el-input
                v-model="statsForm.platform"
                placeholder="请输入平台"
                clearable
                style="width: 120px"
              />
            </el-form-item>
            <el-form-item label="时间间隔">
              <el-select v-model="statsForm.interval" style="width: 100px">
                <el-option label="分钟" :value="TimeInterval.MINUTE" />
                <el-option label="小时" :value="TimeInterval.HOUR" />
                <el-option label="天" :value="TimeInterval.DAY" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围" required>
              <el-date-picker
                v-model="statsForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 360px"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                :shortcuts="[
                  {
                    text: '最近1小时',
                    value: () => {
                      const end = new Date()
                      const start = new Date(end.getTime() - 60 * 60 * 1000)
                      return [start, end]
                    }
                  },
                  {
                    text: '最近24小时',
                    value: () => {
                      const end = new Date()
                      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
                      return [start, end]
                    }
                  },
                  {
                    text: '最近7天',
                    value: () => {
                      const end = new Date()
                      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
                      return [start, end]
                    }
                  },
                  {
                    text: '最近30天',
                    value: () => {
                      const end = new Date()
                      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
                      return [start, end]
                    }
                  }
                ]"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchStats">
                查询统计
              </el-button>
              <el-button @click="handleStatsReset">
                重置
              </el-button>
              <el-button @click="exportData">
                导出
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 统计结果 -->
        <div class="table-section">
          <el-table
            v-loading="loading"
            :data="statsData"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="timeKey" label="时间" width="150" />
            <el-table-column prop="eventName" label="事件名称" width="120" />
            <el-table-column prop="action" label="操作" width="100" />
            <el-table-column prop="platform" label="平台" width="100" />
            <el-table-column prop="count" label="计数" width="100" />
            <el-table-column label="平均持续时间" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.avgDuration) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="less" scoped>
.track-stats {
  padding: 20px;
}

.search-section,
.table-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style> 