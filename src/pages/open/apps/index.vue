<template>
  <div class="open-apps">
    <div class="open-apps__header">
      <h2 class="open-apps__title">开放平台应用</h2>
      <el-tag type="info">共 {{ pagination.total }} 个</el-tag>
    </div>

    <el-form :inline="true" class="open-apps__form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="应用名称" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="所有者ID">
        <el-input v-model="searchForm.ownerUserId" placeholder="用户ID" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="AppID">
        <el-input v-model="searchForm.appId" placeholder="精确匹配" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="能力">
        <el-select v-model="searchForm.capabilityType" placeholder="全部" clearable style="width: 130px">
          <el-option label="机器人" :value="OPEN_CAPABILITY_TYPE.ROBOT" />
          <el-option label="Webhook" :value="OPEN_CAPABILITY_TYPE.WEBHOOK" />
          <el-option label="Robot/Webhook" :value="OPEN_CAPABILITY_TYPE.ROBOT_OR_WEBHOOK" />
        </el-select>
      </el-form-item>
      <el-form-item label="应用状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="草稿" :value="1" />
          <el-option label="已发布" :value="2" />
          <el-option label="已禁用" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable style="width: 120px">
          <el-option label="待审核" :value="1" />
          <el-option label="已通过" :value="2" />
          <el-option label="已拒绝" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button link type="primary" @click="goDevelopers">开发者审核</el-button>
        <el-button link type="primary" @click="goIntegrations">集成管理</el-button>
      </el-form-item>
    </el-form>

    <div class="open-apps__toolbar">
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchStatus(3)">批量禁用</el-button>
      <el-button type="success" :disabled="!selectedIds.length" @click="handleBatchStatus(4)">批量启用</el-button>
    </div>

    <el-table v-loading="loading" :data="appList" border stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="appId" label="应用ID" min-width="140" show-overflow-tooltip />
      <el-table-column prop="name" label="应用名称" min-width="140" />
      <el-table-column prop="ownerUserName" label="所有者" width="120" />
      <el-table-column prop="ownerUserId" label="所有者ID" width="140" show-overflow-tooltip />
      <el-table-column label="应用状态" width="100">
        <template #default="{ row }">
          <el-tag :type="(APP_STATUS[row.status]?.type as any) || 'info'" size="small">{{ APP_STATUS[row.status]?.text || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="100">
        <template #default="{ row }">
          <el-tag :type="(AUDIT_STATUS[row.auditStatus]?.type as any) || 'info'" size="small">{{ AUDIT_STATUS[row.auditStatus]?.text || row.auditStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="能力" width="160">
        <template #default="{ row }">
          <el-tag v-if="row.enableRobot" size="small" class="open-apps__cap">Robot</el-tag>
          <el-tag v-if="row.enableOAuth" size="small" type="success" class="open-apps__cap">OAuth</el-tag>
          <el-tag v-if="row.enableWebhook" size="small" type="warning" class="open-apps__cap">Webhook</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.ownerUserId)">用户360</el-button>
          <el-button v-if="row.enableRobot || row.enableWebhook" link @click="goIntegrationsApp(row.appId)">集成</el-button>
          <el-button v-if="row.auditStatus === 0" link type="primary" @click="handleAudit(row)">审核</el-button>
          <el-text v-else type="info">已审核</el-text>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无应用数据" />
      </template>
    </el-table>

    <el-pagination
      class="open-apps__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />

    <el-dialog v-model="auditDialogVisible" title="审核应用" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="应用名称">{{ currentApp?.name }}</el-descriptions-item>
        <el-descriptions-item label="应用ID">{{ currentApp?.appId }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentApp?.description || "-" }}</el-descriptions-item>
      </el-descriptions>
      <el-form style="margin-top: 16px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="auditForm.auditRemark" type="textarea" :rows="3" placeholder="审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IOpenAppInfo } from "@/types/api/open"
import { OPEN_CAPABILITY_TYPE } from "@/types/api/open"
import { ElMessage, ElMessageBox } from "element-plus"
import { auditOpenAppApi, getOpenAppListApi, updateOpenAppStatusApi } from "@/api/open"

const APP_STATUS: Record<number, { text: string; type: string }> = {
  0: { text: "草稿", type: "info" },
  1: { text: "已发布", type: "success" },
  2: { text: "已禁用", type: "danger" }
}

const AUDIT_STATUS: Record<number, { text: string; type: string }> = {
  0: { text: "待审核", type: "warning" },
  1: { text: "已通过", type: "success" },
  2: { text: "已拒绝", type: "danger" }
}

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const appList = ref<IOpenAppInfo[]>([])
    const selectedIds = ref<string[]>([])
    const auditDialogVisible = ref(false)
    const currentApp = ref<IOpenAppInfo | null>(null)
    const auditForm = reactive({ status: 1, auditRemark: "" })
    const searchForm = reactive({
      keyword: "",
      ownerUserId: "",
      appId: "",
      capabilityType: undefined as number | undefined,
      status: undefined as number | undefined,
      auditStatus: undefined as number | undefined
    })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const formatTime = (ts: number) => (ts ? new Date(ts).toLocaleString() : "-")

    const fetchAppList = async () => {
      loading.value = true
      const res = await getOpenAppListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        ownerUserId: searchForm.ownerUserId || undefined,
        appId: searchForm.appId || undefined,
        capabilityType: searchForm.capabilityType,
        status: searchForm.status,
        auditStatus: searchForm.auditStatus
      })
      loading.value = false
      if (res.code === 0) {
        appList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取应用列表失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchAppList()
    }

    const handleReset = () => {
      searchForm.keyword = ""
      searchForm.ownerUserId = ""
      searchForm.appId = ""
      searchForm.capabilityType = undefined
      searchForm.status = undefined
      searchForm.auditStatus = undefined
      handleSearch()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchAppList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchAppList()
    }

    const handleSelectionChange = (rows: IOpenAppInfo[]) => {
      selectedIds.value = rows.map(r => r.appId)
    }

    const handleAudit = (row: IOpenAppInfo) => {
      currentApp.value = row
      auditForm.status = 1
      auditForm.auditRemark = ""
      auditDialogVisible.value = true
    }

    const submitAudit = async () => {
      if (!currentApp.value) return
      const res = await auditOpenAppApi({
        appId: currentApp.value.appId,
        status: auditForm.status,
        auditRemark: auditForm.auditRemark
      })
      if (res.code === 0) {
        ElMessage.success("审核成功")
        auditDialogVisible.value = false
        fetchAppList()
      } else {
        ElMessage.error(res.msg || "审核失败")
      }
    }

    const handleBatchStatus = async (action: number) => {
      if (!selectedIds.value.length) {
        ElMessage.warning("请选择应用")
        return
      }
      const label = action === 3 ? "禁用" : "启用"
      await ElMessageBox.confirm(`确认批量${label} ${selectedIds.value.length} 个应用？`, "提示", { type: "warning" })
      const res = await updateOpenAppStatusApi({ appIds: selectedIds.value, action })
      if (res.code === 0) {
        ElMessage.success(`批量${label}成功`)
        fetchAppList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goDevelopers = () => router.push("/open/developers")
    const goIntegrations = () => router.push("/open/integrations")
    const goIntegrationsApp = (appId: string) => {
      router.push({ path: "/open/integrations", query: { appId } })
    }

    onMounted(() => {
      const qAudit = route.query.auditStatus as string
      const qAppId = route.query.appId as string
      if (qAudit) searchForm.auditStatus = Number(qAudit)
      if (qAppId) searchForm.appId = qAppId
      fetchAppList()
    })

    return {
      loading, appList, searchForm, pagination, selectedIds,
      auditDialogVisible, currentApp, auditForm, APP_STATUS, AUDIT_STATUS, OPEN_CAPABILITY_TYPE,
      formatTime, handleSearch, handleReset, onSizeChange, onPageChange,
      handleSelectionChange, handleAudit, submitAudit, handleBatchStatus,
      goUser, goDevelopers, goIntegrations, goIntegrationsApp
    }
  }
})
</script>

<style lang="less">
.open-apps {
  padding: 20px;

  .open-apps__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .open-apps__title {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 12px;
    }
  }

  .open-apps__form {
    margin-bottom: 12px;
  }

  .open-apps__toolbar {
    margin-bottom: 12px;
  }

  .open-apps__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .open-apps__cap {
    margin-right: 4px;
  }
}
</style>
