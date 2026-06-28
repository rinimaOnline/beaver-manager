<template>
  <div v-loading="loading" class="user-profile">
    <template v-if="profile">
      <div class="user-profile__header">
        <el-avatar :size="48" class="user-profile__avatar">{{ profile.nickName?.charAt(0) || "U" }}</el-avatar>
        <div class="user-profile__header-info">
          <h2 class="user-profile__title">{{ profile.nickName || profile.userId }}</h2>
          <p class="user-profile__meta">{{ profile.userId }} · {{ profile.email || "无邮箱" }}</p>
          <div class="user-profile__tags">
            <el-tag :type="profile.status === 2 ? 'danger' : 'success'" size="small">
              {{ profile.status === 2 ? "禁用" : "正常" }}
            </el-tag>
            <el-tag type="info" size="small">
              {{ data.friendTotal }} 好友 · {{ data.groupTotal }} 群 · {{ data.momentTotal }} 动态
            </el-tag>
          </div>
        </div>
        <div class="user-profile__header-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button @click="extraDrawerVisible = true">更多资料</el-button>
          <el-button @click="goAppeals">申诉</el-button>
          <el-button
            v-if="profile.status === 2"
            type="success"
            :loading="controlLoading"
            @click="handleUnban"
          >
            解封账号
          </el-button>
          <el-button v-else type="danger" :loading="controlLoading" @click="handleBan">封禁账号</el-button>
        </div>
      </div>

      <div class="user-profile__body">
        <aside class="user-profile__relations">
          <div class="user-profile__relations-head">
            <el-radio-group v-model="relationMode" size="small" class="user-profile__mode" @change="onModeChange">
              <el-radio-button value="private">私聊</el-radio-button>
              <el-radio-button value="groups">群聊</el-radio-button>
              <el-radio-button value="moments">动态</el-radio-button>
              <el-radio-button value="emojis">表情</el-radio-button>
            </el-radio-group>
            <el-input
              v-model="relationKeyword"
              placeholder="搜索名称 / ID"
              clearable
              size="small"
              class="user-profile__search"
            />
            <el-button v-if="relationMode === 'private'" link type="primary" size="small" @click="friendRequestsVisible = true">
              好友申请
            </el-button>
          </div>

          <div v-loading="sidebarLoading" class="user-profile__relation-list">
            <template v-if="relationMode === 'private' || relationMode === 'groups'">
              <div
                v-for="item in filteredRelations"
                :key="item.key"
                class="user-profile__relation-item"
                :class="{ active: activeRelation?.key === item.key }"
                @click="selectRelation(item)"
              >
                <div class="user-profile__relation-top">
                  <el-tag size="small" :type="item.conversationType === 1 ? 'primary' : 'success'">
                    {{ item.conversationType === 1 ? "私聊" : "群聊" }}
                  </el-tag>
                  <span v-if="item.lastMessageTime" class="user-profile__relation-time">{{ formatTime(item.lastMessageTime) }}</span>
                </div>
                <div class="user-profile__relation-title">{{ item.title }}</div>
                <div class="user-profile__relation-preview">{{ item.subtitle }}</div>
                <div v-if="item.messageCount != null" class="user-profile__relation-meta">{{ item.messageCount }} 条消息</div>
                <div class="user-profile__relation-actions" @click.stop>
                  <el-button v-if="item.peerUserId" link type="primary" size="small" @click="goUser(item.peerUserId)">用户360</el-button>
                </div>
              </div>
              <el-empty v-if="!sidebarLoading && !filteredRelations.length" :description="emptyRelationHint" :image-size="64" />
            </template>

            <template v-else-if="relationMode === 'moments'">
              <div
                v-for="m in filteredMoments"
                :key="m.momentId"
                class="user-profile__relation-item"
                :class="{ active: activeMomentId === m.momentId }"
                @click="selectMoment(m.momentId)"
              >
                <div class="user-profile__relation-top">
                  <el-tag size="small" :type="m.isDeleted ? 'danger' : 'success'">{{ m.isDeleted ? "已删" : "正常" }}</el-tag>
                  <span class="user-profile__relation-time">{{ formatTime(m.createdAt) }}</span>
                </div>
                <div class="user-profile__relation-title">{{ m.content || m.momentId }}</div>
                <div class="user-profile__relation-meta">{{ m.commentCount }} 评论 · {{ m.likeCount }} 点赞</div>
              </div>
              <el-empty v-if="!sidebarLoading && !momentList.length" description="该用户暂无动态" :image-size="64" />
            </template>

            <template v-else-if="relationMode === 'emojis'">
              <div
                v-for="e in filteredEmojis"
                :key="e.id"
                class="user-profile__relation-item"
                :class="{ active: activeEmoji?.id === e.id }"
                @click="selectEmoji(e)"
              >
                <div class="user-profile__relation-title">{{ e.title }}</div>
                <div class="user-profile__relation-meta">{{ e.createTime }}</div>
              </div>
              <el-empty v-if="!sidebarLoading && !emojiList.length" description="该用户暂无表情" :image-size="64" />
            </template>
          </div>
        </aside>

        <ChatAuditPanel
          v-if="relationMode === 'private'"
          :conversation-id="activeConversationId"
          :title="activeConversationTitle"
          :participant-names="activeParticipantNames"
          @cleared="loadRelations"
        />
        <UserGroupPanel
          v-else-if="relationMode === 'groups' && activeGroupId"
          :group-id="activeGroupId"
          :conversation-id="activeConversationId || ''"
          @go-user="goUser"
          @changed="loadRelations"
        />
        <UserMomentPanel
          v-else-if="relationMode === 'moments'"
          :moment-id="activeMomentId"
          @deleted="onMomentDeleted"
          @go-user="goUser"
        />
        <UserEmojiPanel
          v-else-if="relationMode === 'emojis'"
          :emoji="activeEmoji"
          @deleted="onEmojiDeleted"
        />
      </div>
    </template>
    <el-empty v-else-if="!loading" description="用户不存在或加载失败" />

    <el-drawer v-model="extraDrawerVisible" title="更多资料" size="520px">
      <el-tabs v-model="extraTab">
        <el-tab-pane label="举报" name="reports">
          <div v-for="r in data.reports" :key="r.id" class="user-profile__extra-item">
            <p>{{ targetTypeLabel(r.targetType) }} · {{ r.targetId }}</p>
            <div class="user-profile__extra-meta">
              <span>{{ r.createdAt }}</span>
            </div>
          </div>
          <el-empty v-if="!data.reports.length" description="暂无举报" />
        </el-tab-pane>
        <el-tab-pane label="黑名单" name="blocks">
          <div v-for="b in data.blocks" :key="b.id" class="user-profile__extra-item">
            <p>{{ b.blockedUserName }} ({{ b.blockedUserId }})</p>
            <div class="user-profile__extra-meta">
              <span>{{ b.createTime }}</span>
              <el-button link type="primary" @click="goUser(b.blockedUserId)">用户360</el-button>
            </div>
          </div>
          <el-empty v-if="!data.blocks.length" description="暂无拉黑" />
        </el-tab-pane>
      </el-tabs>
    </el-drawer>

    <UserFriendRequestsDialog v-model:visible="friendRequestsVisible" :user-id="userId" />
  </div>
