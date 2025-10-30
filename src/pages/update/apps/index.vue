<template>
  <div class="apps-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>应用管理</span>
          <el-button type="primary" @click="handleAdd">添加应用</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="应用名称" width="180" />
        <el-table-column prop="appId" label="应用ID" width="200" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'info'">
              {{ scope.row.isActive ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { addAppApi, getAppsApi } from '@/api/update'
import type { IAppInfo } from '@/types/api/update'

interface AppForm {
  name: string
  description?: string
}

export default defineComponent({
  name: 'AppManagement',
  setup() {
    const loading = ref<boolean>(false)
    const dialogVisible = ref<boolean>(false)
    const dialogTitle = ref<string>('添加应用')
    const currentPage = ref<number>(1)
    const pageSize = ref<number>(10)
    const total = ref<number>(0)
    const tableData = ref<IAppInfo[]>([])
    const formRef = ref<FormInstance>()

    const form = ref<AppForm>({
      name: '',
      description: ''
    })

    const rules: FormRules = {
      name: [
        { required: true, message: '请输入应用名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ]
    }

    const fetchData = async () => {
      loading.value = true
      try {
        const res = await getAppsApi({
          page: currentPage.value,
          pageSize: pageSize.value,
          isActive: true
        })
        if (res.code === 0 && res.result) {
          tableData.value = res.result.apps
          total.value = res.result.total
        } else {
          tableData.value = []
          total.value = 0
          ElMessage.error(res.msg || '获取应用列表失败')
        }
      } catch (error) {
        console.error('获取应用列表失败:', error)
        tableData.value = []
        total.value = 0
        ElMessage.error('获取应用列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleAdd = () => {
      form.value = {
        name: '',
        description: ''
      }
      dialogTitle.value = '添加应用'
      dialogVisible.value = true
    }

    const handleView = (row: IAppInfo) => {
      // 跳转到应用详情页，可以查看架构、版本等信息
      // TODO: 实现应用详情页跳转
      console.log('查看应用:', row)
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const res = await addAppApi({
              name: form.value.name,
              description: form.value.description
            })
            if (res.code === 0) {
              ElMessage.success('添加成功')
              dialogVisible.value = false
              fetchData()
            } else {
              ElMessage.error(res.msg || '添加失败')
            }
          } catch (error) {
            console.error('添加应用失败:', error)
            ElMessage.error('添加失败')
          }
        }
      })
    }

    const handleSizeChange = (val: number) => {
      pageSize.value = val
      fetchData()
    }

    const handleCurrentChange = (val: number) => {
      currentPage.value = val
      fetchData()
    }

    onMounted(() => {
      fetchData()
    })

    return {
      loading,
      dialogVisible,
      dialogTitle,
      currentPage,
      pageSize,
      total,
      tableData,
      formRef,
      form,
      rules,
      handleAdd,
      handleView,
      handleSubmit,
      handleSizeChange,
      handleCurrentChange
    }
  }
})
</script>

<style scoped>
.apps-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 