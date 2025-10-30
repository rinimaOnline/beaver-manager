<script>
import { DocumentRemove } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { batchDeleteFileApi, deleteFileApi, getFileDetailApi, getFileListApi } from "@/api/file"

export default {
  components: {
    DocumentRemove
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const detailLoading = ref(false)
    const fileList = ref([])
    const selectedFiles = ref([])
    const fileDetail = reactive({
      id: 0,
      fileName: "",
      fileName: "",
      size: 0,
      path: "",
      hash: "",
      type: "",
      createdAt: "",
      updatedAt: ""
    })

    // 搜索表单
    const searchForm = reactive({
      keywords: "",
      type: ""
    })

    // 分页数据
    const pagination = reactive({
      page: 1,
      limit: 10,
      total: 0
    })

    // 弹窗控制
    const showDetailDialog = ref(false)
    const showPreviewDialog = ref(false)
    const previewFile = ref(null)

    // 获取文件列表
    const fetchFileList = async () => {
      try {
        loading.value = true
        const res = await getFileListApi({
          page: pagination.page,
          limit: pagination.limit,
          type: searchForm.type || undefined,
          keywords: searchForm.keywords || undefined
        })
        if (res.code === 0) {
          fileList.value = res.result.list || []
          pagination.total = res.result.total || 0
        } else {
          ElMessage.error(res.msg || "获取文件列表失败")
        }
      } catch {
        ElMessage.error("获取文件列表失败")
      } finally {
        loading.value = false
      }
    }

    // 获取文件详情
    const fetchFileDetail = async (id) => {
      try {
        detailLoading.value = true
        const res = await getFileDetailApi(id)
        if (res.code === 0) {
          Object.assign(fileDetail, res.result)
        } else {
          ElMessage.error(res.msg || "获取文件详情失败")
        }
      } catch {
        ElMessage.error("获取文件详情失败")
      } finally {
        detailLoading.value = false
      }
    }

    // 工具函数
    const getFileTypeText = (type) => {
      const typeMap = {
        image: "图片",
        video: "视频",
        audio: "音频",
        document: "文档",
        other: "其他"
      }
      return typeMap[type] || "未知"
    }

    const getFileTypeTagType = (type) => {
      const typeMap = {
        image: "success",
        video: "primary",
        audio: "warning",
        document: "info",
        other: ""
      }
      return typeMap[type] || ""
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 B"
      const k = 1024
      const sizes = ["B", "KB", "MB", "GB", "TB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
    }

    const isPreviewable = (type) => {
      return ["image", "video", "audio"].some(t => type.includes(t))
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchFileList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        keywords: "",
        type: ""
      })
      handleSearch()
    }

    const handleSizeChange = (size) => {
      pagination.limit = size
      fetchFileList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchFileList()
    }

    const handleSelectionChange = (selection) => {
      selectedFiles.value = selection.map(item => item.id)
    }

    const handleViewDetail = async (row) => {
      await fetchFileDetail(row.id)
      showDetailDialog.value = true
    }

    const handlePreview = (row) => {
      previewFile.value = row
      showPreviewDialog.value = true
    }

    const handlePreviewError = () => {
      ElMessage.error("文件预览失败，文件可能已损坏或不存在")
    }

    const handleDownload = (row) => {
      // 创建一个临时链接进行下载
      const link = document.createElement("a")
      link.href = row.path
      link.download = row.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确认删除文件"${row.fileName}"吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteFileApi(row.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          fetchFileList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    const handleBatchDelete = async () => {
      try {
        await ElMessageBox.confirm(`确认删除选中的 ${selectedFiles.value.length} 个文件吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await batchDeleteFileApi({ ids: selectedFiles.value })
        if (res.code === 0) {
          ElMessage.success("批量删除成功")
          selectedFiles.value = []
          fetchFileList()
        } else {
          ElMessage.error(res.msg || "批量删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("批量删除失败")
        }
      }
    }

    const handleDeleteFromDetail = async () => {
      try {
        await ElMessageBox.confirm(`确认删除文件"${fileDetail.fileName}"吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteFileApi(fileDetail.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          showDetailDialog.value = false
          fetchFileList()
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
      fetchFileList()
    })

    return {
      loading,
      detailLoading,
      fileList,
      selectedFiles,
      fileDetail,
      searchForm,
      pagination,
      showDetailDialog,
      showPreviewDialog,
      previewFile,
      fetchFileList,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleSelectionChange,
      handleViewDetail,
      handlePreview,
      handlePreviewError,
      handleDownload,
      handleDelete,
      handleBatchDelete,
      handleDeleteFromDetail,
      getFileTypeText,
      getFileTypeTagType,
      formatFileSize,
      isPreviewable
    }
  }
}
</script>

<template>
  <div class="file-storage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">文件存储管理</span>
          <div class="header-actions">
            <el-button
              type="danger"
              :disabled="selectedFiles.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline>
          <el-form-item label="文件名">
            <el-input
              v-model="searchForm.keywords"
              placeholder="请输入文件名关键词"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="文件类型">
            <el-select
              v-model="searchForm.type"
              placeholder="请选择文件类型"
              clearable
              style="width: 150px"
            >
              <el-option label="图片" value="image" />
              <el-option label="视频" value="video" />
              <el-option label="音频" value="audio" />
              <el-option label="文档" value="document" />
              <el-option label="其他" value="other" />
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
          :data="fileList"
          v-loading="loading"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getFileTypeTagType(row.type)" size="small">
                {{ getFileTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="文件大小" width="120" align="center">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="path" label="文件路径" min-width="300" show-overflow-tooltip />
          <el-table-column label="预览" width="100" align="center">
            <template #default="{ row }">
              <el-button
                v-if="isPreviewable(row.type)"
                size="small"
                type="primary"
                @click="handlePreview(row)"
              >
                预览
              </el-button>
              <span v-else class="text-gray">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="上传时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewDetail(row)">
                详情
              </el-button>
              <el-button size="small" @click="handleDownload(row)">
                下载
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
            :page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 文件详情弹窗 -->
    <el-dialog
      title="文件详情"
      v-model="showDetailDialog"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件ID" span="2">
            {{ fileDetail.fileName }}
          </el-descriptions-item>
          <el-descriptions-item label="文件名" span="2">
            {{ fileDetail.fileName }}
          </el-descriptions-item>
          <el-descriptions-item label="文件类型" span="1">
            <el-tag :type="getFileTypeTagType(fileDetail.type)" size="small">
              {{ getFileTypeText(fileDetail.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="文件大小" span="1">
            {{ formatFileSize(fileDetail.size) }}
          </el-descriptions-item>
          <el-descriptions-item label="文件路径" span="2">
            {{ fileDetail.path }}
          </el-descriptions-item>
          <el-descriptions-item label="文件Hash" span="2">
            <span class="hash-text">{{ fileDetail.hash }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="上传时间" span="1">
            {{ fileDetail.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" span="1">
            {{ fileDetail.updatedAt }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">
            关闭
          </el-button>
          <el-button type="primary" @click="handleDownload(fileDetail)">
            下载文件
          </el-button>
          <el-button type="danger" @click="handleDeleteFromDetail">
            删除文件
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 文件预览弹窗 -->
    <el-dialog
      title="文件预览"
      v-model="showPreviewDialog"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="preview-container">
        <img
          v-if="previewFile && previewFile.type.includes('image')"
          :src="previewFile.path"
          class="preview-image"
          @error="handlePreviewError"
        >
        <video
          v-else-if="previewFile && previewFile.type.includes('video')"
          :src="previewFile.path"
          class="preview-video"
          controls
          @error="handlePreviewError"
        />
        <audio
          v-else-if="previewFile && previewFile.type.includes('audio')"
          :src="previewFile.path"
          class="preview-audio"
          controls
          @error="handlePreviewError"
        />
        <div v-else class="preview-error">
          <el-icon size="48">
            <DocumentRemove />
          </el-icon>
          <p>该文件类型不支持预览</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPreviewDialog = false">
            关闭
          </el-button>
          <el-button type="primary" @click="handleDownload(previewFile)">
            下载文件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.file-storage {
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

.hash-text {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}

.preview-container {
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.preview-video {
  max-width: 100%;
  max-height: 400px;
}

.preview-audio {
  width: 100%;
}

.preview-error {
  color: #909399;
  text-align: center;
}

.preview-error p {
  margin-top: 10px;
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
}
</style>
