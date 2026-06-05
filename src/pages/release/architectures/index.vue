<template>
  <div class="release-architectures">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>架构管理</span>
          <el-button type="primary" @click="handleAdd">添加架构</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="appId" label="应用ID" width="180" />
        <el-table-column prop="platformId" label="平台" width="120">
          <template #default="scope">
            {{ getPlatformName(scope.row.platformId) }}
          </template>
        </el-table-column>
        <el-table-column prop="archId" label="架构" width="120">
          <template #default="scope">
            {{ getArchName(scope.row.archId) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'info'">
              {{ scope.row.isActive ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" @click="goVersions(scope.row)">版本</el-button>
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
        <el-form-item label="应用ID" prop="appId">
          <el-select v-model="form.appId" placeholder="请选择应用">
            <el-option v-for="item in appList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台" prop="platformId">
          <el-select v-model="form.platformId" placeholder="请选择平台">
            <el-option
              v-for="(name, type) in PlatformNames"
              :key="type"
              :label="name"
              :value="Number(type)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="架构" prop="archId">
          <el-select v-model="form.archId" placeholder="请选择架构">
            <el-option
              v-for="archType in getAvailableArchs(form.platformId)"
              :key="archType"
              :label="getArchName(archType)"
              :value="archType"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="isActive">
          <el-switch v-model="form.isActive" />
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
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { addArchitectureApi, updateArchitectureApi, getArchitecturesApi, getAppsApi } from '@/api/update'
import type { IArchitectureInfo, IAddArchitectureReq, IUpdateArchitectureReq } from '@/types/api/update'
import { PlatformTypes, PlatformNames, ArchTypes, getPlatformName, getArchName, getAvailableArchs } from '@/utils/constants/platform'

interface ArchitectureForm {
  id?: number
  appId: string
  platformId: number
  archId: number
  description?: string
  isActive?: boolean
}

export default defineComponent({
  name: 'ArchitectureManagement',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref<boolean>(false)
    const dialogVisible = ref<boolean>(false)
    const dialogTitle = ref<string>('添加架构')
    const currentPage = ref<number>(1)
    const pageSize = ref<number>(10)
    const total = ref<number>(0)
    const tableData = ref<IArchitectureInfo[]>([])
    const isEdit = ref<boolean>(false)
    const formRef = ref<FormInstance>()
    const appList = ref<{ label: string; value: string }[]>([])

    const fetchAppList = async () => {
      const res = await getAppsApi({ isActive: true })
      if (res.code === 0 && res.result) {
        appList.value = res.result.apps.map(app => ({
          label: `${app.name} (${app.appId})`,
          value: app.appId
        }))
      } else {
        ElMessage.error(res.msg || "获取应用列表失败")
      }
    }

    const form = ref<ArchitectureForm>({
      appId: '',
      platformId: PlatformTypes.WINDOWS,
      archId: ArchTypes.WIN_X64,
      description: ''
    })

    // 监听平台变化，自动选择该平台下的第一个可用架构
    watch(() => form.value.platformId, (newPlatform) => {
      const availableArchs = getAvailableArchs(newPlatform)
      if (availableArchs.length > 0) {
        form.value.archId = availableArchs[0]
      }
    })

    const rules: FormRules = {
      appId: [
        { required: true, message: '请选择应用', trigger: 'change' }
      ],
      platformId: [
        { required: true, message: '请选择平台', trigger: 'change' }
      ],
      archId: [
        { required: true, message: '请选择架构', trigger: 'change' }
      ]
    }

    const filterAppId = ref("")

    const fetchData = async () => {
      loading.value = true
      const res = await getArchitecturesApi({
        page: currentPage.value,
        pageSize: pageSize.value,
        isActive: true,
        appId: filterAppId.value || undefined
      })
      loading.value = false
      if (res.code === 0 && res.result) {
        tableData.value = res.result.architectures || []
        total.value = res.result.total || 0
      } else {
        tableData.value = []
        total.value = 0
        ElMessage.error(res.msg || "获取架构列表失败")
      }
    }

    const handleAdd = () => {
      isEdit.value = false
      form.value = {
        appId: '',
        platformId: PlatformTypes.WINDOWS,
        archId: ArchTypes.WIN_X64,
        description: ''
      }
      dialogTitle.value = '添加架构'
      dialogVisible.value = true
    }

    const handleEdit = (row: IArchitectureInfo) => {
      isEdit.value = true
      form.value = {
        id: row.id,
        appId: row.appId,
        platformId: row.platformId,
        archId: row.archId,
        description: row.description,
        isActive: row.isActive
      }
      dialogTitle.value = '编辑架构'
      dialogVisible.value = true
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      await formRef.value.validate()
      if (isEdit.value) {
        const res = await updateArchitectureApi({
          id: form.value.id!,
          description: form.value.description,
          isActive: form.value.isActive
        })
        if (res.code === 0) {
          ElMessage.success("更新成功")
          dialogVisible.value = false
          fetchData()
        } else {
          ElMessage.error(res.msg || "更新失败")
        }
      } else {
        const res = await addArchitectureApi({
          appId: form.value.appId,
          platformId: form.value.platformId,
          archId: form.value.archId,
          description: form.value.description
        })
        if (res.code === 0) {
          ElMessage.success("添加成功")
          dialogVisible.value = false
          fetchData()
        } else {
          ElMessage.error(res.msg || "添加失败")
        }
      }
    }

    const handleSizeChange = (val: number) => {
      pageSize.value = val
      fetchData()
    }

    const handleCurrentChange = (val: number) => {
      currentPage.value = val
      fetchData()
    }

    const goVersions = (row: IArchitectureInfo) => {
      router.push({ path: '/release/versions', query: { appId: row.appId, archId: String(row.id) } })
    }

    onMounted(() => {
      const qAppId = route.query.appId as string
      if (qAppId) filterAppId.value = qAppId
      fetchAppList()
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
      isEdit,
      formRef,
      form,
      rules,
      appList,
      PlatformNames,
      handleAdd,
      handleEdit,
      handleSubmit,
      handleSizeChange,
      handleCurrentChange,
      getPlatformName,
      getArchName,
      getAvailableArchs,
      goVersions
    }
  }
})
</script>

<style lang="less">
.release-architectures {
  padding: 20px;

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
}
</style>