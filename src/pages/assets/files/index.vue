<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-manager-header-v1
-->

<template>
  <div class="assets-files">
    <el-card class="assets-files__search">
      <el-form :model="searchForm" inline>
        <el-form-item label="文件名">
          <el-input
            v-model="searchForm.keywords"
            placeholder="关键词"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="音频" value="audio" />
            <el-option label="文档" value="document" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="assets-files__list">
      <template #header>
        <div class="assets-files__header">
          <span>文件存储</span>
          <div class="assets-files__actions">
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleUpload"
            >
              <el-button type="primary" :loading="uploading">
                上传文件
              </el-button>
            </el-upload>
            <el-button
              type="danger"
              :disabled="!selectedIds.length"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="fileList"
        border
        height="100%"
        class="assets-files__table"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="预览" width="88" align="center">
          <template #default="{ row }">
            <el-image
              v-if="isImage(row.type) && row.path"
              :src="row.path"
              :preview-src-list="[row.path]"
              :preview-teleported="true"
              fit="cover"
              class="assets-files__thumb"
            />
            <div
              v-else-if="isVideo(row.type)"
              class="assets-files__thumb assets-files__thumb--media"
            >
              <el-icon :size="22"><VideoPlay /></el-icon>
            </div>
            <div
              v-else-if="isAudio(row.type)"
              class="assets-files__thumb assets-files__thumb--media"
            >
              <el-icon :size="22"><Headset /></el-icon>
            </div>
            <div v-else class="assets-files__thumb assets-files__thumb--file">
              <el-icon :size="22"><Document /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="originalName"
          label="原始文件名"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="100" align="center">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="170" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">
              详情
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="assets-files__pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          background
          layout="total, sizes, prev, pager, next"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="文件详情" width="560px">
      <el-descriptions v-if="fileDetail.id" :column="2" border>
        <el-descriptions-item label="ID">
          {{ fileDetail.id }}
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          {{ getTypeLabel(fileDetail.type) }}
        </el-descriptions-item>
        <el-descriptions-item label="原始文件名" :span="2">
          {{ fileDetail.originalName }}
        </el-descriptions-item>
        <el-descriptions-item label="文件 Key" :span="2">
          {{ fileDetail.fileName }}
        </el-descriptions-item>
        <el-descriptions-item label="大小">
          {{ formatSize(fileDetail.size) }}
        </el-descriptions-item>
        <el-descriptions-item label="MD5">
          {{ fileDetail.md5 }}
        </el-descriptions-item>
        <el-descriptions-item label="上传时间">
          {{ fileDetail.createdAt }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ fileDetail.updatedAt }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="fileDetail.path" class="assets-files__detail-preview">
        <el-image
          v-if="isImage(fileDetail.type)"
          :src="fileDetail.path"
          :preview-src-list="[fileDetail.path]"
          :preview-teleported="true"
          fit="contain"
          class="assets-files__detail-image"
        />
        <video
          v-else-if="isVideo(fileDetail.type)"
          :src="fileDetail.path"
          class="assets-files__detail-media"
          controls
        />
        <audio
          v-else-if="isAudio(fileDetail.type)"
          :src="fileDetail.path"
          controls
          class="assets-files__detail-audio"
        />
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">
          关闭
        </el-button>
        <el-button type="danger" @click="handleDeleteFromDetail">
          删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IFileInfo } from "@/types/api/file"
import type { TagType } from "@/types/common"
import { Document, Headset, VideoPlay } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  batchDeleteFileApi,
  deleteFileApi,
  getFileDetailApi,
  getFileListApi,
  uploadToLocalApi
} from "@/api/file"

