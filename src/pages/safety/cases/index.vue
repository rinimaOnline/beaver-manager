<template>
  <div class="safety-cases">
    <div class="page-header">
      <div>
        <h2>运营处置中心</h2>
        <span class="hint">发现举报 → 立案工单 → 查看跨域上下文 → 联动管控 → 留痕结案</span>
      </div>
    </div>

    <div class="page-body">
      <!-- 左栏：举报 / 工单 -->
      <aside class="list-panel">
        <el-tabs v-model="activeTab" @tab-change="onTabChange">
          <el-tab-pane label="待处理举报" name="reports">
            <div class="filter-bar">
              <el-select v-model="reportFilter.status" placeholder="状态" clearable size="small" @change="loadReports">
                <el-option label="待处理" :value="1" />
                <el-option label="已立案" :value="2" />
                <el-option label="已驳回" :value="3" />
                <el-option label="已结案" :value="4" />
              </el-select>
            </div>
            <div v-loading="reportLoading" class="item-list">
              <div
                v-for="r in reportList"
                :key="r.id"
                class="list-item"
                :class="{ active: selectedReport?.id === r.id }"
                @click="selectReport(r)"
              >
                <div class="list-item__top">
                  <el-tag size="small">{{ targetTypeLabel(r.targetType) }}</el-tag>
                  <el-tag size="small" :type="reportStatusType(r.status)">{{ reportStatusLabel(r.status) }}</el-tag>
                </div>
                <div class="list-item__title">{{ r.reporterName || r.reporterUserId }} 举报</div>
                <div class="list-item__sub">对象: {{ r.targetId }}</div>
                <div class="list-item__preview">{{ r.content || '无描述' }}</div>
                <div class="list-item__time">{{ r.createdAt }}</div>
                <el-button
                  v-if="r.status === 1"
                  type="primary"
                  size="small"
                  link
                  @click.stop="escalateReport(r)"
                >
                  立案
                </el-button>
              </div>
              <el-empty v-if="!reportLoading && !reportList.length" description="暂无举报" :image-size="64" />
            </div>
            <el-pagination
              v-if="reportPagination.total > 0"
              small
              layout="prev, pager, next"
              :total="reportPagination.total"
              :page-size="reportPagination.pageSize"
              :current-page="reportPagination.page"
              @current-change="onReportPageChange"
            />
          </el-tab-pane>

          <el-tab-pane label="处置工单" name="cases">
            <div class="filter-bar">
              <el-input
                v-model="caseFilter.keyword"
                placeholder="工单号/标题/对象ID"
                size="small"
                clearable
                @keyup.enter="loadCases"
              />
              <el-select v-model="caseFilter.status" placeholder="状态" clearable size="small" @change="loadCases">
                <el-option label="待处理" :value="1" />
                <el-option label="处理中" :value="2" />
                <el-option label="已结案" :value="3" />
                <el-option label="已驳回" :value="4" />
              </el-select>
            </div>
            <div v-loading="caseLoading" class="item-list">
              <div
                v-for="c in caseList"
                :key="c.id"
                class="list-item"
                :class="{ active: selectedCase?.id === c.id }"
                @click="selectCase(c)"
              >
                <div class="list-item__top">
                  <span class="case-no">{{ c.caseNo }}</span>
                  <el-tag size="small" :type="caseStatusType(c.status)">{{ caseStatusLabel(c.status) }}</el-tag>
                </div>
                <div class="list-item__title">{{ c.title }}</div>
                <div class="list-item__sub">{{ targetTypeLabel(c.targetType) }} · {{ c.targetId }}</div>
                <div class="list-item__time">{{ c.createdAt }}</div>
              </div>
              <el-empty v-if="!caseLoading && !caseList.length" description="暂无工单" :image-size="64" />
            </div>
            <el-pagination
              v-if="casePagination.total > 0"
              small
              layout="prev, pager, next"
              :total="casePagination.total"
              :page-size="casePagination.pageSize"
              :current-page="casePagination.page"
              @current-change="onCasePageChange"
            />
          </el-tab-pane>
        </el-tabs>
      </aside>

      <!-- 中栏：跨域上下文 -->
      <section class="context-panel" v-loading="contextLoading">
        <template v-if="context">
          <div class="context-header">
            <h3>{{ context.case.caseNo }}</h3>
            <el-tag>{{ caseStatusLabel(context.case.status) }}</el-tag>
          </div>
          <el-descriptions :column="2" border size="small" class="case-desc">
            <el-descriptions-item label="标题">{{ context.case.title }}</el-descriptions-item>
            <el-descriptions-item label="对象类型">{{ targetTypeLabel(context.case.targetType) }}</el-descriptions-item>
            <el-descriptions-item label="对象ID">{{ context.case.targetId }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ context.case.description || '-' }}</el-descriptions-item>
          </el-descriptions>

          <div v-if="context.targetUser" class="context-block">
            <div class="block-title">目标用户</div>
            <p>
              <el-link type="primary" @click="goUser(context.targetUser.userId)">
                {{ context.targetUser.nickName }} ({{ context.targetUser.userId }})
              </el-link>
            </p>
            <p>邮箱: {{ context.targetUser.email || '-' }} · 状态: {{ userStatusLabel(context.targetUser.status) }}</p>
          </div>

          <div v-if="context.targetMessage" class="context-block">
            <div class="block-title">目标消息</div>
            <p>
              发送者:
              <el-link type="primary" @click="goUser(context.targetMessage.sendUserId)">
                {{ context.targetMessage.sendUserName || context.targetMessage.sendUserId }}
              </el-link>
            </p>
            <p>会话: {{ context.targetMessage.conversationId }}
              <el-button link type="primary" size="small" @click="goSession(context.targetMessage)">审计会话</el-button>
            </p>
            <p class="msg-preview">{{ context.targetMessage.msgPreview }}</p>
            <el-tag v-if="context.targetMessage.isDeleted" type="danger" size="small">已删除</el-tag>
          </div>

          <div v-if="context.targetMoment" class="context-block">
            <div class="block-title">目标动态</div>
            <p>
              作者:
              <el-link type="primary" @click="goUser(context.targetMoment.userId)">
                {{ context.targetMoment.userId }}
              </el-link>
            </p>
            <p class="msg-preview">{{ context.targetMoment.content }}</p>
            <el-button link type="primary" size="small" @click="goMoment(context.targetMoment.momentId)">查看动态</el-button>
          </div>

          <div v-if="context.targetGroup" class="context-block">
            <div class="block-title">目标群组</div>
            <p>
              <el-link type="primary" @click="goGroup(context.targetGroup.groupId)">
                {{ context.targetGroup.title }} ({{ context.targetGroup.groupId }})
              </el-link>
            </p>
            <p>状态: {{ context.targetGroup.status === 3 ? '已解散' : '正常' }}</p>
          </div>

          <div v-if="context.recentMessages?.length" class="context-block">
            <div class="block-title">会话近期消息</div>
            <div v-for="m in context.recentMessages" :key="m.messageId" class="timeline-msg">
              <span class="time">{{ m.createTime }}</span>
              <span class="sender">{{ m.sendUserName || m.sendUserId }}</span>
              <span class="content">{{ m.msgPreview }}</span>
              <el-tag v-if="m.isDeleted" type="info" size="small">删</el-tag>
            </div>
          </div>

          <div v-if="context.relatedReports?.length" class="context-block">
            <div class="block-title">关联举报 ({{ context.relatedReports.length }})</div>
            <div v-for="r in context.relatedReports" :key="r.id" class="report-row">
              {{ r.reporterName || r.reporterUserId }}: {{ r.content || '无描述' }}
            </div>
          </div>
        </template>
        <el-empty v-else description="选择举报立案或点击工单查看上下文" :image-size="100" />
      </section>

      <!-- 右栏：处置面板 -->
      <aside class="handle-panel">
        <div class="panel-title">处置操作</div>
        <template v-if="selectedCase || context">
          <el-form label-width="72px" size="small">
            <el-form-item label="结案状态">
              <el-select v-model="handleForm.status">
                <el-option label="处理中" :value="2" />
                <el-option label="已结案" :value="3" />
                <el-option label="驳回" :value="4" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="handleForm.remark" type="textarea" :rows="3" placeholder="处置说明" />
            </el-form-item>
            <el-form-item label="联动管控">
              <el-checkbox-group v-model="handleForm.selectedActions">
                <el-checkbox
                  v-for="a in suggestedActions"
                  :key="a.action"
                  :value="a.action"
                  :label="a.action"
                >
                  {{ a.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item v-if="needKickExtra" label="群ID">
              <el-input v-model="handleForm.kickGroupId" placeholder="踢人时需填写 groupId" />
            </el-form-item>
          </el-form>
          <el-button type="primary" :loading="handleLoading" @click="submitHandle">提交处置</el-button>
          <el-divider />
          <div class="quick-control">
            <div class="block-title">快捷用户管控</div>
            <el-input v-model="quickUserId" placeholder="用户ID" size="small" />
            <div class="quick-btns">
              <el-button size="small" type="danger" @click="quickBan">封禁</el-button>
              <el-button size="small" @click="quickUnban">解封</el-button>
            </div>
          </div>
        </template>
        <el-empty v-else description="请先选择工单" :image-size="80" />
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import type {
  IContentReportInfo,
  IGetModerationCaseContextRes,
  IModerationCaseInfo,
  IModerationControlAction
} from "@/types/api/moderation"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  escalateContentReportApi,
  executeUserControlApi,
  getContentReportListApi,
  getModerationCaseContextApi,
  getModerationCaseDetailApi,
  getModerationCaseListApi,
  handleModerationCaseApi
} from "@/api/moderation"

const TARGET_TYPE: Record<number, string> = { 1: "用户", 2: "消息", 3: "动态", 4: "群组" }
const REPORT_STATUS: Record<number, string> = { 1: "待处理", 2: "已立案", 3: "已驳回", 4: "已结案" }
const CASE_STATUS: Record<number, string> = { 1: "待处理", 2: "处理中", 3: "已结案", 4: "已驳回" }

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const activeTab = ref("reports")
    const reportLoading = ref(false)
    const caseLoading = ref(false)
    const contextLoading = ref(false)
    const handleLoading = ref(false)

    const reportList = ref<IContentReportInfo[]>([])
    const caseList = ref<IModerationCaseInfo[]>([])
    const selectedReport = ref<IContentReportInfo | null>(null)
    const selectedCase = ref<IModerationCaseInfo | null>(null)
    const context = ref<IGetModerationCaseContextRes | null>(null)

    const reportFilter = reactive({ status: 1 as number | undefined })
    const caseFilter = reactive({ keyword: "", status: undefined as number | undefined })
    const reportPagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const casePagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const handleForm = reactive({
      status: 3,
      remark: "",
      selectedActions: [] as string[],
      kickGroupId: ""
    })
    const quickUserId = ref("")

    const targetTypeLabel = (t: number) => TARGET_TYPE[t] || `类型${t}`
    const reportStatusLabel = (s: number) => REPORT_STATUS[s] || "未知"
    const caseStatusLabel = (s: number) => CASE_STATUS[s] || "未知"
    const userStatusLabel = (s: number) => (s === 2 ? "禁用" : s === 3 ? "已删除" : "正常")
    const reportStatusType = (s: number) => (s === 1 ? "warning" : s === 3 ? "info" : "success")
    const caseStatusType = (s: number) => (s === 1 ? "warning" : s === 3 ? "success" : s === 4 ? "info" : "")

    const currentCase = computed(() => selectedCase.value || context.value?.case || null)

    const suggestedActions = computed(() => {
      const c = currentCase.value
      if (!c) return []
      const target = c.targetId
      const actions: { action: string; label: string }[] = []
      switch (c.targetType) {
        case 1:
          actions.push({ action: "ban_user", label: "封禁用户" })
          actions.push({ action: "unban_user", label: "解封用户" })
          break
        case 2:
          actions.push({ action: "delete_message", label: "删除消息" })
          actions.push({ action: "clear_conversation", label: "清空会话" })
          actions.push({ action: "ban_user", label: "封禁发送者(需填target)" })
          break
        case 3:
          actions.push({ action: "delete_moment", label: "删除动态" })
          break
        case 4:
          actions.push({ action: "dissolve_group", label: "解散群组" })
          actions.push({ action: "kick_member", label: "踢出成员" })
          break
      }
      void target
      return actions
    })

    const needKickExtra = computed(() => handleForm.selectedActions.includes("kick_member"))

    const loadReports = async () => {
      reportLoading.value = true
      const res = await getContentReportListApi({
        page: reportPagination.page,
        pageSize: reportPagination.pageSize,
        status: reportFilter.status
      })
      reportLoading.value = false
      if (res.code === 0) {
        reportList.value = res.result.list || []
        reportPagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载举报失败")
      }
    }

    const loadCases = async () => {
      caseLoading.value = true
      const res = await getModerationCaseListApi({
        page: casePagination.page,
        pageSize: casePagination.pageSize,
        status: caseFilter.status,
        keyword: caseFilter.keyword || undefined
      })
      caseLoading.value = false
      if (res.code === 0) {
        caseList.value = res.result.list || []
        casePagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载工单失败")
      }
    }

    const loadContext = async (caseId: number) => {
      contextLoading.value = true
      const res = await getModerationCaseContextApi(caseId)
      contextLoading.value = false
      if (res.code === 0) {
        context.value = res.result
        quickUserId.value = res.result.targetUser?.userId
          || res.result.targetMessage?.sendUserId
          || res.result.targetMoment?.userId
          || ""
      } else {
        ElMessage.error(res.msg || "加载上下文失败")
      }
    }

    const selectReport = (r: IContentReportInfo) => {
      selectedReport.value = r
    }

    const selectCase = async (c: IModerationCaseInfo) => {
      selectedCase.value = c
      await loadContext(c.id)
    }

    const escalateReport = async (r: IContentReportInfo) => {
      await ElMessageBox.confirm("确认将该举报立案为处置工单？", "立案", { type: "warning" })
      const res = await escalateContentReportApi({ reportId: r.id })
      if (res.code === 0) {
        ElMessage.success(`已立案: ${res.result.caseNo}`)
        activeTab.value = "cases"
        await loadReports()
        await loadCases()
        const matched = caseList.value.find(c => c.id === res.result.caseId)
        if (matched) {
          await selectCase(matched)
        }
      } else {
        ElMessage.error(res.msg || "立案失败")
      }
    }

    const buildActions = (): IModerationControlAction[] => {
      const c = currentCase.value
      if (!c) return []
      return handleForm.selectedActions.map(action => {
        const item: IModerationControlAction = { action, reason: handleForm.remark }
        switch (action) {
          case "ban_user":
          case "unban_user":
            item.target = quickUserId.value || c.targetId
            break
          case "delete_message":
            item.target = c.targetId
            break
          case "clear_conversation":
            item.target = context.value?.targetMessage?.conversationId || c.targetId
            break
          case "delete_moment":
          case "dissolve_group":
            item.target = c.targetId
            break
          case "kick_member":
            item.target = quickUserId.value
            item.extra = handleForm.kickGroupId || c.targetId
            break
        }
        return item
      })
    }

    const submitHandle = async () => {
      const c = currentCase.value
      if (!c) return
      await ElMessageBox.confirm("确认提交处置？联动管控将立即执行。", "提交处置", { type: "warning" })
      handleLoading.value = true
      const res = await handleModerationCaseApi(c.id, {
        status: handleForm.status,
        handleRemark: handleForm.remark,
        actions: buildActions()
      })
      handleLoading.value = false
      if (res.code === 0) {
        ElMessage.success("处置成功")
        await loadCases()
        await loadContext(c.id)
        handleForm.selectedActions = []
      } else {
        ElMessage.error(res.msg || "处置失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    const goGroup = (groupId: string) => router.push(`/group/profile/${groupId}`)

    const goSession = (msg: { sendUserId: string; conversationId: string }) => {
      router.push({
        path: "/compliance/sessions",
        query: { userId: msg.sendUserId, conversationId: msg.conversationId }
      })
    }

    const goMoment = (momentId: string) => {
      router.push({ path: "/community/moments", query: { momentId } })
    }

    const quickControl = async (action: string) => {
      if (!quickUserId.value) {
        ElMessage.warning("请填写用户ID")
        return
      }
      const res = await executeUserControlApi({
        userId: quickUserId.value,
        action,
        caseId: currentCase.value?.id
      })
      if (res.code === 0) {
        ElMessage.success(action === "ban_user" ? "已封禁" : "已解封")
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const quickBan = () => quickControl("ban_user")
    const quickUnban = () => quickControl("unban_user")

    const onTabChange = () => {
      if (activeTab.value === "reports") loadReports()
      else loadCases()
    }
    const onReportPageChange = (p: number) => { reportPagination.page = p; loadReports() }
    const onCasePageChange = (p: number) => { casePagination.page = p; loadCases() }

    const applyRouteQuery = async () => {
      const qCaseId = route.query.caseId as string
      const qReportId = route.query.reportId as string
      if (qCaseId) {
        activeTab.value = "cases"
        const caseId = Number.parseInt(qCaseId, 10)
        if (Number.isNaN(caseId)) return
        await loadCases()
        const matched = caseList.value.find(c => c.id === caseId)
        if (matched) {
          await selectCase(matched)
          return
        }
        const detailRes = await getModerationCaseDetailApi(caseId)
        if (detailRes.code === 0 && detailRes.result.case) {
          selectedCase.value = detailRes.result.case
          await loadContext(caseId)
          return
        }
        const ctxRes = await getModerationCaseContextApi(caseId)
        if (ctxRes.code === 0 && ctxRes.result.case) {
          selectedCase.value = ctxRes.result.case
          context.value = ctxRes.result
          quickUserId.value = ctxRes.result.targetUser?.userId
            || ctxRes.result.targetMessage?.sendUserId
            || ctxRes.result.targetMoment?.userId
            || ""
        } else {
          ElMessage.warning("工单不在当前列表，请调整筛选条件")
        }
        return
      }
      if (qReportId) {
        activeTab.value = "reports"
        await loadReports()
        const reportId = Number.parseInt(qReportId, 10)
        const matched = reportList.value.find(r => r.id === reportId)
        if (matched) {
          selectReport(matched)
        }
      }
    }

    onMounted(async () => {
      await loadReports()
      await loadCases()
      await applyRouteQuery()
    })

    return {
      activeTab, reportLoading, caseLoading, contextLoading, handleLoading,
      reportList, caseList, selectedReport, selectedCase, context,
      reportFilter, caseFilter, reportPagination, casePagination,
      handleForm, quickUserId, suggestedActions, needKickExtra,
      targetTypeLabel, reportStatusLabel, caseStatusLabel, userStatusLabel,
      reportStatusType, caseStatusType,
      loadReports, loadCases, selectReport, selectCase, escalateReport,
      submitHandle, quickBan, quickUnban, goUser, goGroup, goSession, goMoment, onTabChange, onReportPageChange, onCasePageChange
    }
  }
})
</script>

<style lang="less" scoped>
.safety-cases {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);

  .page-header {
    padding: 0 0 12px;

    h2 {
      margin: 0 0 4px;
    }

    .hint {
      color: #909399;
      font-size: 13px;
    }
  }

  .page-body {
    display: flex;
    flex: 1;
    gap: 12px;
    min-height: 0;
  }

  .list-panel {
    width: 300px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
  }

  .context-panel {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    overflow-y: auto;
    min-width: 0;
  }

  .handle-panel {
    width: 280px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
  }

  .filter-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .item-list {
    flex: 1;
    overflow-y: auto;
    min-height: 200px;
  }

  .list-item {
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;

    &.active {
      border-color: #409eff;
      background: #ecf5ff;
    }

    &__top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    &__title {
      font-weight: 500;
      font-size: 13px;
    }

    &__sub,
    &__preview,
    &__time {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }

  .case-no {
    font-family: monospace;
    font-size: 12px;
  }

  .context-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .case-desc {
    margin-bottom: 16px;
  }

  .context-block {
    margin-bottom: 16px;
  }

  .block-title {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .msg-preview {
    background: #f5f7fa;
    padding: 8px;
    border-radius: 4px;
    font-size: 13px;
  }

  .timeline-msg {
    font-size: 12px;
    padding: 4px 0;
    border-bottom: 1px dashed #ebeef5;

    .time {
      color: #909399;
      margin-right: 8px;
    }

    .sender {
      font-weight: 500;
      margin-right: 8px;
    }
  }

  .report-row {
    font-size: 12px;
    padding: 4px 0;
    color: #606266;
  }

  .panel-title {
    font-weight: 600;
    margin-bottom: 12px;
  }

  .quick-control {
    margin-top: 8px;
  }

  .quick-btns {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
}
</style>
