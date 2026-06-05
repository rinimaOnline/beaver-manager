<template>
  <div class="compliance-messages">
    <div class="page-header">
      <h2>消息检索</h2>
      <p class="hint">按消息ID、会话ID、发送者检索，用于合规审计</p>
    </div>

    <el-form :inline="true" class="search-form">
      <el-form-item label="消息ID">
        <el-input v-model="form.messageId" placeholder="精确匹配" clearable />
      </el-form-item>
      <el-form-item label="会话ID">
        <el-input v-model="form.conversationId" placeholder="精确匹配" clearable />
      </el-form-item>
      <el-form-item label="发送者">
        <el-input v-model="form.sendUserId" placeholder="用户ID" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">检索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      <el-button type="success" :disabled="!selectedIds.length" @click="handleBatchRestore">批量恢复</el-button>
    </div>

    <el-table v-loading="loading" :data="messageList" border stripe @selection-change="onSelectionChange">
      <el-table-column type="selection" width="45" />
      <el-table-column prop="messageId" label="消息ID" min-width="160" show-overflow-tooltip />
      <el-table-column prop="conversationId" label="会话ID" min-width="160" show-overflow-tooltip />
      <el-table-column prop="sendUserName" label="发送者" width="120">
        <template #default="{ row }">
          <el-link type="primary" @click="goUser(row.sendUserId)">{{ row.sendUserName || row.sendUserId }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="msgPreview" label="内容预览" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isDeleted ? 'danger' : 'success'" size="small">
            {{ row.isDeleted ? "已删" : "正常" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="时间" width="170" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDetail(row)">详情</el-button>
          <el-button type="primary" link @click="goSession(row)">看会话</el-button>
          <el-button v-if="!row.isDeleted" link type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button v-else link type="success" @click="handleRestore(row)">恢复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawerVisible" title="消息详情" size="480px">
      <el-descriptions v-if="detailMsg" :column="1" border size="small">
        <el-descriptions-item label="消息ID">{{ detailMsg.messageId }}</el-descriptions-item>
        <el-descriptions-item label="会话ID">{{ detailMsg.conversationId }}</el-descriptions-item>
        <el-descriptions-item label="发送者">
          <el-button link type="primary" @click="goUser(detailMsg.sendUserId)">{{ detailMsg.sendUserName || detailMsg.sendUserId }}</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="内容">{{ detailMsg.msgPreview || detailMsg.msgContent || "-" }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailMsg.isDeleted ? 'danger' : 'success'" size="small">{{ detailMsg.isDeleted ? "已删" : "正常" }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="时间">{{ detailMsg.createTime }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detailMsg" class="drawer-actions">
        <el-button type="primary" @click="goSession(detailMsg)">会话审计</el-button>
        <el-button v-if="!detailMsg.isDeleted" type="danger" @click="handleDelete(detailMsg)">删除消息</el-button>
        <el-button v-else type="success" @click="handleRestore(detailMsg)">恢复消息</el-button>
      </div>
    </el-drawer>

    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />
  </div>
</template>

<script lang="ts">
import type { IChatMessageInfo } from "@/types/api/chat"
import { ElMessage, ElMessageBox } from "element-plus"
import { batchDeleteChatMessagesApi, batchRestoreChatMessagesApi, deleteChatMessageApi, getChatMessageDetailApi, getChatMessageListApi, restoreChatMessageApi } from "@/api/chat"

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const drawerVisible = ref(false)
    const detailMsg = ref<IChatMessageInfo | null>(null)
    const messageList = ref<IChatMessageInfo[]>([])
    const selectedIds = ref<string[]>([])
    const form = reactive({ messageId: "", conversationId: "", sendUserId: "" })
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const fetchList = async () => {
      loading.value = true
      if (form.messageId) {
        const res = await getChatMessageDetailApi(form.messageId)
        loading.value = false
        if (res.code === 0 && res.result) {
          messageList.value = [{
            messageId: res.result.messageId,
            conversationId: res.result.conversationId,
            sendUserId: res.result.sendUserId,
            sendUserName: res.result.sendUserName,
            msgPreview: res.result.msgPreview,
            isDeleted: res.result.isDeleted,
            createTime: res.result.createTime
          } as IChatMessageInfo]
          pagination.total = 1
        } else {
          messageList.value = []
          pagination.total = 0
          ElMessage.error(res.msg || "消息不存在")
        }
        return
      }
      const res = await getChatMessageListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        conversationId: form.conversationId || undefined,
        sendUserId: form.sendUserId || undefined,
        withContent: false,
        order: 2
      })
      loading.value = false
      if (res.code === 0) {
        messageList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "检索失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const handleReset = () => {
      form.messageId = ""
      form.conversationId = ""
      form.sendUserId = ""
      handleSearch()
    }

    const onPageChange = (p: number) => {
      pagination.page = p
      fetchList()
    }

    const openDetail = async (row: IChatMessageInfo) => {
      const res = await getChatMessageDetailApi(row.messageId)
      if (res.code === 0 && res.result) {
        detailMsg.value = {
          messageId: res.result.messageId,
          conversationId: res.result.conversationId,
          sendUserId: res.result.sendUserId,
          sendUserName: res.result.sendUserName,
          msgPreview: res.result.msgPreview,
          msgContent: res.result.msgContent,
          isDeleted: res.result.isDeleted,
          createTime: res.result.createTime
        } as IChatMessageInfo
        drawerVisible.value = true
      } else {
        ElMessage.error(res.msg || "加载详情失败")
      }
    }

    const goSession = (row: IChatMessageInfo) => {
      router.push({
        path: "/compliance/sessions",
        query: { userId: row.sendUserId, conversationId: row.conversationId }
      })
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    const handleDelete = async (row: IChatMessageInfo) => {
      await ElMessageBox.confirm("确认删除该消息？", "合规处置", { type: "warning" })
      const res = await deleteChatMessageApi(row.messageId)
      if (res.code === 0) {
        ElMessage.success("已删除")
        fetchList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleRestore = async (row: IChatMessageInfo) => {
      const res = await restoreChatMessageApi({ messageId: row.messageId })
      if (res.code === 0) {
        ElMessage.success("已恢复")
        fetchList()
      } else {
        ElMessage.error(res.msg || "恢复失败")
      }
    }

    const onSelectionChange = (rows: IChatMessageInfo[]) => {
      selectedIds.value = rows.map(r => r.messageId)
    }

    const handleBatchDelete = async () => {
      if (!selectedIds.value.length) return
      await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条消息？`, "批量删除", { type: "warning" })
      const res = await batchDeleteChatMessagesApi({ ids: selectedIds.value })
      if (res.code === 0) {
        ElMessage.success("批量删除成功")
        selectedIds.value = []
        fetchList()
      } else {
        ElMessage.error(res.msg || "批量删除失败")
      }
    }

    const handleBatchRestore = async () => {
      if (!selectedIds.value.length) return
      const res = await batchRestoreChatMessagesApi({ ids: selectedIds.value })
      if (res.code === 0) {
        ElMessage.success("批量恢复成功")
        selectedIds.value = []
        fetchList()
      } else {
        ElMessage.error(res.msg || "批量恢复失败")
      }
    }

    onMounted(() => {
      const qMessageId = route.query.messageId as string
      const qConversationId = route.query.conversationId as string
      const qSendUserId = route.query.sendUserId as string
      if (qMessageId) {
        form.messageId = qMessageId
        fetchList()
        return
      }
      if (qConversationId) {
        form.conversationId = qConversationId
      }
      if (qSendUserId) {
        form.sendUserId = qSendUserId
      }
      if (qConversationId || qSendUserId) {
        fetchList()
      }
    })

    return {
      loading, drawerVisible, detailMsg, messageList, selectedIds, form, pagination,
      handleSearch, handleReset, onPageChange, openDetail, goSession, goUser,
      handleDelete, handleRestore, onSelectionChange, handleBatchDelete, handleBatchRestore
    }
  }
})
</script>

<style lang="less">
.compliance-messages {
  padding: 20px;

  .page-header {
    margin-bottom: 16px;
    h2 { margin: 0 0 4px; }
    .hint { color: #909399; font-size: 13px; margin: 0; }
  }

  .search-form { margin-bottom: 12px; }
  .toolbar { margin-bottom: 12px; display: flex; gap: 8px; }
  .pagination { margin-top: 16px; justify-content: flex-end; }

  .drawer-actions {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