export default defineComponent({
  name: "AssetsFiles",
  components: { Document, Headset, VideoPlay },
  setup() {
    const loading = ref(false)
    const uploading = ref(false)
    const fileList = ref<IFileInfo[]>([])
    const selectedIds = ref<number[]>([])
    const fileDetail = ref<IFileInfo>({} as IFileInfo)
    const detailVisible = ref(false)
    const searchForm = reactive({ keywords: "", type: "" })
    const pagination = reactive({ page: 1, limit: 10, total: 0 })

    const isImage = (type: string) => type === "image" || !!type?.includes("image")
    const isVideo = (type: string) => type === "video" || !!type?.includes("video")
    const isAudio = (type: string) => type === "audio" || !!type?.includes("audio")

    const fetchFileList = async () => {
      loading.value = true
      try {
        const res = await getFileListApi({
          page: pagination.page,
          limit: pagination.limit,
          type: searchForm.type || undefined,
          keywords: searchForm.keywords || undefined
        })
        if (res.code === 0) {
          fileList.value = res.result.list || []
          pagination.total = res.result.total || 0
        }
        else {
          ElMessage.error(res.msg || "获取文件列表失败")
        }
      }
      finally {
        loading.value = false
      }
    }

    const getTypeLabel = (type: string) => {
      const map: Record<string, string> = {
        image: "图片",
        video: "视频",
        audio: "音频",
        document: "文档",
        other: "其他"
      }
      return map[type] || type || "未知"
    }

    const getTypeTag = (type: string): TagType => {
      const map: Record<string, TagType> = {
        image: "success",
        video: "primary",
        audio: "warning",
        document: "info"
      }
      return map[type] || "info"
    }

    const formatSize = (bytes: number) => {
      if (!bytes)
        return "0 B"
      const units = ["B", "KB", "MB", "GB"]
      const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
      return `${Number.parseFloat((bytes / 1024 ** i).toFixed(2))} ${units[i]}`
    }

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
      pagination.page = 1
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
      }
      else {
        ElMessage.error(res.msg || "获取详情失败")
      }
    }

    const handleDelete = async (row: IFileInfo) => {
      await ElMessageBox.confirm(
        `确认删除文件「${row.originalName || row.fileName}」？`,
        "删除文件",
        { type: "warning" }
      )
      const res = await deleteFileApi(row.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchFileList()
      }
      else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleDeleteFromDetail = async () => {
      await handleDelete(fileDetail.value)
      detailVisible.value = false
    }

    const handleBatchDelete = async () => {
      if (!selectedIds.value.length)
        return
      await ElMessageBox.confirm(
        `确认删除选中的 ${selectedIds.value.length} 个文件？`,
        "批量删除",
        { type: "warning" }
      )
      const res = await batchDeleteFileApi({ ids: selectedIds.value })
      if (res.code === 0) {
        ElMessage.success("批量删除成功")
        selectedIds.value = []
        fetchFileList()
      }
      else {
        ElMessage.error(res.msg || "批量删除失败")
      }
    }

    const handleUpload = async (file: { raw?: File }) => {
      if (!file.raw)
        return
      uploading.value = true
      try {
        const res = await uploadToLocalApi(file.raw)
        if (res) {
          ElMessage.success(`上传成功：${res.originalName}`)
          fetchFileList()
        }
      }
      finally {
        uploading.value = false
      }
    }

    onMounted(fetchFileList)

    return {
      loading,
      uploading,
      fileList,
      selectedIds,
      fileDetail,
      detailVisible,
      searchForm,
      pagination,
      isImage,
      isVideo,
      isAudio,
      handleSearch,
      handleReset,
      onSizeChange,
      onPageChange,
      onSelectionChange,
      openDetail,
      handleDelete,
      handleDeleteFromDetail,
      handleBatchDelete,
      handleUpload,
      getTypeLabel,
      getTypeTag,
      formatSize
    }
  }
})
</script>

<style lang="less" scoped>
.assets-files {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;

  .assets-files__search {
    flex-shrink: 0;
    margin-bottom: 16px;
  }

  .assets-files__list {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    :deep(.el-card__header) {
      flex-shrink: 0;
    }

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .assets-files__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .assets-files__actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .assets-files__table {
    flex: 1;
    min-height: 0;
  }

  .assets-files__thumb {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    vertical-align: middle;

    &--media {
      color: #409eff;
    }

    &--file {
      color: #909399;
    }
  }

  .assets-files__pagination {
    flex-shrink: 0;
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .assets-files__detail-preview {
    margin-top: 16px;
    text-align: center;

    .assets-files__detail-image,
    .assets-files__detail-media {
      max-width: 100%;
      max-height: 280px;
    }

    .assets-files__detail-audio {
      width: 100%;
    }
  }
}
</style>