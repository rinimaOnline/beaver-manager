<template>
  <div class="safety-reports">
    <div class="page-header">
      <h2>举报中心</h2>
      <p class="hint">受理全类型内容举报，可立案、驳回或下钻处置上下文</p>
    </div>

    <el-form :inline="true" class="search-form">
      <el-form-item label="状态">
        <el-select v-model="filters.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="待处理" :value="1" />
          <el-option label="已立案" :value="2" />
          <el-option label="已驳回" :value="3" />
          <el-option label="已结案" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="对象类型">
        <el-select v-model="filters.targetType" placeholder="全部" clearable style="width: 110px">
          <el-option label="用户" :value="1" />
          <el-option label="消息" :value="2" />
          <el-option label="动态" :value="3" />
          <el-option label="群组" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="对象ID">
        <el-input v-model="filters.targetId" placeholder="精确匹配" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="goCases">工单中心</el-button>
      </el-form-item>
    </el-form>

    <div class="page-body">
      <el-table
        v-loading="loading"
        :data="reportList"
        border
        stripe
        highlight-current-row
        :row-class-name="rowClassName"
        @row-click="selectReport"
      >
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="举报人" width="130">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="goUser(row.reporterUserId)">
              {{ row.reporterName || row.reporterUserId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">{{ targetTypeLabel(row.targetType) }}</template>
        </el-table-column>
        <el-table-column prop="targetId" label="对象ID" min-width="140" show-overflow-tooltip />
        <el-table-column label="原因" width="90">
          <template #default="{ row }">{{ reasonLabel(row.reasonType) }}</template>
        </el-table-column>
        <el-table-column prop="content" label="描述" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="selectReport(row)">详情</el-button>
            <el-button v-if="row.status === 1" type="warning" link @click.stop="escalate(row)">立案</el-button>
            <el-button v-if="row.status === 1" type="info" link @click.stop="openReject(row)">驳回</el-button>
            <el-button v-if="row.caseId" type="success" link @click.stop="goCase(row)">工单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        background
        layout="total, prev, pager, next"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        :current-page="pagination.page"
        @current-change="onPageChange"
      />

      <aside v-if="currentReport" class="detail-panel">
        <div class="detail-panel__header">
          <h3>举报 #{{ currentReport.id }}</h3>
          <el-tag :type="statusTag(currentReport.status)" size="small">{{ statusLabel(currentReport.status) }}</el-tag>
        </div>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="举报人">
            <el-link type="primary" @click="goUser(currentReport.reporterUserId)">
              {{ currentReport.reporterName || currentReport.reporterUserId }}
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item label="对象类型">{{ targetTypeLabel(currentReport.targetType) }}</el-descriptions-item>
          <el-descriptions-item label="对象ID">{{ currentReport.targetId }}</el-descriptions-item>
          <el-descriptions-item label="举报原因">{{ reasonLabel(currentReport.reasonType) }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ currentReport.content || '-' }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentReport.createdAt }}</el-descriptions-item>
          <el-descriptions-item v-if="currentReport.caseId" label="关联工单">
            <el-button type="primary" link @click="goCase(currentReport)">{{ currentReport.caseId }}</el-button>
          </el-descriptions-item>
        </el-descriptions>
        <div class="detail-panel__actions">
          <el-button v-if="currentReport.status === 1" type="warning" @click="escalate(currentReport)">立案</el-button>
          <el-button v-if="currentReport.status === 1" @click="openReject(currentReport)">驳回</el-button>
          <el-button type="primary" @click="goTarget(currentReport)">查看对象</el-button>
          <el-button @click="goDetailCase(currentReport)">进入处置</el-button>
        </div>
      </aside>
    </div>

    <el-dialog v-model="rejectVisible" title="驳回举报" width="480px">
      <el-form label-width="80px">
        <el-form-item label="备注">
          <el-input v-model="rejectRemark" type="textarea" :rows="3" placeholder="驳回原因说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" :loading="rejectLoading" @click="submitReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IContentReportInfo } from "@/types/api/moderation"
