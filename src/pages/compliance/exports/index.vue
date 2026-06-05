<template>
  <div class="compliance-exports">
    <div class="compliance-exports__header">
      <h2 class="compliance-exports__title">合规导出记录</h2>
      <p class="compliance-exports__hint">对接 /admin/moderation/logs，筛选合规处置类操作审计留痕</p>
    </div>

    <el-form :inline="true" class="compliance-exports__form">
      <el-form-item label="动作">
        <el-select v-model="searchForm.action" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="item in actionOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人">
        <el-input v-model="searchForm.operatorId" placeholder="管理员ID" clearable style="width: 140px" />
      </el-form-item>
      <el-form-item label="对象ID">
        <el-input v-model="searchForm.targetId" placeholder="消息/会话/用户ID" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button :disabled="!logList.length" @click="exportCsv">导出 CSV</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="logList" border stripe @row-click="selectLog">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="动作" width="140">
        <template #default="{ row }">{{ actionLabel(row.action) }}</template>
      </el-table-column>
      <el-table-column prop="operatorId" label="操作人" width="130" />
      <el-table-column prop="targetId" label="对象ID" min-width="140" show-overflow-tooltip />
      <el-table-column prop="result" label="结果" width="80">
        <template #default="{ row }">
          <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click.stop="selectLog(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="compliance-exports__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />

    <el-drawer v-model="drawerVisible" title="处置详情" size="420px">
      <el-descriptions v-if="currentLog" :column="1" border size="small">
        <el-descriptions-item label="动作">{{ actionLabel(currentLog.action) }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog.operatorId }}</el-descriptions-item>
        <el-descriptions-item label="对象类型">{{ currentLog.targetType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="对象ID">{{ currentLog.targetId }}</el-descriptions-item>
        <el-descriptions-item label="工单ID">
          <el-button v-if="currentLog.caseId" link type="primary" @click="goCase(currentLog.caseId)">{{ currentLog.caseId }}</el-button>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="详情">{{ currentLog.detail || '-' }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentLog.createdAt }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="currentLog" class="drawer-actions">
        <el-button v-if="currentLog.action === 'delete_message'" type="primary" @click="goMessage">查看消息</el-button>
        <el-button v-if="currentLog.action === 'clear_conversation'" type="primary" @click="goSession">查看会话</el-button>
        <el-button v-if="currentLog.targetType === 'user'" type="primary" @click="goUser(currentLog.targetId)">用户360</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import type { IGetOperationLogListReq, IOperationLogInfo } from "@/types/api/moderation"
import { MODERATION_ACTION_LABELS } from "@/types/api/moderation"
import { ElMessage } from "element-plus"
import { getOperationLogListApi } from "@/api/moderation"

const ACTION_MAP = MODERATION_ACTION_LABELS

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const drawerVisible = ref(false)
    const logList = ref<IOperationLogInfo[]>([])
    const currentLog = ref<IOperationLogInfo | null>(null)
    const searchForm = reactive({ action: "", operatorId: "", targetId: "" })
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const actionOptions = Object.entries(ACTION_MAP).map(([value, label]) => ({ value, label }))

    const actionLabel = (action: string) => ACTION_MAP[action] || action

    const buildParams = (): IGetOperationLogListReq => {
      const params: IGetOperationLogListReq = {
        page: pagination.page,
        pageSize: pagination.pageSize
      }
      if (searchForm.action) {
        params.action = searchForm.action
      } else {
        params.actions = "delete_message,clear_conversation,handle_case,ban_user,unban_user,reject_report,escalate_report"
      }
      if (searchForm.operatorId) params.operatorId = searchForm.operatorId
      if (searchForm.targetId) params.targetId = searchForm.targetId
      return params
    }

    const fetchList = async () => {
      loading.value = true
      const res = await getOperationLogListApi(buildParams())
      loading.value = false
      if (res.code === 0) {
        logList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const handleReset = () => {
      searchForm.action = ""
      searchForm.operatorId = ""
      searchForm.targetId = ""
      handleSearch()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const selectLog = (row: IOperationLogInfo) => {
      currentLog.value = row
      drawerVisible.value = true
    }

    const exportCsv = () => {
      const header = ["ID", "动作", "操作人", "对象ID", "结果", "详情", "时间"]
      const rows = logList.value.map(row => [
        row.id,
        actionLabel(row.action),
        row.operatorId,
        row.targetId,
        row.result,
        (row.detail || "").replace(/"/g, '""'),
        row.createdAt
      ])
      const csv = [header, ...rows].map(cols => cols.map(c => `"${c}"`).join(",")).join("\n")
      const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `compliance-logs-${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }

    const goCase = (caseId: number) => router.push({ path: "/safety/cases", query: { caseId: String(caseId) } })
    const goMessage = () => {
      if (!currentLog.value) return
      router.push({ path: "/compliance/messages", query: { messageId: currentLog.value.targetId } })
    }
    const goSession = () => {
      if (!currentLog.value) return
      router.push({ path: "/compliance/sessions", query: { conversationId: currentLog.value.targetId } })
    }
    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(fetchList)

    return {
      loading, drawerVisible, logList, currentLog, searchForm, pagination, actionOptions,
      actionLabel, handleSearch, handleReset, onPageChange, selectLog, exportCsv,
      goCase, goMessage, goSession, goUser
    }
  }
})
</script>

<style lang="less" scoped>
.compliance-exports {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__pagination { margin-top: 16px; justify-content: flex-end; }

  .drawer-actions {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
