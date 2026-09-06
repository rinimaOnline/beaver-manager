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
  <div v-loading="loading" class="user-group-panel">
    <template v-if="profile">
      <div class="user-group-panel__header">
        <div class="user-group-panel__info">
          <h3 class="user-group-panel__title">{{ profile.title || profile.groupId }}</h3>
          <p class="user-group-panel__meta">群ID: {{ profile.groupId }} · 群主: {{ profile.creatorId }}</p>
          <div class="user-group-panel__tags">
            <el-tag :type="profile.status === 3 ? 'danger' : 'success'" size="small">
              {{ profile.status === 3 ? "已解散" : "正常" }}
            </el-tag>
            <el-tag v-if="profile.muteAll" type="warning" size="small">全员禁言</el-tag>
            <el-tag type="info" size="small">{{ data.memberTotal }} 成员 · {{ data.messageTotal }} 消息</el-tag>
          </div>
          <p v-if="profile.notice" class="user-group-panel__notice">{{ profile.notice }}</p>
        </div>
        <div class="user-group-panel__actions">
          <el-button size="small" @click="reportsDrawerVisible = true">举报</el-button>
          <el-button v-if="profile.status !== 3 && groupDbId" size="small" @click="openEditDialog">编辑</el-button>
          <el-button v-if="profile.status !== 3 && groupDbId" size="small" type="danger" @click="handleDissolve">解散</el-button>
        </div>
      </div>

      <div class="user-group-panel__body">
        <aside class="user-group-panel__members">
          <div class="user-group-panel__members-head">
            <span>群成员</span>
            <el-tag size="small" type="info">{{ memberRows.length }}</el-tag>
          </div>
          <el-input v-model="memberKeyword" placeholder="搜索成员" clearable size="small" class="user-group-panel__members-search" />
          <div v-loading="membersLoading" class="user-group-panel__member-list">
            <div
              v-for="row in filteredMembers"
              :key="row.userId"
              class="user-group-panel__member-item"
              :class="{ active: selectedMember?.userId === row.userId }"
              @click="selectedMember = row"
            >
              <el-avatar :size="32">{{ row.nickName?.charAt(0) || "?" }}</el-avatar>
              <div class="user-group-panel__member-info">
                <div class="user-group-panel__member-name">{{ row.nickName || row.userId }}</div>
                <el-tag size="small" :type="row.role === 1 ? 'warning' : 'info'">{{ roleLabel(row.role) }}</el-tag>
              </div>
            </div>
            <el-empty v-if="!membersLoading && !filteredMembers.length" description="暂无成员" :image-size="48" />
          </div>
        </aside>

        <ChatAuditPanel
          :conversation-id="resolvedConversationId"
          :title="profile.title || profile.groupId"
          @cleared="onChatCleared"
        >
          <template v-if="selectedMember" #inspector-extra>
            <div class="user-group-panel__member-detail">
              <div class="user-group-panel__member-detail-title">成员详情</div>
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="昵称">{{ selectedMember.nickName }}</el-descriptions-item>
                <el-descriptions-item label="用户ID">{{ selectedMember.userId }}</el-descriptions-item>
                <el-descriptions-item label="角色">{{ roleLabel(selectedMember.role) }}</el-descriptions-item>
                <el-descriptions-item label="加入时间">{{ selectedMember.joinTime }}</el-descriptions-item>
              </el-descriptions>
              <div class="user-group-panel__member-detail-actions">
                <el-button type="primary" plain size="small" @click="emit('go-user', selectedMember.userId)">用户360</el-button>
                <el-button
                  v-if="selectedMember.memberDbId && profile.status !== 3 && selectedMember.role !== 1"
                  size="small"
                  @click="handleChangeRole(selectedMember)"
                >
                  改角色
                </el-button>
                <el-button
                  v-if="selectedMember.memberDbId && profile.status !== 3"
                  type="warning"
                  plain
                  size="small"
                  @click="handleMute(selectedMember)"
                >
                  禁言
                </el-button>
                <el-button
                  v-if="groupDbId && profile.status !== 3 && selectedMember.role !== 1"
                  type="danger"
                  plain
                  size="small"
                  @click="handleRemoveMember(selectedMember)"
                >
                  移除
                </el-button>
              </div>
            </div>
          </template>
        </ChatAuditPanel>
      </div>
    </template>
    <el-empty v-else-if="!loading" description="群组加载失败" :image-size="64" />

    <el-drawer v-model="reportsDrawerVisible" title="举报记录" size="420px">
      <div v-for="r in data.reports" :key="r.id" class="user-group-panel__report-item">
        <p>{{ r.reporterName }} · {{ r.createdAt }}</p>
      </div>
      <el-empty v-if="!data.reports.length" description="暂无举报" />
    </el-drawer>

    <el-dialog v-model="editVisible" title="编辑群信息" width="480px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="群名称">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="群公告">
          <el-input v-model="editForm.notice" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="全员禁言">
          <el-switch v-model="editForm.muteAll" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSaving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IGetGroupOperationsProfileRes } from "@/types/api/operations"
