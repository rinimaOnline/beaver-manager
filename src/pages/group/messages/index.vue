<template>
  <div class="group-messages">
    <div class="group-messages__header">
      <h2 class="group-messages__title">群消息审计</h2>
      <p class="group-messages__hint">按群组查看消息时间线，支持删/恢复与跳转会话审计</p>
    </div>

    <el-form :inline="true" class="group-messages__form">
      <el-form-item label="群组ID">
        <el-input v-model="groupId" placeholder="群UUID" clearable style="width: 280px" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="msgTypeFilter" placeholder="全部" clearable style="width: 110px" @change="reload">
          <el-option label="文本" :value="1" />
          <el-option label="图片" :value="2" />
          <el-option label="视频" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="showDeletedOnly" @change="reload">仅看已删除</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="reload">查询</el-button>
        <el-button v-if="groupId" @click="goGroupProfile">群组360</el-button>
        <el-button v-if="conversationId" @click="goSessionAudit">会话审计</el-button>
      </el-form-item>
    </el-form>

    <div class="group-messages__toolbar">
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      <el-button type="success" :disabled="!selectedIds.length" @click="handleBatchRestore">批量恢复</el-button>
    </div>

    <el-table v-loading="loading" :data="messageList" border stripe @selection-change="onSelectionChange">
      <el-table-column type="selection" width="45" />
      <el-table-column label="发送者" width="140">
        <template #default="{ row }">
          <el-link type="primary" @click="goUser(row.sendUserId)">{{ row.sendUserName || row.sendUserId }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="msgPreview" label="内容" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isDeleted ? 'danger' : 'success'" size="small">{{ row.isDeleted ? "已删" : "正常" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="时间" width="170" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button v-if="!row.isDeleted" link type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button v-else link type="success" @click="handleRestore(row)">恢复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="group-messages__pagination"
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
import { batchDeleteChatMessagesApi, batchRestoreChatMessagesApi, deleteChatMessageApi, getChatMessageListApi, restoreChatMessageApi } from "@/api/chat"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const groupId = ref("")
    const conversationId = ref("")
    const msgTypeFilter = ref<number | undefined>()
    const showDeletedOnly = ref(false)
    const loading = ref(false)
    const messageList = ref<IChatMessageInfo[]>([])
    const selectedIds = ref<string[]>([])
    const pagination = reactive({ page: 1, pageSize: 30, total: 0 })

    const loadMessages = async () => {
      if (!groupId.value.trim()) {
        ElMessage.warning("请输入群组ID")
        return
      }
      conversationId.value = `group_${groupId.value.trim()}`
      loading.value = true
      let res = await getChatMessageListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        conversationId: conversationId.value,
        msgType: msgTypeFilter.value,
        isDeleted: showDeletedOnly.value ? true : undefined,
        order: 2,
        withContent: false
      })
      if (res.code === 0 && res.result.total === 0) {
        conversationId.value = groupId.value.trim()
        res = await getChatMessageListApi({
          page: pagination.page,
          pageSize: pagination.pageSize,
          conversationId: conversationId.value,
          msgType: msgTypeFilter.value,
          isDeleted: showDeletedOnly.value ? true : undefined,
          order: 2,
          withContent: false
        })
      }
      loading.value = false
      if (res.code === 0) {
        messageList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const reload = () => {
      pagination.page = 1
      loadMessages()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      loadMessages()
    }

    const handleDelete = async (row: IChatMessageInfo) => {
      await ElMessageBox.confirm("确认删除该消息？", "删除", { type: "warning" })
      const res = await deleteChatMessageApi(row.messageId)
      if (res.code === 0) {
        ElMessage.success("已删除")
        loadMessages()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleRestore = async (row: IChatMessageInfo) => {
      const res = await restoreChatMessageApi({ messageId: row.messageId })
      if (res.code === 0) {
        ElMessage.success("已恢复")
        loadMessages()
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
        loadMessages()
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
        loadMessages()
      } else {
        ElMessage.error(res.msg || "批量恢复失败")
      }
    }

    const goGroupProfile = () => router.push(`/group/profile/${groupId.value}`)
    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goSessionAudit = () => {
      router.push({ path: "/compliance/sessions", query: { conversationId: conversationId.value } })
    }

    onMounted(() => {
      const q = route.query.groupId as string
      if (q) {
        groupId.value = q
        loadMessages()
      }
    })

    return {
      groupId, conversationId, msgTypeFilter, showDeletedOnly, loading, messageList, selectedIds, pagination,
      loadMessages, reload, onPageChange, handleDelete, handleRestore,
      onSelectionChange, handleBatchDelete, handleBatchRestore,
      goGroupProfile, goUser, goSessionAudit
    }
  }
})
</script>

<style lang="less" scoped>
.group-messages {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__toolbar { margin-bottom: 12px; display: flex; gap: 8px; }
  &__pagination { margin-top: 16px; justify-content: flex-end; }
}
</style>
