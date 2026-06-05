<template>
  <div class="service-tickets">
    <div class="service-tickets__header">
      <h2 class="service-tickets__title">客诉工单</h2>
      <p class="service-tickets__hint">待办用户反馈，对接 /admin/feedback 接口受理与结案</p>
    </div>

    <el-form :inline="true" class="service-tickets__form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keywords" placeholder="内容关键词" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userId" placeholder="用户ID" clearable style="width: 150px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="待处理" :value="FeedbackStatus.PENDING" />
          <el-option label="处理中" :value="FeedbackStatus.IN_PROGRESS" />
          <el-option label="已解决" :value="FeedbackStatus.RESOLVED" />
          <el-option label="已拒绝" :value="FeedbackStatus.REJECTED" />
          <el-option label="已关闭" :value="FeedbackStatus.CLOSED" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button link type="primary" @click="goFeedback">全部反馈</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="ticketList" border stripe>
      <el-table-column prop="id" label="工单ID" width="80" />
      <el-table-column prop="userId" label="用户ID" min-width="130">
        <template #default="{ row }">
          <el-link type="primary" @click="goUser(row.userId)">{{ row.userId }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="反馈内容" min-width="220" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" width="170" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link @click="handleDetail(row)">详情</el-button>
          <el-button v-if="row.status <= FeedbackStatus.IN_PROGRESS" link type="primary" @click="handleProcess(row)">处理</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="service-tickets__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />

    <el-drawer v-model="detailVisible" title="工单详情" size="480px">
      <el-descriptions v-if="currentTicket" :column="1" border>
        <el-descriptions-item label="工单ID">{{ currentTicket.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">
          <el-button link type="primary" @click="goUser(currentTicket.userId)">{{ currentTicket.userId }}</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTag(currentTicket.status)" size="small">{{ statusLabel(currentTicket.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentTicket.handlerId || "未分配" }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentTicket.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="反馈内容">{{ currentTicket.content }}</el-descriptions-item>
        <el-descriptions-item v-if="currentTicket.handleResult" label="处理结果">{{ currentTicket.handleResult }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="currentTicket" class="drawer-actions">
        <el-button v-if="currentTicket.status <= FeedbackStatus.IN_PROGRESS" type="primary" @click="handleProcess(currentTicket)">处理工单</el-button>
        <el-button @click="goUser(currentTicket.userId)">用户360</el-button>
        <el-button @click="goSanctions(currentTicket.userId)">处置记录</el-button>
        <el-button v-if="currentTicket.status <= FeedbackStatus.IN_PROGRESS" type="danger" @click="handleDelete(currentTicket)">删除</el-button>
      </div>
    </el-drawer>

    <el-dialog v-model="processVisible" title="处理工单" width="480px">
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="90px">
        <el-form-item label="处理状态" prop="status">
          <el-select v-model="processForm.status" placeholder="请选择">
            <el-option label="处理中" :value="FeedbackStatus.IN_PROGRESS" />
            <el-option label="已解决" :value="FeedbackStatus.RESOLVED" />
            <el-option label="已拒绝" :value="FeedbackStatus.REJECTED" />
            <el-option label="已关闭" :value="FeedbackStatus.CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果" prop="handleResult">
          <el-input v-model="processForm.handleResult" type="textarea" :rows="4" placeholder="填写处理说明，处理人将自动记录为当前登录管理员" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitProcess">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { IFeedbackInfo } from "@/types/api/feedback"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteFeedbackApi, getFeedbackDetailApi, getFeedbackListApi, handleFeedbackApi } from "@/api/feedback"
import { FeedbackStatus } from "@/types/api/feedback"

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const submitting = ref(false)
    const ticketList = ref<IFeedbackInfo[]>([])
    const currentTicket = ref<IFeedbackInfo | null>(null)
    const detailVisible = ref(false)
    const processVisible = ref(false)
    const processFormRef = ref<FormInstance>()
    const searchForm = reactive({
      keywords: "",
      userId: "",
      status: FeedbackStatus.PENDING as number | undefined
    })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const processForm = reactive({ status: null as number | null, handleResult: "" })
    const processRules: FormRules = {
      status: [{ required: true, message: "请选择状态", trigger: "change" }],
      handleResult: [{ required: true, message: "请输入处理结果", trigger: "blur" }]
    }

    const statusLabel = (status: number) => {
      const map: Record<number, string> = {
        [FeedbackStatus.PENDING]: "待处理",
        [FeedbackStatus.IN_PROGRESS]: "处理中",
        [FeedbackStatus.RESOLVED]: "已解决",
        [FeedbackStatus.REJECTED]: "已拒绝",
        [FeedbackStatus.CLOSED]: "已关闭"
      }
      return map[status] || "未知"
    }
    const statusTag = (status: number) => {
      const map: Record<number, string> = {
        [FeedbackStatus.PENDING]: "warning",
        [FeedbackStatus.IN_PROGRESS]: "primary",
        [FeedbackStatus.RESOLVED]: "success",
        [FeedbackStatus.REJECTED]: "danger",
        [FeedbackStatus.CLOSED]: "info"
      }
      return map[status] || ""
    }

    const fetchList = async () => {
      loading.value = true
      const res = await getFeedbackListApi({
        page: pagination.page,
        limit: pagination.pageSize,
        keywords: searchForm.keywords || undefined,
        userId: searchForm.userId || undefined,
        status: searchForm.status
      })
      loading.value = false
      if (res.code === 0) {
        ticketList.value = res.result.list || []
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
      searchForm.keywords = ""
      searchForm.userId = ""
      searchForm.status = FeedbackStatus.PENDING
      handleSearch()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const handleDetail = async (row: IFeedbackInfo) => {
      const res = await getFeedbackDetailApi(row.id)
      if (res.code === 0) {
        currentTicket.value = res.result
        detailVisible.value = true
      } else {
        ElMessage.error(res.msg || "获取详情失败")
      }
    }

    const handleProcess = (row: IFeedbackInfo) => {
      currentTicket.value = row
      Object.assign(processForm, { status: FeedbackStatus.IN_PROGRESS, handleResult: "" })
      processVisible.value = true
    }

    const submitProcess = async () => {
      if (!processFormRef.value || !currentTicket.value || processForm.status === null) return
      await processFormRef.value.validate()
      submitting.value = true
      const res = await handleFeedbackApi(currentTicket.value.id, {
        status: processForm.status,
        handleResult: processForm.handleResult
      })
      submitting.value = false
      if (res.code === 0) {
        ElMessage.success("处理成功")
        processVisible.value = false
        detailVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "处理失败")
      }
    }

    const handleDelete = async (row: IFeedbackInfo) => {
      await ElMessageBox.confirm(`确认删除工单 #${row.id}？`, "删除", { type: "warning" })
      const res = await deleteFeedbackApi(row.id)
      if (res.code === 0) {
        ElMessage.success("已删除")
        detailVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goSanctions = (userId: string) => router.push({ path: "/user/sanctions", query: { userId } })
    const goFeedback = () => router.push("/service/feedback")

    onMounted(async () => {
      const qUserId = route.query.userId as string
      const qId = route.query.id as string
      if (qUserId) searchForm.userId = qUserId
      await fetchList()
      if (qId) {
        const ticketId = Number.parseInt(qId, 10)
        const matched = ticketList.value.find(t => t.id === ticketId)
        if (matched) {
          handleDetail(matched)
        } else {
          const res = await getFeedbackDetailApi(ticketId)
          if (res.code === 0) {
            currentTicket.value = res.result
            detailVisible.value = true
          }
        }
      }
    })

    return {
      loading, submitting, ticketList, searchForm, pagination, currentTicket,
      detailVisible, processVisible, processForm, processFormRef, processRules,
      FeedbackStatus, statusLabel, statusTag,
      handleSearch, handleReset, onPageChange, handleDetail, handleProcess, submitProcess, handleDelete,
      goUser, goSanctions, goFeedback
    }
  }
})
</script>

<style lang="less" scoped>
.service-tickets {
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
