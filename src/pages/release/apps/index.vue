<template>
  <div class="release-apps">
    <div class="release-apps__header">
      <h2 class="release-apps__title">版本发布</h2>
      <el-button type="primary" @click="openAppDialog">
        <el-icon><Plus /></el-icon>新建应用
      </el-button>
    </div>

    <el-table v-loading="appLoading" :data="apps" border stripe>
      <el-table-column prop="name" label="应用名称" min-width="140" />
      <el-table-column label="AppID" min-width="280">
        <template #default="{ row }">
          <span class="release-apps__app-id">{{ row.appId }}</span>
          <el-button link type="primary" @click="copyAppId(row.appId)">复制</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openManageDialog(row)">管理</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无应用">
          <el-button type="primary" @click="openAppDialog">新建应用</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 架构 + 版本 -->
    <el-dialog
      v-model="manageVisible"
      :title="manageTitle"
      width="920px"
      destroy-on-close
      append-to-body
    >
      <div v-if="currentApp" class="release-apps__manage-appid">
        <span>AppID：{{ currentApp.appId }}</span>
        <el-button link type="primary" @click="copyAppId(currentApp.appId)">复制</el-button>
      </div>

      <el-empty v-if="!architectures.length" description="还没有架构，先添加一个">
        <el-button type="primary" @click="openArchFormDialog">添加架构</el-button>
      </el-empty>

      <template v-else>
        <div class="release-apps__manage-tabs">
          <el-tabs v-model="selectedArchId" type="card" @tab-click="handleArchTabClick">
            <el-tab-pane
              v-for="arch in architectures"
              :key="arch.id"
              :label="archTabLabel(arch)"
              :name="arch.id"
            />
          </el-tabs>
          <el-button type="primary" plain @click="openArchFormDialog">
            <el-icon><Plus /></el-icon>添加架构
          </el-button>
        </div>

        <div v-if="selectedArchId" class="release-apps__version-toolbar">
          <el-button type="primary" @click="openVersionDialog">
            <el-icon><Plus /></el-icon>添加版本
          </el-button>
          <el-button @click="openPolicyDialog">发版策略</el-button>
        </div>

        <el-table v-if="selectedArchId" v-loading="versionLoading" :data="versions" border stripe>
          <el-table-column prop="version" label="版本号" width="110" />
          <el-table-column prop="fileUrl" label="下载地址" min-width="200" show-overflow-tooltip />
          <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="发布时间" width="170" />
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button link type="danger" @click="handleDeleteVersion(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="该架构暂无版本" />
          </template>
        </el-table>
      </template>
    </el-dialog>

    <el-dialog v-model="appDialogVisible" title="新建应用" width="480px" destroy-on-close append-to-body>
      <el-form ref="appFormRef" :model="appForm" :rules="appRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="appForm.name" placeholder="如：海狸IM" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="appForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="appDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="appSubmitting" @click="submitApp">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="archFormDialogVisible" title="添加架构" width="520px" destroy-on-close append-to-body>
      <el-form ref="archFormRef" :model="archForm" :rules="archRules" label-width="80px">
        <el-form-item label="平台" prop="platformId">
          <el-select v-model="archForm.platformId" placeholder="选择平台" style="width: 100%" @change="handlePlatformChange">
            <el-option v-for="id in platformOptions" :key="id" :label="getPlatformName(id)" :value="id" />
          </el-select>
        </el-form-item>
        <el-form-item label="架构" prop="archId">
          <el-select v-model="archForm.archId" placeholder="选择架构" style="width: 100%">
            <el-option v-for="id in archOptions" :key="id" :label="getArchName(id)" :value="id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="archForm.description" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="archFormDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="archSubmitting" @click="submitArch">添加</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="versionDialogVisible" title="添加版本" width="600px" destroy-on-close append-to-body>
      <el-form ref="versionFormRef" :model="versionForm" :rules="versionRules" label-width="90px">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="versionForm.version" placeholder="如：1.0.0" />
        </el-form-item>
        <el-form-item label="安装包" prop="fileKey">
          <el-upload action="#" :auto-upload="false" :limit="1" :on-change="handleFileChange">
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="versionForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="更新日志">
          <el-input v-model="versionForm.releaseNotes" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="versionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="versionSubmitting" @click="submitVersion">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteVersionVisible" title="确认删除" width="400px" append-to-body>
      <p>确定删除该版本？此操作不可恢复。</p>
      <template #footer>
        <el-button @click="deleteVersionVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteVersion">删除</el-button>
      </template>
    </el-dialog>

    <release-policy-dialog
      v-model="policyVisible"
      :app-id="currentApp?.appId || ''"
      :architecture-id="selectedArchId"
      :arch-label="selectedArchLabel"
      :versions="versions"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import ReleasePolicyDialog from '@/components/release/releasePolicyDialog.vue'
