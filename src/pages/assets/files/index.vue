<template>
  <div class="assets-files">
    <div class="assets-files__header">
      <h2 class="assets-files__title">文件存储</h2>
      <div class="assets-files__actions">
        <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleUpload">
          <el-button type="primary" :loading="uploading">上传文件</el-button>
        </el-upload>
        <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      </div>
    </div>

    <el-form :inline="true" class="assets-files__form">
      <el-form-item label="文件名">
        <el-input v-model="searchForm.keywords" placeholder="关键词" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 140px">
          <el-option label="图片" value="image" />
          <el-option label="视频" value="video" />
          <el-option label="音频" value="audio" />
          <el-option label="文档" value="document" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="fileList" border stripe @selection-change="onSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="fileName" label="文件名" min-width="180" show-overflow-tooltip />
      <el-table-column label="类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.type)" size="small">{{ getTypeLabel(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="110" align="center">
        <template #default="{ row }">{{ formatSize(row.size) }}</template>
      </el-table-column>
      <el-table-column prop="path" label="路径" min-width="240" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="上传时间" width="170" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link @click="openDetail(row)">详情</el-button>
          <el-button v-if="canPreview(row.type)" link type="primary" @click="openPreview(row)">预览</el-button>
          <el-button link @click="downloadFile(row)">下载</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="assets-files__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      :current-page="pagination.page"
      :page-size="pagination.limit"
      :page-sizes="[10, 20, 50]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />

    <el-dialog v-model="detailVisible" title="文件详情" width="560px">
      <el-descriptions v-if="fileDetail.id" :column="2" border>
        <el-descriptions-item label="ID">{{ fileDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ getTypeLabel(fileDetail.type) }}</el-descriptions-item>
        <el-descriptions-item label="文件名" :span="2">{{ fileDetail.fileName }}</el-descriptions-item>
        <el-descriptions-item label="大小">{{ formatSize(fileDetail.size) }}</el-descriptions-item>
        <el-descriptions-item label="MD5">{{ fileDetail.md5 }}</el-descriptions-item>
        <el-descriptions-item label="路径" :span="2">{{ fileDetail.path }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ fileDetail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ fileDetail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadFile(fileDetail)">下载</el-button>
        <el-button type="danger" @click="handleDeleteFromDetail">删除</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="文件预览" width="720px">
      <div class="assets-files__preview">
        <img v-if="previewItem && previewItem.type.includes('image')" :src="previewItem.path" class="assets-files__preview-media">
        <video v-else-if="previewItem && previewItem.type.includes('video')" :src="previewItem.path" class="assets-files__preview-media" controls />
        <audio v-else-if="previewItem && previewItem.type.includes('audio')" :src="previewItem.path" controls style="width: 100%" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IFileInfo } from "@/types/api/file"
import { ElMessage, ElMessageBox } from "element-plus"
import { batchDeleteFileApi, deleteFileApi, getFileDetailApi, getFileListApi, uploadToLocalApi } from "@/api/file"

export default defineComponent({
  setup() {
    const loading = ref(false)
    const uploading = ref(false)
    const fileList = ref<IFileInfo[]>([])
    const selectedIds = ref<number[]>([])
    const fileDetail = ref<IFileInfo>({} as IFileInfo)
    const previewItem = ref<IFileInfo | null>(null)
    const detailVisible = ref(false)
    const previewVisible = ref(false)
    const searchForm = reactive({ keywords: "", type: "" })
    const pagination = reactive({ page: 1, limit: 10, total: 0 })

    const fetchFileList = async () => {
      loading.value = true
      const res = await getFileListApi({
        page: pagination.page,
        limit: pagination.limit,
        type: searchForm.type || undefined,
        keywords: searchForm.keywords || undefined
      })
      loading.value = false
      if (res.code === 0) {
        fileList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取文件列表失败")
      }
    }

    const getTypeLabel = (type: string) => {
      const map: Record<string, string> = { image: "图片", video: "视频", audio: "音频", document: "文档", other: "其他" }
      return map[type] || type || "未知"
    }

    const getTypeTag = (type: string) => {
      const map: Record<string, string> = { image: "success", video: "primary", audio: "warning", document: "info" }
      return map[type] || ""
    }

    const formatSize = (bytes: number) => {
      if (!bytes) return "0 B"
      const units = ["B", "KB", "MB", "GB"]
      const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
      return `${Number.parseFloat((bytes / 1024 ** i).toFixed(2))} ${units[i]}`
    }

    const canPreview = (type: string) => ["image", "video", "audio"].some(t => type?.includes(t))

    const handleSearch = () => {
      pagination.page = 1
      fetchFileList()
    }

    const handleReset = () => {
      searchForm.keywords = ""
      searchForm.type = ""
      handleSearch()
    }

    const onSizeChange = (size: number) => {
      pagination.limit = size
      fetchFileList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchFileList()
    }

    const onSelectionChange = (rows: IFileInfo[]) => {
      selectedIds.value = rows.map(r => r.id)
    }

    const openDetail = async (row: IFileInfo) => {
      const res = await getFileDetailApi(row.id)
      if (res.code === 0) {
        fileDetail.value = res.result
        detailVisible.value = true
      } else {
        ElMessage.error(res.msg || "获取详情失败")
      }
    }

    const openPreview = (row: IFileInfo) => {
      previewItem.value = row
      previewVisible.value = true
    }

    const downloadFile = (row: IFileInfo) => {
      if (!row?.path) return
      const link = document.createElement("a")
      link.href = row.path
      link.download = row.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    const handleDelete = async (row: IFileInfo) => {
      await ElMessageBox.confirm(`确认删除文件「${row.fileName}」？`, "删除文件", { type: "warning" })
      const res = await deleteFileApi(row.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchFileList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleDeleteFromDetail = async () => {
      await handleDelete(fileDetail.value)
      detailVisible.value = false
    }

    const handleBatchDelete = async () => {
      if (!selectedIds.value.length) return
      await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个文件？`, "批量删除", { type: "warning" })
      const res = await batchDeleteFileApi({ ids: selectedIds.value })
      if (res.code === 0) {
        ElMessage.success("批量删除成功")
        selectedIds.value = []
        fetchFileList()
      } else {
        ElMessage.error(res.msg || "批量删除失败")
      }
    }

    const handleUpload = async (file: { raw?: File }) => {
      if (!file.raw) return
      uploading.value = true
      const res = await uploadToLocalApi(file.raw)
      uploading.value = false
      if (res) {
        ElMessage.success(`上传成功：${res.originalName}`)
        fetchFileList()
      }
    }

    onMounted(fetchFileList)

    return {
      loading, uploading, fileList, selectedIds, fileDetail, previewItem, detailVisible, previewVisible,
      searchForm, pagination,
      handleSearch, handleReset, onSizeChange, onPageChange, onSelectionChange,
      openDetail, openPreview, downloadFile, handleDelete, handleDeleteFromDetail, handleBatchDelete, handleUpload,
      getTypeLabel, getTypeTag, formatSize, canPreview
    }
  }
})
</script>

<style lang="less">
.assets-files {
  padding: 20px;

  .assets-files__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .assets-files__title {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
    }

    .assets-files__actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .assets-files__form {
    margin-bottom: 12px;
  }

  .assets-files__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .assets-files__preview {
    text-align: center;

    .assets-files__preview-media {
      max-width: 100%;
      max-height: 420px;
    }
  }
}
</style>
