<template>
  <div class="open-apps-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>应用管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建应用
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="应用名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入应用名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="appList"
        border
        style="width: 100%"
      >
        <el-table-column prop="appId" label="AppID" width="280" />
        <el-table-column prop="name" label="应用名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="webhookUrl" label="Webhook URL" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="warning" @click="handleConfigWebhook(row)">
              Webhook
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入应用描述"
          />
        </el-form-item>
        <el-form-item label="Webhook URL" prop="webhookUrl">
          <el-input
            v-model="formData.webhookUrl"
            placeholder="请输入Webhook接收地址"
          />
        </el-form-item>
        <el-form-item label="权限范围" prop="scopes">
          <el-select
            v-model="selectedScopes"
            multiple
            placeholder="请选择权限范围"
            style="width: 100%"
          >
            <el-option
              v-for="scope in availableScopes"
              :key="scope.value"
              :label="scope.label"
              :value="scope.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看应用详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="应用详情"
      width="700px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="AppID">
          {{ currentApp?.appId }}
          <el-button link type="primary" @click="copyToClipboard(currentApp?.appId)">
            复制
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="AppSecret" v-if="currentApp?.appSecret">
          {{ maskSecret(currentApp.appSecret) }}
          <el-button link type="primary" @click="copyToClipboard(currentApp.appSecret)">
            复制
          </el-button>
          <el-text type="warning" size="small" style="margin-left: 10px">
            请妥善保管，仅在创建时显示
          </el-text>
        </el-descriptions-item>
        <el-descriptions-item label="Bot UserID" v-if="currentApp?.botUserId">
          {{ currentApp.botUserId }}
          <el-button link type="primary" @click="copyToClipboard(currentApp.botUserId)">
            复制
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="应用名称">
          {{ currentApp?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="描述">
          {{ currentApp?.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="Webhook URL">
          {{ currentApp?.webhookUrl || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentApp?.status === 1 ? 'success' : 'info'">
            {{ currentApp?.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ currentApp?.createdAt ? formatTime(currentApp.createdAt) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  getAppListApi,
  createAppApi,
  updateAppApi,
  deleteAppApi,
  getAppDetailApi,
  type IAppInfo,
  type ICreateAppReq,
  type IUpdateAppReq
} from '@/api/open'

// 数据
const loading = ref(false)
const appList = ref<IAppInfo[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined
})

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('创建应用')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  appId: '',
  name: '',
  description: '',
  webhookUrl: '',
  scopes: '',
  status: 1
})

const selectedScopes = ref<string[]>([])
const availableScopes = [
  { label: '消息发送', value: 'message:send' },
  { label: '消息接收', value: 'message:receive' },
  { label: '用户信息', value: 'user:info' },
  { label: '群组管理', value: 'group:manage' },
  { label: '好友管理', value: 'friend:manage' }
]

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  webhookUrl: [
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ]
}

// 详情对话框
const detailDialogVisible = ref(false)
const currentApp = ref<IAppInfo & { appSecret?: string; botUserId?: string } | null>(null)

// 格式化时间
const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN')
}

// 脱敏显示密钥
const maskSecret = (secret: string) => {
  if (!secret) return ''
  return secret.substring(0, 8) + '****' + secret.substring(secret.length - 8)
}

// 复制到剪贴板
const copyToClipboard = async (text?: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 加载应用列表
const loadAppList = async () => {
  loading.value = true
  try {
    const res = await getAppListApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status
    })
    appList.value = res.result.list
    pagination.total = res.result.total
  } catch (error) {
    ElMessage.error('加载应用列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadAppList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = undefined
  handleSearch()
}

// 分页
const handleSizeChange = () => {
  loadAppList()
}

const handlePageChange = () => {
  loadAppList()
}

// 创建应用
const handleCreate = () => {
  isEdit.value = false
  dialogTitle.value = '创建应用'
  resetForm()
  dialogVisible.value = true
}

// 编辑应用
const handleEdit = (row: IAppInfo) => {
  isEdit.value = true
  dialogTitle.value = '编辑应用'
  formData.appId = row.appId
  formData.name = row.name
  formData.description = row.description
  formData.webhookUrl = row.webhookUrl
  formData.status = row.status
  dialogVisible.value = true
}

// 查看应用
const handleView = async (row: IAppInfo) => {
  try {
    const res = await getAppDetailApi({ appId: row.appId })
    currentApp.value = res.result.app
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取应用详情失败')
  }
}

// 配置 Webhook（跳转到 Webhook 页面）
const handleConfigWebhook = (row: IAppInfo) => {
  // TODO: 跳转到 Webhook 配置页面
  ElMessage.info('Webhook 配置功能开发中')
}

// 删除应用
const handleDelete = (row: IAppInfo) => {
  ElMessageBox.confirm(
    `确定要删除应用 "${row.name}" 吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteAppApi({ appId: row.appId })
      ElMessage.success('删除成功')
      loadAppList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      // 将选中的权限转换为 JSON 字符串
      formData.scopes = JSON.stringify(selectedScopes.value)
      
      if (isEdit.value) {
        await updateAppApi({
          appId: formData.appId,
          name: formData.name,
          description: formData.description,
          webhookUrl: formData.webhookUrl,
          status: formData.status
        })
        ElMessage.success('更新成功')
      } else {
        const res = await createAppApi({
          name: formData.name,
          description: formData.description,
          webhookUrl: formData.webhookUrl,
          scopes: formData.scopes
        })
        ElMessage.success('创建成功')
        // 显示 AppSecret
        currentApp.value = {
          appId: res.result.appId,
          appSecret: res.result.appSecret,
          botUserId: res.result.botUserId,
          name: formData.name,
          description: formData.description,
          webhookUrl: formData.webhookUrl,
          status: 1,
          createdAt: Math.floor(Date.now() / 1000)
        }
        detailDialogVisible.value = true
      }
      dialogVisible.value = false
      loadAppList()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.appId = ''
  formData.name = ''
  formData.description = ''
  formData.webhookUrl = ''
  formData.scopes = ''
  formData.status = 1
  selectedScopes.value = []
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

onMounted(() => {
  loadAppList()
})
</script>

<style scoped lang="less">
.open-apps-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
