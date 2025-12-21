<script>
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { deleteFriendApi, getFriendDetailApi, getFriendListApi, restoreFriendApi } from "@/api/friend"

export default {
  setup() {
    // 响应式数据
    const loading = ref(false)
    const detailLoading = ref(false)
    const friendList = ref([])
    const friendDetail = reactive({
      id: "",
      sendUserId: "",
      sendUserName: "",
      revUserId: "",
      revUserName: "",
      sendUserNotice: "",
      revUserNotice: "",
      isDeleted: false,
      createTime: "",
      updateTime: ""
    })

    // 搜索表单
    const searchForm = reactive({
      userId: "",
      friendId: "",
      isDeleted: undefined,
      startTime: "",
      endTime: ""
    })

    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 弹窗控制
    const showDetailDialog = ref(false)
    const dateRange = ref([])

    // 获取好友关系列表
    const fetchFriendList = async () => {
      try {
        loading.value = true
        const res = await getFriendListApi({
          page: pagination.page,
          pageSize: pagination.pageSize,
          userId: searchForm.userId || undefined,
          friendId: searchForm.friendId || undefined,
          isDeleted: searchForm.isDeleted,
          startTime: searchForm.startTime || undefined,
          endTime: searchForm.endTime || undefined
        })
        if (res.code === 0) {
          friendList.value = res.result.list || []
          pagination.total = res.result.total || 0
        } else {
          ElMessage.error(res.msg || "获取好友关系列表失败")
        }
      } catch {
        ElMessage.error("获取好友关系列表失败")
      } finally {
        loading.value = false
      }
    }

    // 获取好友关系详情
    const fetchFriendDetail = async (id) => {
      try {
        detailLoading.value = true
        const res = await getFriendDetailApi(id)
        if (res.code === 0) {
          Object.assign(friendDetail, res.result)
        } else {
          ElMessage.error(res.msg || "获取好友关系详情失败")
        }
      } catch {
        ElMessage.error("获取好友关系详情失败")
      } finally {
        detailLoading.value = false
      }
    }

    // 事件处理
    const handleDateRangeChange = (value) => {
      if (value && value.length === 2) {
        searchForm.startTime = value[0]
        searchForm.endTime = value[1]
      } else {
        searchForm.startTime = ""
        searchForm.endTime = ""
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchFriendList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        userId: "",
        friendId: "",
        isDeleted: undefined,
        startTime: "",
        endTime: ""
      })
      dateRange.value = []
      handleSearch()
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchFriendList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchFriendList()
    }

    const handleViewDetail = async (row) => {
      await fetchFriendDetail(row.id)
      showDetailDialog.value = true
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确认删除"${row.sendUserName}"与"${row.revUserName}"的好友关系吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteFriendApi(row.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          fetchFriendList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    const handleRestore = async (row) => {
      try {
        await ElMessageBox.confirm(`确认恢复"${row.sendUserName}"与"${row.revUserName}"的好友关系吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await restoreFriendApi({ friendId: row.id })
        if (res.code === 0) {
          ElMessage.success("恢复成功")
          fetchFriendList()
        } else {
          ElMessage.error(res.msg || "恢复失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("恢复失败")
        }
      }
    }

    const handleDeleteFromDetail = async () => {
      try {
        await ElMessageBox.confirm(`确认删除这个好友关系吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteFriendApi(friendDetail.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          showDetailDialog.value = false
          fetchFriendList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    const handleRestoreFromDetail = async () => {
      try {
        await ElMessageBox.confirm(`确认恢复这个好友关系吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await restoreFriendApi({ friendId: friendDetail.id })
        if (res.code === 0) {
          ElMessage.success("恢复成功")
          showDetailDialog.value = false
          fetchFriendList()
        } else {
          ElMessage.error(res.msg || "恢复失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("恢复失败")
        }
      }
    }

    // 初始化
    onMounted(() => {
      fetchFriendList()
    })

    return {
      loading,
      detailLoading,
      friendList,
      friendDetail,
      searchForm,
      pagination,
      showDetailDialog,
      dateRange,
      fetchFriendList,
      handleDateRangeChange,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleViewDetail,
      handleDelete,
      handleRestore,
      handleDeleteFromDetail,
      handleRestoreFromDetail
    }
  }
}
</script>

<template>
  <div class="friend-relations">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">好友关系管理</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户ID">
            <el-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="好友ID">
            <el-input
              v-model="searchForm.friendId"
              placeholder="请输入好友ID"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.isDeleted"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="正常" :value="false" />
              <el-option label="已删除" :value="true" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
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

      <!-- 数据表格 -->
      <div class="table-section">
        <el-table
          :data="friendList"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="sendUserId" label="发起用户ID" width="120" show-overflow-tooltip />
          <el-table-column prop="sendUserName" label="发起用户" width="120" show-overflow-tooltip />
          <el-table-column prop="revUserId" label="接收用户ID" width="120" show-overflow-tooltip />
          <el-table-column prop="revUserName" label="接收用户" width="120" show-overflow-tooltip />
          <el-table-column prop="sendUserNotice" label="发起方备注" min-width="150" show-overflow-tooltip />
          <el-table-column prop="revUserNotice" label="接收方备注" min-width="150" show-overflow-tooltip />
          <el-table-column prop="isDeleted" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isDeleted ? 'danger' : 'success'" size="small">
                {{ row.isDeleted ? '已删除' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewDetail(row)">
                详情
              </el-button>
              <el-button
                v-if="!row.isDeleted"
                size="small"
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
              <el-button
                v-else
                size="small"
                type="success"
                @click="handleRestore(row)"
              >
                恢复
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

    <!-- 好友关系详情弹窗 -->
    <el-dialog
      title="好友关系详情"
      v-model="showDetailDialog"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关系ID" span="2">
            {{ friendDetail.id }}
          </el-descriptions-item>
          <el-descriptions-item label="发起用户ID" span="1">
            {{ friendDetail.sendUserId }}
          </el-descriptions-item>
          <el-descriptions-item label="发起用户昵称" span="1">
            {{ friendDetail.sendUserName }}
          </el-descriptions-item>
          <el-descriptions-item label="接收用户ID" span="1">
            {{ friendDetail.revUserId }}
          </el-descriptions-item>
          <el-descriptions-item label="接收用户昵称" span="1">
            {{ friendDetail.revUserName }}
          </el-descriptions-item>
          <el-descriptions-item label="发起方备注" span="2">
            {{ friendDetail.sendUserNotice || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="接收方备注" span="2">
            {{ friendDetail.revUserNotice || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态" span="1">
            <el-tag :type="friendDetail.isDeleted ? 'danger' : 'success'" size="small">
              {{ friendDetail.isDeleted ? '已删除' : '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" span="1">
            {{ friendDetail.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" span="2">
            {{ friendDetail.updateTime }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">
            关闭
          </el-button>
          <el-button
            v-if="!friendDetail.isDeleted"
            type="danger"
            @click="handleDeleteFromDetail"
          >
            删除关系
          </el-button>
          <el-button
            v-else
            type="success"
            @click="handleRestoreFromDetail"
          >
            恢复关系
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.friend-relations {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.table-section {
  margin-top: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}
</style>