</template>

<script lang="ts">
import type { IChatSessionInfo } from "@/types/api/chat"
import type { IEmojiInfo } from "@/types/api/emoji"
import type { IFriendInfo } from "@/types/api/friend"
import type { MomentInfo } from "@/types/api/moment"
import type { IGetUserOperationsProfileRes } from "@/types/api/operations"
import { ElMessage, ElMessageBox } from "element-plus"
import { getUserOperationsProfileApi } from "@/api/operations"
import { executeUserControlApi } from "@/api/moderation"
import { getFriendListApi } from "@/api/friend"
import { getChatSessionListApi } from "@/api/chat"
import { getEmojiListApi } from "@/api/emoji"
import { getMomentListApi } from "@/api/moment"
import ChatAuditPanel from "./components/chatAuditPanel.vue"
import UserGroupPanel from "./components/userGroupPanel.vue"
import UserFriendRequestsDialog from "./components/userFriendRequestsDialog.vue"
import UserEmojiPanel from "./components/userEmojiPanel.vue"
import UserMomentPanel from "./components/userMomentPanel.vue"
import { buildGroupConversationCandidates, buildPrivateConversationId } from "@/utils/conversation"

type RelationMode = "private" | "groups" | "moments" | "emojis"

interface IRelationItem {
  key: string
  kind: "session" | "friend" | "group"
  title: string
  subtitle: string
  conversationId: string
  conversationType: number
  lastMessage?: string
  lastMessageTime?: string
  messageCount?: number
  peerUserId?: string
  groupId?: string
  participantNames?: string[]
}

