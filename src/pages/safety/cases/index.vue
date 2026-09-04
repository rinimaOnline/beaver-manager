<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-manager-header-v1
-->

<template>
  <div class="safety-cases">
    <div class="safety-cases__header">
      <div>
        <h2 class="safety-cases__title">处置工单</h2>
        <p class="safety-cases__subtitle">举报立案后的工单都会落到这里，处置时可联动封禁、删消息等管控动作</p>
      </div>
      <el-button type="primary" @click="openCreate">新建工单</el-button>
    </div>

    <el-form :inline="true">
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" clearable placeholder="状态" style="width: 140px">
          <el-option label="待处理" :value="1" />
          <el-option label="处理中" :value="2" />
          <el-option label="已完结" :value="3" />
          <el-option label="已驳回" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="对象类型">
        <el-select v-model="searchForm.targetType" clearable placeholder="类型" style="width: 140px">
          <el-option label="用户" :value="1" />
          <el-option label="消息" :value="2" />
          <el-option label="动态" :value="3" />
          <el-option label="群组" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="工单号 / 标题 / 对象ID"
          clearable
          style="width: 220px"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      :row-class-name="rowClassName"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="caseNo" label="工单号" width="190" />
      <el-table-column label="来源" width="100">
        <template #default="{ row }">{{ sourceLabel(row.source) }}</template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column label="对象" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ targetTypeLabel(row.targetType) }} · {{ row.targetId }}</template>
      </el-table-column>
      <el-table-column label="优先级" width="100">
        <template #default="{ row }">
          <el-tag :type="priorityTagType(row.priority)" size="small">{{ priorityLabel(row.priority) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="处理人" width="140">
        <template #default="{ row }">{{ row.handlerId || "—" }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="200" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)">详情</el-button>
          <el-button
            v-if="row.status === 1 || row.status === 2"
            link
            type="warning"
            @click="openDetail(row.id)"
          >
            处置
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      background
      class="safety-cases__pager"
      layout="total, sizes, prev, pager, next"
      :current-page="searchForm.page"
      :page-size="searchForm.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      @size-change="(v: number) => { searchForm.pageSize = v; searchForm.page = 1; load() }"
      @current-change="(v: number) => { searchForm.page = v; load() }"
    />

    <el-drawer v-model="detailVisible" size="60%" :title="detailTitle">
      <div v-loading="detailLoading" class="safety-cases__detail">
        <template v-if="context">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="工单号">{{ context.case.caseNo }}</el-descriptions-item>
            <el-descriptions-item label="来源">
              {{ sourceLabel(context.case.source) }}
              <span v-if="context.case.sourceId"> · #{{ context.case.sourceId }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="对象">
              {{ targetTypeLabel(context.case.targetType) }} · {{ context.case.targetId }}
            </el-descriptions-item>
            <el-descriptions-item label="优先级">{{ priorityLabel(context.case.priority) }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ statusLabel(context.case.status) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ context.case.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="处理人">{{ context.case.handlerId || "—" }}</el-descriptions-item>
            <el-descriptions-item label="处置时间">{{ context.case.handleTime || "—" }}</el-descriptions-item>
            <el-descriptions-item label="标题" :span="2">{{ context.case.title }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ context.case.description || "—" }}</el-descriptions-item>
            <el-descriptions-item label="处置备注" :span="2">
              {{ context.case.handleRemark || "—" }}
            </el-descriptions-item>
          </el-descriptions>

          <template v-if="context.targetUser">
            <h4 class="safety-cases__section">目标用户</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户ID">
                <el-button link type="primary" @click="goUser(context.targetUser.userId)">
                  {{ context.targetUser.userId }}
                </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="昵称">{{ context.targetUser.nickName || "—" }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ context.targetUser.email || "—" }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                {{ context.targetUser.status === 2 ? "已封禁" : "正常" }}
              </el-descriptions-item>
            </el-descriptions>
          </template>

          <template v-if="context.targetMessage">
            <h4 class="safety-cases__section">目标消息</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="消息ID">{{ context.targetMessage.messageId }}</el-descriptions-item>
              <el-descriptions-item label="会话ID">{{ context.targetMessage.conversationId }}</el-descriptions-item>
              <el-descriptions-item label="发送人">
                {{ context.targetMessage.sendUserName || "—" }} · {{ context.targetMessage.sendUserId }}
              </el-descriptions-item>
              <el-descriptions-item label="是否已删除">
                {{ context.targetMessage.isDeleted ? "是" : "否" }}
              </el-descriptions-item>
              <el-descriptions-item label="内容" :span="2">
                {{ context.targetMessage.msgPreview || "—" }}
              </el-descriptions-item>
            </el-descriptions>
          </template>

          <template v-if="context.targetMoment">
            <h4 class="safety-cases__section">目标动态</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="动态ID">{{ context.targetMoment.momentId }}</el-descriptions-item>
              <el-descriptions-item label="发布人">{{ context.targetMoment.userId }}</el-descriptions-item>
              <el-descriptions-item label="内容" :span="2">
                {{ context.targetMoment.content || "—" }}
              </el-descriptions-item>
            </el-descriptions>
          </template>

          <template v-if="context.targetGroup">
            <h4 class="safety-cases__section">目标群组</h4>
            <el-descriptions :column="3" border>
              <el-descriptions-item label="群ID">{{ context.targetGroup.groupId }}</el-descriptions-item>
              <el-descriptions-item label="群名">{{ context.targetGroup.title || "—" }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ context.targetGroup.status }}</el-descriptions-item>
            </el-descriptions>
          </template>

          <h4 class="safety-cases__section">关联举报（{{ context.relatedReports.length }}）</h4>
          <el-table v-if="context.relatedReports.length" :data="context.relatedReports" border stripe size="small">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="reporterName" label="举报人" width="140" />
            <el-table-column prop="content" label="原因" min-width="180" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="时间" width="180" />
          </el-table>
          <el-empty v-else description="暂无关联举报" :image-size="60" />

          <template v-if="context.recentMessages.length">
            <h4 class="safety-cases__section">会话近期消息</h4>
            <el-table :data="context.recentMessages" border stripe size="small">
              <el-table-column prop="createTime" label="时间" width="180" />
              <el-table-column label="发送人" width="180">
                <template #default="{ row }">{{ row.sendUserName || row.sendUserId }}</template>
              </el-table-column>
              <el-table-column prop="msgPreview" label="内容" min-width="200" show-overflow-tooltip />
              <el-table-column label="已删除" width="90">
                <template #default="{ row }">{{ row.isDeleted ? "是" : "否" }}</template>
              </el-table-column>
            </el-table>
          </template>

          <h4 class="safety-cases__section">处置</h4>
          <el-form label-width="90px">
            <el-form-item label="处置结果">
              <el-select v-model="handleForm.status" style="width: 200px">
                <el-option label="标记处理中" :value="2" />
                <el-option label="处置完结" :value="3" />
                <el-option label="驳回工单" :value="4" />
              </el-select>
            </el-form-item>
            <el-form-item label="处置备注">
              <el-input v-model="handleForm.handleRemark" type="textarea" :rows="2" placeholder="记录处置依据" />
            </el-form-item>
            <el-form-item label="管控动作">
              <div class="safety-cases__actions">
                <div v-for="(act, idx) in handleForm.actions" :key="idx" class="safety-cases__action">
                  <el-select v-model="act.action" style="width: 150px" @change="onActionChange(act)">
                    <el-option
                      v-for="opt in controlActionOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                  <el-input v-model="act.target" :placeholder="targetPlaceholder(act.action)" style="width: 200px" />
                  <el-input
                    v-if="act.action === 'kick_member'"
                    v-model="act.extra"
                    placeholder="群ID（extra）"
                    style="width: 180px"
                  />
                  <el-input v-model="act.reason" placeholder="原因（可选）" style="width: 180px" />
                  <el-button link type="danger" @click="removeAction(idx)">移除</el-button>
                </div>
                <el-button link type="primary" @click="addAction">+ 添加管控动作</el-button>
              </div>
            </el-form-item>
          </el-form>
          <!-- 管控动作是真在改线上数据（封号、删消息、解散群），任一失败服务端会整单中断，先提醒 -->
          <el-alert
            type="warning"
            :closable="false"
            show-icon
            title="管控动作会立即生效且不可撤销；若其中一条执行失败，工单状态不会被更新。"
          />
        </template>
        <el-empty v-else-if="!detailLoading" description="暂无工单数据" :image-size="80" />
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" :loading="handling" :disabled="!context" @click="submitHandle">
          提交处置
        </el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="createVisible" title="新建工单" width="520px">
      <el-form label-width="90px">
        <el-form-item label="对象类型">
          <el-select v-model="createForm.targetType" style="width: 100%">
            <el-option label="用户" :value="1" />
            <el-option label="消息" :value="2" />
            <el-option label="动态" :value="3" />
            <el-option label="群组" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象ID">
          <el-input v-model="createForm.targetId" placeholder="用户ID / 消息ID / 动态ID / 群ID" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="createForm.title" placeholder="必填" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="createForm.priority" style="width: 100%">
            <el-option label="低" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type {
  IGetModerationCaseContextRes,
  IModerationCaseInfo,
  IModerationControlAction
} from "@/types/api/moderation"
import type { TagType } from "@/types/common"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createModerationCaseApi,
  getModerationCaseContextApi,
  getModerationCaseListApi,
  handleModerationCaseApi
} from "@/api/moderation"
import { computed, defineComponent, onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

// 与服务端 executeControlAction 的 switch 分支一一对应，别加服务端不认的动作
const controlActionOptions = [
  { label: "封禁用户", value: "ban_user", target: "用户ID" },
  { label: "解封用户", value: "unban_user", target: "用户ID" },
  { label: "删除消息", value: "delete_message", target: "消息ID" },
  { label: "清空会话", value: "clear_conversation", target: "会话ID" },
  { label: "删除动态", value: "delete_moment", target: "动态ID" },
  { label: "解散群组", value: "dissolve_group", target: "群ID" },
  { label: "踢出成员", value: "kick_member", target: "用户ID" }
]

export default defineComponent({
  name: "SafetyCases",
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const list = ref<IModerationCaseInfo[]>([])
    const total = ref(0)

    const detailVisible = ref(false)
    const detailLoading = ref(false)
    const handling = ref(false)
    const context = ref<IGetModerationCaseContextRes | null>(null)
    const currentCaseId = ref(0)

    const createVisible = ref(false)
    const creating = ref(false)

    const searchForm = reactive({
      page: 1,
      pageSize: 10,
      status: undefined as number | undefined,
      targetType: undefined as number | undefined,
      keyword: ""
    })

    const handleForm = reactive({
      status: 3,
      handleRemark: "",
      actions: [] as IModerationControlAction[]
    })

    const createForm = reactive({
      targetType: 1,
      targetId: "",
      title: "",
      description: "",
      priority: 1
    })

    const sourceLabel = (s: number) => ({ 1: "举报", 2: "反馈", 3: "手动" }[s] || "其他")
    const targetTypeLabel = (t: number) => ({ 1: "用户", 2: "消息", 3: "动态", 4: "群组" }[t] || "其他")
    const statusLabel = (s: number) => ({ 1: "待处理", 2: "处理中", 3: "已完结", 4: "已驳回" }[s] || "未知")
    const statusTagType = (s: number): TagType =>
      ({ 1: "warning", 2: "primary", 3: "success", 4: "info" }[s] as TagType) || "info"
    const priorityLabel = (p: number) => ({ 1: "低", 2: "中", 3: "高" }[p] || "低")
    const priorityTagType = (p: number): TagType =>
      ({ 1: "info", 2: "warning", 3: "danger" }[p] as TagType) || "info"

    const detailTitle = computed(() =>
      context.value ? `工单 ${context.value.case.caseNo}` : "工单详情"
    )

    const load = async () => {
      loading.value = true
      const res = await getModerationCaseListApi({
        page: searchForm.page,
        pageSize: searchForm.pageSize,
        status: searchForm.status,
        targetType: searchForm.targetType,
        keyword: searchForm.keyword || undefined
      })
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      list.value = res.result?.list || []
      total.value = res.result?.total || 0
    }

    const search = () => {
      searchForm.page = 1
      load()
    }

    const rowClassName = ({ row }: { row: IModerationCaseInfo }) => {
      const focusId = Number(route.query.id || 0)
      return focusId && row.id === focusId ? "is-focus-row" : ""
    }

    // 处置默认动作要跟着工单对象类型走，省得每次手填 target
    const defaultActionFor = (targetType: number) => {
      const map: Record<number, string> = {
        1: "ban_user",
        2: "delete_message",
        3: "delete_moment",
        4: "dissolve_group"
      }
      return map[targetType] || "ban_user"
    }

    const openDetail = async (id: number) => {
      currentCaseId.value = id
      context.value = null
      detailVisible.value = true
      detailLoading.value = true
      const res = await getModerationCaseContextApi(id)
      detailLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载工单详情失败")
        return
      }
      context.value = res.result
      handleForm.status = 3
      handleForm.handleRemark = res.result.case.handleRemark || ""
      handleForm.actions = []
    }

    const addAction = () => {
      const targetType = context.value?.case.targetType || 1
      handleForm.actions.push({
        action: defaultActionFor(targetType),
        target: context.value?.case.targetId || "",
        reason: "",
        extra: ""
      })
    }

    const removeAction = (idx: number) => {
      handleForm.actions.splice(idx, 1)
    }

    const onActionChange = (act: IModerationControlAction) => {
      if (act.action !== "kick_member") {
        act.extra = ""
      }
    }

    const targetPlaceholder = (action: string) =>
      controlActionOptions.find(opt => opt.value === action)?.target || "对象ID"

    const submitHandle = async () => {
      if (!currentCaseId.value) {
        return
      }
      for (const act of handleForm.actions) {
        if (!act.target?.trim()) {
          ElMessage.warning(`管控动作「${targetPlaceholder(act.action)}」不能为空`)
          return
        }
        if (act.action === "kick_member" && !act.extra?.trim()) {
          ElMessage.warning("踢出成员需要填写群ID")
          return
        }
      }

      const actionSummary = handleForm.actions.length
        ? `\n将执行 ${handleForm.actions.length} 个管控动作，立即生效且不可撤销。`
        : ""
      await ElMessageBox.confirm(
        `确认将工单置为「${statusLabel(handleForm.status)}」？${actionSummary}`,
        "处置工单",
        { type: "warning" }
      )

      handling.value = true
      const res = await handleModerationCaseApi({
        id: currentCaseId.value,
        status: handleForm.status,
        handleRemark: handleForm.handleRemark,
        actions: handleForm.actions.length ? handleForm.actions : undefined
      })
      handling.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "处置失败")
        return
      }
      ElMessage.success("处置成功")
      detailVisible.value = false
      load()
    }

    const openCreate = () => {
      createForm.targetType = 1
      createForm.targetId = ""
      createForm.title = ""
      createForm.description = ""
      createForm.priority = 1
      createVisible.value = true
    }

    const submitCreate = async () => {
      if (!createForm.targetId.trim()) {
        ElMessage.warning("请填写对象ID")
        return
      }
      if (!createForm.title.trim()) {
        ElMessage.warning("请填写工单标题")
        return
      }
      creating.value = true
      const res = await createModerationCaseApi({
        targetType: createForm.targetType,
        targetId: createForm.targetId.trim(),
        title: createForm.title.trim(),
        description: createForm.description,
        priority: createForm.priority
      })
      creating.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "创建失败")
        return
      }
      ElMessage.success(`已创建工单 ${res.result.caseNo}`)
      createVisible.value = false
      search()
    }

    const goUser = (userId: string) => {
      if (userId) {
        router.push(`/user/profile/${userId}`)
      }
    }

    onMounted(async () => {
      await load()
      // 举报页立案成功后会带上 ?id=，直接把对应工单的处置抽屉打开
      const focusId = Number(route.query.id || 0)
      if (focusId) {
        openDetail(focusId)
      }
    })

    return {
      loading,
      list,
      total,
      searchForm,
      detailVisible,
      detailLoading,
      detailTitle,
      handling,
      context,
      handleForm,
      createVisible,
      creating,
      createForm,
      controlActionOptions,
      sourceLabel,
      targetTypeLabel,
      statusLabel,
      statusTagType,
      priorityLabel,
      priorityTagType,
      load,
      search,
      rowClassName,
      openDetail,
      addAction,
      removeAction,
      onActionChange,
      targetPlaceholder,
      submitHandle,
      openCreate,
      submitCreate,
      goUser
    }
  }
})
</script>

<style lang="less" scoped>
.safety-cases {
  padding: 8px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 6px;
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }

  &__detail {
    min-height: 200px;
  }

  &__section {
    margin: 20px 0 10px;
    font-size: 14px;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>

<style>
.safety-cases .is-focus-row > td {
  background: #e8f8ef !important;
}
</style>
