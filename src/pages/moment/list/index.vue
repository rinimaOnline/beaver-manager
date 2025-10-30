<script>
import { ElImageViewer, ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { deleteMomentApi, getMomentDetailApi, getMomentListApi } from "@/api/moment"

export default {
  components: {
    ElImageViewer
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const detailLoading = ref(false)
    const momentList = ref([])
    const momentDetail = reactive({
      id: 0,
      userId: "",
      content: "",
      files: [],
      isDeleted: false,
      visibility: 0,
      location: "",
      commentCount: 0,
      likeCount: 0,
      createdAt: "",
      updatedAt: ""
    })

    // 搜索表单
    const searchForm = reactive({
      userId: "",
      visibility: undefined,
      keywords: ""
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

    // 获取动态列表
    const fetchMomentList = async () => {
      try {
        loading.value = true
        const res = await getMomentListApi({
          page: pagination.page,
          limit: pagination.pageSize,
          userId: searchForm.userId || undefined,
          visibility: searchForm.visibility,
          keywords: searchForm.keywords || undefined
        })
        if (res.code === 0) {
          momentList.value = res.result.list || []
          pagination.total = res.result.total || 0
        } else {
          ElMessage.error(res.msg || "获取动态列表失败")
        }
      } catch {
        ElMessage.error("获取动态列表失败")
      } finally {
        loading.value = false
      }
    }

    // 获取动态详情
    const fetchMomentDetail = async (id) => {
      try {
        detailLoading.value = true
        const res = await getMomentDetailApi(id)
        if (res.code === 0) {
          Object.assign(momentDetail, res.result)
        } else {
          ElMessage.error(res.msg || "获取动态详情失败")
        }
      } catch {
        ElMessage.error("获取动态详情失败")
      } finally {
        detailLoading.value = false
      }
    }

    // 工具函数
    const getVisibilityText = (visibility) => {
      const visibilityMap = {
        0: "公开",
        1: "仅好友",
        2: "仅自己"
      }
      return visibilityMap[visibility] || "未知"
    }

    const getVisibilityTagType = (visibility) => {
      const typeMap = {
        0: "success",
        1: "warning",
        2: "info"
      }
      return typeMap[visibility] || ""
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchMomentList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        userId: "",
        visibility: undefined,
        keywords: ""
      })
      handleSearch()
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchMomentList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchMomentList()
    }

    const handleViewDetail = async (row) => {
      await fetchMomentDetail(row.id)
      showDetailDialog.value = true
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确认删除用户 ${row.userId} 的这条动态吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteMomentApi(row.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          fetchMomentList()
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
        await ElMessageBox.confirm(`确认删除这条动态吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteMomentApi(momentDetail.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          showDetailDialog.value = false
          fetchMomentList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    const handlePreviewImage = (url) => {
      previewImageUrl.value = url
      showImageViewer.value = true
    }

    // 初始化
    onMounted(() => {
      fetchMomentList()
    })

    return {
      loading,
      detailLoading,
      momentList,
      momentDetail,
      searchForm,
      pagination,
      showDetailDialog,
      showImageViewer,
      previewImageUrl,
      fetchMomentList,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleViewDetail,
      handleDelete,
      handleDeleteFromDetail,
      handlePreviewImage,
      getVisibilityText,
      getVisibilityTagType
    }
  }
}
</script>

<template>
  <div class="moment-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">动态管理</span>
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
          <el-form-item label="可见性">
            <el-select
              v-model="searchForm.visibility"
              placeholder="请选择可见性"
              clearable
              style="width: 120px"
            >
              <el-option label="公开" :value="0" />
              <el-option label="仅好友" :value="1" />
              <el-option label="仅自己" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keywords"
              placeholder="请输入内容关键词"
              clearable
              style="width: 200px"
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
          :data="momentList"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="userId" label="用户ID" width="120" show-overflow-tooltip />
          <el-table-column prop="content" label="动态内容" min-width="300" show-overflow-tooltip />
          <el-table-column prop="files" label="媒体文件" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" v-if="row.files && row.files.length > 0">
                {{ row.files.length }} 个文件
              </el-tag>
              <span v-else class="text-gray">无</span>
            </template>
          </el-table-column>
          <el-table-column prop="visibility" label="可见性" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getVisibilityTagType(row.visibility)" size="small">
                {{ getVisibilityText(row.visibility) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="位置" width="120" show-overflow-tooltip />
          <el-table-column prop="commentCount" label="评论数" width="80" align="center" />
          <el-table-column prop="likeCount" label="点赞数" width="80" align="center" />
          <el-table-column prop="isDeleted" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isDeleted ? 'danger' : 'success'" size="small">
                {{ row.isDeleted ? '已删除' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="发布时间" width="180" />
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

    <!-- 动态详情弹窗 -->
    <el-dialog
      title="动态详情"
      v-model="showDetailDialog"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="动态ID" span="1">
            {{ momentDetail.id }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID" span="1">
            {{ momentDetail.userId }}
          </el-descriptions-item>
          <el-descriptions-item label="可见性" span="1">
            <el-tag :type="getVisibilityTagType(momentDetail.visibility)" size="small">
              {{ getVisibilityText(momentDetail.visibility) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态" span="1">
            <el-tag :type="momentDetail.isDeleted ? 'danger' : 'success'" size="small">
              {{ momentDetail.isDeleted ? '已删除' : '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="位置" span="2">
            {{ momentDetail.location || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="动态内容" span="2">
            <div class="moment-content">
              {{ momentDetail.content }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="媒体文件" span="2" v-if="momentDetail.files && momentDetail.files.length > 0">
            <div class="files-container">
              <div
                v-for="(file, index) in momentDetail.files"
                :key="index"
                class="file-item"
              >
                <img
                  v-if="file.type && file.type.includes('image')"
                  :src="file.url"
                  class="file-preview"
                  @click="handlePreviewImage(file.url)"
                >
                <video
                  v-else-if="file.type && file.type.includes('video')"
                  :src="file.url"
                  class="file-preview"
                  controls
                />
                <div v-else class="file-link">
                  <a :href="file.url" target="_blank">{{ file.url }}</a>
                </div>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="评论数" span="1">
            {{ momentDetail.commentCount }}
          </el-descriptions-item>
          <el-descriptions-item label="点赞数" span="1">
            {{ momentDetail.likeCount }}
          </el-descriptions-item>
          <el-descriptions-item label="发布时间" span="1">
            {{ momentDetail.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" span="1">
            {{ momentDetail.updatedAt }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">
            关闭
          </el-button>
          <el-button
            v-if="!momentDetail.isDeleted"
            type="danger"
            @click="handleDeleteFromDetail"
          >
            删除动态
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

<style scoped>
.moment-list {
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

.text-gray {
  color: #909399;
}

.moment-content {
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
  white-space: pre-wrap;
}

.files-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-item {
  position: relative;
}

.file-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
}

.file-link {
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.file-link a {
  color: #409eff;
  text-decoration: none;
}

.file-link a:hover {
  text-decoration: underline;
}

.dialog-footer {
  text-align: right;
}
</style>
