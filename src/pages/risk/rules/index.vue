<template>
  <div class="risk-rules">
    <div class="risk-rules__header">
      <h2 class="risk-rules__title">行为规则</h2>
      <p class="risk-rules__hint">联动管控动作、敏感词策略与近期风控处置留痕</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="处置动作" name="actions">
        <el-table :data="ruleList" border stripe>
          <el-table-column prop="action" label="动作标识" width="180" />
          <el-table-column prop="label" label="说明" min-width="200" />
          <el-table-column prop="targetType" label="适用对象" width="120" />
          <el-table-column prop="scene" label="典型场景" min-width="160" show-overflow-tooltip />
          <el-table-column label="快捷入口" width="140">
            <template #default="{ row }">
              <el-button type="primary" link @click="goEntry(row.entry)">{{ row.entryLabel }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="risk-rules__footer">
          <el-button type="primary" @click="goCases">前往工单中心</el-button>
          <el-button @click="goPolicy">敏感词与策略</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="敏感词概览" name="words">
        <div class="risk-rules__toolbar">
          <el-button type="primary" link @click="goPolicy">管理敏感词库</el-button>
        </div>
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
              <el-tag :type="row.isActive ? 'success' : 'info'" size="small">{{ row.isActive ? "是" : "否" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="近期风控日志" name="logs">
        <el-table v-loading="logLoading" :data="riskLogs" border stripe size="small">
          <el-table-column prop="operatorId" label="操作人" width="120" />
          <el-table-column label="动作" width="120">
            <template #default="{ row }">{{ actionLabel(row.action) }}</template>
          </el-table-column>
          <el-table-column prop="targetId" label="对象ID" min-width="140" show-overflow-tooltip />
          <el-table-column prop="detail" label="详情" min-width="160" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="时间" width="170" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button v-if="row.action === 'ban_user' || row.action === 'unban_user'" type="primary" link @click="goUser(row.targetId)">用户360</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import {
  MODERATION_ACTION_LABELS,
  MODERATION_CONTROL_ACTIONS,
  SENSITIVE_WORD_LEVEL,
  type IOperationLogInfo,
  type ISensitiveWordInfo
} from "@/types/api/moderation"
import { getOperationLogListApi, getSensitiveWordListApi } from "@/api/moderation"

const ENTRY_MAP: Record<string, { entry: string; entryLabel: string }> = {
  ban_user: { entry: "/risk/users", entryLabel: "风险用户" },
  unban_user: { entry: "/safety/appeals", entryLabel: "申诉管理" },
  delete_message: { entry: "/compliance/messages", entryLabel: "消息检索" },
  clear_conversation: { entry: "/compliance/sessions", entryLabel: "会话审计" },
  delete_moment: { entry: "/community/moments", entryLabel: "动态流" },
  dissolve_group: { entry: "/group/list", entryLabel: "群组列表" },
  kick_member: { entry: "/group/search", entryLabel: "群组检索" },
  reject_report: { entry: "/safety/reports", entryLabel: "举报中心" },
  escalate_report: { entry: "/safety/reports", entryLabel: "举报中心" }
}

export default defineComponent({
  setup() {
    const router = useRouter()
    const activeTab = ref("actions")
    const wordLoading = ref(false)
    const logLoading = ref(false)
    const wordList = ref<ISensitiveWordInfo[]>([])
    const riskLogs = ref<IOperationLogInfo[]>([])

    const ruleList = MODERATION_CONTROL_ACTIONS.map(item => ({
      ...item,
      entry: ENTRY_MAP[item.action]?.entry || "/safety/cases",
      entryLabel: ENTRY_MAP[item.action]?.entryLabel || "工单处置"
    }))

    const actionLabel = (action: string) => MODERATION_ACTION_LABELS[action] || action

    const fetchWords = async () => {
      wordLoading.value = true
      const res = await getSensitiveWordListApi({ page: 1, pageSize: 20, isActive: true })
      wordLoading.value = false
      if (res.code === 0) {
        wordList.value = res.result.list || []
      }
    }

    const fetchRiskLogs = async () => {
      logLoading.value = true
      const res = await getOperationLogListApi({
        page: 1,
        pageSize: 20,
        actions: "ban_user,unban_user,kick_member,dissolve_group"
      })
      logLoading.value = false
      if (res.code === 0) {
        riskLogs.value = res.result.list || []
      }
    }

    const goEntry = (path: string) => router.push(path)
    const goCases = () => router.push("/safety/cases")
    const goPolicy = () => router.push("/safety/policy")
    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    watch(activeTab, tab => {
      if (tab === "words" && !wordList.value.length) fetchWords()
      if (tab === "logs" && !riskLogs.value.length) fetchRiskLogs()
    })

    return {
      activeTab, ruleList, wordList, riskLogs, wordLoading, logLoading, SENSITIVE_WORD_LEVEL,
      actionLabel, goEntry, goCases, goPolicy, goUser
    }
  }
})
</script>

<style lang="less" scoped>
.risk-rules {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__footer { margin-top: 16px; display: flex; gap: 8px; }
  &__toolbar { margin-bottom: 12px; }
}
</style>