const emptyData = (): IGetUserOperationsProfileRes => ({
  profile: { userId: "", nickName: "", email: "", avatar: "", abstract: "", status: 1, source: 1, createTime: "" },
  friendTotal: 0, groupTotal: 0, sessionTotal: 0, momentTotal: 0, reportTotal: 0, blockTotal: 0,
  friends: [], groups: [], sessions: [], moments: [], reports: [], blocks: []
})

export default defineComponent({
  components: { ChatAuditPanel, UserMomentPanel, UserEmojiPanel, UserGroupPanel, UserFriendRequestsDialog },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const sidebarLoading = ref(false)
    const controlLoading = ref(false)
    const data = ref<IGetUserOperationsProfileRes>(emptyData())

    const relationMode = ref<RelationMode>("private")
    const relationKeyword = ref("")
    const relationItems = ref<IRelationItem[]>([])
    const activeRelation = ref<IRelationItem | null>(null)

    const momentList = ref<MomentInfo[]>([])
    const activeMomentId = ref("")

    const emojiList = ref<IEmojiInfo[]>([])
    const activeEmoji = ref<IEmojiInfo | null>(null)

    const extraDrawerVisible = ref(false)
    const extraTab = ref("reports")
    const friendRequestsVisible = ref(false)

    const userId = computed(() => route.params.userId as string)
    const profile = computed(() => data.value.profile?.userId ? data.value.profile : null)

    const activeConversationId = computed(() => activeRelation.value?.conversationId || null)
    const activeGroupId = computed(() => activeRelation.value?.groupId || "")
    const activeConversationTitle = computed(() => activeRelation.value?.title || "")
    const activeParticipantNames = computed(() => activeRelation.value?.participantNames || [])

    const emptyRelationHint = computed(() => {
      const map: Record<RelationMode, string> = {
        private: "该用户暂无私聊",
        groups: "该用户暂无群聊",
        moments: "该用户暂无动态",
        emojis: "该用户暂无表情"
      }
      return map[relationMode.value]
    })

    const filteredRelations = computed(() => {
      const kw = relationKeyword.value.trim().toLowerCase()
      let list = relationItems.value
      if (relationMode.value === "private") {
        list = list.filter(i => i.kind === "friend" || (i.kind === "session" && i.conversationType === 1))
      } else {
        list = list.filter(i => i.kind === "group" || (i.kind === "session" && i.conversationType === 2))
      }
      if (!kw) return list
      return list.filter(i =>
        i.title.toLowerCase().includes(kw) ||
        i.subtitle.toLowerCase().includes(kw) ||
        i.conversationId.toLowerCase().includes(kw) ||
        (i.peerUserId || "").toLowerCase().includes(kw) ||
        (i.groupId || "").toLowerCase().includes(kw)
      )
    })

    const filteredMoments = computed(() => {
      const kw = relationKeyword.value.trim().toLowerCase()
      if (!kw) return momentList.value
      return momentList.value.filter(m =>
        (m.content || "").toLowerCase().includes(kw) ||
        m.momentId.toLowerCase().includes(kw)
      )
    })

    const filteredEmojis = computed(() => {
      const kw = relationKeyword.value.trim().toLowerCase()
      if (!kw) return emojiList.value
      return emojiList.value.filter(e =>
        (e.title || "").toLowerCase().includes(kw) ||
        e.id.toLowerCase().includes(kw)
      )
    })

    const formatTime = (t: string) => {
      if (!t) return ""
      try {
        return new Date(t).toLocaleString()
      } catch {
        return t
      }
    }

    const targetTypeLabel = (t: number) => {
      const map: Record<number, string> = { 1: "用户", 2: "消息", 3: "动态", 4: "群组" }
      return map[t] || `类型${t}`
    }

    const getPeerFromFriend = (f: IFriendInfo) => {
      if (f.sendUserId === userId.value) {
        return { peerUserId: f.revUserId, peerUserName: f.revUserName }
      }
      return { peerUserId: f.sendUserId, peerUserName: f.sendUserName }
    }

    const sessionToRelation = (s: IChatSessionInfo): IRelationItem => ({
      key: `session-${s.conversationId}`,
      kind: "session",
      title: s.title,
      subtitle: s.lastMessage || "暂无消息",
      conversationId: s.conversationId,
      conversationType: s.conversationType,
      lastMessage: s.lastMessage,
      lastMessageTime: s.lastMessageTime,
      messageCount: s.messageCount,
      peerUserId: s.conversationType === 1 ? s.peerUserId : undefined,
      groupId: s.conversationType === 2 ? s.peerUserId || s.conversationId.replace(/^group_/, "") : undefined,
      participantNames: s.participantNames
    })

    const buildRelations = (sessions: IChatSessionInfo[], friends: IFriendInfo[]) => {
      const items: IRelationItem[] = []
      const sessionMap = new Map<string, IChatSessionInfo>()
      for (const s of sessions) {
        sessionMap.set(s.conversationId, s)
        items.push(sessionToRelation(s))
      }

      for (const f of friends) {
        const { peerUserId, peerUserName } = getPeerFromFriend(f)
        const convId = buildPrivateConversationId(userId.value, peerUserId)
        if (sessionMap.has(convId)) continue
        items.push({
          key: `friend-${peerUserId}`,
          kind: "friend",
          title: peerUserName || peerUserId,
          subtitle: "点击查看与该好友的聊天记录",
          conversationId: convId,
          conversationType: 1,
          peerUserId,
          participantNames: [profile.value?.nickName || userId.value, peerUserName || peerUserId]
        })
      }

      const groupSeen = new Set<string>()
      for (const s of sessions) {
        if (s.conversationType !== 2) continue
        groupSeen.add(s.peerUserId || s.conversationId.replace(/^group_/, ""))
      }
      for (const g of data.value.groups || []) {
        if (groupSeen.has(g.groupId)) continue
        items.push({
          key: `group-${g.groupId}`,
          kind: "group",
          title: g.title || g.groupId,
          subtitle: "点击查看群聊记录",
          conversationId: buildGroupConversationCandidates(g.groupId)[0],
          conversationType: 2,
          groupId: g.groupId
        })
      }

      items.sort((a, b) => {
        const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return tb - ta
      })
      relationItems.value = items
    }

    const loadRelations = async () => {
      if (!userId.value) return
      sidebarLoading.value = true
      const [sessionRes, friendRes] = await Promise.all([
        getChatSessionListApi({ userId: userId.value, page: 1, pageSize: 200 }),
        getFriendListApi({ userId: userId.value, page: 1, pageSize: 500, isDeleted: false })
      ])
      sidebarLoading.value = false
      const sessions = sessionRes.code === 0 ? sessionRes.result.list || [] : []
      const friends = friendRes.code === 0 ? friendRes.result.list || [] : []
      buildRelations(sessions, friends)
    }

    const loadMoments = async () => {
      if (!userId.value) return
      sidebarLoading.value = true
      const res = await getMomentListApi({ page: 1, limit: 100, userId: userId.value })
      sidebarLoading.value = false
      if (res.code === 0) {
        momentList.value = res.result.list || []
        if (!activeMomentId.value && momentList.value.length) {
          activeMomentId.value = momentList.value[0].momentId
        }
      } else {
        momentList.value = []
        ElMessage.error(res.msg || "加载动态失败")
      }
    }

    const loadEmojis = async () => {
      if (!userId.value) return
      sidebarLoading.value = true
      const res = await getEmojiListApi({ page: 1, pageSize: 100, authorId: userId.value })
      sidebarLoading.value = false
      if (res.code === 0) {
        emojiList.value = res.result.list || []
        if (!activeEmoji.value && emojiList.value.length) {
          activeEmoji.value = emojiList.value[0]
        }
      } else {
        emojiList.value = []
        ElMessage.error(res.msg || "加载表情失败")
      }
    }

    const onModeChange = () => {
      relationKeyword.value = ""
      if (relationMode.value === "moments") {
        loadMoments()
      } else if (relationMode.value === "emojis") {
        loadEmojis()
      }
    }

    const selectRelation = (item: IRelationItem) => {
      activeRelation.value = item
    }

    const selectMoment = (momentId: string) => {
      activeMomentId.value = momentId
    }

    const selectEmoji = (emoji: IEmojiInfo) => {
      activeEmoji.value = emoji
    }

    const onMomentDeleted = async () => {
      activeMomentId.value = ""
      await loadMoments()
      if (momentList.value.length) {
        activeMomentId.value = momentList.value[0].momentId
      }
      loadProfile()
    }

    const onEmojiDeleted = async () => {
      activeEmoji.value = null
      await loadEmojis()
      if (emojiList.value.length) {
        activeEmoji.value = emojiList.value[0]
      }
    }

    const applyRouteQuery = () => {
      const qRelation = route.query.relation as string
      if (qRelation === "private" || qRelation === "groups" || qRelation === "moments" || qRelation === "emojis") {
        relationMode.value = qRelation
      }
      if (qRelation === "friends") {
        relationMode.value = "private"
      }
      if (qRelation === "sessions") {
        relationMode.value = "private"
      }

      const qMomentId = route.query.momentId as string
      if (qMomentId) {
        relationMode.value = "moments"
        activeMomentId.value = qMomentId
      }

      const qExtra = route.query.extra as string
      if (qExtra === "blocks" || qExtra === "reports") {
        extraTab.value = qExtra
        extraDrawerVisible.value = true
      }

      const qGroupId = route.query.groupId as string
      if (qGroupId) {
        relationMode.value = "groups"
        const found = relationItems.value.find(i => i.groupId === qGroupId)
        if (found) activeRelation.value = found
      }

      const qConvId = route.query.conversationId as string
      const qPeerId = route.query.peerUserId as string
      if (qConvId) {
        const found = relationItems.value.find(i => i.conversationId === qConvId)
        if (found) {
          activeRelation.value = found
          relationMode.value = found.conversationType === 1 ? "private" : "groups"
        }
      } else if (qPeerId) {
        relationMode.value = "private"
        const found = relationItems.value.find(i => i.peerUserId === qPeerId)
        if (found) activeRelation.value = found
      }
    }

    const loadProfile = async () => {
      if (!userId.value) return
      loading.value = true
      const res = await getUserOperationsProfileApi(userId.value)
      loading.value = false
      if (res.code === 0) {
        data.value = res.result
        await loadRelations()
        applyRouteQuery()
        if (relationMode.value === "moments") {
          await loadMoments()
          const qMomentId = route.query.momentId as string
          if (qMomentId) activeMomentId.value = qMomentId
        } else if (relationMode.value === "emojis") {
          await loadEmojis()
        }
        if ((relationMode.value === "private" || relationMode.value === "groups") && !activeRelation.value) {
          const list = relationMode.value === "private"
            ? filteredRelations.value
            : filteredRelations.value
          if (list.length) activeRelation.value = list[0]
        }
      } else {
        ElMessage.error(res.msg || "加载用户360失败")
        data.value = emptyData()
      }
    }

    const doControl = async (action: string, label: string) => {
      await ElMessageBox.confirm(`确认${label}该用户？`, "账号管控", { type: "warning" })
      controlLoading.value = true
      const res = await executeUserControlApi({ userId: userId.value, action })
      controlLoading.value = false
      if (res.code === 0) {
        ElMessage.success(`${label}成功`)
        loadProfile()
      } else {
        ElMessage.error(res.msg || `${label}失败`)
      }
    }

    const handleBan = () => doControl("ban_user", "封禁")
    const handleUnban = () => doControl("unban_user", "解封")

    const goBack = () => {
      if (window.history.length > 1) router.back()
      else router.push("/user/list")
    }
    const goAppeals = () => router.push({ path: "/safety/appeals", query: { userId: userId.value } })
    const goFriendRequests = () => { friendRequestsVisible.value = true }
    const goUser = (id: string) => router.push(`/user/profile/${id}`)

    watch(userId, loadProfile, { immediate: true })

    return {
      loading, sidebarLoading, controlLoading, data, profile, userId,
      relationMode, relationKeyword, filteredRelations, activeRelation,
      momentList, filteredMoments, activeMomentId,
      emojiList, filteredEmojis, activeEmoji,
      activeConversationId, activeGroupId, activeConversationTitle, activeParticipantNames,
      emptyRelationHint, extraDrawerVisible, extraTab, friendRequestsVisible,
      formatTime, targetTypeLabel,
      selectRelation, selectMoment, selectEmoji, loadRelations, onModeChange,
      onMomentDeleted, onEmojiDeleted,
      handleBan, handleUnban,
      goBack, goAppeals, goFriendRequests, goUser
    }
  }
})
</script>

