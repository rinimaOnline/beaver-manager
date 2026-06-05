<template>
  <div class="safety-appeals">
    <div class="safety-appeals__header">
      <h2 class="safety-appeals__title">申诉管理</h2>
      <p class="safety-appeals__hint">用户投诉类申诉，支持本页受理、解封联动与结案</p>
    </div>

    <el-form :inline="true" class="safety-appeals__form">
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userId" placeholder="申诉用户" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" clearable style="width: 120px">
          <el-option label="待处理" :value="1" />
          <el-option label="处理中" :value="2" />
          <el-option label="已解决" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="appealList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="userId" label="用户ID" min-width="130">
        <template #default="{ row }">
          <el-link type="primary" @click="goUser(row.userId)">{{ row.userId }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="申诉内容" min-width="220" show-overflow-tooltip />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" width="170" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link @click="handleDetail(row)">详情</el-button>
          <el-button link type="primary" @click="handleProcess(row)">处理</el-button>
          <el-button link type="success" @click="quickUnban(row)">解封</el-button>
          <el-button link @click="goSanctions(row.userId)">处置记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="safety-appeals__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />

    <el-dialog v-model="detailVisible" title="申诉详情" width="560px">
      <el-descriptions v-if="currentAppeal" :column="2" border>
        <el-descriptions-item label="申诉ID">{{ currentAppeal.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentAppeal.userId }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(currentAppeal.status) }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentAppeal.handlerId || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="申诉内容" :span="2">{{ currentAppeal.content }}</el-descriptions-item>
        <el-descriptions-item v-if="currentAppeal.handleResult" label="处理结果" :span="2">{{ currentAppeal.handleResult }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="processVisible" title="处理申诉" width="480px">
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="90px">
        <el-form-item label="处理状态" prop="status">
          <el-select v-model="processForm.status">
            <el-option label="处理中" :value="2" />
            <el-option label="已解决" :value="3" />
            <el-option label="已拒绝" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人ID" prop="handlerId">
          <el-input v-model.number="processForm.handlerId" type="number" />
        </el-form-item>
        <el-form-item label="处理结果" prop="handleResult">
          <el-input v-model="processForm.handleResult" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { IFeedbackInfo } from "@/types/api/feedback"
import { ElMessage, ElMessageBox } from "element-plus"
import { getFeedbackDetailApi, getFeedbackListApi, handleFeedbackApi } from "@/api/feedback"
import { FeedbackStatus, FeedbackType } from "@/types/api/feedback"
import { executeUserControlApi } from "@/api/moderation"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const appealList = ref<IFeedbackInfo[]>([])
    const currentAppeal = ref<IFeedbackInfo | null>(null)
    const detailVisible = ref(false)
    const processVisible = ref(false)
    const processFormRef = ref<FormInstance>()
    const searchForm = reactive({ userId: "", status: 1 as number | undefined })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const processForm = reactive({ status: null as number | null, handlerId: null as number | null, handleResult: "" })
    const processRules: FormRules = {
      status: [{ required: true, message: "请选择状态", trigger: "change" }],
      handlerId: [{ required: true, message: "请输入处理人ID", trigger: "blur" }],
      handleResult: [{ required: true, message: "请输入处理结果", trigger: "blur" }]
    }

    const statusLabel = (status: number) => {
      const map: Record<number, string> = {
        [FeedbackStatus.PENDING]: "待处理",
        [FeedbackStatus.IN_PROGRESS]: "处理中",
        [FeedbackStatus.RESOLVED]: "已解决",
        [FeedbackStatus.REJECTED]: "已拒绝"
      }
      return map[status] || "未知"
    }
    const statusTag = (status: number) => {
      const map: Record<number, string> = { 1: "warning", 2: "primary", 3: "success", 4: "danger" }
      return map[status] || ""
    }

    const fetchList = async () => {
      loading.value = true
      const res = await getFeedbackListApi({
        page: pagination.page,
        limit: pagination.pageSize,
        type: FeedbackType.COMPLAINT,
        userId: searchForm.userId || undefined,
        status: searchForm.status
      })
      loading.value = false
      if (res.code === 0) {
        appealList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const handleSearch = () => { pagination.page = 1; fetchList() }
    const handleReset = () => { searchForm.userId = ""; searchForm.status = 1; handleSearch() }
    const onPageChange = (page: number) => { pagination.page = page; fetchList() }

    const handleDetail = async (row: IFeedbackInfo) => {
      const res = await getFeedbackDetailApi(row.id)
      if (res.code === 0) {
        currentAppeal.value = res.result
        detailVisible.value = true
      } else {
        ElMessage.error(res.msg || "获取详情失败")
      }
    }

    const handleProcess = (row: IFeedbackInfo) => {
      currentAppeal.value = row
      Object.assign(processForm, { status: null, handlerId: null, handleResult: "" })
      processVisible.value = true
    }

    const submitProcess = async () => {
      if (!processFormRef.value || !currentAppeal.value) return
      await processFormRef.value.validate()
      const res = await handleFeedbackApi(currentAppeal.value.id, processForm)
      if (res.code === 0) {
        ElMessage.success("申诉已处理")
        processVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "处理失败")
      }
    }

    const quickUnban = async (row: IFeedbackInfo) => {
      await ElMessageBox.confirm(`确认解封用户 ${row.userId}？`, "解封用户", { type: "warning" })
      const res = await executeUserControlApi({ userId: row.userId, action: "unban_user", reason: `申诉 #${row.id}` })
      if (res.code === 0) {
        ElMessage.success("已解封")
      } else {
        ElMessage.error(res.msg || "解封失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goSanctions = (userId: string) => router.push({ path: "/user/sanctions", query: { userId } })

    onMounted(fetchList)

    return {
      loading, appealList, searchForm, pagination, currentAppeal, detailVisible, processVisible,
      processForm, processFormRef, processRules, statusLabel, statusTag,
      handleSearch, handleReset, onPageChange, handleDetail, handleProcess, submitProcess,
      quickUnban, goUser, goSanctions
    }
  }
})
</script>

<style lang="less" scoped>
.safety-appeals {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__pagination { margin-top: 16px; justify-content: flex-end; }
}
</style>
