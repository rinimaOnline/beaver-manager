<template>
  <div class="assets-emojis">
    <!-- 搜索和筛选区域 -->
    <el-card class="box-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="表情名称">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入表情名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="创建者ID">
          <el-input
            v-model="searchForm.authorId"
            placeholder="请输入创建者ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button type="success" @click="handleCreate">
            新增表情
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表情列表 -->
    <el-card class="box-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>表情管理</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="emojiList"
        border
        style="width: 100%"

      >
      <!-- 序号 -->
        <el-table-column prop="emojiId" label="表情id" width="200" />
        <el-table-column prop="title" label="表情名称" min-width="150" />
        <el-table-column prop="fileKey" label="文件预览" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.fileKey"
              :src="row.fileKey"
              :preview-src-list="row.fileKey ? [row.fileKey] : []"
              style="width: 40px; height: 40px"
              fit="cover"
            />
            <span v-else>无文件</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
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



    <!-- 创建/编辑表情对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑表情' : '新增表情'" width="50%">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="表情名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入表情名称" />
        </el-form-item>
        <el-form-item label="表情文件" prop="fileId">
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
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="uploading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance } from "element-plus"
import type { IEmojiInfo } from "@/types/api/emoji"
import { ElMessage, ElMessageBox } from "element-plus"
import { UploadFilled, Close } from "@element-plus/icons-vue"
import {
  createEmojiApi,
  deleteEmojiApi,
  getEmojiListApi,
  updateEmojiApi
} from "@/api/emoji"
import { uploadFile } from "@/api/upload"

export default defineComponent({
  name: "AssetsEmojis",
  components: { UploadFilled, Close },
  setup() {
    const loading = ref(false)
    const emojiList = ref<IEmojiInfo[]>([])
    const total = ref(0)
    const formDialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref(null)
    const fileInput = ref(null)
    const uploading = ref(false)
    const previewUrl = ref('')
    const selectedFile = ref(null)

    // 搜索表单
    const searchForm = reactive({
      page: 1,
      pageSize: 10,
      title: "",
      authorId: ""
    })

    // 创建/编辑表单
    const form = reactive({
      title: "",
      fileId: "",
      fileName: "",
      emojiInfo: { width: 0, height: 0 },
      authorId: ""
    })

    // 表单验证规则
    const formRules = {
      title: [{ required: true, message: "请输入表情名称", trigger: "blur" }],
      fileId: [{ required: true, message: "请选择表情文件", trigger: "change" }]
    }

    const fetchEmojiList = async () => {
      loading.value = true
      const res = await getEmojiListApi(searchForm)
      loading.value = false
      if (res.code === 0) {
        emojiList.value = res.result.list || []
        total.value = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取表情列表失败")
      }
    }

    // 搜索
    const handleSearch = () => {
      searchForm.page = 1
      fetchEmojiList()
    }

    // 重置
    const handleReset = () => {
      Object.assign(searchForm, {
        page: 1,
        pageSize: 10,
        title: "",
        authorId: ""
      })
      fetchEmojiList()
    }

    // 分页处理
    const handleSizeChange = (size) => {
      searchForm.pageSize = size
      searchForm.page = 1
      fetchEmojiList()
    }

    const handleCurrentChange = (page) => {
      searchForm.page = page
      fetchEmojiList()
    }



    // 触发文件选择
    const triggerFileSelect = () => {
      fileInput.value?.click()
    }

    // 文件选择处理
    const handleFileSelect = async (event: Event) => {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return

      if (!file.type.startsWith("image/")) {
        ElMessage.error("只能上传图片文件")
        return
      }
      if (file.size / 1024 / 1024 >= 2) {
        ElMessage.error("上传图片大小不能超过 2MB")
        return
      }

      uploading.value = true
      const result = await uploadFile(file)
      uploading.value = false
      selectedFile.value = file
      form.fileId = result.fileKey
      form.emojiInfo = result.style
      previewUrl.value = URL.createObjectURL(file)
      ElMessage.success("文件上传成功")
    }



    // 删除文件
    const removeFile = () => {
      selectedFile.value = null
      form.fileId = ''
      previewUrl.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 新增表情
    const handleCreate = () => {
      isEdit.value = false
      Object.assign(form, { title: "", fileId: "", authorId: "" })
      selectedFile.value = null
      previewUrl.value = ''
      formDialogVisible.value = true
    }

    // 编辑表情
    const handleEdit = (row) => {
      isEdit.value = true
      Object.assign(form, {
        id: row.id,
        title: row.title,
        fileName: row.fileName,
        authorId: row.authorId
      })
      selectedFile.value = null
      previewUrl.value = row.fileKey || ''
      formDialogVisible.value = true
    }

    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      await formRef.value.validate()
      uploading.value = true

      if (isEdit.value) {
        let fileId = form.fileId
        if (selectedFile.value && !form.fileId) {
          const result = await uploadFile(selectedFile.value)
          fileId = result.fileKey
        }
        const res = await updateEmojiApi(form.id, { title: form.title, fileId })
        uploading.value = false
        if (res.code === 0) {
          ElMessage.success("更新成功")
          formDialogVisible.value = false
          fetchEmojiList()
        } else {
          ElMessage.error(res.msg || "更新失败")
        }
      } else {
        if (!form.fileId) {
          uploading.value = false
          ElMessage.error("请选择表情文件")
          return
        }
        const res = await createEmojiApi({
          title: form.title,
          fileKey: form.fileId,
          emojiInfo: form.emojiInfo
        })
        uploading.value = false
        if (res.code === 0) {
          ElMessage.success("创建成功")
          formDialogVisible.value = false
          fetchEmojiList()
        } else {
          ElMessage.error(res.msg || "创建失败")
        }
      }
    }

    const handleDelete = async (row: IEmojiInfo) => {
      await ElMessageBox.confirm(`确定删除表情「${row.title}」？`, "确认删除", { type: "warning" })
      const res = await deleteEmojiApi(row.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchEmojiList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }



    onMounted(() => {
      fetchEmojiList()
    })

    return {
      loading,
      emojiList,
      total,
      searchForm,
      form,
      formRef,
      formRules,
      formDialogVisible,
      isEdit,
      fileInput,
      uploading,
      previewUrl,
      selectedFile,
      fetchEmojiList,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleCreate,
      handleEdit,
      submitForm,
      handleDelete,
      triggerFileSelect,
      handleFileSelect,
      removeFile
    }
  }
})
</script>


<style lang="less">
.assets-emojis {
  padding: 20px;

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
    border-width: 2px;
    border-style: dashed;
    border-color: #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;

      .upload-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }
    }

    .image-preview {
      position: relative;
      width: 100%;
      height: 100%;

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
        color: #ffffff;
        cursor: pointer;
      }
    }
  }
}
</style>
