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
  <div class="assets-emoji-packages">
    <!-- 搜索和筛选区域 -->
    <el-card class="box-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="表情包名称">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入表情包名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.userId"
            placeholder="请输入用户ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 120px"
          >
            <el-option label="官方" value="official" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="(label, value) in packageStatusMap"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button type="success" @click="handleCreate">
            新增表情包
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表情包列表 -->
    <el-card class="box-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>表情包管理</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="packageList"
        style="width: 100%"
      >
        <el-table-column prop="packageId" label="合集id" width="120" />
        <el-table-column prop="title" label="表情包名称" min-width="180" />
        <el-table-column prop="coverFile" label="封面预览" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.coverFile"
              :src="row.coverFile"
              :preview-src-list="row.coverFile ? [row.coverFile] : []"
              style="width: 50px; height: 50px"
              fit="cover"
            />
            <span v-else>无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'official' ? 'success' : 'info'">
              {{ row.type === 'official' ? '官方' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ packageStatusMap[row.status] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="goUser(row.userId)">用户360</el-button>
            <el-button size="small" type="success" @click="handleManageEmojis(row)">管理表情</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        :current-page="searchForm.page"
        :page-size="searchForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>



    <!-- 创建/编辑表情包对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑表情包' : '新增表情包'"
      width="50%"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="表情包名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入表情包名称" />
        </el-form-item>
        <el-form-item label="封面文件" prop="coverFile">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />
          
          <div class="upload-box" @click="triggerFileSelect">
            <div v-if="!previewUrl" class="upload-placeholder">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <span class="upload-text">点击上传</span>
            </div>
            
            <div v-else class="image-preview">
              <el-image
                :src="previewUrl"
                fit="cover"
                :preview-src-list="[previewUrl]"
                class="preview-image"
              />
              <div class="delete-icon" @click.stop="removeFile">
                <el-icon><Close /></el-icon>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="官方" value="official" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入表情包描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="uploading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 表情管理对话框 -->
    <el-dialog v-model="emojiDialogVisible" title="表情管理" width="90%">
      <div v-if="currentPackage">
        <!-- 表情包信息 -->
        <el-card class="box-card" style="margin-bottom: 20px">
          <template #header>
            <div class="card-header">
              <span>{{ currentPackage.title }} - 表情管理</span>
              <el-button type="success" @click="handleAddEmojiToPackage">
                添加表情
              </el-button>
            </div>
          </template>
          
          <el-descriptions :column="4" border>
            <el-descriptions-item label="表情包ID">{{ currentPackage.packageId }}</el-descriptions-item>
            <el-descriptions-item label="创建者">{{ currentPackage.userId }}</el-descriptions-item>
            <el-descriptions-item label="类型">
              <el-tag :type="currentPackage.type === 'official' ? 'success' : 'info'">
                {{ currentPackage.type === 'official' ? '官方' : '用户' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="表情数量">{{ emojiList.length }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 表情列表 -->
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>表情列表</span>
            </div>
          </template>

          <div v-if="emojiList.length === 0" class="empty-state">
            <el-empty description="暂无表情，点击上方按钮添加表情" />
          </div>
          
          <div v-else class="emoji-grid">
            <div 
              v-for="emoji in emojiList" 
              :key="emoji.emojiId" 
              class="emoji-item"
            >
              <div class="emoji-preview">
                <el-image
                  v-if="emoji.fileUrl"
                  :src="emoji.fileUrl"
                  :preview-src-list="emoji.fileUrl ? [emoji.fileUrl] : []"
                  fit="cover"
                />
                <div v-else class="no-image">无图片</div>
              </div>
              <div class="emoji-info">
                <div class="emoji-title">{{ emoji.title }}</div>
                <div class="emoji-actions">
                  <el-button size="small" type="danger" @click="handleDeleteEmoji(emoji)">
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-dialog>

    <!-- 添加表情对话框 -->
    <el-dialog v-model="emojiFormDialogVisible" title="添加表情" width="50%">
      <el-form ref="emojiFormRef" :model="emojiForm" :rules="emojiFormRules" label-width="100px">
        <el-form-item label="表情名称" prop="title">
          <el-input v-model="emojiForm.title" placeholder="请输入表情名称" />
        </el-form-item>
        <el-form-item label="表情文件" prop="fileUrl">
          <input
            ref="emojiFileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleEmojiFileSelect"
          />
          
          <div class="upload-box" @click="triggerEmojiFileSelect">
            <div v-if="!emojiPreviewUrl" class="upload-placeholder">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <span class="upload-text">点击上传</span>
            </div>
            
            <div v-else class="image-preview">
              <el-image
                :src="emojiPreviewUrl"
                fit="cover"
                :preview-src-list="[emojiPreviewUrl]"
                class="preview-image"
              />
              <div class="delete-icon" @click.stop="removeEmojiFile">
                <el-icon><Close /></el-icon>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="emojiFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEmojiForm" :loading="emojiUploading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance } from "element-plus"
import type { TagType } from "@/types/common"
import type { IEmojiInfo, IEmojiPackageInfo } from "@/types/api/emoji"
import { ElMessage, ElMessageBox } from "element-plus"
import {  onMounted, reactive, ref } from "vue"

import {
  createEmojiPackageApi,
  deleteEmojiPackageApi,
  getEmojiPackageListApi,
  getEmojiPackageEmojisApi,
  updateEmojiPackageApi,
  addEmojiToPackageApi,
  removeEmojiFromPackageApi
} from "@/api/emoji"
import { EmojiPackageStatus } from "@/types/api/emoji"
import { uploadFile } from "@/api/upload"

export default defineComponent({
  name: "EmojiPackageList",
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const packageList = ref<IEmojiPackageInfo[]>([])
    const total = ref(0)
    const formDialogVisible = ref(false)
    const emojiDialogVisible = ref(false)
    const emojiFormDialogVisible = ref(false)
    const isEdit = ref(false)
    const currentPackage = ref<IEmojiPackageInfo | null>(null)
    const formRef = ref<FormInstance>()
    const fileInput = ref<HTMLInputElement | null>(null)
    const uploading = ref(false)
    const previewUrl = ref('')
    const selectedFile = ref<File | null>(null)
    const emojiList = ref<IEmojiInfo[]>([])
    const emojiLoading = ref(false)
    const emojiFileInput = ref<HTMLInputElement | null>(null)
    const emojiFormRef = ref<FormInstance>()
    const emojiUploading = ref(false)
    const emojiPreviewUrl = ref('')
    const emojiSelectedFile = ref<File | null>(null)

    // 表情包状态映射
    const packageStatusMap: Record<number, string> = {
      [EmojiPackageStatus.DISABLED]: "禁用",
      [EmojiPackageStatus.ENABLED]: "启用",
      [EmojiPackageStatus.REVIEWING]: "审核中",
      [EmojiPackageStatus.REJECTED]: "已拒绝"
    }

    // 搜索表单
    const searchForm = reactive({
      page: 1,
      pageSize: 10,
      title: "",
      userId: "",
      type: "",
      status: undefined as number | undefined
    })

    // 创建/编辑表单
    const form = reactive({
      packageId: "",
      title: "",
      coverFile: "",
      description: "",
      type: "user"
    })

    // 表单验证规则
    const formRules = {
      title: [
        { required: true, message: "请输入表情包名称", trigger: "blur" }
      ],
      coverFile: [
        { required: true, message: "请选择封面文件", trigger: "change" }
      ],
      type: [
        { required: true, message: "请选择类型", trigger: "change" }
      ],
      description: [
        { required: true, message: "请输入描述", trigger: "blur" }
      ]
    }

    // 表情表单数据
    const emojiForm = reactive({
      title: "",
      fileUrl: "",
      packageId: "",
      emojiInfo: { width: 0, height: 0 }
    })

    // 表情表单验证规则
    const emojiFormRules = {
      title: [{ required: true, message: "请输入表情名称", trigger: "blur" }],
      fileUrl: [{ required: true, message: "请选择表情文件", trigger: "change" }]
    }

    // 获取状态标签类型
    const getStatusTagType = (status: number): TagType => {
      const statusMap: Record<number, TagType> = {
        [EmojiPackageStatus.DISABLED]: "danger",
        [EmojiPackageStatus.ENABLED]: "success",
        [EmojiPackageStatus.REVIEWING]: "warning",
        [EmojiPackageStatus.REJECTED]: "info"
      }
      return statusMap[status] || "info"
    }

    // 获取表情包列表
    const fetchPackageList = async () => {
      loading.value = true
      const res = await getEmojiPackageListApi(searchForm)
      loading.value = false
      if (res.code === 0) {
        packageList.value = res.result.list || []
        total.value = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取表情包列表失败")
      }
    }

    const fetchEmojiList = async (packageId: string) => {
      emojiLoading.value = true
      const res = await getEmojiPackageEmojisApi({ packageId })
      emojiLoading.value = false
      if (res.code === 0) {
        emojiList.value = res.result?.list || []
      } else {
        ElMessage.error(res.msg || "获取表情列表失败")
      }
    }

    // 搜索
    const handleSearch = () => {
      searchForm.page = 1
      fetchPackageList()
    }

    // 重置
    const handleReset = () => {
      Object.assign(searchForm, {
        page: 1,
        pageSize: 10,
        title: "",
        userId: "",
        type: "",
        status: undefined
      })
      fetchPackageList()
    }

    // 处理分页大小变化
    const handleSizeChange = (size: number) => {
      searchForm.pageSize = size
      searchForm.page = 1
      fetchPackageList()
    }

    // 处理当前页变化
    const handleCurrentChange = (page: number) => {
      searchForm.page = page
      fetchPackageList()
    }

    // 触发文件选择
    const triggerFileSelect = () => {
      fileInput.value?.click()
    }

    // 文件选择处理
    const handleFileSelect = async (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      // 验证文件
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return
      }
      if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!')
        return
      }

      uploading.value = true
      const result = await uploadFile(file)
      uploading.value = false
      selectedFile.value = file
      form.coverFile = result.fileUrl
      previewUrl.value = result.fileUrl
      ElMessage.success("文件上传成功")
    }

    // 删除文件
    const removeFile = () => {
      selectedFile.value = null
      form.coverFile = ''
      previewUrl.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 表情文件相关方法
    const triggerEmojiFileSelect = () => {
      emojiFileInput.value?.click()
    }

    const handleEmojiFileSelect = async (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return
      }
      if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!')
        return
      }

      emojiUploading.value = true
      const result = await uploadFile(file)
      emojiUploading.value = false
      emojiSelectedFile.value = file
      emojiForm.fileUrl = result.fileUrl
      emojiForm.emojiInfo = {
        width: result.style.width || 0,
        height: result.style.height || 0,
      }
      emojiPreviewUrl.value = result.fileUrl
      ElMessage.success("文件上传成功")
    }

    const removeEmojiFile = () => {
      emojiSelectedFile.value = null
      emojiForm.fileUrl = ''
      emojiPreviewUrl.value = ''
      if (emojiFileInput.value) {
        emojiFileInput.value.value = ''
      }
    }

    // 管理表情包内的表情
    const handleManageEmojis = (row: IEmojiPackageInfo) => {
      currentPackage.value = row
      emojiDialogVisible.value = true
      fetchEmojiList(row.packageId)
    }

    // 添加表情到表情包
    const handleAddEmojiToPackage = () => {
      if (!currentPackage.value) return
      emojiFormDialogVisible.value = true
      emojiForm.packageId = currentPackage.value.packageId
    }

    // 新增表情包
    const handleCreate = () => {
      isEdit.value = false
      Object.assign(form, {
        title: "",
        coverFile: "",
        description: "",
        type: "user"
      })
      selectedFile.value = null
      previewUrl.value = ''
      formDialogVisible.value = true
    }

    // 编辑表情包
    const handleEdit = (row: IEmojiPackageInfo) => {
      isEdit.value = true
      Object.assign(form, {
        packageId: row.packageId,
        title: row.title,
        coverFile: row.coverFile,
        description: row.description,
        type: row.type
      })
      selectedFile.value = null
      previewUrl.value = row.coverFile || ''
      formDialogVisible.value = true
    }

    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      await formRef.value.validate()
      if (isEdit.value) {
        const res = await updateEmojiPackageApi({
          packageId: form.packageId,
          title: form.title,
          coverFile: form.coverFile,
          description: form.description,
          type: form.type
        })
        if (res.code === 0) {
          ElMessage.success("更新成功")
          formDialogVisible.value = false
          fetchPackageList()
        } else {
          ElMessage.error(res.msg || "更新失败")
        }
      } else {
        const res = await createEmojiPackageApi({
          title: form.title,
          coverFile: form.coverFile,
          description: form.description,
          type: form.type
        })
        if (res.code === 0) {
          ElMessage.success("创建成功")
          formDialogVisible.value = false
          fetchPackageList()
        } else {
          ElMessage.error(res.msg || "创建失败")
        }
      }
    }

    const handleDelete = async (row: IEmojiPackageInfo) => {
      await ElMessageBox.confirm(`确定删除表情包「${row.title}」？`, "确认删除", { type: "warning" })
      const res = await deleteEmojiPackageApi(row.packageId)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchPackageList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }



    // 提交表情表单
    const submitEmojiForm = async () => {
      if (!emojiFormRef.value || !currentPackage.value) return
      await emojiFormRef.value.validate()
      if (!emojiForm.fileUrl) {
        ElMessage.error("请选择表情文件")
        return
      }
      emojiUploading.value = true
      const res = await addEmojiToPackageApi({
        packageId: emojiForm.packageId,
        fileUrl: emojiForm.fileUrl,
        title: emojiForm.title,
        emojiInfo: emojiForm.emojiInfo
      })
      emojiUploading.value = false
      if (res.code === 0) {
        ElMessage.success("添加成功")
        emojiFormDialogVisible.value = false
        fetchEmojiList(currentPackage.value.packageId)
        Object.assign(emojiForm, { title: "", fileUrl: "", emojiInfo: { width: 0, height: 0 } })
        emojiSelectedFile.value = null
        emojiPreviewUrl.value = ""
      } else {
        ElMessage.error(res.msg || "添加失败")
      }
    }

    const handleDeleteEmoji = async (row: IEmojiInfo) => {
      if (!currentPackage.value) return
      const packageId = currentPackage.value.packageId
      await ElMessageBox.confirm(`确认移除表情「${row.title}」？`, "确认移除", { type: "warning" })
      const res = await removeEmojiFromPackageApi({ packageId, emojiId: row.emojiId })
      if (res.code === 0) {
        ElMessage.success("移除成功")
        fetchEmojiList(packageId)
      } else {
        ElMessage.error(res.msg || "移除失败")
      }
    }



    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(() => {
      fetchPackageList()
    })

    return {
      loading,
      packageList,
      total,
      searchForm,
      form,
      formRef,
      formRules,
      formDialogVisible,
      isEdit,
      currentPackage,
      packageStatusMap,
      fileInput,
      uploading,
      previewUrl,
      selectedFile,
      getStatusTagType,
      fetchPackageList,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleManageEmojis,
      handleCreate,
      handleEdit,
      submitForm,
      handleDelete,
      handleAddEmojiToPackage,
      handleDeleteEmoji,
      triggerFileSelect,
      handleFileSelect,
      removeFile,
      triggerEmojiFileSelect,
      handleEmojiFileSelect,
      removeEmojiFile,
      submitEmojiForm,
      goUser,
      emojiDialogVisible,
      emojiFormDialogVisible,
      emojiList,
      emojiLoading,
      emojiForm,
      emojiFormRules,
      emojiFormRef,
      emojiFileInput,
      emojiUploading,
      emojiPreviewUrl,
      emojiSelectedFile,
      fetchEmojiList
    }
  }
})
</script>


<style scoped>
.emoji-package-list {
  padding: 20px;
}

.box-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-box {
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.upload-box:hover {
  border-color: #409eff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.delete-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-icon:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.emoji-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.emoji-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.emoji-preview {
  height: 150px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.emoji-preview .el-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #909399;
  font-size: 14px;
}

.emoji-info {
  padding: 12px;
}

.emoji-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emoji-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
