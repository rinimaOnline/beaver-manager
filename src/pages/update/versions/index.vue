<template>
  <div class="version-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">版本管理</h2>
        <el-select 
          v-model="state.selectedAppId" 
          placeholder="请选择应用"
          @change="handleAppChange"
          class="app-select"
        >
          <el-option 
            v-for="app in state.apps" 
            :key="app.appId" 
            :label="app.name" 
            :value="app.appId"
          />
        </el-select>
      </div>
    </div>
    <div v-if="state.selectedAppId" class="arch-tabs-container">
      <el-tabs
        v-model="state.selectedArchId"
        type="card"
        class="arch-tabs"
        @tab-click="handleArchTabClick"
      >
        <el-tab-pane
          v-for="arch in state.architectures"
          :key="arch.id"
          :label="getArchitectureName(arch.archId)"
          :name="arch.id"
        />
      </el-tabs>
    </div>

    <!-- 版本列表 -->
    <div v-if="state.selectedArchId" class="version-list">
      <div class="list-header">
        <div class="header-info">
          <span class="selected-app">{{ getSelectedAppName() }}</span>
          <el-tag size="small" type="success">{{ getSelectedArchName() }}</el-tag>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加版本
        </el-button>
      </div>

      <el-table 
        :data="state.tableData" 
        style="width: 100%" 
        border
        v-loading="state.loading"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column prop="version" label="版本号" width="120" />
        <el-table-column prop="fileName" label="文件ID" width="280" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="updatedAt" label="更新日志" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="发布时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              plain
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="state.currentPage"
          :page-size="state.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="state.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          @update:current-page="val => state.currentPage = val"
          @update:page-size="val => state.pageSize = val"
        />
      </div>
    </div>
    <!-- 添加版本弹窗 -->
    <el-dialog v-model="state.dialogVisible" :title="state.dialogTitle" width="600px" destroy-on-close>

      <el-form
        ref="formRef"
        :model="state.form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="版本号" prop="version">
          <el-input v-model="state.form.version" placeholder="如：1.0.0">
            <template #prefix>v</template>
          </el-input>
        </el-form-item>
        <el-form-item label="安装包" prop="fileName">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请选择安装包文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="state.form.description" type="textarea" :rows="2" placeholder="简短描述此版本的主要更新内容" />
        </el-form-item>
        <el-form-item label="更新日志" prop="releaseNotes">
          <el-input v-model="state.form.releaseNotes" type="textarea" :rows="4" placeholder="详细的更新日志，支持 Markdown 格式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="state.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="state.deleteDialogVisible"
      title="确认删除"
      width="400px"
      destroy-on-close
    >
      <div class="delete-confirm">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <p>确定要删除该版本吗？此操作不可恢复。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="state.deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Warning } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { IVersionState } from '@/types/pages/update/version'
import type { IVersionInfo } from '@/types/api/update'
import { getArchName } from '@/utils/constants/platform'
import config from '@/config/env'
import { 
  addVersionApi, 
  getAppsApi, 
  getArchitecturesApi, 
  getVersionListApi, 
  deleteVersionApi
} from '@/api/update'
import { uploadAndSaveFile } from '@/utils/upload/upload'

