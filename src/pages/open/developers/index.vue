<template>
  <div class="developer-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>开发者审核</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
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
        :data="developerList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="companyName" label="公司名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="description" label="应用场景描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditRemark" label="审核备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 0" 
              link 
              type="primary" 
              @click="handleAudit(row)"
            >
              审核
            </el-button>
            <el-text v-else type="info">已审核</el-text>
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

    <!-- 审核对话框 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="审核开发者申请"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请人">
          {{ currentDeveloper?.realName }}
        </el-descriptions-item>
        <el-descriptions-item label="公司名称">
          {{ currentDeveloper?.companyName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentDeveloper?.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ currentDeveloper?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="应用场景">
          {{ currentDeveloper?.description }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        label-width="100px"
        style="margin-top: 20px"
      >
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="auditForm.status">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注" prop="auditRemark">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAudit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import {
  getDeveloperListApi,
  auditDeveloperApi,
  type IDeveloperInfo
} from '@/api/open'

// 数据
const loading = ref(false)
const developerList = ref<IDeveloperInfo[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const searchForm = reactive({
  status: undefined as number | undefined
})

// 审核对话框
const auditDialogVisible = ref(false)
const submitLoading = ref(false)
const currentDeveloper = ref<IDeveloperInfo | null>(null)
const auditFormRef = ref<FormInstance>()

const auditForm = reactive({
  id: '',
  status: 1,
  auditRemark: ''
})

const auditRules: FormRules = {
  status: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ]
}

// 格式化时间
const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN')
}

// 获取状态文本
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  }
  return map[status] || '未知'
}

// 获取状态类型
const getStatusType = (status: number) => {
  const map: Record<number, 'warning' | 'success' | 'danger'> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}

// 加载开发者列表
const loadDeveloperList = async () => {
  loading.value = true
  try {
    const res = await getDeveloperListApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status
    })
    developerList.value = res.result.list
    pagination.total = res.result.total
  } catch (error) {
    ElMessage.error('加载开发者列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadDeveloperList()
}

// 重置
const handleReset = () => {
  searchForm.status = undefined
  handleSearch()
}

// 分页
const handleSizeChange = () => {
  loadDeveloperList()
}

const handlePageChange = () => {
  loadDeveloperList()
}

// 审核
const handleAudit = (row: IDeveloperInfo) => {
  currentDeveloper.value = row
  auditForm.id = row.id
  auditForm.status = 1
  auditForm.auditRemark = ''
  auditDialogVisible.value = true
}

// 提交审核
const handleSubmitAudit = async () => {
  if (!auditFormRef.value) return
  
  await auditFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      await auditDeveloperApi({
        id: auditForm.id,
        status: auditForm.status,
        auditRemark: auditForm.auditRemark
      })
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      loadDeveloperList()
    } catch (error: any) {
      ElMessage.error(error.message || '审核失败')
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => {
  loadDeveloperList()
})
</script>

<style scoped lang="less">
.developer-audit-container {
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
