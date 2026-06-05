<template>
  <div class="data-events">
    <div class="data-events__header">
      <h2 class="data-events__title">事件查询</h2>
      <p class="data-events__hint">按 Bucket 与时间范围检索埋点事件，支持导出 CSV</p>
    </div>

    <el-form :inline="true" class="data-events__form">
      <el-form-item label="Bucket">
        <el-select v-model="searchForm.bucketId" placeholder="选择 Bucket" style="width: 200px" clearable>
          <el-option v-for="b in bucketList" :key="b.uuid" :label="b.name" :value="b.uuid" />
        </el-select>
      </el-form-item>
      <el-form-item label="事件名">
        <el-input v-model="searchForm.eventName" placeholder="事件名称" clearable style="width: 140px" />
      </el-form-item>
      <el-form-item label="操作">
        <el-input v-model="searchForm.action" placeholder="action" clearable style="width: 120px" />
      </el-form-item>
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userFilter" placeholder="用户ID" clearable style="width: 140px" />
      </el-form-item>
      <el-form-item label="平台">
        <el-input v-model="searchForm.platform" placeholder="平台" clearable style="width: 120px" />
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="searchForm.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始"
          end-placeholder="结束"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 360px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button :disabled="!eventList.length" @click="exportCsv">导出</el-button>
        <el-button link type="primary" @click="goBuckets">Bucket</el-button>
        <el-button link type="primary" @click="goLogs">日志</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="eventList" border stripe>
      <el-table-column prop="eventName" label="事件" width="140" />
      <el-table-column prop="action" label="操作" width="100" />
      <el-table-column prop="userId" label="用户ID" width="140" show-overflow-tooltip />
      <el-table-column prop="bucketName" label="Bucket" width="120" />
      <el-table-column prop="platform" label="平台" width="100" />
      <el-table-column prop="deviceId" label="设备ID" min-width="160" show-overflow-tooltip />
      <el-table-column label="时间戳" width="170">
        <template #default="{ row }">{{ formatTs(row.timestamp) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.userId" link type="primary" @click="goUser(row.userId)">用户360</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="data-events__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :page-sizes="[20, 50, 100]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />
  </div>
</template>

<script lang="ts">
import type { IBucketInfo, IEventInfo } from "@/types/api/track"
import { ElMessage } from "element-plus"
import { getBucketListApi, getEventListApi } from "@/api/track"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const eventList = ref<IEventInfo[]>([])
    const bucketList = ref<IBucketInfo[]>([])
    const searchForm = reactive({
      bucketId: "",
      eventName: "",
      action: "",
      userFilter: "",
      platform: "",
      timeRange: [] as string[]
    })
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const fetchBucketList = async () => {
      const res = await getBucketListApi({ page: 1, pageSize: 100 })
      if (res.code === 0) {
        bucketList.value = res.result.list || []
      }
    }

    const fetchEventList = async () => {
      if (!searchForm.bucketId) {
        ElMessage.warning("请选择 Bucket")
        return
      }
      if (!searchForm.timeRange?.length) {
        ElMessage.warning("请选择时间范围")
        return
      }
      loading.value = true
      const res = await getEventListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        bucketId: searchForm.bucketId,
        eventName: searchForm.eventName || undefined,
        action: searchForm.action || undefined,
        userFilter: searchForm.userFilter || undefined,
        platform: searchForm.platform || undefined,
        startTime: new Date(searchForm.timeRange[0]).getTime(),
        endTime: new Date(searchForm.timeRange[1]).getTime()
      })
      loading.value = false
      if (res.code === 0) {
        eventList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "查询失败")
      }
    }

    const formatTs = (ts: number) => (ts ? new Date(ts).toLocaleString() : "-")

    const handleSearch = () => {
      pagination.page = 1
      fetchEventList()
    }

    const handleReset = () => {
      Object.assign(searchForm, { bucketId: "", eventName: "", action: "", userFilter: "", platform: "", timeRange: [] })
      eventList.value = []
      pagination.total = 0
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchEventList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchEventList()
    }

    const exportCsv = () => {
      const header = ["事件", "操作", "用户ID", "Bucket", "平台", "设备ID", "时间戳"].join(",")
      const rows = eventList.value.map(e =>
        [e.eventName, e.action, e.userId, e.bucketName, e.platform, e.deviceId, e.timestamp].join(",")
      )
      const blob = new Blob([`${header}\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `events_${Date.now()}.csv`
      link.click()
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goBuckets = () => router.push("/data/buckets")
    const goLogs = () => router.push({ path: "/data/logs", query: { bucketId: searchForm.bucketId } })

    onMounted(async () => {
      await fetchBucketList()
      const qBucket = route.query.bucketId as string
      if (qBucket) {
        searchForm.bucketId = qBucket
      }
    })

    return {
      loading, eventList, bucketList, searchForm, pagination,
      handleSearch, handleReset, onSizeChange, onPageChange, exportCsv,
      formatTs, goUser, goBuckets, goLogs
    }
  }
})
</script>

<style lang="less">
.data-events {
  padding: 20px;

  .data-events__header {
    margin-bottom: 16px;

    .data-events__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .data-events__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .data-events__form {
    margin-bottom: 12px;
  }

  .data-events__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
