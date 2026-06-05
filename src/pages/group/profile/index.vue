<template>
  <div v-loading="loading" class="group-profile">
    <template v-if="profile">
      <div class="group-profile__header">
        <div class="group-profile__header-info">
          <h2 class="group-profile__title">{{ profile.title || profile.groupId }}</h2>
          <p class="group-profile__meta">群ID: {{ profile.groupId }} · 群主: {{ profile.creatorId }}</p>
          <div class="group-profile__tags">
            <el-tag :type="profile.status === 3 ? 'danger' : 'success'" size="small">
              {{ profile.status === 3 ? "已解散" : "正常" }}
            </el-tag>
            <el-tag v-if="profile.muteAll" type="warning" size="small">全员禁言</el-tag>
            <el-tag type="info" size="small">{{ data.memberTotal }} 成员 · {{ data.messageTotal }} 消息</el-tag>
          </div>
          <p v-if="profile.notice" class="group-profile__notice-text">{{ profile.notice }}</p>
        </div>
        <div class="group-profile__header-actions">
          <el-button @click="goSearch">返回检索</el-button>
          <el-button @click="reportsDrawerVisible = true">举报记录</el-button>
          <el-button v-if="profile.status !== 3 && groupDbId" @click="openEditDialog">编辑群信息</el-button>
          <el-button type="warning" @click="goSafety">内容安全</el-button>
          <el-button v-if="profile.status !== 3 && groupDbId" type="danger" @click="handleDissolve">解散群组</el-button>
        </div>
      </div>

      <div class="group-profile__body">
        <aside class="group-profile__members">
          <div class="group-profile__members-head">
            <span class="group-profile__members-title">群成员</span>
            <el-tag size="small" type="info">{{ memberRows.length }}</el-tag>
          </div>
          <el-input v-model="memberKeyword" placeholder="搜索成员" clearable size="small" class="group-profile__members-search" />
          <div v-loading="membersLoading" class="group-profile__member-list">
            <div
              v-for="row in filteredMembers"
              :key="row.userId"
              class="group-profile__member-item"
              :class="{ active: selectedMember?.userId === row.userId }"
              @click="selectedMember = row"
            >
              <el-avatar :size="36">{{ row.nickName?.charAt(0) || "?" }}</el-avatar>
              <div class="group-profile__member-info">
                <div class="group-profile__member-name">{{ row.nickName || row.userId }}</div>
                <div class="group-profile__member-meta">
                  <el-tag size="small" :type="row.role === 1 ? 'warning' : 'info'">{{ roleLabel(row.role) }}</el-tag>
                  <span>{{ row.joinTime }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="!membersLoading && !filteredMembers.length" description="暂无成员" :image-size="64" />
          </div>
        </aside>

        <ChatAuditPanel
          :conversation-id="groupConversationId"
          :title="profile.title || profile.groupId"
          @cleared="loadProfile"
        >
          <template v-if="selectedMember" #inspector-extra>
            <div class="group-profile__member-panel">
              <div class="group-profile__member-panel-title">成员详情</div>
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="昵称">{{ selectedMember.nickName }}</el-descriptions-item>
                <el-descriptions-item label="用户ID">
                  <el-link type="primary" @click="goUser(selectedMember.userId)">{{ selectedMember.userId }}</el-link>
                </el-descriptions-item>
                <el-descriptions-item label="角色">{{ roleLabel(selectedMember.role) }}</el-descriptions-item>
                <el-descriptions-item label="加入时间">{{ selectedMember.joinTime }}</el-descriptions-item>
              </el-descriptions>
              <div class="group-profile__member-panel-actions">
                <el-button type="primary" plain size="small" @click="goUser(selectedMember.userId)">用户360</el-button>
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
    <el-empty v-else-if="!loading" description="群组不存在或加载失败" />

    <el-drawer v-model="reportsDrawerVisible" title="举报记录" size="480px">
      <div v-for="r in data.reports" :key="r.id" class="group-profile__report-item">
        <p>{{ r.reporterName }} · {{ r.createdAt }}</p>
        <el-button link type="primary" @click="goReports(r.id)">举报中心</el-button>
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
import ChatAuditPanel from "@/components/chat/ChatAuditPanel.vue"
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
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const membersLoading = ref(false)
    const data = ref<IGetGroupOperationsProfileRes>(emptyData())
    const groupDbId = ref<number | null>(null)
    const fullMembers = ref<GroupMemberInfo[]>([])
    const groupConversationId = ref<string | null>(null)
    const memberKeyword = ref("")
    const selectedMember = ref<IMemberRow | null>(null)
    const reportsDrawerVisible = ref(false)

    const editVisible = ref(false)
    const editSaving = ref(false)
    const editForm = reactive({ title: "", notice: "", muteAll: false })

    const groupId = computed(() => route.params.groupId as string)
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
            nickName: m.nickName || m.userId,
            role: m.role,
            joinTime: m.joinTime || "",
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
      if (!kw) {
        return memberRows.value
      }
      return memberRows.value.filter(m =>
        m.nickName.toLowerCase().includes(kw) || m.userId.toLowerCase().includes(kw)
      )
    })

    const resolveGroupConversationId = async (groupUuid: string) => {
      const candidates = buildGroupConversationCandidates(groupUuid)
      for (const cid of candidates) {
        const res = await getChatMessageListApi({ page: 1, pageSize: 1, conversationId: cid })
        if (res.code === 0 && (res.result.total || 0) > 0) {
          return cid
        }
      }
      return candidates[0] || null
    }

    const resolveGroupDbId = async () => {
      groupDbId.value = null
      fullMembers.value = []
      if (!groupId.value) {
        return
      }
      const res = await getGroupListApi({ page: 1, limit: 20, keywords: groupId.value })
      if (res.code === 0) {
        const matched = (res.result.list || []).find(g => g.uuid === groupId.value)
        if (matched) {
          groupDbId.value = matched.id
          await loadFullMembers()
        }
      }
    }

    const loadFullMembers = async () => {
      if (!groupDbId.value) {
        return
      }
      membersLoading.value = true
      const res = await getGroupMemberListApi({
        groupId: String(groupDbId.value),
        page: 1,
        limit: 500
      })
      membersLoading.value = false
      if (res.code === 0) {
        fullMembers.value = res.result.list || []
      }
    }

    const loadProfile = async () => {
      if (!groupId.value) {
        return
      }
      loading.value = true
      const res = await getGroupOperationsProfileApi(groupId.value)
      loading.value = false
      if (res.code === 0) {
        data.value = res.result
        groupConversationId.value = await resolveGroupConversationId(groupId.value)
        await resolveGroupDbId()
      } else {
        ElMessage.error(res.msg || "加载群组360失败")
        data.value = emptyData()
        groupConversationId.value = null
      }
    }

    const handleRemoveMember = async (row: IMemberRow) => {
      if (!groupDbId.value) {
        return
      }
      await ElMessageBox.confirm(`确认移除成员「${row.nickName || row.userId}」？`, "移除成员", { type: "warning" })
      const res = await removeGroupMemberApi({ groupId: String(groupDbId.value), memberIds: [row.userId] })
      if (res.code === 0) {
        ElMessage.success("已移除")
        selectedMember.value = null
        await loadProfile()
      } else {
        ElMessage.error(res.msg || "移除失败")
      }
    }

    const handleMute = async (row: IMemberRow) => {
      if (!row.memberDbId) {
        return
      }
      await ElMessageBox.confirm(`确认禁言成员「${row.nickName || row.userId}」24小时？`, "禁言成员", { type: "warning" })
      const res = await muteGroupMemberApi(row.memberDbId, { prohibitionTime: 86400 })
      if (res.code === 0) {
        ElMessage.success("已禁言")
      } else {
        ElMessage.error(res.msg || "禁言失败")
      }
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
      } else {
        ElMessage.error(res.msg || "修改失败")
      }
    }

    const handleDissolve = async () => {
      if (!groupDbId.value) {
        return
      }
      await ElMessageBox.confirm(`确认解散群组「${profile.value?.title}」？此操作不可撤销。`, "解散群组", { type: "error" })
      const res = await deleteGroupApi(groupDbId.value)
      if (res.code === 0) {
        ElMessage.success("群组已解散")
        await loadProfile()
      } else {
        ElMessage.error(res.msg || "解散失败")
      }
    }

    const goSearch = () => router.push("/group/search")
    const goSafety = () => router.push({ path: "/safety/reports", query: { targetType: "4" } })
    const goReports = (reportId: number) => {
      router.push({ path: "/safety/reports", query: { reportId: String(reportId) } })
    }
    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    watch(groupId, loadProfile, { immediate: true })

    return {
      loading, membersLoading, data, profile, groupDbId, memberRows, filteredMembers,
      groupConversationId, memberKeyword, selectedMember, reportsDrawerVisible,
      editVisible, editSaving, editForm,
      roleLabel, openEditDialog, submitEdit, handleChangeRole,
      handleRemoveMember, handleMute, handleDissolve, loadProfile,
      goSearch, goSafety, goReports, goUser
    }
  }
})
</script>

