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
  <div class="compliance-sessions">
    <!-- 顶栏：当前审计上下文 -->
    <div class="audit-header">
      <div class="audit-header__left">
        <h2>聊天审计</h2>
        <span class="audit-header__hint">先定位用户 → 选择会话 → 查看完整聊天记录并处置</span>
      </div>
      <div v-if="selectedUser" class="audit-header__user">
        <el-avatar :size="36">{{ selectedUser.nickName?.charAt(0) || 'U' }}</el-avatar>
        <div>
          <div class="user-name">
            <el-link type="primary" @click="goUser(selectedUser.userId)">{{ selectedUser.nickName }}</el-link>
          </div>
          <div class="user-id">{{ selectedUser.userId }}</div>
        </div>
      </div>
    </div>

    <div class="audit-body">
      <!-- 左栏：用户检索 + 会话列表 -->
      <aside class="session-panel">
        <div class="panel-block">
          <div class="panel-title">用户检索</div>
          <el-input
            v-model="userKeyword"
            placeholder="昵称 / 邮箱 / 用户ID"
            clearable
            @keyup.enter="searchUsers"
          >
            <template #append>
              <el-button :loading="userLoading" @click="searchUsers">搜索</el-button>
            </template>
          </el-input>
          <div v-if="userCandidates.length" class="user-candidates">
            <div
              v-for="u in userCandidates"
              :key="u.userId"
              class="user-candidate"
              :class="{ active: selectedUser?.userId === u.userId }"
              @click="selectUser(u)"
            >
              <el-avatar :size="32">{{ u.nickName?.charAt(0) || 'U' }}</el-avatar>
              <div class="user-candidate__info">
                <div>{{ u.nickName || u.userId }}</div>
                <div class="sub">{{ u.userId }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-block session-list-block">
          <div class="panel-title">
            会话列表
            <el-tag v-if="selectedUser" size="small" type="info">{{ sessionList.length }}</el-tag>
          </div>
          <el-radio-group v-model="sessionTypeFilter" size="small" class="session-filter" @change="loadSessions">
            <el-radio-button :value="0">全部</el-radio-button>
            <el-radio-button :value="1">私聊</el-radio-button>
            <el-radio-button :value="2">群聊</el-radio-button>
          </el-radio-group>

          <div v-loading="sessionLoading" class="session-list">
            <template v-if="selectedUser">
              <div
                v-for="s in sessionList"
                :key="s.conversationId"
                class="session-item"
                :class="{ active: activeSession?.conversationId === s.conversationId }"
                @click="selectSession(s)"
              >
                <div class="session-item__top">
                  <el-tag size="small" :type="s.conversationType === 1 ? 'primary' : 'success'">
                    {{ s.conversationType === 1 ? '私聊' : '群聊' }}
                  </el-tag>
                  <span class="session-item__time">{{ formatTime(s.lastMessageTime) }}</span>
                </div>
                <div class="session-item__title">{{ s.title }}</div>
                <div class="session-item__preview">{{ s.lastMessage || '暂无消息' }}</div>
                <div class="session-item__meta">{{ s.messageCount }} 条消息</div>
              </div>
              <el-empty v-if="!sessionLoading && !sessionList.length" description="该用户暂无会话" :image-size="64" />
            </template>
            <el-empty v-else description="请先搜索并选择用户" :image-size="80" />
          </div>
        </div>
      </aside>

      <!-- 中栏：聊天记录时间线（运营审计视图，非手机仿品） -->
      <section class="timeline-panel">
        <div v-if="activeSession" class="timeline-toolbar">
          <div class="timeline-toolbar__info">
            <strong>{{ activeSession.title }}</strong>
            <span class="conv-id">会话ID: {{ activeSession.conversationId }}</span>
            <span v-if="activeSession.participantNames?.length" class="participants">
              参与方: {{ activeSession.participantNames.join('、') }}
            </span>
          </div>
          <div class="timeline-toolbar__actions">
            <el-select v-model="msgTypeFilter" placeholder="消息类型" clearable size="small" style="width: 110px" @change="reloadTimeline">
              <el-option label="文本" :value="1" />
              <el-option label="图片" :value="2" />
              <el-option label="视频" :value="3" />
              <el-option label="文件" :value="4" />
              <el-option label="语音" :value="5" />
            </el-select>
            <el-checkbox v-model="showDeletedOnly" @change="reloadTimeline">仅看已删除</el-checkbox>
            <el-checkbox v-model="batchMode">多选模式</el-checkbox>
            <el-button v-if="batchMode && selectedBatchIds.length" size="small" type="danger" @click="handleBatchDeleteMessages">
              删除选中({{ selectedBatchIds.length }})
            </el-button>
            <el-button v-if="batchMode && selectedBatchIds.length" size="small" type="success" @click="handleBatchRestoreMessages">
              恢复选中
            </el-button>
            <el-button size="small" @click="loadMoreMessages" :loading="timelineLoading" :disabled="!hasMoreMessages">
              加载更早消息
            </el-button>
          </div>
        </div>

        <div
          ref="timelineRef"
          v-loading="timelineLoading"
          class="timeline-scroll"
        >
          <template v-if="activeSession">
            <div
              v-for="msg in timelineMessages"
              :key="msg.messageId"
              class="audit-msg"
              :class="{ deleted: msg.isDeleted, selected: selectedMessage?.messageId === msg.messageId, 'batch-checked': selectedBatchIds.includes(msg.messageId) }"
              @click="batchMode ? toggleBatchSelect(msg.messageId) : selectMessage(msg)"
            >
              <el-checkbox
                v-if="batchMode"
                class="audit-msg__check"
                :model-value="selectedBatchIds.includes(msg.messageId)"
                @click.stop="toggleBatchSelect(msg.messageId)"
              />
              <div class="audit-msg__head">
                <div class="audit-msg__sender">
                  <el-avatar :size="28">{{ msg.sendUserName?.charAt(0) || '?' }}</el-avatar>
                  <div>
                    <span class="name">
                      <el-link type="primary" @click.stop="goUser(msg.sendUserId)">
                        {{ msg.sendUserName || msg.sendUserId }}
                      </el-link>
                    </span>
                    <span class="uid">{{ msg.sendUserId }}</span>
                  </div>
                </div>
                <div class="audit-msg__meta">
                  <el-tag size="small">{{ getMsgTypeLabel(msg.msgType) }}</el-tag>
                  <span class="time">{{ msg.createTime }}</span>
                </div>
              </div>
              <div class="audit-msg__body">
                <span v-if="msg.isDeleted" class="deleted-tag">[已删除]</span>
                {{ msg.msgPreview }}
              </div>
              <div class="audit-msg__foot">
                <span class="msg-id">ID: {{ msg.messageId }}</span>
                <div class="msg-ops" @click.stop>
                  <el-button v-if="!msg.isDeleted" link type="danger" size="small" @click="handleDeleteMessage(msg)">删除</el-button>
                  <el-button v-else link type="success" size="small" @click="handleRestoreMessage(msg)">恢复</el-button>
                </div>
              </div>
            </div>
            <el-empty v-if="!timelineLoading && !timelineMessages.length" description="该会话暂无消息" />
          </template>
          <el-empty v-else description="请从左侧选择一个会话" :image-size="100" />
        </div>
      </section>

      <!-- 右栏：审计处置面板 -->
      <aside class="inspector-panel">
        <div class="panel-block">
          <div class="panel-title">消息详情</div>
          <template v-if="selectedMessage">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="消息ID">{{ selectedMessage.messageId }}</el-descriptions-item>
              <el-descriptions-item label="发送者">
                <el-link type="primary" @click="goUser(selectedMessage.sendUserId)">
                  {{ selectedMessage.sendUserName }} ({{ selectedMessage.sendUserId }})
                </el-link>
              </el-descriptions-item>
              <el-descriptions-item label="类型">{{ getMsgTypeLabel(selectedMessage.msgType) }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="selectedMessage.isDeleted ? 'danger' : 'success'" size="small">
                  {{ selectedMessage.isDeleted ? '已删除' : '正常' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="时间">{{ selectedMessage.createTime }}</el-descriptions-item>
              <el-descriptions-item label="预览">{{ selectedMessage.msgPreview }}</el-descriptions-item>
            </el-descriptions>
            <pre v-if="selectedMessageDetail?.msgContent" class="json-block">{{ formatJson(selectedMessageDetail.msgContent) }}</pre>
          </template>
          <el-empty v-else description="点击消息查看详情" :image-size="60" />
        </div>

        <div v-if="activeSession" class="panel-block">
          <div class="panel-title">会话处置</div>
          <el-button type="danger" plain size="small" class="full-btn" @click="handleClearConversation">
            清空本会话消息
          </el-button>
          <el-divider />
          <el-form label-position="top" size="small">
            <el-form-item label="按类型批量删除">
              <el-select v-model="deleteByType" placeholder="选择类型" style="width: 100%">
                <el-option label="图片" :value="2" />
                <el-option label="视频" :value="3" />
                <el-option label="文件" :value="4" />
              </el-select>
            </el-form-item>
            <el-button type="warning" plain class="full-btn" :disabled="!deleteByType" @click="handleDeleteByType">
              执行批量删除
            </el-button>
          </el-form>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import type { IChatMessageInfo, IChatSessionInfo } from "@/types/api/chat"
import type { IUserInfo } from "@/types/api/user"
import { ElMessage, ElMessageBox } from "element-plus"
import { getUserDetailApi, getUserListApi } from "@/api/user"
import {
  batchDeleteChatMessagesApi,
  batchRestoreChatMessagesApi,
  clearConversationApi,
  deleteChatMessageApi,
  deleteMessagesByTypeApi,
  getChatMessageDetailApi,
  getChatMessageListApi,
  getChatSessionListApi,
  restoreChatMessageApi
} from "@/api/chat"
import { MessageType } from "@/types/api/chat"

const MSG_TYPE_MAP: Record<number, string> = {
  [MessageType.TEXT]: "文本",
  [MessageType.IMAGE]: "图片",
  [MessageType.VIDEO]: "视频",
  [MessageType.FILE]: "文件",
  [MessageType.VOICE]: "语音",
  [MessageType.VOICE_CALL]: "语音通话",
  [MessageType.VIDEO_CALL]: "视频通话",
  [MessageType.RECALL]: "撤回",
  [MessageType.REPLY]: "回复",
  [MessageType.QUOTE]: "引用"
}

const PAGE_SIZE = 30

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userKeyword = ref("")
    const userLoading = ref(false)
    const userCandidates = ref<IUserInfo[]>([])
    const selectedUser = ref<IUserInfo | null>(null)

    const sessionLoading = ref(false)
    const sessionList = ref<IChatSessionInfo[]>([])
    const sessionTypeFilter = ref(0)
    const activeSession = ref<IChatSessionInfo | null>(null)

    const timelineLoading = ref(false)
    const timelineMessages = ref<IChatMessageInfo[]>([])
    const timelinePage = ref(1)
    const timelineTotal = ref(0)
    const msgTypeFilter = ref<number | undefined>()
    const showDeletedOnly = ref(false)
    const timelineRef = ref<HTMLElement | null>(null)

    const selectedMessage = ref<IChatMessageInfo | null>(null)
    const selectedMessageDetail = ref<any>(null)
    const deleteByType = ref<number | undefined>()
    const batchMode = ref(false)
    const selectedBatchIds = ref<string[]>([])

    const hasMoreMessages = computed(() => timelinePage.value * PAGE_SIZE < timelineTotal.value)

    const getMsgTypeLabel = (type: number) => MSG_TYPE_MAP[type] || `类型${type}`

    const formatTime = (t: string) => {
      if (!t) return ""
      try {
        return new Date(t).toLocaleString()
      } catch {
        return t
      }
    }

    const formatJson = (raw: string) => {
      try {
        return JSON.stringify(JSON.parse(raw), null, 2)
      } catch {
        return raw
      }
    }

    const searchUsers = async () => {
      if (!userKeyword.value.trim()) {
        ElMessage.warning("请输入搜索关键词")
        return
      }
      userLoading.value = true
      const res = await getUserListApi({ keyword: userKeyword.value, page: 1, pageSize: 10 })
      userLoading.value = false
      if (res.code === 0) {
        userCandidates.value = res.result.list || []
        if (!userCandidates.value.length) {
          ElMessage.info("未找到匹配用户")
        }
      } else {
        ElMessage.error(res.msg || "搜索用户失败")
      }
    }

    const selectUser = async (user: IUserInfo) => {
      selectedUser.value = user
      activeSession.value = null
      timelineMessages.value = []
      selectedMessage.value = null
      await loadSessions()
    }

    const loadSessions = async () => {
      if (!selectedUser.value) return
      sessionLoading.value = true
      const res = await getChatSessionListApi({
        userId: selectedUser.value.userId,
        conversationType: sessionTypeFilter.value || undefined,
        page: 1,
        pageSize: 50
      })
      sessionLoading.value = false
      if (res.code === 0) {
        sessionList.value = res.result.list || []
      } else {
        ElMessage.error(res.msg || "加载会话列表失败")
      }
    }

    const selectSession = async (session: IChatSessionInfo) => {
      activeSession.value = session
      selectedMessage.value = null
      selectedMessageDetail.value = null
      selectedBatchIds.value = []
      timelinePage.value = 1
      timelineMessages.value = []
      await loadTimeline(true)
    }

    const loadTimeline = async (reset = false) => {
      if (!activeSession.value) return
      if (reset) {
        timelinePage.value = 1
        timelineMessages.value = []
      }
      timelineLoading.value = true
      const res = await getChatMessageListApi({
        page: timelinePage.value,
        pageSize: PAGE_SIZE,
        conversationId: activeSession.value.conversationId,
        msgType: msgTypeFilter.value,
        isDeleted: showDeletedOnly.value ? true : undefined,
        order: 2,
        withContent: false
      })
      timelineLoading.value = false
      if (res.code === 0) {
        const list = (res.result.list || []).slice().reverse()
        timelineTotal.value = res.result.total || 0
        const prevHeight = timelineRef.value?.scrollHeight || 0
        if (reset) {
          timelineMessages.value = list
        } else {
          timelineMessages.value = [...list, ...timelineMessages.value]
        }
        await nextTick()
        if (reset && timelineRef.value) {
          timelineRef.value.scrollTop = timelineRef.value.scrollHeight
        } else if (timelineRef.value) {
          timelineRef.value.scrollTop = timelineRef.value.scrollHeight - prevHeight
        }
      } else {
        ElMessage.error(res.msg || "加载聊天记录失败")
      }
    }

    const reloadTimeline = () => {
      selectSession(activeSession.value!)
    }

    const loadMoreMessages = async () => {
      if (!hasMoreMessages.value) return
      timelinePage.value += 1
      await loadTimeline(false)
    }

    const selectMessage = async (msg: IChatMessageInfo) => {
      selectedMessage.value = msg
      const res = await getChatMessageDetailApi(msg.messageId)
      if (res.code === 0) {
        selectedMessageDetail.value = res.result
      } else {
        selectedMessageDetail.value = null
      }
    }

    const handleDeleteMessage = async (msg: IChatMessageInfo) => {
      await ElMessageBox.confirm("确认删除该消息？", "审计处置", { type: "warning" })
      const res = await deleteChatMessageApi(msg.messageId)
      if (res.code === 0) {
        ElMessage.success("已删除")
        await loadTimeline(true)
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleRestoreMessage = async (msg: IChatMessageInfo) => {
      const res = await restoreChatMessageApi({ messageId: msg.messageId })
      if (res.code === 0) {
        ElMessage.success("已恢复")
        await loadTimeline(true)
      }
    }

    const handleClearConversation = async () => {
      if (!activeSession.value) return
      await ElMessageBox.confirm("确认清空该会话全部消息？此操作不可撤销。", "高危操作", { type: "error" })
      const res = await clearConversationApi({ conversationId: activeSession.value.conversationId })
      if (res.code === 0) {
        ElMessage.success("会话已清空")
        await loadTimeline(true)
        await loadSessions()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const handleDeleteByType = async () => {
      if (!activeSession.value || !deleteByType.value) return
      await ElMessageBox.confirm("确认按类型批量删除消息？", "审计处置", { type: "warning" })
      const res = await deleteMessagesByTypeApi({
        conversationId: activeSession.value.conversationId,
        msgType: deleteByType.value
      })
      if (res.code === 0) {
        ElMessage.success(`已删除 ${res.result.deletedCount} 条`)
        await loadTimeline(true)
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const toggleBatchSelect = (messageId: string) => {
      const idx = selectedBatchIds.value.indexOf(messageId)
      if (idx >= 0) {
        selectedBatchIds.value.splice(idx, 1)
      } else {
        selectedBatchIds.value.push(messageId)
      }
    }

    const handleBatchDeleteMessages = async () => {
      if (!selectedBatchIds.value.length) return
      await ElMessageBox.confirm(`确认删除选中的 ${selectedBatchIds.value.length} 条消息？`, "批量删除", { type: "warning" })
      const res = await batchDeleteChatMessagesApi({ ids: [...selectedBatchIds.value] })
      if (res.code === 0) {
        ElMessage.success("批量删除成功")
        selectedBatchIds.value = []
        await loadTimeline(true)
      } else {
        ElMessage.error(res.msg || "批量删除失败")
      }
    }

    const handleBatchRestoreMessages = async () => {
      if (!selectedBatchIds.value.length) return
      const res = await batchRestoreChatMessagesApi({ ids: [...selectedBatchIds.value] })
      if (res.code === 0) {
        ElMessage.success("批量恢复成功")
        selectedBatchIds.value = []
        await loadTimeline(true)
      } else {
        ElMessage.error(res.msg || "批量恢复失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    const applyRouteQuery = async () => {
      const qUserId = route.query.userId as string
      const qConvId = route.query.conversationId as string
      if (qUserId) {
        const res = await getUserDetailApi(qUserId)
        if (res.code === 0 && res.result) {
          userCandidates.value = [res.result]
          await selectUser(res.result)
          if (qConvId) {
            const session = sessionList.value.find(s => s.conversationId === qConvId)
            if (session) {
              await selectSession(session)
            }
          }
        }
        return
      }
      if (qConvId) {
        userKeyword.value = qConvId
      }
    }

    onMounted(applyRouteQuery)

    return {
      userKeyword,
      userLoading,
      userCandidates,
      selectedUser,
      sessionLoading,
      sessionList,
      sessionTypeFilter,
      activeSession,
      timelineLoading,
      timelineMessages,
      msgTypeFilter,
      showDeletedOnly,
      timelineRef,
      selectedMessage,
      selectedMessageDetail,
      deleteByType,
      batchMode,
      selectedBatchIds,
      hasMoreMessages,
      getMsgTypeLabel,
      formatTime,
      formatJson,
      searchUsers,
      selectUser,
      loadSessions,
      selectSession,
      reloadTimeline,
      loadMoreMessages,
      selectMessage,
      handleDeleteMessage,
      handleRestoreMessage,
      handleClearConversation,
      handleDeleteByType,
      toggleBatchSelect,
      handleBatchDeleteMessages,
      handleBatchRestoreMessages,
      goUser
    }
  }
})
</script>

<style lang="less" scoped>
.compliance-sessions {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  padding: 12px;
  box-sizing: border-box;
}

.audit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  h2 {
    margin: 0;
    font-size: 18px;
  }

  &__hint {
    margin-left: 12px;
    font-size: 13px;
    color: #909399;
  }

  &__left {
    display: flex;
    align-items: baseline;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-name {
      font-weight: 600;
    }
    .user-id {
      font-size: 12px;
      color: #909399;
    }
  }
}

.audit-body {
  display: flex;
  flex: 1;
  gap: 12px;
  min-height: 0;
}

.session-panel,
.inspector-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.timeline-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  min-width: 0;
}

.panel-block {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.session-list-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-bottom: none;
}

.session-filter {
  margin-bottom: 8px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
}

.user-candidates {
  margin-top: 8px;
  max-height: 160px;
  overflow-y: auto;
}

.user-candidate {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;

  &:hover,
  &.active {
    background: #ecf5ff;
  }

  &__info .sub {
    font-size: 12px;
    color: #909399;
  }
}

.session-item {
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

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  &__time {
    font-size: 11px;
    color: #c0c4cc;
  }

  &__title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  &__preview {
    font-size: 12px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    font-size: 11px;
    color: #909399;
    margin-top: 4px;
  }
}

.timeline-toolbar {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;

    .conv-id,
    .participants {
      color: #909399;
      font-size: 12px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.timeline-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  background: #f8f9fb;
}

.audit-msg {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: #c6e2ff;
  }

  &.selected {
    border-color: #409eff;
    box-shadow: 0 0 0 1px #409eff33;
  }

  &.deleted {
    opacity: 0.75;
    border-color: #fbc4c4;
    background: #fef0f0;
  }

  &.batch-checked {
    border-color: #409eff;
    background: #ecf5ff;
  }

  &__check {
    margin-bottom: 8px;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  &__sender {
    display: flex;
    align-items: center;
    gap: 8px;

    .name {
      font-weight: 600;
      font-size: 13px;
      margin-right: 6px;
    }
    .uid {
      font-size: 11px;
      color: #909399;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #909399;
  }

  &__body {
    font-size: 14px;
    line-height: 1.6;
    color: #303133;
    word-break: break-word;
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #ebeef5;

    .msg-id {
      font-size: 11px;
      color: #c0c4cc;
      font-family: monospace;
    }
  }
}

.deleted-tag {
  color: #f56c6c;
  font-weight: 600;
  margin-right: 6px;
}

.inspector-panel {
  overflow-y: auto;
}

.json-block {
  margin-top: 10px;
  padding: 10px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 6px;
  font-size: 11px;
  max-height: 240px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.full-btn {
  width: 100%;
}
</style>