import { ElMessage, ElMessageBox } from "element-plus"
import { escalateContentReportApi, getContentReportListApi, rejectContentReportApi } from "@/api/moderation"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const rejectLoading = ref(false)
    const rejectVisible = ref(false)
    const rejectRemark = ref("")
    const rejectTarget = ref<IContentReportInfo | null>(null)
    const highlightId = ref<number | null>(null)
    const currentReport = ref<IContentReportInfo | null>(null)
    const filters = reactive({
      status: 1 as number | undefined,
      targetType: undefined as number | undefined,
      targetId: ""
    })
    const reportList = ref<IContentReportInfo[]>([])
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const targetTypeLabel = (t: number) => {
      const map: Record<number, string> = { 1: "用户", 2: "消息", 3: "动态", 4: "群组" }
      return map[t] || `类型${t}`
    }
    const reasonLabel = (r: number) => {
      const map: Record<number, string> = { 1: "垃圾信息", 2: "骚扰辱骂", 3: "违法违规", 4: "色情低俗", 5: "其他" }
      return map[r] || `原因${r}`
    }
    const statusLabel = (s: number) => {
      const map: Record<number, string> = { 1: "待处理", 2: "已立案", 3: "已驳回", 4: "已结案" }
      return map[s] || "未知"
    }
    const statusTag = (s: number) => (s === 1 ? "warning" : s === 3 ? "info" : "success")

    const rowClassName = ({ row }: { row: IContentReportInfo }) => {
      return row.id === highlightId.value ? "safety-reports__row--highlight" : ""
    }

    const fetchList = async () => {
      loading.value = true
      const res = await getContentReportListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: filters.status,
        targetType: filters.targetType,
        targetId: filters.targetId || undefined
      })
      loading.value = false
      if (res.code === 0) {
        reportList.value = res.result.list || []
        pagination.total = res.result.total || 0
        if (currentReport.value) {
          const matched = reportList.value.find(r => r.id === currentReport.value!.id)
          currentReport.value = matched || null
        }
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const handleReset = () => {
      filters.status = 1
      filters.targetType = undefined
      filters.targetId = ""
      handleSearch()
    }

    const onPageChange = (p: number) => {
      pagination.page = p
      fetchList()
    }

    const selectReport = (row: IContentReportInfo) => {
      currentReport.value = row
      highlightId.value = row.id
    }

    const escalate = async (row: IContentReportInfo) => {
      await ElMessageBox.confirm("确认立案并创建处置工单？", "立案", { type: "warning" })
      const res = await escalateContentReportApi({ reportId: row.id })
      if (res.code === 0) {
        ElMessage.success(`已立案: ${res.result.caseNo}`)
        await fetchList()
        router.push({ path: "/safety/cases", query: { caseId: String(res.result.caseId) } })
      } else {
        ElMessage.error(res.msg || "立案失败")
      }
    }

    const openReject = (row: IContentReportInfo) => {
      rejectTarget.value = row
      rejectRemark.value = ""
      rejectVisible.value = true
    }

    const submitReject = async () => {
      if (!rejectTarget.value) return
      rejectLoading.value = true
      const res = await rejectContentReportApi({
        reportId: rejectTarget.value.id,
        handleRemark: rejectRemark.value || undefined
      })
      rejectLoading.value = false
      if (res.code === 0) {
        ElMessage.success("已驳回")
        rejectVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "驳回失败")
      }
    }

    const goUser = (userId: string) => {
      if (userId) router.push(`/user/profile/${userId}`)
    }

    const goCase = (row: IContentReportInfo) => {
      router.push({ path: "/safety/cases", query: { reportId: String(row.id) } })
    }

    const goDetailCase = (row: IContentReportInfo) => {
      router.push({ path: "/safety/cases", query: { reportId: String(row.id) } })
    }

    const goTarget = (row: IContentReportInfo) => {
      switch (row.targetType) {
        case 1:
          goUser(row.targetId)
          break
        case 2:
          router.push({ path: "/compliance/messages", query: { messageId: row.targetId } })
          break
        case 3:
          router.push({ path: "/community/moments", query: { momentId: row.targetId } })
          break
        case 4:
          router.push(`/group/profile/${row.targetId}`)
          break
      }
    }

    const goCases = () => router.push("/safety/cases")

    onMounted(() => {
      const qReportId = route.query.reportId as string
      const qTargetType = route.query.targetType as string
      const qTargetId = route.query.targetId as string
      if (qReportId) {
        highlightId.value = Number.parseInt(qReportId, 10)
        filters.status = undefined
      }
      if (qTargetType) filters.targetType = Number.parseInt(qTargetType, 10)
      if (qTargetId) filters.targetId = qTargetId
      fetchList().then(() => {
        if (highlightId.value) {
          const matched = reportList.value.find(r => r.id === highlightId.value)
          if (matched) selectReport(matched)
        }
      })
    })

    return {
      loading, rejectLoading, rejectVisible, rejectRemark, filters, reportList, pagination,
      currentReport, targetTypeLabel, reasonLabel, statusLabel, statusTag, rowClassName,
      handleSearch, handleReset, onPageChange, selectReport, escalate, openReject, submitReject,
      goUser, goCase, goDetailCase, goTarget, goCases
    }
  }
})
</script>

<style lang="less" scoped>
.safety-reports {
  padding: 20px;

  .page-header {
    margin-bottom: 16px;
    h2 { margin: 0 0 4px; }
    .hint { color: #909399; font-size: 13px; margin: 0; }
  }

  .search-form { margin-bottom: 12px; }

  .page-body {
    display: flex;
    gap: 16px;
    align-items: flex-start;

    .el-table { flex: 1; min-width: 0; }
  }

  .detail-panel {
    width: 320px;
    flex-shrink: 0;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 16px;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      h3 { margin: 0; font-size: 15px; }
    }

    &__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
  }

  .pagination { margin-top: 16px; justify-content: flex-end; width: 100%; }

  :deep(.safety-reports__row--highlight) {
    background-color: #ecf5ff;
  }
}
</style>