<style lang="less">
.user-profile {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  padding: 12px;
  box-sizing: border-box;

  .user-profile__header {
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

  .user-profile__header-info {
    flex: 1;

    .user-profile__title {
      margin: 0 0 4px;
      font-size: 18px;
    }

    .user-profile__meta {
      margin: 0 0 8px;
      color: #606266;
      font-size: 13px;
    }

    .user-profile__tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .user-profile__header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
    justify-content: flex-end;
  }

  .user-profile__body {
    flex: 1;
    display: flex;
    gap: 12px;
    min-height: 0;
  }

  .user-profile__relations {
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .user-profile__relations-head {
    padding: 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .user-profile__mode {
    width: 100%;
    margin-bottom: 8px;
    display: flex;

    .el-radio-button {
      flex: 1;

      .el-radio-button__inner {
        width: 100%;
        padding-left: 6px;
        padding-right: 6px;
      }
    }
  }

  .user-profile__relation-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    min-height: 0;
  }

  .user-profile__relation-item {
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

  .user-profile__relation-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .user-profile__relation-time {
    font-size: 11px;
    color: #c0c4cc;
  }

  .user-profile__relation-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-profile__relation-preview {
    font-size: 12px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-profile__relation-meta {
    font-size: 11px;
    color: #909399;
    margin-top: 4px;
  }

  .user-profile__relation-actions {
    margin-top: 4px;
  }

  .user-profile__extra-item {
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;

    p {
      margin: 0 0 6px;
      font-size: 14px;
    }
  }

  .user-profile__extra-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