<style lang="less">
.group-profile {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  padding: 12px;
  box-sizing: border-box;

  .group-profile__header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  .group-profile__header-info {
    flex: 1;
  }

  .group-profile__title {
    margin: 0 0 4px;
    font-size: 18px;
  }

  .group-profile__meta {
    margin: 0 0 8px;
    color: #606266;
    font-size: 13px;
  }

  .group-profile__tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .group-profile__notice-text {
    margin: 8px 0 0;
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
  }

  .group-profile__header-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .group-profile__body {
    flex: 1;
    display: flex;
    gap: 12px;
    min-height: 0;
  }

  .group-profile__members {
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .group-profile__members-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .group-profile__members-title {
    font-weight: 600;
    font-size: 14px;
  }

  .group-profile__members-search {
    margin: 8px 12px 0;
  }

  .group-profile__member-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px 12px;
    min-height: 0;
  }

  .group-profile__member-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    margin-bottom: 6px;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
      border-color: #b3d8ff;
    }
  }

  .group-profile__member-info {
    flex: 1;
    min-width: 0;
  }

  .group-profile__member-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group-profile__member-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #909399;
  }

  .group-profile__member-panel {
    padding: 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .group-profile__member-panel-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .group-profile__member-panel-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .group-profile__report-item {
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;

    p {
      margin: 0 0 6px;
    }
  }
}
</style>
