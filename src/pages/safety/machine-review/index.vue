<template>
  <div class="safety-machine-review">
    <div class="safety-machine-review__header">
      <h2 class="safety-machine-review__title">机审命中队列</h2>
      <p class="safety-machine-review__hint">对接 /admin/moderation/reports，消息类待复核举报（targetType=2）</p>
    </div>

    <div class="safety-machine-review__body">
      <div class="safety-machine-review__list">
        <el-table
          v-loading="loading"
          :data="reportList"
          border
          stripe
          highlight-current-row
          @row-click="selectReport"
        >
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="targetId" label="消息ID" min-width="160" show-overflow-tooltip />
          <el-table-column prop="content" label="举报描述" min-width="160" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="时间" width="170" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click.stop="selectReport(row)">复核</el-button>
              <el-button type="warning" link @click.stop="escalate(row.id)">立案</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="safety-machine-review__pagination"
          background
          layout="total, prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page="pagination.page"
          @current-change="onPageChange"
        />
      </div>

      <aside v-if="currentReport" class="review-panel">
        <h3>人工复核 #{{ currentReport.id }}</h3>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="消息ID">{{ currentReport.targetId }}</el-descriptions-item>
          <el-descriptions-item label="举报人">
            <el-link type="primary" @click="goUser(currentReport.reporterUserId)">
              {{ currentReport.reporterName || currentReport.reporterUserId }}
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item v-if="messageDetail" label="发送者">
            <el-link type="primary" @click="goUser(messageDetail.sendUserId)">{{ messageDetail.sendUserId }}</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="描述">{{ currentReport.content || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="messageDetail" class="review-panel__msg">
          <div class="review-panel__msg-title">消息预览</div>
          <p>{{ messageDetail.msgPreview }}</p>
          <el-tag v-if="messageDetail.isDeleted" type="danger" size="small">已删除</el-tag>
          <el-tag v-else type="success" size="small">正常</el-tag>
        </div>
        <el-skeleton v-else-if="msgLoading" :rows="2" animated />

        <div class="review-panel__actions">
          <el-button type="primary" @click="goSession">会话审计</el-button>
          <el-button v-if="messageDetail" @click="goUser(messageDetail.sendUserId)">发送者360</el-button>
          <el-button v-if="messageDetail && !messageDetail.isDeleted" type="danger" @click="deleteMessage">删除消息</el-button>
          <el-button type="warning" @click="escalate(currentReport.id)">立案工单</el-button>
          <el-button @click="rejectReport">驳回举报</el-button>
        </div>
      </aside>
      <el-empty v-else class="review-panel review-panel--empty" description="选择一条命中记录进行复核" />
    </div>
  </div>
</template>

<script lang="ts">
import type { IContentReportInfo } from "@/types/api/moderation"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteChatMessageApi, getChatMessageDetailApi } from "@/api/chat"
import { escalateContentReportApi, getContentReportListApi, rejectContentReportApi } from "@/api/moderation"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const msgLoading = ref(false)
    const reportList = ref<IContentReportInfo[]>([])
    const currentReport = ref<IContentReportInfo | null>(null)
    const messageDetail = ref<{ msgPreview: string; isDeleted: boolean; sendUserId: string; conversationId: string } | null>(null)
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const fetchList = async () => {
      loading.value = true
      const res = await getContentReportListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: 1,
        targetType: 2
      })
      loading.value = false
      if (res.code === 0) {
        reportList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const loadMessage = async (messageId: string) => {
      msgLoading.value = true
      messageDetail.value = null
      const res = await getChatMessageDetailApi(messageId)
      msgLoading.value = false
      if (res.code === 0 && res.result) {
        messageDetail.value = {
          msgPreview: res.result.msgPreview,
          isDeleted: res.result.isDeleted,
          sendUserId: res.result.sendUserId,
          conversationId: res.result.conversationId
        }
      }
    }

    const selectReport = async (row: IContentReportInfo) => {
      currentReport.value = row
      await loadMessage(row.targetId)
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const escalate = async (reportId: number) => {
      await ElMessageBox.confirm("确认立案并进入工单处置？", "立案", { type: "warning" })
      const res = await escalateContentReportApi({ reportId })
      if (res.code === 0) {
        ElMessage.success(`已立案: ${res.result.caseNo}`)
        router.push({ path: "/safety/cases", query: { caseId: String(res.result.caseId) } })
      } else {
        ElMessage.error(res.msg || "立案失败")
      }
    }

    const rejectReport = async () => {
      if (!currentReport.value) return
      await ElMessageBox.confirm("确认驳回该举报？", "驳回", { type: "warning" })
      const res = await rejectContentReportApi({ reportId: currentReport.value.id, handleRemark: "机审复核驳回" })
      if (res.code === 0) {
        ElMessage.success("已驳回")
        currentReport.value = null
        messageDetail.value = null
        fetchList()
      } else {
        ElMessage.error(res.msg || "驳回失败")
      }
    }

    const deleteMessage = async () => {
      if (!currentReport.value) return
      await ElMessageBox.confirm("确认删除该违规消息？", "删除消息", { type: "warning" })
      const res = await deleteChatMessageApi(currentReport.value.targetId)
      if (res.code === 0) {
        ElMessage.success("消息已删除")
        await loadMessage(currentReport.value.targetId)
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const goSession = () => {
      if (!messageDetail.value) return
      router.push({
        path: "/compliance/sessions",
        query: { userId: messageDetail.value.sendUserId, conversationId: messageDetail.value.conversationId }
      })
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(fetchList)

    return {
      loading, msgLoading, reportList, currentReport, messageDetail, pagination,
      selectReport, onPageChange, escalate, rejectReport, deleteMessage, goSession, goUser
    }
  }
})
</script>

<style lang="less" scoped>
.safety-machine-review {
  padding: 20px;

  &__header {
    margin-bottom: 16px;

    .safety-machine-review__title { margin: 0 0 4px; }
    .safety-machine-review__hint { margin: 0; color: #909399; font-size: 13px; }
  }

  &__body {
    display: flex;
    gap: 16px;
    min-height: 400px;
  }

  &__list {
    flex: 1;
    min-width: 0;
  }

  &__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}

.review-panel {
  width: 340px;
  flex-shrink: 0;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  background: #fff;

  &--empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h3 { margin: 0 0 12px; font-size: 15px; }

  &__msg {
    margin-top: 12px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 6px;
    font-size: 13px;

    &-title { font-weight: 600; margin-bottom: 6px; }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }
}
</style>
