<template>
  <div class="system-audit-logs">
    <div class="system-audit-logs__header">
      <h2 class="system-audit-logs__title">全量操作审计</h2>
      <p class="system-audit-logs__hint">对接 /admin/moderation/logs 全量操作留痕，支持筛选、深链与 CSV 导出</p>
    </div>

    <el-form :inline="true" class="system-audit-logs__form">
      <el-form-item label="操作人">
        <el-input v-model="searchForm.operatorId" placeholder="管理员ID" clearable />
      </el-form-item>
      <el-form-item label="动作">
        <el-input v-model="searchForm.action" placeholder="如 ban_user" clearable style="width: 140px" />
      </el-form-item>
      <el-form-item label="对象类型">
        <el-input v-model="searchForm.targetType" placeholder="如 user" clearable style="width: 100px" />
      </el-form-item>
      <el-form-item label="对象ID">
        <el-input v-model="searchForm.targetId" placeholder="目标ID" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="工单ID">
        <el-input v-model="searchForm.caseId" placeholder="工单ID" clearable style="width: 100px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button :disabled="!logList.length" @click="exportCsv">导出 CSV</el-button>
        <el-button link type="primary" @click="goSafetyAudit">安全审计</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="logList" border stripe @row-click="selectLog">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="operatorId" label="操作人" width="120" />
      <el-table-column label="动作" width="140">
        <template #default="{ row }">{{ actionLabel(row.action) }}</template>
      </el-table-column>
      <el-table-column prop="targetType" label="对象类型" width="100" />
      <el-table-column prop="targetId" label="对象ID" min-width="120" show-overflow-tooltip />
      <el-table-column label="工单" width="70">
        <template #default="{ row }">
          <el-button v-if="row.caseId" type="primary" link @click.stop="goCase(row.caseId)">{{ row.caseId }}</el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="结果" width="80">
        <template #default="{ row }">
          <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="170" />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click.stop="selectLog(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="system-audit-logs__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />

    <el-drawer v-model="drawerVisible" title="审计详情" size="440px">
      <el-descriptions v-if="currentLog" :column="1" border size="small">
        <el-descriptions-item label="动作">{{ actionLabel(currentLog.action) }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog.operatorId }}</el-descriptions-item>
        <el-descriptions-item label="对象类型">{{ currentLog.targetType || "-" }}</el-descriptions-item>
        <el-descriptions-item label="对象ID">{{ currentLog.targetId }}</el-descriptions-item>
        <el-descriptions-item label="工单">
          <el-button v-if="currentLog.caseId" link type="primary" @click="goCase(currentLog.caseId)">{{ currentLog.caseId }}</el-button>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="结果">{{ currentLog.result }}</el-descriptions-item>
        <el-descriptions-item label="详情">{{ currentLog.detail || "-" }}</el-descriptions-item>
        <el-descriptions-item label="错误">{{ currentLog.errorMessage || "-" }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentLog.createdAt }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="currentLog" class="drawer-actions">
        <el-button v-if="currentLog.targetType === 'user' || currentLog.action.includes('user')" type="primary" @click="goUser(currentLog.targetId)">用户360</el-button>
        <el-button v-if="currentLog.action === 'delete_message'" type="primary" @click="goMessage">查看消息</el-button>
        <el-button v-if="currentLog.action === 'clear_conversation'" type="primary" @click="goSession">查看会话</el-button>
        <el-button v-if="currentLog.caseId" @click="goCase(currentLog.caseId)">查看工单</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import type { IGetOperationLogListReq, IOperationLogInfo } from "@/types/api/moderation"
import { MODERATION_ACTION_LABELS } from "@/types/api/moderation"
import { ElMessage } from "element-plus"
import { getOperationLogListApi } from "@/api/moderation"

const actionLabel = (action: string) => MODERATION_ACTION_LABELS[action] || action

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const drawerVisible = ref(false)
    const currentLog = ref<IOperationLogInfo | null>(null)
    const logList = ref<IOperationLogInfo[]>([])
    const searchForm = reactive({
      operatorId: "",
      action: "",
      targetType: "",
      targetId: "",
      caseId: ""
    })
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const buildParams = (): IGetOperationLogListReq => {
      const params: IGetOperationLogListReq = {
        page: pagination.page,
        pageSize: pagination.pageSize
      }
      if (searchForm.operatorId) params.operatorId = searchForm.operatorId
      if (searchForm.action) params.action = searchForm.action
      if (searchForm.targetType) params.targetType = searchForm.targetType
      if (searchForm.targetId) params.targetId = searchForm.targetId
      if (searchForm.caseId) params.caseId = Number.parseInt(searchForm.caseId, 10)
      return params
    }

    const fetchLogs = async () => {
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
      fetchLogs()
    }

    const handleReset = () => {
      searchForm.operatorId = ""
      searchForm.action = ""
      searchForm.targetType = ""
      searchForm.targetId = ""
      searchForm.caseId = ""
      handleSearch()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchLogs()
    }

    const selectLog = (row: IOperationLogInfo) => {
      currentLog.value = row
      drawerVisible.value = true
    }

    const exportCsv = () => {
      const header = ["ID", "动作", "操作人", "对象类型", "对象ID", "工单", "结果", "详情", "时间"]
      const rows = logList.value.map(row => [
        row.id,
        actionLabel(row.action),
        row.operatorId,
        row.targetType,
        row.targetId,
        row.caseId || "",
        row.result,
        (row.detail || "").replace(/"/g, '""'),
        row.createdAt
      ])
      const csv = [header, ...rows].map(cols => cols.map(c => `"${c}"`).join(",")).join("\n")
      const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `audit-logs-${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goCase = (caseId: number) => router.push({ path: "/safety/cases", query: { caseId: String(caseId) } })
    const goMessage = () => {
      if (!currentLog.value) return
      router.push({ path: "/compliance/messages", query: { messageId: currentLog.value.targetId } })
    }
    const goSession = () => {
      if (!currentLog.value) return
      router.push({ path: "/compliance/sessions", query: { conversationId: currentLog.value.targetId } })
    }
    const goSafetyAudit = () => router.push("/safety/audit-logs")

    onMounted(fetchLogs)

    return {
      loading, drawerVisible, currentLog, logList, searchForm, pagination,
      actionLabel, handleSearch, handleReset, onPageChange, selectLog, exportCsv,
      goUser, goCase, goMessage, goSession, goSafetyAudit
    }
  }
})
</script>

<style lang="less" scoped>
.system-audit-logs {
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