import {
  addAppApi,
  getAppsApi,
  addArchitectureApi,
  getArchitecturesApi,
  addVersionApi,
  getVersionListApi,
  deleteVersionApi
} from '@/api/update'
import type { IAppInfo, IArchitectureInfo, IVersionInfo } from '@/types/api/update'
import {
  PlatformTypes,
  getPlatformName,
  getArchName,
  getArchDescription,
  getAvailableArchs
} from '@/utils/constants/platform'
import { uploadFile } from '@/api/upload'

export default defineComponent({
  name: 'ReleaseApps',
  components: { Plus, ReleasePolicyDialog },
  setup() {
    const appLoading = ref(false)
    const archLoading = ref(false)
    const versionLoading = ref(false)
    const appSubmitting = ref(false)
    const archSubmitting = ref(false)
    const versionSubmitting = ref(false)
    const appDialogVisible = ref(false)
    const manageVisible = ref(false)
    const archFormDialogVisible = ref(false)
    const versionDialogVisible = ref(false)
    const deleteVersionVisible = ref(false)
    const policyVisible = ref(false)
    const apps = ref<IAppInfo[]>([])
    const architectures = ref<IArchitectureInfo[]>([])
    const versions = ref<IVersionInfo[]>([])
    const currentApp = ref<IAppInfo | null>(null)
    const selectedArchId = ref<number>(0)
    const toDeleteVersion = ref<IVersionInfo | null>(null)
    const appFormRef = ref<FormInstance>()
    const archFormRef = ref<FormInstance>()
    const versionFormRef = ref<FormInstance>()

    const manageTitle = computed(() =>
      currentApp.value ? `${currentApp.value.name}` : '管理'
    )

    const selectedArchLabel = computed(() => {
      const arch = architectures.value.find(a => a.id === selectedArchId.value)
      return arch ? archTabLabel(arch) : ''
    })

    const appForm = ref({ name: '', description: '' })
    const archForm = ref({
      platformId: undefined as number | undefined,
      archId: undefined as number | undefined,
      description: ''
    })
    const versionForm = ref({
      version: '',
      fileUrl: '',
      description: '',
      releaseNotes: ''
    })

    const appRules: FormRules = {
      name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
    }
    const archRules: FormRules = {
      platformId: [{ required: true, message: '请选择平台', trigger: 'change' }],
      archId: [{ required: true, message: '请选择架构', trigger: 'change' }]
    }
    const versionRules: FormRules = {
      version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
    }

    const platformOptions = [
      PlatformTypes.WINDOWS,
      PlatformTypes.MACOS,
      PlatformTypes.IOS,
      PlatformTypes.ANDROID,
      PlatformTypes.HARMONYOS
    ]

    const archOptions = computed(() => {
      if (!archForm.value.platformId) return []
      return getAvailableArchs(archForm.value.platformId)
    })

    const archTabLabel = (arch: IArchitectureInfo) =>
      `${getPlatformName(arch.platformId)} · ${getArchName(arch.archId)}`

    const fetchApps = async () => {
      appLoading.value = true
      const res = await getAppsApi({ page: 1, pageSize: 200 })
      appLoading.value = false
      if (res.code === 0 && res.result) {
        apps.value = res.result.apps || []
      } else {
        ElMessage.error(res.msg || '获取应用列表失败')
      }
    }

    const fetchArchitectures = async (appId: string) => {
      archLoading.value = true
      const res = await getArchitecturesApi({ appId, page: 1, pageSize: 200 })
      archLoading.value = false
      if (res.code === 0 && res.result) {
        architectures.value = res.result.architectures || []
      } else {
        ElMessage.error(res.msg || '获取架构列表失败')
      }
    }

    const fetchVersions = async () => {
      if (!currentApp.value || !selectedArchId.value) return
      versionLoading.value = true
      const res = await getVersionListApi({
        appId: currentApp.value.appId,
        architectureId: selectedArchId.value,
        page: 1,
        pageSize: 100
      })
      versionLoading.value = false
      if (res.code === 0 && res.result) {
        versions.value = res.result.versions || []
      } else {
        ElMessage.error(res.msg || '获取版本列表失败')
      }
    }

    const openManageDialog = async (app: IAppInfo) => {
      currentApp.value = app
      selectedArchId.value = 0
      versions.value = []
      manageVisible.value = true
      await fetchArchitectures(app.appId)
      if (architectures.value.length) {
        selectedArchId.value = architectures.value[0].id
        await fetchVersions()
      }
    }

    const handleArchTabClick = async (tab: any) => {
      selectedArchId.value = typeof tab.paneName === 'string' ? Number(tab.paneName) : tab.paneName
      await fetchVersions()
    }

    const copyAppId = async (appId: string) => {
      await navigator.clipboard.writeText(appId)
      ElMessage.success('AppID 已复制')
    }

    const openAppDialog = () => {
      appForm.value = { name: '', description: '' }
      appDialogVisible.value = true
    }

    const submitApp = async () => {
      if (!appFormRef.value) return
      await appFormRef.value.validate()
      appSubmitting.value = true
      const res = await addAppApi(appForm.value)
      appSubmitting.value = false
      if (res.code === 0 && res.result) {
        appDialogVisible.value = false
        ElMessage.success(`创建成功，AppID：${res.result.appId}`)
        await fetchApps()
      } else {
        ElMessage.error(res.msg || '创建失败')
      }
    }

    const openArchFormDialog = () => {
      archForm.value = { platformId: undefined, archId: undefined, description: '' }
      archFormDialogVisible.value = true
    }

    const handlePlatformChange = () => {
      archForm.value.archId = undefined
    }

    const submitArch = async () => {
      if (!archFormRef.value || !currentApp.value) return
      await archFormRef.value.validate()
      archSubmitting.value = true
      const res = await addArchitectureApi({
        appId: currentApp.value.appId,
        platformId: archForm.value.platformId!,
        archId: archForm.value.archId!,
        description: archForm.value.description || getArchDescription(archForm.value.archId!)
      })
      archSubmitting.value = false
      if (res.code === 0) {
        archFormDialogVisible.value = false
        ElMessage.success('架构添加成功')
        await fetchArchitectures(currentApp.value.appId)
        if (res.result?.id) {
          selectedArchId.value = res.result.id
        } else if (architectures.value.length) {
          selectedArchId.value = architectures.value[architectures.value.length - 1].id
        }
        await fetchVersions()
      } else {
        ElMessage.error(res.msg || '添加失败')
      }
    }

    const openVersionDialog = () => {
      versionForm.value = { version: '', fileUrl: '', description: '', releaseNotes: '' }
      versionDialogVisible.value = true
    }

    const handleFileChange = async (file: { raw?: File }) => {
      if (!file.raw) return
      const result = await uploadFile(file.raw)
      versionForm.value.fileUrl = result.fileUrl || result.fileKey
      ElMessage.success('文件上传成功')
    }

    const submitVersion = async () => {
      if (!versionFormRef.value || !selectedArchId.value) return
      if (!versionForm.value.fileUrl) {
        ElMessage.error('请先上传安装包')
        return
      }
      await versionFormRef.value.validate()
      versionSubmitting.value = true
      const res = await addVersionApi({
        architectureId: selectedArchId.value,
        version: versionForm.value.version,
        fileUrl: versionForm.value.fileUrl,
        description: versionForm.value.description,
        releaseNotes: versionForm.value.releaseNotes
      } as any)
      versionSubmitting.value = false
      if (res.code === 0) {
        versionDialogVisible.value = false
        ElMessage.success('版本添加成功')
        await fetchVersions()
      } else {
        ElMessage.error(res.msg || '添加失败')
      }
    }

    const handleDeleteVersion = (row: IVersionInfo) => {
      toDeleteVersion.value = row
      deleteVersionVisible.value = true
    }

    const confirmDeleteVersion = async () => {
      if (!toDeleteVersion.value) return
      const res = await deleteVersionApi(toDeleteVersion.value.versionId)
      if (res.code === 0) {
        deleteVersionVisible.value = false
        ElMessage.success('删除成功')
        await fetchVersions()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    }

    const openPolicyDialog = () => {
      if (!selectedArchId.value) {
        ElMessage.warning('请先选择架构')
        return
      }
      policyVisible.value = true
    }

    onMounted(fetchApps)

    return {
      appLoading,
      versionLoading,
      appSubmitting,
      archSubmitting,
      versionSubmitting,
      appDialogVisible,
      manageVisible,
      archFormDialogVisible,
      versionDialogVisible,
      deleteVersionVisible,
      policyVisible,
      selectedArchLabel,
      apps,
      architectures,
      versions,
      currentApp,
      selectedArchId,
      manageTitle,
      appFormRef,
      archFormRef,
      versionFormRef,
      appForm,
      archForm,
      versionForm,
      appRules,
      archRules,
      versionRules,
      platformOptions,
      archOptions,
      getPlatformName,
      getArchName,
      archTabLabel,
      openManageDialog,
      handleArchTabClick,
      copyAppId,
      openAppDialog,
      submitApp,
      openArchFormDialog,
      handlePlatformChange,
      submitArch,
      openVersionDialog,
      handleFileChange,
      submitVersion,
      handleDeleteVersion,
      confirmDeleteVersion,
      openPolicyDialog
    }
  }
})
</script>

<style lang="less">
.release-apps {
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0;
  }

  &__app-id {
    font-family: monospace;
    margin-right: 8px;
  }

  &__manage-appid {
    margin-bottom: 12px;
    color: #606266;
    font-size: 13px;
  }

  &__manage-tabs {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  &__version-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
}
</style>
