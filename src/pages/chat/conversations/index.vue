<template>
  <div class="conversations-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">用户对话管理</span>
          <el-tag type="info" size="small">
            共 {{ conversationList.length }} 个对话
          </el-tag>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="用户ID">
            <el-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="用户昵称">
            <el-input
              v-model="searchForm.userName"
              placeholder="请输入用户昵称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
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
          <el-form-item label="时间范围">
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
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewMessages(row)">
                查看消息
              </el-button>
              <el-button size="small" type="warning" @click="handleViewParticipants(row)">
                参与者
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteConversation(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

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
  </div>
</template>

<script lang="ts">
export default defineComponent({
  setup() {
    // 响应式数据
    const loading = ref(false)
    const conversationList = ref([])
    const currentConversation = reactive({
      conversationId: "",
      conversationType: 1,
      participants: [],
      messageCount: 0
    })

    // 搜索表单
    const searchForm = reactive({
      userId: "",
      userName: "",
      conversationType: undefined,
      dateRange: []
    })

    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 弹窗控制
    const showParticipantsDialog = ref(false)

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
            messageCount: 25,
            createTime: "2024-01-10 10:00:00"
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
            messageCount: 156,
            createTime: "2024-01-08 15:30:00"
          },
          {
            conversationId: "conv_003",
            conversationType: 1,
            participants: [
              { userId: "user_001", nickName: "张三", avatar: "" },
              { userId: "user_004", nickName: "赵六", avatar: "" }
            ],
            lastMessage: "项目进展如何？",
            lastMessageTime: "2024-01-15 18:20:00",
            messageCount: 89,
            createTime: "2024-01-05 09:15:00"
          }
        ]
        pagination.total = 3
      } catch (error) {
        ElMessage.error("获取对话列表失败")
      } finally {
        loading.value = false
      }
    }

    // 工具函数
    const getParticipantNames = (participants) => {
      return participants.map(p => p.nickName).join(", ")
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchConversationList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        userId: "",
        userName: "",
        conversationType: undefined,
        dateRange: []
      })
      handleSearch()
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchConversationList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchConversationList()
    }

    const handleViewMessages = (row) => {
      // 跳转到消息管理页面，传递对话ID
      window.location.href = `/chat/messages?conversationId=${row.conversationId}`
    }

    const handleViewParticipants = (row) => {
      Object.assign(currentConversation, row)
      showParticipantsDialog.value = true
    }

    const handleDeleteConversation = async (row) => {
      try {
        await ElMessageBox.confirm(`确认删除此对话吗？删除后将无法恢复。`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        ElMessage.success("删除成功")
        fetchConversationList()
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    // 初始化
    onMounted(() => {
      fetchConversationList()
    })

    return {
      loading,
      conversationList,
      currentConversation,
      searchForm,
      pagination,
      showParticipantsDialog,
      getParticipantNames,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleViewMessages,
      handleViewParticipants,
      handleDeleteConversation
    }
  }
})
</script>

<style lang="less" scoped>
.conversations-container {
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

  .pagination-wrapper {
    flex-shrink: 0;
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
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

.participants-list {
  max-height: 400px;
  overflow-y: auto;
}
</style> 