<template>
  <div class="strategy-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">城市策略管理</h2>
        <el-select v-model="selectedAppId" placeholder="请选择应用" @change="handleAppChange" class="app-select">
          <el-option v-for="app in apps" :key="app.appId" :label="app.name" :value="app.appId" />
        </el-select>
      </div>
    </div>

    <div v-if="selectedAppId" class="arch-tabs-container">
      <div class="arch-header">
        <el-tabs
          v-model="selectedArchId"
          type="card"
          class="arch-tabs"
          @tab-click="handleArchTabClick"
        >
          <el-tab-pane
            v-for="arch in architectures"
            :key="arch.id"
            :label="getArchName(arch.archId)"
            :name="arch.id"
          />
        </el-tabs>
        <el-button type="primary" @click="handleGlobalStrategy">
          <el-icon><Setting /></el-icon>全局策略
        </el-button>
      </div>
    </div>

    <!-- 策略列表 -->
    <div v-if="selectedArchId" class="strategy-list">
      <div class="list-header">
        <div class="header-info">
          <span class="selected-app">{{ getSelectedAppName() }}</span>
          <el-tag size="small" type="success">{{ getSelectedArchName() }}</el-tag>
        </div>
        <el-button type="primary" @click="handleBatchStrategy">
          <el-icon><Edit /></el-icon>批量修改策略
        </el-button>
      </div>

      <el-table 
        :data="filteredTableData" 
        style="width: 100%" 
        border
        v-loading="loading"
        :header-cell-style="{ background: '#f5f7fa' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="cityId" label="城市" width="120">
          <template #default="scope">
            {{ getCityName(scope.row.cityId) }}
          </template>
        </el-table-column>
        <el-table-column label="当前版本" width="120">
          <template #default="scope">
            <span class="strategy-text">{{ getCurrentVersion(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目标版本" width="120">
          <template #default="scope">
            <span class="strategy-text">{{ getTargetVersion(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="强制更新" width="100">
          <template #default="scope">
            <el-tag size="small" :type="getForceUpdate(scope.row) ? 'danger' : 'info'">
              {{ getForceUpdate(scope.row) ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="filteredTotal"
          layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange"
          @update:current-page="(val) => currentPage = val" @update:page-size="(val) => pageSize = val" />
      </div>
    </div>

    <!-- 编辑单个策略弹窗 -->
    <el-dialog :model-value="dialogVisible" @update:model-value="dialogVisible = $event" :title="dialogTitle"
      width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="demo-ruleForm">
        <el-form-item label="城市" prop="cityId">
          <el-select :model-value="form.cityId" @update:model-value="form.cityId = $event" placeholder="请选择城市">
            <el-option v-for="city in CityList" :key="city.value" :label="city.label" :value="city.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标版本" prop="targetVersion">
          <el-select :model-value="form.targetVersion" @update:model-value="form.targetVersion = $event" placeholder="请选择版本">
            <el-option v-for="version in versionOptions" :key="version.value" :label="version.label" :value="version.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="强制更新" prop="forceUpdate">
          <el-switch :model-value="form.forceUpdate" @update:model-value="form.forceUpdate = !!$event" active-text="强制更新" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="isActive">
          <el-switch :model-value="form.isActive" @update:model-value="form.isActive = !!$event" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量修改策略弹窗 -->
    <el-dialog :model-value="batchDialogVisible" @update:model-value="batchDialogVisible = $event" title="批量修改策略"
      width="700px">
      <el-form ref="batchFormRef" :model="batchForm" :rules="batchRules" label-width="120px">
        <el-form-item :label="getSelectedArchName() + '版本'" prop="targetVersion">
          <el-select :model-value="batchForm.targetVersion" @update:model-value="batchForm.targetVersion = $event" placeholder="请选择版本">
            <el-option v-for="version in versionOptions" :key="version.value" :label="version.label" :value="version.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="强制更新" prop="forceUpdate">
          <el-switch :model-value="batchForm.forceUpdate" @update:model-value="batchForm.forceUpdate = !!$event" active-text="强制更新" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 全局策略弹窗 -->
    <el-dialog :model-value="globalDialogVisible" @update:model-value="globalDialogVisible = $event" title="全局策略配置"
      width="800px">
      <el-form ref="globalFormRef" :model="globalForm" :rules="globalRules" label-width="120px">
        <el-form-item label="架构配置">
          <div class="arch-config-list">
            <div v-for="arch in validArchitectureVersions" :key="arch.architectureId" class="arch-config-item">
              <span class="arch-name">{{ getArchName(arch.archId) }}</span>
              <div class="arch-config-controls">
                <el-select 
                  :model-value="getGlobalArchVersion(arch.architectureId)"
                  @update:model-value="(value) => updateGlobalArchVersion(arch.architectureId, value)"
                  placeholder="选择版本"
                  style="width: 150px; margin-right: 10px;"
                >
                  <el-option 
                    v-for="version in getArchVersionOptions(arch.architectureId)" 
                    :key="version.value" 
                    :label="version.label" 
                    :value="version.value" 
                  />
                </el-select>
                <el-switch 
                  :model-value="globalForm.architectures[arch.architectureId] !== undefined"
                  @update:model-value="(val) => toggleArchitecture(arch.architectureId, !!val)"
                  active-text="启用"
                />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="强制更新" prop="forceUpdate">
          <el-switch :model-value="globalForm.forceUpdate" @update:model-value="globalForm.forceUpdate = !!$event" active-text="强制更新" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="globalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleGlobalSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus, Setting, Edit } from '@element-plus/icons-vue'
import { getAppsApi, getArchitecturesApi, getCityStrategiesApi, updateCityStrategyApi, getAppVersionsApi } from '@/api/update'
import { getArchName } from '@/utils/constants/platform'
import { useCommonStore } from '@/pinia/common/common'
import type { IStrategyInfo } from '@/types/api/update'

interface StrategyForm {
  cityId: string
  targetVersion: number
  forceUpdate: boolean
  isActive?: boolean
}

interface BatchForm {
  targetVersion: number
  forceUpdate: boolean
}

interface GlobalForm {
  architectures: { [archId: number]: number } // archId -> versionId mapping
  forceUpdate: boolean
}

export default defineComponent({
  components: {
    Plus,
    Setting,
    Edit
  },
  setup() {
    const commonStore = useCommonStore()
    const loading = ref(false)
    const dialogVisible = ref(false)
    const batchDialogVisible = ref(false)
    const globalDialogVisible = ref(false)
    const dialogTitle = ref('添加策略')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const tableData = ref([])
    const isEdit = ref(false)
    const selectedRows = ref([])

    // 新增的变量
    const selectedAppId = ref('')
    const selectedArchId = ref(0)
    const apps = ref<any[]>([])
    const architectures = ref<any[]>([])
    const versions = ref<any[]>([]) // 存储版本数据
    const architectureVersions = ref<any[]>([]) // 存储架构分组的版本数据

    const formRef = ref<FormInstance>()
    const batchFormRef = ref<FormInstance>()
    const globalFormRef = ref<FormInstance>()
    
    const form = ref<StrategyForm>({
      cityId: '',
      targetVersion: 0,
      forceUpdate: false,
      isActive: true
    })

    const batchForm = ref<BatchForm>({
      targetVersion: 0,
      forceUpdate: false
    })

    const globalForm = ref<GlobalForm>({
      architectures: {},
      forceUpdate: false
    })

    const rules = ref<FormRules>({
      cityId: [{ required: true, message: '请选择城市', trigger: 'change' }],
      targetVersion: [{ required: true, message: '请选择目标版本', trigger: 'change' }]
    })

    const batchRules = ref<FormRules>({
      targetVersion: [{ required: true, message: '请选择目标版本', trigger: 'change' }]
    })

    const globalRules = ref<FormRules>({
      // No specific rules for globalForm, as it's a configuration
    })

    // 动态获取版本选项 - 根据选中的架构过滤
    const versionOptions = computed(() => {
      if (!selectedArchId.value || !architectureVersions.value.length) {
        return []
      }
      
      // 找到当前架构的版本数据
      const currentArch = architectureVersions.value.find(arch => arch.architectureId === selectedArchId.value)
      if (!currentArch || !currentArch.versions || !Array.isArray(currentArch.versions)) {
        return []
      }
      
      return currentArch.versions.map(version => ({
        label: `版本 ${version.version}`,
        value: version.versionId
      }))
    })

    // 过滤出有有效版本的架构（用于全局策略配置）
    const validArchitectureVersions = computed(() => {
      return architectureVersions.value.filter(arch => hasValidVersions(arch))
    })

    // 检查架构是否有有效版本
    const hasValidVersions = (arch: any) => {
      return arch.versions && Array.isArray(arch.versions) && arch.versions.length > 0
    }

    // 根据选中的架构过滤表格数据
    const filteredTableData = computed(() => {
      if (!selectedArchId.value) return []
      
      // 如果没有数据，返回空数组
      if (!tableData.value || tableData.value.length === 0) {
        return []
      }
      
      // 显示所有城市数据，不管strategy是否为null
      const filtered = tableData.value
      
      // 分页处理
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filtered.slice(start, end)
    })

    const filteredTotal = computed(() => {
      if (!selectedArchId.value) return 0
      
      if (!tableData.value || tableData.value.length === 0) {
        return 0
      }
      
      // 返回所有城市的总数
      return tableData.value.length
    })

    // 获取当前版本
    const getCurrentVersion = (row: any) => {
      if (!row.strategy) return '未知版本'
      const strategy = row.strategy.find((s: any) => s.architectureId === selectedArchId.value)
      return strategy?.version || '未知版本'
    }

    // 获取目标版本
    const getTargetVersion = (row: any) => {
      if (!row.strategy) return '未知版本'
      const strategy = row.strategy.find((s: any) => s.architectureId === selectedArchId.value)
      return strategy?.version || '未知版本'
    }

    // 获取强制更新状态
    const getForceUpdate = (row: any) => {
      if (!row.strategy) return false
      const strategy = row.strategy.find((s: any) => s.architectureId === selectedArchId.value)
      return strategy?.forceUpdate || false
    }

    // 处理表格选择变化
    const handleSelectionChange = (selection: any[]) => {
      selectedRows.value = selection
    }

    // 获取应用列表
    const fetchApps = async () => {
      try {
        const res = await getAppsApi({ isActive: true })
        if (res.code === 0 && res.result) {
          apps.value = res.result.apps
        }
      } catch (error) {
        console.error('获取应用列表失败:', error)
        ElMessage.error('获取应用列表失败')
      }
    }

    // 获取架构列表
    const fetchArchitectures = async () => {
      if (!selectedAppId.value) return

      try {
        const res = await getArchitecturesApi({
          appId: selectedAppId.value,
          isActive: true
        })
        if (res.code === 0 && res.result) {
          architectures.value = res.result.architectures || []
          console.log('获取到的架构数据:', architectures.value)
        }
      } catch (error) {
        console.error('获取架构列表失败:', error)
        ElMessage.error('获取架构列表失败')
      }
    }

    // 获取版本列表
    const fetchVersions = async () => {
      if (!selectedAppId.value) return

      try {
        const res = await getAppVersionsApi({
          appId: selectedAppId.value,
          page: 1,
          pageSize: 1000 // 一次性获取所有数据
        })
        
        if (res.code === 0 && res.result) {
          // 保存架构分组的版本数据
          architectureVersions.value = res.result.architectures
          console.log('获取到的架构版本数据:', architectureVersions.value)
          
          // 将架构分组的版本数据转换为扁平化的版本列表（用于兼容）
          const allVersions: any[] = []
          res.result.architectures.forEach(arch => {
            // 检查versions是否存在且不为null
            if (arch.versions && Array.isArray(arch.versions)) {
              arch.versions.forEach(version => {
                allVersions.push({
                  versionId: version.versionId,
                  version: version.version,
                  architectureId: arch.architectureId
                })
              })
            }
          })
          
          // 去重并排序
          const uniqueVersions = allVersions.filter((version, index, self) => 
            index === self.findIndex(v => v.versionId === version.versionId)
          ).sort((a, b) => {
            // 按版本号排序（简单的字符串比较）
            return a.version.localeCompare(b.version, undefined, { numeric: true })
          })
          
          versions.value = uniqueVersions
        }
      } catch (error) {
        console.error('获取版本列表失败:', error)
        ElMessage.error('获取版本列表失败')
      }
    }

    // 应用选择变化
    const handleAppChange = async () => {
      selectedArchId.value = 0
      tableData.value = []
      selectedRows.value = []
      versions.value = [] // 清空版本数据
      architectureVersions.value = [] // 清空架构版本数据
      if (selectedAppId.value) {
        await fetchArchitectures()
        await fetchVersions() // 获取版本数据
        await fetchData()
      }
    }

    // 架构选择变化
    const handleArchSelect = (index: string | number) => {
      selectedArchId.value = typeof index === 'string' ? parseInt(index) : index
      currentPage.value = 1
      selectedRows.value = []
    }

    const handleArchTabClick = (tab: any) => {
      handleArchSelect(tab.paneName)
    }

    // 获取选中的应用名称
    const getSelectedAppName = () => {
      const app = apps.value.find((a: any) => a.appId === selectedAppId.value)
      return app ? app.name : ''
    }

    // 获取选中的架构名称
    const getSelectedArchName = () => {
      const arch = architectures.value.find((a: any) => a.id === selectedArchId.value)
      return arch ? getArchName(arch.archId) : ''
    }

    const fetchData = async () => {
      if (!selectedAppId.value) return

      loading.value = true
      try {
        const res = await getCityStrategiesApi({
          appId: selectedAppId.value,
          page: 1,
          pageSize: 1000 // 一次性获取所有数据
        })
        if (res.code === 0 && res.result) {
          tableData.value = res.result.strategies || []
          total.value = res.result.total
          console.log('获取到的策略数据:', tableData.value)
          
          // 如果没有数据，可能需要初始化默认数据
          if (tableData.value.length === 0) {
            console.log('没有策略数据，可能需要初始化')
          }
        }
      } catch (error) {
        console.error('获取策略列表失败:', error)
        ElMessage.error('获取策略列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleEdit = (row: any) => {
      isEdit.value = true
      const strategy = row.strategy?.find((s: any) => s.architectureId === selectedArchId.value)
      form.value = {
        cityId: row.cityId,
        targetVersion: strategy?.versionId || 0,
        forceUpdate: strategy?.forceUpdate || false,
        isActive: row.isActive
      }
      dialogTitle.value = '编辑策略'
      dialogVisible.value = true
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 构建新的策略数据
            const strategyData: IStrategyInfo[] = []
            
            // 为当前架构创建策略
            strategyData.push({
              architectureId: selectedArchId.value,
              versionId: form.value.targetVersion,
              forceUpdate: form.value.forceUpdate,
              isActive: true
            })

            await updateCityStrategyApi({
              appId: selectedAppId.value,
              cityIds: [form.value.cityId],
              strategy: strategyData,
              updateType: 'single'
            })

            ElMessage.success('更新成功')
            dialogVisible.value = false
            await fetchData() // 重新获取数据
          } catch (error) {
            console.error('更新策略失败:', error)
            ElMessage.error('更新策略失败')
          }
        }
      })
    }

    // 批量修改策略
    const handleBatchStrategy = () => {
      batchForm.value = {
        targetVersion: 0,
        forceUpdate: false
      }
      batchDialogVisible.value = true
    }

    const handleBatchSubmit = async () => {
      if (!batchFormRef.value) return
      
      // 检查是否选择了城市
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请至少选择一个城市')
        return
      }
      
      await batchFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 构建新的策略数据
            const strategyData: IStrategyInfo[] = []
            strategyData.push({
              architectureId: selectedArchId.value,
              versionId: batchForm.value.targetVersion,
              forceUpdate: batchForm.value.forceUpdate,
              isActive: true
            })

            // 获取选中城市的ID
            const cityIds = selectedRows.value.map((item: any) => item.cityId)

            await updateCityStrategyApi({
              appId: selectedAppId.value,
              cityIds: cityIds,
              strategy: strategyData,
              updateType: 'single'
            })

            ElMessage.success('批量更新成功')
            batchDialogVisible.value = false
            await fetchData()
          } catch (error) {
            console.error('批量更新失败:', error)
            ElMessage.error('批量更新失败')
          }
        }
      })
    }

    // 全局策略配置
    const handleGlobalStrategy = () => {
      // 初始化全局表单，只为有有效版本的架构设置默认版本
      const archVersions: { [archId: number]: number } = {}
      validArchitectureVersions.value.forEach((arch: any) => {
        // 确保有版本数据，设置第一个版本为默认值
        if (arch.versions && arch.versions.length > 0) {
          archVersions[arch.architectureId] = arch.versions[0].versionId
        }
      })
      
      globalForm.value = {
        architectures: archVersions,
        forceUpdate: false
      }
      globalDialogVisible.value = true
    }

    const toggleArchitecture = (archId: number, enabled: boolean) => {
      if (enabled) {
        if (!globalForm.value.architectures[archId]) {
          globalForm.value.architectures[archId] = 1 // 默认版本
        }
      } else {
        delete globalForm.value.architectures[archId]
      }
    }

    const updateGlobalArchVersion = (archId: number, version: number) => {
      globalForm.value.architectures[archId] = version
    }

    const getGlobalArchVersion = (archId: number) => {
      return globalForm.value.architectures[archId] || 1
    }

    // 获取指定架构的版本选项
    const getArchVersionOptions = (archId: number) => {
      if (!architectureVersions.value.length) {
        return []
      }
      
      // 找到指定架构的版本数据
      const arch = architectureVersions.value.find(arch => arch.architectureId === archId)
      if (!arch || !arch.versions || !Array.isArray(arch.versions)) {
        return []
      }
      
      return arch.versions.map(version => ({
        label: `版本 ${version.version}`,
        value: version.versionId
      }))
    }

    const handleGlobalSubmit = async () => {
      if (!globalFormRef.value) return
      await globalFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 构建全局策略数据
            const strategyData: IStrategyInfo[] = []
            
            // 为每个启用的架构创建策略
            for (const [archId, versionId] of Object.entries(globalForm.value.architectures)) {
              strategyData.push({
                architectureId: parseInt(archId),
                versionId: versionId,
                forceUpdate: globalForm.value.forceUpdate,
                isActive: true
              })
            }

            // 获取所有城市的ID（全局策略作用于所有城市）
            const cityIds = tableData.value.map((item: any) => item.cityId)

            await updateCityStrategyApi({
              appId: selectedAppId.value,
              cityIds: cityIds,
              strategy: strategyData,
              updateType: 'global'
            })

            ElMessage.success('全局策略配置成功')
            globalDialogVisible.value = false
            await fetchData()
          } catch (error) {
            console.error('全局策略配置失败:', error)
            ElMessage.error('全局策略配置失败')
          }
        }
      })
    }

    const handleSizeChange = (val: number) => {
      pageSize.value = val
      currentPage.value = 1
    }

    const handleCurrentChange = (val: number) => {
      currentPage.value = val
    }

    onMounted(async () => {
      await commonStore.fetchCities()
      fetchApps()
    })

    return {
      loading,
      dialogVisible,
      batchDialogVisible,
      globalDialogVisible,
      dialogTitle,
      currentPage,
      pageSize,
      total,
      filteredTableData,
      filteredTotal,
      isEdit,
      selectedRows,
      selectedAppId,
      selectedArchId,
      apps,
      architectures,
      versions,
      architectureVersions,
      versionOptions,
      validArchitectureVersions,
      formRef,
      batchFormRef,
      globalFormRef,
      form,
      batchForm,
      globalForm,
      rules,
      batchRules,
      globalRules,
      CityList: computed(() => commonStore.getCities.map(city => ({ label: city.name, value: city.code }))),
      fetchApps,
      fetchArchitectures,
      fetchVersions,
      handleAppChange,
      handleArchSelect,
      handleArchTabClick,
      handleSelectionChange,
      getSelectedAppName,
      getSelectedArchName,
      handleEdit,
      handleSubmit,
      handleBatchStrategy,
      handleBatchSubmit,
      handleGlobalStrategy,
      handleGlobalSubmit,
      toggleArchitecture,
      updateGlobalArchVersion,
      getGlobalArchVersion,
      getArchVersionOptions,
      handleSizeChange,
      handleCurrentChange,
      getArchName,
      getCityName: commonStore.getCityName,
      getCurrentVersion,
      getTargetVersion,
      getForceUpdate,
    }
  }
})
</script>

<style scoped>
.strategy-container {
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

.arch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arch-tabs {
  margin: 0 -24px;
}

.strategy-list {
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

.strategy-text {
  font-size: 12px;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.arch-config-list {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.arch-config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.arch-config-item:last-child {
  border-bottom: none;
}

.arch-name {
  font-weight: 500;
  color: #606266;
}

.arch-config-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>