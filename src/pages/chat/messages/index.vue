
<template>
  <div class="chat-messages-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">聊天对话管理</span>
          <el-tag type="info" size="small">
            共 {{ conversationList.length }} 个对话
          </el-tag>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="对话类型">
            <el-select
              v-model="searchForm.conversationType"
              placeholder="请选择类型"
              clearable
              style="width: 140px"
            >
              <el-option label="私聊" :value="1" />
              <el-option label="群聊" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="参与者">
            <el-input
              v-model="searchForm.participantName"
              placeholder="请输入参与者姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="最后消息时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 对话列表 -->
      <div class="conversation-section">
        <el-table
          :data="conversationList"
          v-loading="loading"
          stripe
          style="width: 100%"
          @row-click="handleConversationClick"
        >
          <el-table-column prop="conversationId" label="对话ID" width="120" show-overflow-tooltip />
          <el-table-column label="对话类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.conversationType === 1 ? 'primary' : 'success'" size="small">
                {{ row.conversationType === 1 ? '私聊' : '群聊' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="参与者" min-width="200">
            <template #default="{ row }">
              <div class="participants">
                <el-avatar 
                  v-for="user in row.participants.slice(0, 3)" 
                  :key="user.userId"
                  :size="32"
                  :src="user.avatar"
                >
                  {{ user.nickName && user.nickName.charAt(0) }}
                </el-avatar>
                <span v-if="row.participants.length > 3" class="more-users">
                  +{{ row.participants.length - 3 }}
                </span>
                <div class="participant-names">
                  {{ getParticipantNames(row.participants) }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="lastMessage" label="最后消息" min-width="200" show-overflow-tooltip />
          <el-table-column prop="lastMessageTime" label="最后消息时间" width="180" />
          <el-table-column prop="messageCount" label="消息数量" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info">
                {{ row.messageCount }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewMessages(row)">
                查看消息
              </el-button>
              <el-button size="small" type="warning" @click="handleViewParticipants(row)">
                参与者
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 消息列表弹窗 -->
    <el-dialog
      title="对话消息"
      v-model="showMessagesDialog"
      width="80%"
      top="5vh"
    >
      <div class="messages-dialog-content">
        <!-- 对话信息 -->
        <div class="conversation-info">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="对话ID">
              {{ currentConversation.conversationId }}
            </el-descriptions-item>
            <el-descriptions-item label="对话类型">
              <el-tag :type="currentConversation.conversationType === 1 ? 'primary' : 'success'" size="small">
                {{ currentConversation.conversationType === 1 ? '私聊' : '群聊' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="消息总数">
              {{ currentConversation.messageCount }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 消息搜索 -->
        <div class="message-search">
          <el-form :model="messageSearchForm" inline>
            <el-form-item label="发送者">
              <el-input
                v-model="messageSearchForm.sendUserName"
                placeholder="请输入发送者姓名"
                clearable
                style="width: 150px"
              />
            </el-form-item>
            <el-form-item label="消息类型">
              <el-select
                v-model="messageSearchForm.msgType"
                placeholder="请选择类型"
                clearable
                style="width: 120px"
              >
                <el-option label="文本" :value="1" />
                <el-option label="图片" :value="2" />
                <el-option label="视频" :value="3" />
                <el-option label="文件" :value="4" />
                <el-option label="语音" :value="5" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="handleMessageSearch">
                搜索
              </el-button>
              <el-button size="small" @click="handleMessageReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 消息列表 -->
        <div class="message-list" v-loading="messageLoading">
          <div
            v-for="message in messageList"
            :key="message.messageId"
            class="message-item"
            :class="{ 
              'message-deleted': message.isDeleted,
              'message-mine': message.isMine,
              'message-other': !message.isMine
            }"
          >
            <div class="message-wrapper">
              <!-- 头像 -->
              <div class="message-avatar">
                <el-avatar :size="36" :src="message.sendUserAvatar">
                  {{ message.sendUserName && message.sendUserName.charAt(0) }}
                </el-avatar>
              </div>
              
              <!-- 消息内容 -->
              <div class="message-content-wrapper">
                <!-- 发送者信息 -->
                <div class="message-sender">
                  <span class="sender-name">{{ message.sendUserName }}</span>
                  <span class="message-time">{{ message.createTime }}</span>
                </div>
                
                <!-- 消息气泡 -->
                <div class="message-bubble">
                  <!-- 消息类型标签 -->
                  <div class="message-type-tag">
                    <el-tag size="small" :type="getMessageTypeColor(message.msgType)">
                      {{ getMsgTypeText(message.msgType) }}
                    </el-tag>
                  </div>
                  
                  <!-- 消息内容 -->
                  <div class="message-text">
                    {{ message.msgPreview || message.msgContent }}
                  </div>
                  
                  <!-- 消息状态 -->
                  <div class="message-status">
                    <el-tag :type="message.isDeleted ? 'danger' : 'success'" size="small">
                      {{ message.isDeleted ? '已删除' : '正常' }}
                    </el-tag>
                  </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="message-actions">
                  <el-button size="small" type="primary" @click="handleViewMessageDetail(message)">
                    详情
                  </el-button>
                  <el-button
                    v-if="message.isDeleted"
                    size="small"
                    type="success"
                    @click="handleRestoreMessage(message)"
                  >
                    恢复
                  </el-button>
                  <el-button
                    v-else
                    size="small"
                    type="danger"
                    @click="handleDeleteMessage(message)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息分页 -->
        <div class="message-pagination">
          <el-pagination
            :current-page="messagePagination.page"
            :page-size="messagePagination.pageSize"
            :total="messagePagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleMessageSizeChange"
            @current-change="handleMessageCurrentChange"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 参与者弹窗 -->
    <el-dialog
      title="对话参与者"
      v-model="showParticipantsDialog"
      width="600px"
    >
      <div class="participants-list">
        <el-table :data="currentConversation.participants" stripe>
          <el-table-column label="头像" width="80" align="center">
            <template #default="{ row }">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.nickName && row.nickName.charAt(0) }}
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="nickName" label="昵称" />
          <el-table-column prop="userId" label="用户ID" width="120" show-overflow-tooltip />
          <el-table-column prop="joinTime" label="加入时间" width="180" />
        </el-table>
      </div>
    </el-dialog>

    <!-- 消息详情弹窗 -->
    <el-dialog
      title="消息详情"
      v-model="showMessageDetailDialog"
      width="600px"
    >
      <div v-loading="detailLoading">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="消息ID">
            {{ messageDetail.messageId }}
          </el-descriptions-item>
          <el-descriptions-item label="发送者">
            {{ messageDetail.sendUserName }}
          </el-descriptions-item>
          <el-descriptions-item label="消息类型">
            <el-tag size="small">
              {{ getMsgTypeText(messageDetail.msgType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="messageDetail.isDeleted ? 'danger' : 'success'" size="small">
              {{ messageDetail.isDeleted ? '已删除' : '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="消息内容">
            <div class="message-content">
              {{ messageDetail.msgContent || messageDetail.msgPreview }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">
            {{ messageDetail.createTime }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  setup() {
    // 响应式数据
    const loading = ref(false)
    const messageLoading = ref(false)
    const detailLoading = ref(false)
    const conversationList = ref([])
    const messageList = ref([])
    const currentConversation = reactive({
      conversationId: "",
      conversationType: 1,
      participants: [],
      messageCount: 0
    })

    const messageDetail = reactive({
      messageId: "",
      sendUserName: "",
      msgType: 0,
      msgContent: "",
      msgPreview: "",
      isDeleted: false,
      createTime: ""
    })

    // 搜索表单
    const searchForm = reactive({
      conversationType: undefined,
      participantName: "",
      dateRange: []
    })

    const messageSearchForm = reactive({
      sendUserName: "",
      msgType: undefined
    })

    // 分页数据
    const messagePagination = reactive({
      page: 1,
      pageSize: 20,
      total: 0
    })

    // 弹窗控制
    const showMessagesDialog = ref(false)
    const showParticipantsDialog = ref(false)
    const showMessageDetailDialog = ref(false)

    // 获取对话列表
    const fetchConversationList = async () => {
      try {
        loading.value = true
        // 模拟数据，实际应该调用API
        conversationList.value = [
          {
            conversationId: "conv_001",
            conversationType: 1,
            participants: [
              { userId: "user_001", nickName: "张三", avatar: "" },
              { userId: "user_002", nickName: "李四", avatar: "" }
            ],
            lastMessage: "你好，最近怎么样？",
            lastMessageTime: "2024-01-15 14:30:00",
            messageCount: 25
          },
          {
            conversationId: "conv_002",
            conversationType: 2,
            participants: [
              { userId: "user_001", nickName: "张三", avatar: "" },
              { userId: "user_002", nickName: "李四", avatar: "" },
              { userId: "user_003", nickName: "王五", avatar: "" }
            ],
            lastMessage: "大家周末有什么安排？",
            lastMessageTime: "2024-01-15 16:45:00",
            messageCount: 156
          }
        ]
      } catch (error) {
        ElMessage.error("获取对话列表失败")
      } finally {
        loading.value = false
      }
    }

    // 获取消息列表
    const fetchMessageList = async () => {
      if (!currentConversation.conversationId) return
      
      try {
        messageLoading.value = true
        // 模拟数据，实际应该调用API
        messageList.value = [
          {
            messageId: "msg_001",
            sendUserName: "张三",
            sendUserAvatar: "",
            msgType: 1,
            msgPreview: "你好，最近怎么样？",
            isDeleted: false,
            createTime: "2024-01-15 14:30:00",
            isMine: false
          },
          {
            messageId: "msg_002",
            sendUserName: "李四",
            sendUserAvatar: "",
            msgType: 1,
            msgPreview: "还不错，你呢？",
            isDeleted: false,
            createTime: "2024-01-15 14:32:00",
            isMine: true
          },
          {
            messageId: "msg_003",
            sendUserName: "张三",
            sendUserAvatar: "",
            msgType: 1,
            msgPreview: "我也挺好的，最近在忙什么项目？",
            isDeleted: false,
            createTime: "2024-01-15 14:35:00",
            isMine: false
          },
          {
            messageId: "msg_004",
            sendUserName: "李四",
            sendUserAvatar: "",
            msgType: 2,
            msgPreview: "[图片]",
            isDeleted: false,
            createTime: "2024-01-15 14:40:00",
            isMine: true
          },
          {
            messageId: "msg_005",
            sendUserName: "张三",
            sendUserAvatar: "",
            msgType: 1,
            msgPreview: "这个设计很不错！",
            isDeleted: false,
            createTime: "2024-01-15 14:42:00",
            isMine: false
          },
          {
            messageId: "msg_006",
            sendUserName: "李四",
            sendUserAvatar: "",
            msgType: 1,
            msgPreview: "谢谢！我们团队花了很多时间",
            isDeleted: true,
            createTime: "2024-01-15 14:45:00",
            isMine: true
          }
        ]
        messagePagination.total = 6
      } catch (error) {
        ElMessage.error("获取消息列表失败")
      } finally {
        messageLoading.value = false
      }
    }

    // 获取消息详情
    const fetchMessageDetail = async (messageId) => {
      try {
        detailLoading.value = true
        // 模拟数据
        Object.assign(messageDetail, {
          messageId,
          sendUserName: "张三",
          msgType: 1,
          msgContent: "这是一条测试消息内容",
          isDeleted: false,
          createTime: "2024-01-15 14:30:00"
        })
      } catch (error) {
        ElMessage.error("获取消息详情失败")
      } finally {
        detailLoading.value = false
      }
    }

    // 工具函数
    const getMsgTypeText = (msgType) => {
      const typeMap = {
        1: "文本",
        2: "图片",
        3: "视频",
        4: "文件",
        5: "语音",
        6: "语音通话",
        7: "视频通话",
        8: "撤回消息",
        9: "回复消息",
        10: "引用消息"
      }
      return typeMap[msgType] || "未知"
    }

    const getParticipantNames = (participants) => {
      return participants.map(p => p.nickName).join(", ")
    }

    const getMessageTypeColor = (msgType) => {
      switch (msgType) {
        case 1:
          return 'info';
        case 2:
          return 'success';
        case 3:
          return 'warning';
        case 4:
          return 'danger';
        case 5:
          return 'primary';
        default:
          return 'info';
      }
    }

    // 事件处理
    const handleSearch = () => {
      fetchConversationList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        conversationType: undefined,
        participantName: "",
        dateRange: []
      })
      handleSearch()
    }

    const handleConversationClick = (row) => {
      handleViewMessages(row)
    }

    const handleViewMessages = (row) => {
      Object.assign(currentConversation, row)
      messagePagination.page = 1
      Object.assign(messageSearchForm, {
        sendUserName: "",
        msgType: undefined
      })
      showMessagesDialog.value = true
      fetchMessageList()
    }

    const handleViewParticipants = (row) => {
      Object.assign(currentConversation, row)
      showParticipantsDialog.value = true
    }

    const handleMessageSearch = () => {
      messagePagination.page = 1
      fetchMessageList()
    }

    const handleMessageReset = () => {
      Object.assign(messageSearchForm, {
        sendUserName: "",
        msgType: undefined
      })
      handleMessageSearch()
    }

    const handleMessageSizeChange = (size) => {
      messagePagination.pageSize = size
      fetchMessageList()
    }

    const handleMessageCurrentChange = (page) => {
      messagePagination.page = page
      fetchMessageList()
    }

    const handleViewMessageDetail = async (message) => {
      await fetchMessageDetail(message.messageId)
      showMessageDetailDialog.value = true
    }

    const handleDeleteMessage = async (message) => {
      try {
        await ElMessageBox.confirm(`确认删除此消息吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        ElMessage.success("删除成功")
        fetchMessageList()
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    const handleRestoreMessage = async (message) => {
      try {
        ElMessage.success("恢复成功")
        fetchMessageList()
      } catch (error) {
        ElMessage.error("恢复失败")
      }
    }

    // 初始化
    onMounted(() => {
      fetchConversationList()
    })

    return {
      loading,
      messageLoading,
      detailLoading,
      conversationList,
      messageList,
      currentConversation,
      messageDetail,
      searchForm,
      messageSearchForm,
      messagePagination,
      showMessagesDialog,
      showParticipantsDialog,
      showMessageDetailDialog,
      getMsgTypeText,
      getParticipantNames,
      getMessageTypeColor,
      handleSearch,
      handleReset,
      handleConversationClick,
      handleViewMessages,
      handleViewParticipants,
      handleMessageSearch,
      handleMessageReset,
      handleMessageSizeChange,
      handleMessageCurrentChange,
      handleViewMessageDetail,
      handleDeleteMessage,
      handleRestoreMessage
    }
  }
})
</script>

<style lang="less" scoped>
.chat-messages-container {
  height: 100%;
  overflow-y: auto;
}

.main-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-right: 12px;
    }
  }

  :deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.search-section {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
  flex-shrink: 0;

  .search-form {
    width: 100%;
    overflow-x: auto;
  }
}

.conversation-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-table {
    flex: 1;
  }
}

.participants {
  display: flex;
  align-items: center;
  gap: 8px;

  .more-users {
    color: #909399;
    font-size: 12px;
  }

  .participant-names {
    margin-left: 8px;
    color: #606266;
    font-size: 14px;
  }
}

.messages-dialog-content {
  .conversation-info {
    margin-bottom: 20px;
  }

  .message-search {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .message-list {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 16px;
    background-color: #f8f9fa;

    .message-item {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;

      &.message-deleted {
        opacity: 0.6;
        
        .message-bubble {
          background-color: #fef0f0;
          border-color: #fbc4c4;
        }
      }

      &.message-mine {
        flex-direction: row-reverse;

        .message-wrapper {
          flex-direction: row-reverse;
        }

        .message-avatar {
          margin-left: 12px;
        }

        .message-content-wrapper {
          margin-left: 12px;
          align-items: flex-end;
        }

        .message-sender {
          text-align: right;
        }

        .message-bubble {
          background-color: #007aff;
          color: white;
          border-color: #007aff;

          .message-text {
            color: white;
          }
        }

        .message-actions {
          justify-content: flex-end;
        }
      }

      &.message-other {
        flex-direction: row;

        .message-wrapper {
          flex-direction: row;
        }

        .message-avatar {
          margin-right: 12px;
        }

        .message-content-wrapper {
          margin-right: 12px;
          align-items: flex-start;
        }

        .message-sender {
          text-align: left;
        }

        .message-bubble {
          background-color: white;
          border-color: #e1e1e1;
        }

        .message-actions {
          justify-content: flex-start;
        }
      }

      .message-wrapper {
        display: flex;
        align-items: flex-start;
        max-width: 70%;
      }

      .message-avatar {
        flex-shrink: 0;
      }

      .message-content-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .message-sender {
        margin-bottom: 4px;
        font-size: 12px;
        color: #909399;
      }

      .message-bubble {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 18px;
        border: 1px solid #e1e1e1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

        .message-type-tag {
          align-self: flex-start;
        }

        .message-text {
          word-break: break-all;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.4;
        }

        .message-status {
          align-self: flex-end;
        }
      }

      .message-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
    }
  }

  .message-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.participants-list {
  max-height: 400px;
  overflow-y: auto;
}

.message-content {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
