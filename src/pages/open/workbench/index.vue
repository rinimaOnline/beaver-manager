<template>
  <div class="open-workbench">
    <div class="open-workbench__header">
      <h2 class="open-workbench__title">工作台应用</h2>
      <p class="open-workbench__hint">配置 IM 客户端工作台展示的应用，支持内部路由与第三方 H5</p>
    </div>

    <el-form :inline="true" class="open-workbench__form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keywords" placeholder="名称/描述" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="searchForm.category" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="下架" :value="0" />
          <el-option label="上架" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="openCreate">新建应用</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="appList" border stripe>
      <el-table-column label="应用" min-width="200">
        <template #default="{ row }">
          <div class="open-workbench__app">
            <el-image
              v-if="row.icon"
              :src="row.icon"
              :preview-src-list="[row.icon]"
              class="open-workbench__icon"
              fit="cover"
            />
            <div v-else class="open-workbench__icon open-workbench__icon--empty">{{ row.name.slice(0, 1) }}</div>
            <div class="open-workbench__meta">
              <div class="open-workbench__name">{{ row.name }}</div>
              <div class="open-workbench__id">{{ row.workbenchAppId }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">{{ row.appType === 0 ? "内部" : "第三方H5" }}</template>
      </el-table-column>
      <el-table-column label="可见端" width="100">
        <template #default="{ row }">{{ clientScopeLabel(row.clientScope) }}</template>
      </el-table-column>
      <el-table-column label="分类" width="90">
        <template #default="{ row }">{{ categoryLabel(row.category) }}</template>
      </el-table-column>
      <el-table-column label="入口" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ entrySummary(row) }}</template>
      </el-table-column>
      <el-table-column label="打开方式" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.appType === 1" :type="row.openMode === 1 ? 'warning' : 'success'" size="small">
            {{ row.openMode === 1 ? "系统浏览器" : "内嵌" }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? "上架" : "下架" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link @click="toggleStatus(row)">{{ row.status === 1 ? "下架" : "上架" }}</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无工作台应用" />
      </template>
    </el-table>

    <el-pagination
      class="open-workbench__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑应用' : '新建应用'" width="620px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" maxlength="64" placeholder="客户端展示名称" />
        </el-form-item>
        <el-form-item label="应用类型" prop="appType">
          <el-radio-group v-model="form.appType" @change="onAppTypeChange">
            <el-radio :value="0">内部（原生路由）</el-radio>
            <el-radio :value="1">第三方 H5</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="可见端" prop="clientScope">
          <el-radio-group v-model="form.clientScope" @change="onClientScopeChange">
            <el-radio :value="0">全部</el-radio>
            <el-radio :value="1">仅 PC</el-radio>
            <el-radio :value="2">仅移动</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入口类型">
          <el-tag size="small">{{ form.entryConfig.type === 0 ? "路由 key" : "H5 地址" }}</el-tag>
        </el-form-item>
        <el-form-item v-if="showPcEntry" label="PC 入口" prop="entryConfig.pc">
          <el-input
            v-model="form.entryConfig.pc"
            :placeholder="form.entryConfig.type === 0 ? '如 moment' : 'https://'"
          />
        </el-form-item>
        <el-form-item v-if="showMobileEntry" label="移动端入口" prop="entryConfig.mobile">
          <el-input
            v-model="form.entryConfig.mobile"
            :placeholder="form.entryConfig.type === 0 ? '如 moment' : 'https://'"
          />
        </el-form-item>
        <el-form-item v-if="form.appType === 1" label="打开方式" prop="openMode">
          <el-radio-group v-model="form.openMode">
            <el-radio :value="0">内嵌打开</el-radio>
            <el-radio :value="1">系统浏览器</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="应用图标" prop="icon">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          >
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
        <el-form-item label="分类">
          <el-select v-model="form.category" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="上架" inactive-text="下架" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="应用简介" />
        </el-form-item>
        <el-form-item label="运营备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="不对客户端展示" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving || uploading" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { IWorkbenchAppItem } from "@/types/api/workbench"
import { ElMessage, ElMessageBox } from "element-plus"
import { Close, UploadFilled } from "@element-plus/icons-vue"
import {
  createWorkbenchAppApi,
  deleteWorkbenchAppApi,
  getWorkbenchAppListApi,
  updateWorkbenchAppApi
} from "@/api/workbench"
import { uploadFile } from "@/api/upload"

const categoryOptions = [
  { label: "默认", value: 0 },
  { label: "办公", value: 1 },
  { label: "审批", value: 2 },
  { label: "效率", value: 3 },
  { label: "其他", value: 4 }
]

const emptyForm = () => ({
  workbenchAppId: "",
  name: "",
  icon: "",
  description: "",
  remark: "",
  appType: 1,
  clientScope: 0,
  entryConfig: { type: 1, pc: "", mobile: "" },
  openMode: 0,
  category: 0,
  sort: 0,
  status: 1
})

export default defineComponent({
  components: { UploadFilled, Close },
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const appList = ref<IWorkbenchAppItem[]>([])
    const formRef = ref<FormInstance>()
    const fileInput = ref<HTMLInputElement | null>(null)
    const uploading = ref(false)
    const previewUrl = ref("")
    const form = reactive(emptyForm())
    const searchForm = reactive({
      keywords: "",
      category: undefined as number | undefined,
      status: undefined as number | undefined
    })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const showPcEntry = computed(() => form.clientScope === 0 || form.clientScope === 1)
    const showMobileEntry = computed(() => form.clientScope === 0 || form.clientScope === 2)

    const validateEntrySide = (_rule: unknown, _value: string, callback: (err?: Error) => void) => {
      const needPc = form.clientScope === 0 || form.clientScope === 1
      const needMobile = form.clientScope === 0 || form.clientScope === 2
      const pc = (form.entryConfig.pc || "").trim()
      const mobile = (form.entryConfig.mobile || "").trim()

      if (needPc && !pc) {
        callback(new Error("请填写 PC 入口"))
        return
      }
      if (needMobile && !mobile) {
        callback(new Error("请填写移动端入口"))
        return
      }
      if (form.entryConfig.type === 1) {
        const sides = [
          ...(needPc && pc ? [pc] : []),
          ...(needMobile && mobile ? [mobile] : [])
        ]
        if (sides.some(u => !/^https?:\/\//i.test(u))) {
          callback(new Error("H5 入口需以 http:// 或 https:// 开头"))
          return
        }
      }
      callback()
    }

    const formRules: FormRules = {
      name: [{ required: true, message: "请输入应用名称", trigger: "blur" }],
      appType: [{ required: true, message: "请选择应用类型", trigger: "change" }],
      clientScope: [{ required: true, message: "请选择可见端", trigger: "change" }],
      icon: [{ required: true, message: "请上传应用图标", trigger: "change" }],
      "entryConfig.pc": [{ validator: validateEntrySide, trigger: "blur" }],
      "entryConfig.mobile": [{ validator: validateEntrySide, trigger: "blur" }],
      openMode: [{ required: true, message: "请选择打开方式", trigger: "change" }]
    }

    const categoryLabel = (value: number) =>
      categoryOptions.find(item => item.value === value)?.label || "-"

    const clientScopeLabel = (value: number) => {
      if (value === 1)
        return "仅 PC"
      if (value === 2)
        return "仅移动"
      return "全部"
    }

    const entrySummary = (row: IWorkbenchAppItem) => {
      const cfg = row.entryConfig || { type: 1, pc: "", mobile: "" }
      const prefix = cfg.type === 0 ? "路由" : "URL"
      const parts = [cfg.pc, cfg.mobile].filter(Boolean)
      return parts.length ? `${prefix}: ${parts.join(" / ")}` : "-"
    }

    const fetchList = async () => {
      loading.value = true
      const res = await getWorkbenchAppListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keywords: searchForm.keywords || undefined,
        category: searchForm.category,
        status: searchForm.status
      })
      loading.value = false
      if (res.code === 0) {
        appList.value = res.result.list || []
        pagination.total = Number(res.result.total || 0)
      } else {
        ElMessage.error(res.msg || "获取工作台应用失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const handleReset = () => {
      searchForm.keywords = ""
      searchForm.category = undefined
      searchForm.status = undefined
      handleSearch()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      pagination.page = 1
      fetchList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const resetForm = () => {
      Object.assign(form, emptyForm())
      form.entryConfig = { type: 1, pc: "", mobile: "" }
      previewUrl.value = ""
      if (fileInput.value)
        fileInput.value.value = ""
      formRef.value?.clearValidate()
    }

    const triggerFileSelect = () => {
      fileInput.value?.click()
    }

    const handleFileSelect = async (event: Event) => {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file)
        return

      if (!file.type.startsWith("image/")) {
        ElMessage.error("只能上传图片文件")
        return
      }
      if (file.size / 1024 / 1024 >= 2) {
        ElMessage.error("上传图片大小不能超过 2MB")
        return
      }

      uploading.value = true
      try {
        const result = await uploadFile(file)
        form.icon = result.fileUrl
        previewUrl.value = result.fileUrl
        formRef.value?.validateField("icon")
        ElMessage.success("图标上传成功")
      } catch {
        ElMessage.error("图标上传失败")
      } finally {
        uploading.value = false
        if (fileInput.value)
          fileInput.value.value = ""
      }
    }

    const removeFile = () => {
      form.icon = ""
      previewUrl.value = ""
      if (fileInput.value)
        fileInput.value.value = ""
      formRef.value?.validateField("icon")
    }

    const onAppTypeChange = (value: number | string | boolean | undefined) => {
      const appType = Number(value)
      form.entryConfig.type = appType === 0 ? 0 : 1
      if (appType === 0)
        form.openMode = 0
    }

    const onClientScopeChange = () => {
      if (!showPcEntry.value)
        form.entryConfig.pc = ""
      if (!showMobileEntry.value)
        form.entryConfig.mobile = ""
      formRef.value?.clearValidate(["entryConfig.pc", "entryConfig.mobile"])
    }

    const openCreate = () => {
      isEdit.value = false
      resetForm()
      dialogVisible.value = true
    }

    const openEdit = (row: IWorkbenchAppItem) => {
      isEdit.value = true
      Object.assign(form, {
        workbenchAppId: row.workbenchAppId,
        name: row.name,
        icon: row.icon,
        description: row.description,
        remark: row.remark,
        appType: row.appType,
        clientScope: row.clientScope,
        openMode: row.openMode,
        category: row.category,
        sort: row.sort,
        status: row.status,
        entryConfig: {
          type: row.entryConfig?.type ?? (row.appType === 0 ? 0 : 1),
          pc: row.entryConfig?.pc || "",
          mobile: row.entryConfig?.mobile || ""
        }
      })
      previewUrl.value = row.icon || ""
      if (fileInput.value)
        fileInput.value.value = ""
      dialogVisible.value = true
    }

    const submitForm = async () => {
      const valid = await formRef.value?.validate().catch(() => false)
      if (!valid)
        return

      saving.value = true
      const payload = {
        name: form.name,
        icon: form.icon,
        description: form.description,
        remark: form.remark,
        appType: form.appType,
        clientScope: form.clientScope,
        entryConfig: {
          type: form.appType === 0 ? 0 : 1,
          pc: showPcEntry.value ? (form.entryConfig.pc?.trim() || "") : "",
          mobile: showMobileEntry.value ? (form.entryConfig.mobile?.trim() || "") : ""
        },
        openMode: form.appType === 1 ? form.openMode : 0,
        category: form.category,
        sort: form.sort,
        status: form.status
      }
      const res = isEdit.value
        ? await updateWorkbenchAppApi({ workbenchAppId: form.workbenchAppId, ...payload })
        : await createWorkbenchAppApi(payload)
      saving.value = false
      if (res.code === 0) {
        ElMessage.success(isEdit.value ? "已更新" : "已创建")
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const toggleStatus = async (row: IWorkbenchAppItem) => {
      const next = row.status === 1 ? 0 : 1
      const res = await updateWorkbenchAppApi({
        workbenchAppId: row.workbenchAppId,
        status: next
      })
      if (res.code === 0) {
        ElMessage.success(next === 1 ? "已上架" : "已下架")
        fetchList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const handleDelete = async (row: IWorkbenchAppItem) => {
      await ElMessageBox.confirm(`确定删除「${row.name}」？删除后客户端不再展示。`, "删除确认", {
        type: "warning"
      })
      const res = await deleteWorkbenchAppApi({ workbenchAppId: row.workbenchAppId })
      if (res.code === 0) {
        ElMessage.success("已删除")
        fetchList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    onMounted(fetchList)

    return {
      loading,
      saving,
      uploading,
      dialogVisible,
      isEdit,
      appList,
      formRef,
      fileInput,
      form,
      formRules,
      searchForm,
      pagination,
      previewUrl,
      categoryOptions,
      categoryLabel,
      clientScopeLabel,
      entrySummary,
      showPcEntry,
      showMobileEntry,
      handleSearch,
      handleReset,
      onSizeChange,
      onPageChange,
      onAppTypeChange,
      onClientScopeChange,
      triggerFileSelect,
      handleFileSelect,
      removeFile,
      openCreate,
      openEdit,
      submitForm,
      toggleStatus,
      handleDelete
    }
  }
})
</script>

<style lang="less">
.open-workbench {
  padding: 20px;

  .open-workbench__header {
    margin-bottom: 16px;
  }

  .open-workbench__title {
    margin: 0 0 6px;
  }

  .open-workbench__hint {
    margin: 0;
    color: #909399;
    font-size: 13px;
  }

  .open-workbench__form {
    margin-bottom: 12px;
  }

  .open-workbench__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .open-workbench__app {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .open-workbench__icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    background: #f5f7fa;

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff7d45;
      font-weight: 600;
      background: #ffe6d9;
    }
  }

  .open-workbench__meta {
    min-width: 0;
  }

  .open-workbench__name {
    font-weight: 500;
    color: #303133;
  }

  .open-workbench__id {
    font-size: 12px;
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .upload-box {
    width: 120px;
    height: 120px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #ff7d45;
    }

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

      .upload-text {
        font-size: 13px;
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