import type { GroupMemberInfo } from "@/types/api/group"
import { ElMessage, ElMessageBox } from "element-plus"
import { getGroupOperationsProfileApi } from "@/api/operations"
import { deleteGroupApi, getGroupListApi, getGroupMemberListApi, muteGroupMemberApi, removeGroupMemberApi, updateGroupApi, updateMemberRoleApi } from "@/api/group"
import { getChatMessageListApi } from "@/api/chat"
import ChatAuditPanel from "./chatAuditPanel.vue"
import { buildGroupConversationCandidates } from "@/utils/conversation"

const emptyData = (): IGetGroupOperationsProfileRes => ({
  profile: {
    groupId: "", title: "", avatar: "", creatorId: "", notice: "",
    status: 1, muteAll: false, createdAt: ""
  },
  memberTotal: 0, messageTotal: 0, reportTotal: 0,
  members: [], messages: [], reports: []
})

interface IMemberRow {
  userId: string
  nickName: string
  role: number
  joinTime: string
  memberDbId?: number
}

export default defineComponent({
  components: { ChatAuditPanel },
  props: {
    groupId: { type: String, required: true },
    conversationId: { type: String, default: "" }
  },
  emits: ["go-user", "changed"],
  setup(props, { emit }) {
    const loading = ref(false)
    const membersLoading = ref(false)
    const data = ref<IGetGroupOperationsProfileRes>(emptyData())
    const groupDbId = ref<number | null>(null)
    const fullMembers = ref<GroupMemberInfo[]>([])
    const resolvedConversationId = ref<string | null>(null)
    const memberKeyword = ref("")
    const selectedMember = ref<IMemberRow | null>(null)
    const reportsDrawerVisible = ref(false)
    const editVisible = ref(false)
    const editSaving = ref(false)
    const editForm = reactive({ title: "", notice: "", muteAll: false })

    const profile = computed(() => data.value.profile?.groupId ? data.value.profile : null)

    const roleLabel = (role: number) => {
      const map: Record<number, string> = { 1: "群主", 2: "管理员", 3: "成员" }
      return map[role] || `角色${role}`
    }

    const memberRows = computed<IMemberRow[]>(() => {
      const memberMap = new Map(fullMembers.value.map(m => [m.userId, m]))
      const source = fullMembers.value.length
        ? fullMembers.value.map(m => ({
            userId: m.userId,
            // 群成员列表接口把用户昵称放在 memberNickname，入群时间放在 createdAt
            nickName: m.memberNickname || m.userId,
            role: m.role,
            joinTime: m.createdAt || "",
            memberDbId: m.id
          }))
        : (data.value.members || []).map(m => ({
            userId: m.userId,
            nickName: m.nickName,
            role: m.role,
            joinTime: m.joinTime,
            memberDbId: memberMap.get(m.userId)?.id
          }))
      return source
    })

    const filteredMembers = computed(() => {
      const kw = memberKeyword.value.trim().toLowerCase()
      if (!kw) return memberRows.value
      return memberRows.value.filter(m =>
        m.nickName.toLowerCase().includes(kw) || m.userId.toLowerCase().includes(kw)
      )
    })

    const resolveGroupConversationId = async (groupUuid: string) => {
      if (props.conversationId) return props.conversationId
      const candidates = buildGroupConversationCandidates(groupUuid)
      for (const cid of candidates) {
        const res = await getChatMessageListApi({ page: 1, pageSize: 1, conversationId: cid })
        if (res.code === 0 && (res.result.total || 0) > 0) return cid
      }
      return candidates[0] || null
    }

    // 成员相关接口收的是群 UUID，不是数据库自增 id，所以不依赖 groupDbId。
    const loadFullMembers = async () => {
      if (!props.groupId) return
      membersLoading.value = true
      const res = await getGroupMemberListApi({
        groupId: props.groupId,
        page: 1,
        limit: 500
      })
      membersLoading.value = false
      if (res.code === 0) fullMembers.value = res.result.list || []
    }

    // groupDbId 只有「编辑群资料」和「解散群」要用（那两个接口收自增 id），
    // 拿不到也不该拖累成员列表，所以两件事分开做。
    const resolveGroupDbId = async () => {
      groupDbId.value = null
      if (!props.groupId) return
      const res = await getGroupListApi({ page: 1, limit: 20, keywords: props.groupId })
      if (res.code === 0) {
        const matched = (res.result.list || []).find(g => g.groupId === props.groupId)
        if (matched) groupDbId.value = matched.id
      }
    }

    const loadProfile = async () => {
      if (!props.groupId) return
      loading.value = true
      selectedMember.value = null
      const res = await getGroupOperationsProfileApi(props.groupId)
      loading.value = false
      if (res.code === 0) {
        data.value = res.result
        resolvedConversationId.value = await resolveGroupConversationId(props.groupId)
        await Promise.all([resolveGroupDbId(), loadFullMembers()])
      } else {
        ElMessage.error(res.msg || "加载群信息失败")
        data.value = emptyData()
        resolvedConversationId.value = null
        fullMembers.value = []
      }
    }

    const onChatCleared = () => {
      loadProfile()
      emit("changed")
    }

    const handleRemoveMember = async (row: IMemberRow) => {
      if (!props.groupId) return
      await ElMessageBox.confirm(`确认移除成员「${row.nickName || row.userId}」？`, "移除成员", { type: "warning" })
      const res = await removeGroupMemberApi({ groupId: props.groupId, memberIds: [row.userId] })
      if (res.code === 0) {
        ElMessage.success("已移除")
        selectedMember.value = null
        await loadProfile()
        emit("changed")
      } else {
        ElMessage.error(res.msg || "移除失败")
      }
    }

    const handleMute = async (row: IMemberRow) => {
      if (!row.memberDbId) return
      await ElMessageBox.confirm(`确认禁言成员「${row.nickName || row.userId}」24小时？`, "禁言成员", { type: "warning" })
      // 服务端 prohibitionTime 的单位是「分钟」（见 backend_admin/api/group.api），
      // 之前按秒传 86400，实际是禁言 60 天。
      const res = await muteGroupMemberApi(row.memberDbId, { prohibitionTime: 24 * 60 })
      if (res.code === 0) ElMessage.success("已禁言")
      else ElMessage.error(res.msg || "禁言失败")
    }

    const openEditDialog = () => {
      if (!profile.value) return
      editForm.title = profile.value.title || ""
      editForm.notice = profile.value.notice || ""
      editForm.muteAll = profile.value.muteAll || false
      editVisible.value = true
    }

    const submitEdit = async () => {
      if (!groupDbId.value) return
      editSaving.value = true
      const res = await updateGroupApi(groupDbId.value, {
        title: editForm.title,
        notice: editForm.notice,
        muteAll: editForm.muteAll
      })
      editSaving.value = false
      if (res.code === 0) {
        ElMessage.success("已保存")
        editVisible.value = false
        await loadProfile()
        emit("changed")
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const handleChangeRole = async (row: IMemberRow) => {
      if (!row.memberDbId) return
      const roleOptions = [
        { label: "管理员", value: 2 },
        { label: "普通成员", value: 3 }
      ]
      const current = roleOptions.find(o => o.value === row.role) || roleOptions[1]
      const next = roleOptions.find(o => o.value !== row.role) || roleOptions[1]
      await ElMessageBox.confirm(
        `确认将「${row.nickName || row.userId}」从「${current.label}」调整为「${next.label}」？`,
        "修改角色",
        { type: "warning" }
      )
      const res = await updateMemberRoleApi(row.memberDbId, { role: next.value })
      if (res.code === 0) {
        ElMessage.success("角色已更新")
        await loadProfile()
        emit("changed")
      } else {
        ElMessage.error(res.msg || "修改失败")
      }
    }

    const handleDissolve = async () => {
      if (!groupDbId.value) return
      await ElMessageBox.confirm(`确认解散群组「${profile.value?.title}」？此操作不可撤销。`, "解散群组", { type: "error" })
      const res = await deleteGroupApi(groupDbId.value)
      if (res.code === 0) {
        ElMessage.success("群组已解散")
        await loadProfile()
        emit("changed")
      } else {
        ElMessage.error(res.msg || "解散失败")
      }
    }

    watch(() => props.groupId, loadProfile, { immediate: true })
    watch(() => props.conversationId, val => {
      if (val) resolvedConversationId.value = val
    })

    return {
      emit,
      loading, membersLoading, data, profile, groupDbId, memberRows, filteredMembers,
      resolvedConversationId, memberKeyword, selectedMember, reportsDrawerVisible,
      editVisible, editSaving, editForm,
      roleLabel, openEditDialog, submitEdit, handleChangeRole,
      handleRemoveMember, handleMute, handleDissolve, onChatCleared
    }
  }
})
</script>

<style lang="less">
.user-group-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  .user-group-panel__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;
  }

  .user-group-panel__info {
    flex: 1;
    min-width: 0;
  }

  .user-group-panel__title {
    margin: 0 0 4px;
    font-size: 16px;
  }

  .user-group-panel__meta {
    margin: 0 0 6px;
    color: #606266;
    font-size: 12px;
  }

  .user-group-panel__tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .user-group-panel__notice {
    margin: 6px 0 0;
    font-size: 12px;
    color: #606266;
    line-height: 1.4;
  }

  .user-group-panel__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
  }

  .user-group-panel__body {
    flex: 1;
    display: flex;
    gap: 0;
    min-height: 0;
  }

  .user-group-panel__members {
    width: 200px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
  }

  .user-group-panel__members-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    font-weight: 600;
    font-size: 13px;
    border-bottom: 1px solid #ebeef5;
  }

  .user-group-panel__members-search {
    margin: 8px 10px 0;
  }

  .user-group-panel__member-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 10px 10px;
    min-height: 0;
  }

  .user-group-panel__member-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 4px;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
    }
  }

  .user-group-panel__member-info {
    flex: 1;
    min-width: 0;
  }

  .user-group-panel__member-name {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-group-panel__member-detail {
    padding: 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .user-group-panel__member-detail-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .user-group-panel__member-detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .user-group-panel__report-item {
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;

    p {
      margin: 0 0 6px;
    }
  }
}
</style>
