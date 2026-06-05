<template>
  <div class="safety-policy">
    <div class="safety-policy__header">
      <h2 class="safety-policy__title">处置策略</h2>
      <p class="safety-policy__hint">对接 moderation API：人工立案、联动管控动作、敏感词库、待处理举报队列</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="快速立案" name="create">
        <el-form :model="caseForm" label-width="100px" class="case-form">
          <el-form-item label="对象类型" required>
            <el-select v-model="caseForm.targetType" style="width: 200px">
              <el-option label="用户" :value="1" />
              <el-option label="消息" :value="2" />
              <el-option label="动态" :value="3" />
              <el-option label="群组" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="对象ID" required>
            <el-input v-model="caseForm.targetId" placeholder="userId / messageId / momentId / groupId" style="width: 360px" />
          </el-form-item>
          <el-form-item label="工单标题" required>
            <el-input v-model="caseForm.title" placeholder="如：违规内容人工处置" style="width: 360px" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="caseForm.description" type="textarea" :rows="3" style="width: 360px" />
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="caseForm.priority" style="width: 120px">
              <el-option label="普通" :value="1" />
              <el-option label="高" :value="2" />
              <el-option label="紧急" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="creating" @click="submitCreateCase">创建工单并处置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="联动管控动作" name="actions">
        <el-table :data="actionList" border stripe>
          <el-table-column prop="action" label="动作标识" width="180" />
          <el-table-column prop="label" label="说明" min-width="200" />
          <el-table-column prop="targetType" label="适用对象" width="100" />
          <el-table-column prop="scene" label="典型场景" min-width="180" />
          <el-table-column label="操作" width="120">
            <template #default>
              <el-button type="primary" link @click="goCases">工单处置</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="敏感词库" name="words">
        <el-form :inline="true" class="word-form">
          <el-form-item label="关键词">
            <el-input v-model="wordKeyword" placeholder="词条 / 分类" clearable @keyup.enter="handleWordSearch" />
          </el-form-item>
          <el-form-item label="仅启用">
            <el-switch v-model="wordActiveOnly" @change="handleWordSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="wordLoading" @click="handleWordSearch">查询</el-button>
            <el-button type="success" @click="openWordDialog()">新增词条</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="wordLoading" :data="wordList" border stripe size="small">
          <el-table-column prop="word" label="词条" min-width="120" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column label="等级" width="80">
            <template #default="{ row }">
              <el-tag :type="(SENSITIVE_WORD_LEVEL[row.level]?.type as any) || 'info'" size="small">
                {{ SENSITIVE_WORD_LEVEL[row.level]?.text || row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="启用" width="80">
            <template #default="{ row }">
              <el-switch :model-value="row.isActive" @change="(v: boolean) => toggleWordActive(row, v)" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="创建时间" width="170" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openWordDialog(row)">编辑</el-button>
              <el-button type="danger" link @click="removeWord(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="word-pagination"
          background
          layout="total, prev, pager, next"
          :total="wordPagination.total"
          :page-size="wordPagination.pageSize"
          :current-page="wordPagination.page"
          @current-change="onWordPageChange"
        />
      </el-tab-pane>

      <el-tab-pane label="待处理举报" name="pending">
        <el-table v-loading="reportLoading" :data="pendingReports" border stripe size="small">
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column label="类型" width="80">
            <template #default="{ row }">{{ targetTypeLabel(row.targetType) }}</template>
          </el-table-column>
          <el-table-column prop="targetId" label="对象ID" min-width="140" show-overflow-tooltip />
          <el-table-column prop="content" label="描述" min-width="160" show-overflow-tooltip />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="warning" link @click="quickEscalate(row.id)">立案</el-button>
              <el-button type="info" link @click="quickReject(row.id)">驳回</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="wordDialogVisible" :title="wordEditing ? '编辑敏感词' : '新增敏感词'" width="420px">
      <el-form :model="wordForm" label-width="80px">
        <el-form-item label="词条" required>
          <el-input v-model="wordForm.word" placeholder="敏感词" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="wordForm.category" placeholder="如：辱骂、广告" />
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="wordForm.level" style="width: 120px">
            <el-option label="低" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="wordEditing" label="启用">
          <el-switch v-model="wordForm.isActive" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="wordForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="wordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="wordSaving" @click="submitWord">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {
  MODERATION_CONTROL_ACTIONS,
  SENSITIVE_WORD_LEVEL,
  type IContentReportInfo,
  type ISensitiveWordInfo
} from "@/types/api/moderation"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createModerationCaseApi,
  createSensitiveWordApi,
  deleteSensitiveWordApi,
  escalateContentReportApi,
  getContentReportListApi,
  getSensitiveWordListApi,
  rejectContentReportApi,
  updateSensitiveWordApi
} from "@/api/moderation"

export default defineComponent({
  setup() {
    const router = useRouter()
    const activeTab = ref("create")
    const creating = ref(false)
    const reportLoading = ref(false)
    const pendingReports = ref<IContentReportInfo[]>([])
    const caseForm = reactive({
      targetType: 2,
      targetId: "",
      title: "",
      description: "",
      priority: 1
    })

    const wordLoading = ref(false)
    const wordSaving = ref(false)
    const wordKeyword = ref("")
    const wordActiveOnly = ref(false)
    const wordList = ref<ISensitiveWordInfo[]>([])
    const wordPagination = reactive({ page: 1, pageSize: 20, total: 0 })
    const wordDialogVisible = ref(false)
    const wordEditing = ref<ISensitiveWordInfo | null>(null)
    const wordForm = reactive({
      word: "",
      category: "",
      level: 1,
      isActive: true,
      remark: ""
    })

    const actionList = MODERATION_CONTROL_ACTIONS

    const targetTypeLabel = (t: number) => {
      const map: Record<number, string> = { 1: "用户", 2: "消息", 3: "动态", 4: "群组" }
      return map[t] || `类型${t}`
    }

    const submitCreateCase = async () => {
      if (!caseForm.targetId || !caseForm.title) {
        ElMessage.warning("请填写对象ID和标题")
        return
      }
      creating.value = true
      const res = await createModerationCaseApi({
        targetType: caseForm.targetType,
        targetId: caseForm.targetId,
        title: caseForm.title,
        description: caseForm.description || undefined,
        priority: caseForm.priority
      })
      creating.value = false
      if (res.code === 0) {
        ElMessage.success(`工单已创建: ${res.result.caseNo}`)
        router.push({ path: "/safety/cases", query: { caseId: String(res.result.caseId) } })
      } else {
        ElMessage.error(res.msg || "创建失败")
      }
    }

    const loadPendingReports = async () => {
      reportLoading.value = true
      const res = await getContentReportListApi({ page: 1, pageSize: 20, status: 1 })
      reportLoading.value = false
      if (res.code === 0) {
        pendingReports.value = res.result.list || []
      }
    }

    const fetchWordList = async () => {
      wordLoading.value = true
      const res = await getSensitiveWordListApi({
        page: wordPagination.page,
        pageSize: wordPagination.pageSize,
        keyword: wordKeyword.value.trim() || undefined,
        isActive: wordActiveOnly.value || undefined
      })
      wordLoading.value = false
      if (res.code === 0) {
        wordList.value = res.result.list || []
        wordPagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载敏感词失败")
      }
    }

    const handleWordSearch = () => {
      wordPagination.page = 1
      fetchWordList()
    }

    const onWordPageChange = (page: number) => {
      wordPagination.page = page
      fetchWordList()
    }

    const openWordDialog = (row?: ISensitiveWordInfo) => {
      wordEditing.value = row || null
      wordForm.word = row?.word || ""
      wordForm.category = row?.category || ""
      wordForm.level = row?.level || 1
      wordForm.isActive = row?.isActive ?? true
      wordForm.remark = row?.remark || ""
      wordDialogVisible.value = true
    }

    const submitWord = async () => {
      if (!wordForm.word.trim()) {
        ElMessage.warning("请填写词条")
        return
      }
      wordSaving.value = true
      if (wordEditing.value) {
        const res = await updateSensitiveWordApi(wordEditing.value.id, {
          word: wordForm.word.trim(),
          category: wordForm.category.trim() || undefined,
          level: wordForm.level,
          isActive: wordForm.isActive,
          remark: wordForm.remark.trim() || undefined
        })
        wordSaving.value = false
        if (res.code === 0) {
          ElMessage.success("已更新")
          wordDialogVisible.value = false
          fetchWordList()
        } else {
          ElMessage.error(res.msg || "更新失败")
        }
      } else {
        const res = await createSensitiveWordApi({
          word: wordForm.word.trim(),
          category: wordForm.category.trim() || undefined,
          level: wordForm.level,
          remark: wordForm.remark.trim() || undefined
        })
        wordSaving.value = false
        if (res.code === 0) {
          ElMessage.success("已新增")
          wordDialogVisible.value = false
          fetchWordList()
        } else {
          ElMessage.error(res.msg || "新增失败")
        }
      }
    }

    const toggleWordActive = async (row: ISensitiveWordInfo, active: boolean) => {
      const res = await updateSensitiveWordApi(row.id, { isActive: active })
      if (res.code === 0) {
        row.isActive = active
        ElMessage.success(active ? "已启用" : "已停用")
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const removeWord = async (row: ISensitiveWordInfo) => {
      await ElMessageBox.confirm(`确认删除敏感词「${row.word}」？`, "删除", { type: "warning" })
      const res = await deleteSensitiveWordApi(row.id)
      if (res.code === 0) {
        ElMessage.success("已删除")
        fetchWordList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const quickEscalate = async (reportId: number) => {
      const res = await escalateContentReportApi({ reportId })
      if (res.code === 0) {
        ElMessage.success("已立案")
        loadPendingReports()
      } else {
        ElMessage.error(res.msg || "立案失败")
      }
    }

    const quickReject = async (reportId: number) => {
      const res = await rejectContentReportApi({ reportId, handleRemark: "策略页快速驳回" })
      if (res.code === 0) {
        ElMessage.success("已驳回")
        loadPendingReports()
      } else {
        ElMessage.error(res.msg || "驳回失败")
      }
    }

    const goCases = () => router.push("/safety/cases")

    watch(activeTab, tab => {
      if (tab === "pending") loadPendingReports()
      if (tab === "words" && !wordList.value.length) fetchWordList()
    })

    return {
      activeTab, creating, reportLoading, pendingReports, caseForm, actionList,
      wordLoading, wordSaving, wordKeyword, wordActiveOnly, wordList, wordPagination,
      wordDialogVisible, wordEditing, wordForm, SENSITIVE_WORD_LEVEL,
      targetTypeLabel, submitCreateCase, quickEscalate, quickReject, goCases,
      handleWordSearch, onWordPageChange, openWordDialog, submitWord, toggleWordActive, removeWord
    }
  }
})
</script>

<style lang="less" scoped>
.safety-policy {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }

  .case-form { max-width: 560px; padding-top: 12px; }
  .word-form { margin-bottom: 12px; }
  .word-pagination { margin-top: 16px; justify-content: flex-end; }
}
</style>