export default defineComponent({
  name: 'VersionManagement',
  components: {
    Plus,
    Warning
  },
  setup() {
    const router = useRouter()
    const formRef = ref<FormInstance>()
    const { proxy: ctx } = getCurrentInstance()!

    const state = reactive<IVersionState>({
      loading: false,
      dialogVisible: false,
      deleteDialogVisible: false,
      dialogTitle: '添加版本',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      apps: [],
      architectures: [],
      selectedAppId: '',
      selectedArchId: 0,
      form: {
        architectureId: 0,
        version: '',
        fileName: '',
        description: '',
        releaseNotes: '',
        releaseDate: ''
      },
      toDeleteVersion: null
    })

    const rules = {
      version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
    }

    const getArchitectureName = (archId: number): string => {
      return getArchName(archId)
    }

    const getSelectedAppName = () => {
      const app = state.apps.find(a => a.appId === state.selectedAppId)
      return app ? app.name : ''
    }

    const getSelectedArchName = () => {
      const arch = state.architectures.find(a => a.id === state.selectedArchId)
      return arch ? getArchitectureName(arch.archId) : ''
    }

    // 获取应用列表
    const fetchApps = async () => {
        try {
        const res = await getAppsApi({ page: 1, pageSize: 100 })
          if (res.result) {
          state.apps = res.result.apps
          }
        } catch (error) {
        console.error('获取应用列表失败:', error)
        ctx?.$message.error('获取应用列表失败')
      }
    }

    // 获取架构列表
    const fetchArchitectures = async (appId: string) => {
      try {
        const res = await getArchitecturesApi({ appId, page: 1, pageSize: 100 })
        if (res.result) {
          state.architectures = res.result.architectures
        }
      } catch (error) {
        console.error('获取架构列表失败:', error)
        ctx?.$message.error('获取架构列表失败')
        }
      }

    const handleAppChange = async (appId: string) => {
      state.selectedArchId = 0
      state.tableData = []
      if (appId) {
        await fetchArchitectures(appId)
      }
    }

    const handleArchSelect = (index: string | number) => {
      state.selectedArchId = typeof index === 'string' ? parseInt(index) : index
      state.currentPage = 1
      fetchData()
    }

    const handleArchTabClick = (tab: any) => {
      handleArchSelect(tab.paneName)
    }

    const fetchData = async () => {
      if (!state.selectedAppId || !state.selectedArchId) return

      state.loading = true
      try {
        const res = await getVersionListApi({
          appId: state.selectedAppId,
          architectureId: state.selectedArchId,
          page: state.currentPage,
          pageSize: state.pageSize
        })
        if (res.result) {
          state.tableData = res.result.versions
          state.total = res.result.total
        }
      } catch (error) {
        console.error('获取版本列表失败:', error)
        ctx?.$message.error('获取版本列表失败')
      } finally {
        state.loading = false
      }
    }

    const handleAdd = () => {
      state.form = {
        architectureId: state.selectedArchId,
        version: '',
        fileName: '',
        description: '',
        releaseNotes: '',
        releaseDate: ''
      }
      state.dialogTitle = '添加版本'
      state.dialogVisible = true
    }

    const handleDelete = (row: IVersionInfo) => {
      state.toDeleteVersion = row
      state.deleteDialogVisible = true
    }

    const confirmDelete = async () => {
      if (!state.toDeleteVersion) return
      
      try {
        await deleteVersionApi(state.toDeleteVersion.versionId)
        state.deleteDialogVisible = false
          fetchData()
        ctx?.$message.success('删除成功')
      } catch (error) {
        console.error('删除版本失败:', error)
        ctx?.$message.error('删除版本失败')
      }
    }



    const handleSizeChange = (val: number) => {
      state.pageSize = val
      fetchData()
    }

    const handleCurrentChange = (val: number) => {
      state.currentPage = val
      fetchData()
    }

    const handleFileChange = async (file: any) => {
      if (file.raw) {
        try {
          // 显示上传进度
          ctx?.$message.info('文件上传中，请稍候...')
          
          // 使用前端直传OSS并保存到数据库
          const result = await uploadAndSaveFile(file.raw, 'update')
          
          state.form.fileId = result.fileId
          console.log('文件上传成功，fileId:', state.form.fileId)
          ctx?.$message.success('文件上传成功')
        } catch (error) {
          console.error('文件上传失败:', error)
          ctx?.$message.error('文件上传失败')
        }
      }
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      // 检查文件是否已上传
      if (!state.form.fileId) {
        ctx?.$message.error('请先上传安装包文件')
        return
      }
      
      try {
        await formRef.value.validate()
        ctx?.$message.info('正在提交版本信息...')
        
        const submitData = {
          ...state.form,
          architectureId: state.selectedArchId
        }
        console.log('提交的数据:', submitData)
        const res = await addVersionApi(submitData)
        
        // 检查接口返回的code
        if (res.code !== 0) {
          ctx?.$message.error(res.msg || '添加版本失败')
          return
        }
        
        state.dialogVisible = false
        fetchData()
        ctx?.$message.success('版本添加成功')
      } catch (error) {
        console.error('添加版本失败:', error)
        ctx?.$message.error('添加版本失败')
      }
    }

    onMounted(() => {
      fetchApps()
    })

    return {
      state,
      formRef,
      rules,
      getArchitectureName,
      getSelectedAppName,
      getSelectedArchName,
      handleAppChange,
      handleArchSelect,
      handleArchTabClick,
      handleAdd,
      handleDelete,
      confirmDelete,
      handleSubmit,
      handleSizeChange,
      handleCurrentChange,
      handleFileChange
    }
  }
})
</script>

<style scoped>
.version-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-title {
  margin: 0;
}

.app-select {
  width: 200px;
}

.arch-tabs-container {
  margin-bottom: 20px;
}

.arch-tabs {
  margin: 0 -24px;
}

.version-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.list-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-app {
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-demo {
  width: 360px;
}

.delete-confirm {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warning-icon {
  font-size: 24px;
  color: #e6a23c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.file-info {
  margin-top: 10px;
}
</style> 