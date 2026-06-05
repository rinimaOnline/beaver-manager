<template>
  <div class="safety-audit-logs">
    <div class="safety-audit-logs__header">
      <h2 class="safety-audit-logs__title">安全操作审计</h2>
      <p class="safety-audit-logs__hint">记录运营处置与联动管控的完整留痕，支持深链跳转</p>
    </div>

    <el-form :inline="true" class="safety-audit-logs__form">
      <el-form-item label="操作人">
        <el-input v-model="searchForm.operatorId" placeholder="管理员ID" clearable />
      </el-form-item>
      <el-form-item label="动作">
        <el-select v-model="searchForm.action" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="item in actionOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="工单ID">
        <el-input v-model="searchForm.caseId" placeholder="工单ID" clearable />
      </el-form-item>
      <el-form-item label="对象ID">
        <el-input v-model="searchForm.targetId" placeholder="用户/消息/会话ID" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button link type="primary" @click="goFullAudit">全量审计</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="logList" border stripe @row-click="selectLog">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="operatorId" label="操作人" width="120" />
      <el-table-column label="动作" width="130">
        <template #default="{ row }">{{ actionLabel(row.action) }}</template>
      </el-table-column>
      <el-table-column prop="targetType" label="对象类型" width="90" />
      <el-table-column prop="targetId" label="对象ID" min-width="120" show-overflow-tooltip />
      <el-table-column label="工单" width="70">
        <template #default="{ row }">
          <el-button v-if="row.caseId" link type="primary" @click.stop="goCase(row.caseId)">{{ row.caseId }}</el-button>
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
      class="safety-audit-logs__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />

    <el-drawer v-model="drawerVisible" title="审计详情" size="420px">
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
        <el-button v-if="currentLog.action === 'ban_user' || currentLog.action === 'unban_user'" type="primary" @click="goUser(currentLog.targetId)">用户360</el-button>
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

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const drawerVisible = ref(false)
    const currentLog = ref<IOperationLogInfo | null>(null)
    const logList = ref<IOperationLogInfo[]>([])
    const searchForm = reactive({ operatorId: "", action: "", caseId: "", targetId: "" })
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const actionOptions = Object.entries(MODERATION_ACTION_LABELS).map(([value, label]) => ({ value, label }))
    const actionLabel = (action: string) => MODERATION_ACTION_LABELS[action] || action

    const buildParams = (): IGetOperationLogListReq => ({
      page: pagination.page,
      pageSize: pagination.pageSize,
      operatorId: searchForm.operatorId || undefined,
      action: searchForm.action || undefined,
      caseId: searchForm.caseId ? Number.parseInt(searchForm.caseId, 10) : undefined,
      targetId: searchForm.targetId || undefined
    })

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
      searchForm.caseId = ""
      searchForm.targetId = ""
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

    const goCase = (caseId: number) => router.push({ path: "/safety/cases", query: { caseId: String(caseId) } })
    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goMessage = () => {
      if (!currentLog.value) return
      router.push({ path: "/compliance/messages", query: { messageId: currentLog.value.targetId } })
    }
    const goSession = () => {
      if (!currentLog.value) return
      router.push({ path: "/compliance/sessions", query: { conversationId: currentLog.value.targetId } })
    }
    const goFullAudit = () => router.push("/system/audit-logs")

    onMounted(fetchLogs)

    return {
      loading, drawerVisible, currentLog, logList, searchForm, pagination, actionOptions,
      actionLabel, handleSearch, handleReset, onPageChange, selectLog,
      goCase, goUser, goMessage, goSession, goFullAudit
    }
  }
})
</script>

<style lang="less" scoped>
.safety-audit-logs {
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
