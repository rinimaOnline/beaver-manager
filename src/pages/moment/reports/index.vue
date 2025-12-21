<script lang="ts">
import { ElImageViewer, ElMessage, ElMessageBox } from "element-plus"
import { defineComponent, onMounted, reactive, ref } from "vue"
import { getMomentReportListApi, handleMomentReportApi } from "@/api/moment"

export default defineComponent({
  components: {
    ElImageViewer
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const detailLoading = ref(false)
    const reportList = ref([])
    const reportDetail = reactive({
      id: 0,
      momentId: 0,
      userId: "",
      reason: "",
      images: [],
      status: 0,
      createdAt: "",
      updatedAt: ""
    })

    // 搜索表单
    const searchForm = reactive({
      momentId: "",
      status: undefined
    })

    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 弹窗控制
    const showDetailDialog = ref(false)
    const showImageViewer = ref(false)
    const previewImageUrl = ref("")

    // 获取举报列表
    const fetchReportList = async () => {
      try {
        loading.value = true
        const res = await getMomentReportListApi({
          page: pagination.page,
          limit: pagination.pageSize,
          momentId: searchForm.momentId ? Number.parseInt(searchForm.momentId) : undefined,
          status: searchForm.status
        })
        if (res.code === 0) {
          reportList.value = res.result.list
          pagination.total = res.result.total
        } else {
          ElMessage.error(res.msg || "获取举报列表失败")
        }
      } catch {
        ElMessage.error("获取举报列表失败")
      } finally {
        loading.value = false
      }
    }

    // 工具函数
    const getStatusText = (status) => {
      const statusMap = {
        0: "待处理",
        1: "已处理",
        2: "已驳回"
      }
      return statusMap[status] || "未知"
    }

    const getStatusTagType = (status) => {
      const typeMap = {
        0: "warning",
        1: "success",
        2: "danger"
      }
      return typeMap[status] || ""
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchReportList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        momentId: "",
        status: undefined
      })
      handleSearch()
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchReportList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchReportList()
    }

    const handleViewDetail = (row) => {
      Object.assign(reportDetail, row)
      showDetailDialog.value = true
    }

    const handleProcess = async (row, status) => {
      const statusText = status === 1 ? "处理" : "驳回"
      try {
        await ElMessageBox.confirm(`确认${statusText}这条举报吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await handleMomentReportApi(row.id, { status })
        if (res.code === 0) {
          ElMessage.success(`${statusText}成功`)
          fetchReportList()
        } else {
          ElMessage.error(res.msg || `${statusText}失败`)
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error(`${statusText}失败`)
        }
      }
    }

    const handleProcessFromDetail = async (status) => {
      const statusText = status === 1 ? "处理" : "驳回"
      try {
        await ElMessageBox.confirm(`确认${statusText}这条举报吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await handleMomentReportApi(reportDetail.id, { status })
        if (res.code === 0) {
          ElMessage.success(`${statusText}成功`)
          showDetailDialog.value = false
          fetchReportList()
        } else {
          ElMessage.error(res.msg || `${statusText}失败`)
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error(`${statusText}失败`)
        }
      }
    }

    const handlePreviewImage = (url) => {
      previewImageUrl.value = url
      showImageViewer.value = true
    }

    // 初始化
    onMounted(() => {
      fetchReportList()
    })

    return {
      loading,
      detailLoading,
      reportList,
      reportDetail,
      searchForm,
      pagination,
      showDetailDialog,
      showImageViewer,
      previewImageUrl,
      getStatusText,
      getStatusTagType,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleViewDetail,
      handleProcess,
      handleProcessFromDetail,
      handlePreviewImage
    }
  }
})
</script>

<template>
  <div class="moment-reports-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">举报管理</span>
          <el-tag type="info" size="small">
            共 {{ pagination.total }} 条举报
          </el-tag>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="动态ID">
            <el-input
              v-model="searchForm.momentId"
              placeholder="请输入动态ID"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="处理状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="待处理" :value="0" />
              <el-option label="已处理" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
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
          :data="reportList"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="举报ID" width="100" />
          <el-table-column prop="momentId" label="动态ID" width="100" />
          <el-table-column prop="userId" label="举报用户" width="120" show-overflow-tooltip />
          <el-table-column prop="reason" label="举报原因" min-width="300" show-overflow-tooltip />
          <el-table-column prop="images" label="举报图片" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" v-if="row.images.length > 0">
                {{ row.images.length }} 张图片
              </el-tag>
              <span v-else class="text-gray">无</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="处理状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="举报时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewDetail(row)">
                详情
              </el-button>
              <el-button
                v-if="row.status === 0"
                size="small"
                type="success"
                @click="handleProcess(row, 1)"
              >
                处理
              </el-button>
              <el-button
                v-if="row.status === 0"
                size="small"
                type="warning"
                @click="handleProcess(row, 2)"
              >
                驳回
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

    <!-- 举报详情弹窗 -->
    <el-dialog
      title="举报详情"
      v-model="showDetailDialog"
      width="600px"
    >
      <div v-loading="detailLoading">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="举报ID">
            {{ reportDetail.id }}
          </el-descriptions-item>
          <el-descriptions-item label="动态ID">
            {{ reportDetail.momentId }}
          </el-descriptions-item>
          <el-descriptions-item label="举报用户">
            {{ reportDetail.userId }}
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusTagType(reportDetail.status)" size="small">
              {{ getStatusText(reportDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="举报原因">
            <div class="report-reason">
              {{ reportDetail.reason }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="举报图片" v-if="reportDetail.images && reportDetail.images.length > 0">
            <div class="images-container">
              <img
                v-for="(image, index) in reportDetail.images"
                :key="index"
                :src="image.url"
                class="report-image"
                @click="handlePreviewImage(image.url)"
              >
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="举报时间">
            {{ reportDetail.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ reportDetail.updatedAt }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">
            关闭
          </el-button>
          <el-button
            v-if="reportDetail.status === 0"
            type="success"
            @click="handleProcessFromDetail(1)"
          >
            处理
          </el-button>
          <el-button
            v-if="reportDetail.status === 0"
            type="warning"
            @click="handleProcessFromDetail(2)"
          >
            驳回
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <ElImageViewer
      v-if="showImageViewer"
      :url-list="[previewImageUrl]"
      @close="showImageViewer = false"
    />
  </div>
</template>

<style lang="less" scoped>
.moment-reports-container {
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

.table-section {
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
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.report-reason {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  word-break: break-all;
  white-space: pre-wrap;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .report-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #dcdfe6;

    &:hover {
      border-color: #409eff;
    }
  }
}

.text-gray {
  color: #909399;
}

.dialog-footer {
  text-align: right;

  .el-button {
    margin-left: 10px;
  }
}
</style>
