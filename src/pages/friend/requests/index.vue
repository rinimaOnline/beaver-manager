<script>
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { deleteFriendVerifyApi, getFriendVerifyDetailApi, getFriendVerifyListApi } from "@/api/friend"

export default {
  setup() {
    // 响应式数据
    const loading = ref(false)
    const detailLoading = ref(false)
    const requestList = ref([])
    const requestDetail = reactive({
      id: "",
      sendUserId: "",
      sendUserName: "",
      revUserId: "",
      revUserName: "",
      sendStatus: 0,
      revStatus: 0,
      message: "",
      createTime: "",
      updateTime: ""
    })

    // 搜索表单
    const searchForm = reactive({
      sendUserId: "",
      revUserId: "",
      sendStatus: undefined,
      revStatus: undefined,
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

    // 获取好友申请列表
    const fetchRequestList = async () => {
      try {
        loading.value = true
        const res = await getFriendVerifyListApi({
          page: pagination.page,
          pageSize: pagination.pageSize,
          sendUserId: searchForm.sendUserId || undefined,
          revUserId: searchForm.revUserId || undefined,
          sendStatus: searchForm.sendStatus,
          revStatus: searchForm.revStatus,
          startTime: searchForm.startTime || undefined,
          endTime: searchForm.endTime || undefined
        })
        if (res.code === 0) {
          requestList.value = res.result.list || []
          pagination.total = res.result.total || 0
        } else {
          ElMessage.error(res.msg || "获取好友申请列表失败")
        }
      } catch {
        ElMessage.error("获取好友申请列表失败")
      } finally {
        loading.value = false
      }
    }

    // 获取好友申请详情
    const fetchRequestDetail = async (verifyId) => {
      try {
        detailLoading.value = true
        const res = await getFriendVerifyDetailApi({ verifyId })
        if (res.code === 0) {
          Object.assign(requestDetail, res.result)
        } else {
          ElMessage.error(res.msg || "获取好友申请详情失败")
        }
      } catch {
        ElMessage.error("获取好友申请详情失败")
      } finally {
        detailLoading.value = false
      }
    }

    // 工具函数
    const getStatusText = (status) => {
      const statusMap = {
        0: "未处理",
        1: "已通过",
        2: "已拒绝",
        3: "忽略",
        4: "删除"
      }
      return statusMap[status] || "未知"
    }

    const getStatusTagType = (status) => {
      const typeMap = {
        0: "warning",
        1: "success",
        2: "danger",
        3: "info",
        4: "danger"
      }
      return typeMap[status] || "info"
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
      fetchRequestList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        sendUserId: "",
        revUserId: "",
        sendStatus: undefined,
        revStatus: undefined,
        startTime: "",
        endTime: ""
      })
      dateRange.value = []
      handleSearch()
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchRequestList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchRequestList()
    }

    const handleViewDetail = async (row) => {
      await fetchRequestDetail(row.id)
      showDetailDialog.value = true
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确认删除"${row.sendUserName}"向"${row.revUserName}"的好友申请记录吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteFriendVerifyApi({ verifyId: row.id })
        if (res.code === 0) {
          ElMessage.success("删除成功")
          fetchRequestList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    const handleDeleteFromDetail = async () => {
      try {
        await ElMessageBox.confirm(`确认删除这个好友申请记录吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteFriendVerifyApi({ verifyId: requestDetail.id })
        if (res.code === 0) {
          ElMessage.success("删除成功")
          showDetailDialog.value = false
          fetchRequestList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    // 初始化
    onMounted(() => {
      fetchRequestList()
    })

    return {
      loading,
      detailLoading,
      requestList,
      requestDetail,
      searchForm,
      pagination,
      showDetailDialog,
      dateRange,
      fetchRequestList,
      handleDateRangeChange,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleViewDetail,
      handleDelete,
      handleDeleteFromDetail,
      getStatusText,
      getStatusTagType
    }
  }
}
</script>

<template>
  <div class="friend-requests">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">好友申请管理</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline>
          <el-form-item label="发起用户ID">
            <el-input
              v-model="searchForm.sendUserId"
              placeholder="请输入发起用户ID"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="接收用户ID">
            <el-input
              v-model="searchForm.revUserId"
              placeholder="请输入接收用户ID"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="发起状态">
            <el-select
              v-model="searchForm.sendStatus"
              placeholder="请选择发起状态"
              clearable
              style="width: 120px"
            >
              <el-option label="未处理" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已拒绝" :value="2" />
              <el-option label="忽略" :value="3" />
              <el-option label="删除" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="接收状态">
            <el-select
              v-model="searchForm.revStatus"
              placeholder="请选择接收状态"
              clearable
              style="width: 120px"
            >
              <el-option label="未处理" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已拒绝" :value="2" />
              <el-option label="忽略" :value="3" />
              <el-option label="删除" :value="4" />
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
          :data="requestList"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="sendUserId" label="发起用户ID" width="120" show-overflow-tooltip />
          <el-table-column prop="sendUserName" label="发起用户" width="120" show-overflow-tooltip />
          <el-table-column prop="revUserId" label="接收用户ID" width="120" show-overflow-tooltip />
          <el-table-column prop="revUserName" label="接收用户" width="120" show-overflow-tooltip />
          <el-table-column prop="message" label="申请消息" min-width="200" show-overflow-tooltip />
          <el-table-column prop="sendStatus" label="发起状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.sendStatus)" size="small">
                {{ getStatusText(row.sendStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="revStatus" label="接收状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.revStatus)" size="small">
                {{ getStatusText(row.revStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="申请时间" width="180" />
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewDetail(row)">
                详情
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
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

    <!-- 好友申请详情弹窗 -->
    <el-dialog
      title="好友申请详情"
      v-model="showDetailDialog"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请ID" span="2">
            {{ requestDetail.id }}
          </el-descriptions-item>
          <el-descriptions-item label="发起用户ID" span="1">
            {{ requestDetail.sendUserId }}
          </el-descriptions-item>
          <el-descriptions-item label="发起用户昵称" span="1">
            {{ requestDetail.sendUserName }}
          </el-descriptions-item>
          <el-descriptions-item label="接收用户ID" span="1">
            {{ requestDetail.revUserId }}
          </el-descriptions-item>
          <el-descriptions-item label="接收用户昵称" span="1">
            {{ requestDetail.revUserName }}
          </el-descriptions-item>
          <el-descriptions-item label="申请消息" span="2">
            {{ requestDetail.message || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="发起状态" span="1">
            <el-tag :type="getStatusTagType(requestDetail.sendStatus)" size="small">
              {{ getStatusText(requestDetail.sendStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="接收状态" span="1">
            <el-tag :type="getStatusTagType(requestDetail.revStatus)" size="small">
              {{ getStatusText(requestDetail.revStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间" span="1">
            {{ requestDetail.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" span="1">
            {{ requestDetail.updateTime }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">
            关闭
          </el-button>
          <el-button type="danger" @click="handleDeleteFromDetail">
            删除申请
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.friend-requests {
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
