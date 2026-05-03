<template>
  <div class="webhook-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Webhook 日志</span>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="应用">
          <el-select
            v-model="searchForm.appId"
            placeholder="请选择应用"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="app in appList"
              :key="app.appId"
              :label="app.name"
              :value="app.appId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="事件类型">
          <el-select
            v-model="searchForm.eventType"
            placeholder="请选择事件类型"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="消息事件" value="message" />
            <el-option label="好友事件" value="friend" />
            <el-option label="群组事件" value="group" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="logList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="日志ID" width="280" />
        <el-table-column prop="eventType" label="事件类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getEventTypeLabel(row.eventType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="responseCode" label="响应码" width="100">
          <template #default="{ row }">
            <el-tag :type="row.responseCode === 200 ? 'success' : 'danger'">
              {{ row.responseCode }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="retryCount" label="重试次数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发送时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="Webhook 详情"
      width="800px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="日志ID">
          {{ currentLog?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="事件类型">
          {{ currentLog ? getEventTypeLabel(currentLog.eventType) : '' }}
        </el-descriptions-item>
        <el-descriptions-item label="响应码">
          <el-tag :type="currentLog?.responseCode === 200 ? 'success' : 'danger'">
            {{ currentLog?.responseCode }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="重试次数">
          {{ currentLog?.retryCount }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentLog?.status === 1 ? 'success' : 'danger'">
            {{ currentLog?.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          {{ currentLog?.createdAt ? formatTime(currentLog.createdAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="请求载荷">
          <el-input
            v-model="formattedPayload"
            type="textarea"
            :rows="6"
            readonly
          />
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import {
  getWebhookLogsApi,
  getAppListApi,
  type IWebhookLogItem,
  type IAppInfo
} from '@/api/open'

// 数据
const loading = ref(false)
const logList = ref<IWebhookLogItem[]>([])
const appList = ref<IAppInfo[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const searchForm = reactive({
  appId: '',
  eventType: ''
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentLog = ref<IWebhookLogItem | null>(null)

// 格式化 Payload
const formattedPayload = computed(() => {
  if (!currentLog.value?.payload) return ''
  try {
    return JSON.stringify(JSON.parse(currentLog.value.payload), null, 2)
  } catch {
    return currentLog.value.payload
  }
})

// 格式化时间
const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN')
}

// 获取事件类型标签
const getEventTypeLabel = (eventType: string) => {
  const map: Record<string, string> = {
    message: '消息事件',
    friend: '好友事件',
    group: '群组事件'
  }
  return map[eventType] || eventType
}

// 加载应用列表
const loadAppList = async () => {
  try {
    const res = await getAppListApi({ page: 1, pageSize: 100 })
    appList.value = res.result.list
  } catch (error) {
    console.error('加载应用列表失败', error)
  }
}

// 加载 Webhook 日志
const loadWebhookLogs = async () => {
  loading.value = true
  try {
    const res = await getWebhookLogsApi({
      appId: searchForm.appId,
      eventType: searchForm.eventType,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    logList.value = res.result.list
    pagination.total = res.result.total
  } catch (error) {
    ElMessage.error('加载 Webhook 日志失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadWebhookLogs()
}

// 重置
const handleReset = () => {
  searchForm.appId = ''
  searchForm.eventType = ''
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  loadWebhookLogs()
}

// 分页
const handleSizeChange = () => {
  loadWebhookLogs()
}

const handlePageChange = () => {
  loadWebhookLogs()
}

// 查看详情
const handleViewDetail = (row: IWebhookLogItem) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  loadAppList()
  loadWebhookLogs()
})
</script>

<style scoped lang="less">
.webhook-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
