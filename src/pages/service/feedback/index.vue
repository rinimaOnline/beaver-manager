<template>
  <div class="service-feedback">
    <div class="service-feedback__header">
      <h2 class="service-feedback__title">用户反馈</h2>
      <p class="service-feedback__hint">处理用户提交的产品反馈与投诉，可联动用户360与客诉工单</p>
    </div>

    <el-form :inline="true" class="service-feedback__form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keywords" placeholder="搜索关键词" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userId" placeholder="用户ID" clearable style="width: 150px" />
      </el-form-item>
      <el-form-item label="反馈类型">
        <el-select v-model="searchForm.type" placeholder="类型" clearable style="width: 150px">
          <el-option v-for="(label, value) in feedbackTypeMap" :key="value" :label="label" :value="Number(value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理状态">
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px">
          <el-option v-for="(label, value) in feedbackStatusMap" :key="value" :label="label" :value="Number(value)" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button link type="primary" @click="goTickets">客诉工单</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="feedbackList" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="userId" label="用户ID" width="120" />
      <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)">{{ feedbackTypeMap[row.type] || "未知" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">{{ feedbackStatusMap[row.status] || "未知" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fileNames" label="附件" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.fileNames?.length" size="small">{{ row.fileNames.length }}个</el-tag>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column prop="handlerId" label="处理人" width="100">
        <template #default="{ row }">{{ row.handlerId || "未分配" }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.userId)">用户360</el-button>
          <el-button link @click="handleDetail(row)">详情</el-button>
          <el-button v-if="row.status === 1 || row.status === 2" link type="primary" @click="handleProcess(row)">处理</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      class="service-feedback__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="searchForm.page"
      :page-size="searchForm.limit"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog v-model="detailDialogVisible" title="反馈详情" width="560px">
      <el-descriptions v-if="currentFeedback" :column="2" border>
        <el-descriptions-item label="反馈ID">{{ currentFeedback.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentFeedback.userId }}</el-descriptions-item>
        <el-descriptions-item label="反馈类型">
          <el-tag :type="getTypeTagType(currentFeedback.type)">{{ feedbackTypeMap[currentFeedback.type] || "未知" }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusTagType(currentFeedback.status)">{{ feedbackStatusMap[currentFeedback.status] || "未知" }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentFeedback.handlerId || "未分配" }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ currentFeedback.handleTime || "未处理" }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentFeedback.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="反馈内容" :span="2">
          <div class="service-feedback__content">{{ currentFeedback.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentFeedback.handleResult" label="处理结果" :span="2">
          <div class="service-feedback__content">{{ currentFeedback.handleResult }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="processDialogVisible" title="处理反馈" width="480px">
      <el-form ref="processFormRef" :model="processForm" :rules="processFormRules" label-width="100px">
        <el-form-item label="处理状态" prop="status">
          <el-select v-model="processForm.status" placeholder="请选择">
            <el-option label="处理中" :value="2" />
            <el-option label="已解决" :value="3" />
            <el-option label="已拒绝" :value="4" />
            <el-option label="已关闭" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果" prop="handleResult">
          <el-input v-model="processForm.handleResult" type="textarea" :rows="4" placeholder="填写处理说明，处理人将自动记录为当前登录管理员" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IFeedbackInfo } from "@/types/api/feedback"
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteFeedbackApi, getFeedbackDetailApi, getFeedbackListApi, handleFeedbackApi } from "@/api/feedback"
import { FeedbackStatus, FeedbackType } from "@/types/api/feedback"

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const feedbackList = ref<IFeedbackInfo[]>([])
    const total = ref(0)
    const detailDialogVisible = ref(false)
    const processDialogVisible = ref(false)
    const currentFeedback = ref<IFeedbackInfo | null>(null)
    const processFormRef = ref<FormInstance>()

    const feedbackTypeMap: Record<number, string> = {
      [FeedbackType.BUG_REPORT]: "错误报告",
      [FeedbackType.FEATURE_REQUEST]: "功能请求",
      [FeedbackType.GENERAL_FEEDBACK]: "一般反馈",
      [FeedbackType.COMPLAINT]: "投诉建议",
      [FeedbackType.OTHER]: "其他"
    }

    const feedbackStatusMap: Record<number, string> = {
      [FeedbackStatus.PENDING]: "待处理",
      [FeedbackStatus.IN_PROGRESS]: "处理中",
      [FeedbackStatus.RESOLVED]: "已解决",
      [FeedbackStatus.REJECTED]: "已拒绝",
      [FeedbackStatus.CLOSED]: "已关闭"
    }

    const searchForm = reactive({
      page: 1,
      limit: 10,
      keywords: "",
      userId: "",
      type: null as number | null,
      status: null as number | null
    })

    const processForm = reactive({
      status: null as number | null,
      handleResult: ""
    })

    const processFormRules: FormRules = {
      status: [{ required: true, message: "请选择处理状态", trigger: "change" }],
      handleResult: [{ required: true, message: "请输入处理结果", trigger: "blur" }]
    }

    const fetchFeedbackList = async () => {
      loading.value = true
      const res = await getFeedbackListApi(searchForm)
      loading.value = false
      if (res.code === 0) {
        feedbackList.value = res.result.list || []
        total.value = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取反馈列表失败")
      }
    }

    const handleSearch = () => {
      searchForm.page = 1
      fetchFeedbackList()
    }

    const handleReset = () => {
      Object.assign(searchForm, { page: 1, limit: 10, keywords: "", userId: "", type: null, status: null })
      fetchFeedbackList()
    }

    const handleSizeChange = (size: number) => {
      searchForm.limit = size
      searchForm.page = 1
      fetchFeedbackList()
    }

    const handleCurrentChange = (page: number) => {
      searchForm.page = page
      fetchFeedbackList()
    }

    const handleDetail = async (row: IFeedbackInfo) => {
      const res = await getFeedbackDetailApi(row.id)
      if (res.code === 0) {
        currentFeedback.value = res.result
        detailDialogVisible.value = true
      } else {
        ElMessage.error(res.msg || "获取详情失败")
      }
    }

    const handleProcess = (row: IFeedbackInfo) => {
      currentFeedback.value = row
      Object.assign(processForm, { status: null, handleResult: "" })
      processDialogVisible.value = true
    }

    const submitProcess = async () => {
      if (!processFormRef.value || !currentFeedback.value) return
      await processFormRef.value.validate()
      const res = await handleFeedbackApi(currentFeedback.value.id, {
        status: processForm.status!,
        handleResult: processForm.handleResult
      })
      if (res.code === 0) {
        ElMessage.success("处理成功")
        processDialogVisible.value = false
        fetchFeedbackList()
      } else {
        ElMessage.error(res.msg || "处理失败")
      }
    }

    const handleDelete = async (row: IFeedbackInfo) => {
      await ElMessageBox.confirm(`确定删除反馈 ID: ${row.id}？`, "确认删除", { type: "warning" })
      const res = await deleteFeedbackApi(row.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchFeedbackList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const getTypeTagType = (type: number) => {
      const map: Record<number, string> = {
        [FeedbackType.BUG_REPORT]: "danger",
        [FeedbackType.FEATURE_REQUEST]: "primary",
        [FeedbackType.GENERAL_FEEDBACK]: "info",
        [FeedbackType.COMPLAINT]: "warning"
      }
      return map[type] || ""
    }

    const getStatusTagType = (status: number) => {
      const map: Record<number, string> = {
        [FeedbackStatus.PENDING]: "warning",
        [FeedbackStatus.IN_PROGRESS]: "primary",
        [FeedbackStatus.RESOLVED]: "success",
        [FeedbackStatus.REJECTED]: "danger",
        [FeedbackStatus.CLOSED]: "info"
      }
      return map[status] || ""
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goTickets = () => router.push("/service/tickets")

    onMounted(() => {
      const qUser = route.query.userId as string
      const qStatus = route.query.status as string
      if (qUser) searchForm.userId = qUser
      if (qStatus) searchForm.status = Number(qStatus)
      fetchFeedbackList()
    })

    return {
      loading, feedbackList, total, searchForm, processForm, processFormRef, processFormRules,
      detailDialogVisible, processDialogVisible, currentFeedback,
      feedbackTypeMap, feedbackStatusMap,
      handleSearch, handleReset, handleSizeChange, handleCurrentChange,
      handleDetail, handleProcess, submitProcess, handleDelete,
      getTypeTagType, getStatusTagType, goUser, goTickets
    }
  }
})
</script>

<style lang="less">
.service-feedback {
  padding: 20px;

  .service-feedback__header {
    margin-bottom: 16px;

    .service-feedback__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .service-feedback__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .service-feedback__form {
    margin-bottom: 12px;
  }

  .service-feedback__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .service-feedback__content {
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
  }
}
</style>
