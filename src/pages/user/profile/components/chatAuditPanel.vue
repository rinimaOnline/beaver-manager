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
  <div class="chat-audit-panel">
    <section class="chat-audit-panel__timeline">
      <div v-if="conversationId" class="chat-audit-panel__toolbar">
        <div class="chat-audit-panel__toolbar-info">
          <strong>{{ title }}</strong>
          <span class="chat-audit-panel__conv-id">会话ID: {{ conversationId }}</span>
          <span v-if="participantNames?.length" class="chat-audit-panel__participants">
            参与方: {{ participantNames.join("、") }}
          </span>
        </div>
        <div class="chat-audit-panel__toolbar-actions">
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
          <el-button size="small" :loading="timelineLoading" :disabled="!hasMoreMessages" @click="loadMoreMessages">
            加载更早消息
          </el-button>
        </div>
      </div>

      <div ref="timelineRef" v-loading="timelineLoading" class="chat-audit-panel__scroll">
        <template v-if="conversationId">
          <div
            v-for="msg in timelineMessages"
            :key="msg.messageId"
            class="chat-audit-panel__msg"
            :class="{
              deleted: msg.isDeleted,
              selected: selectedMessage?.messageId === msg.messageId,
              'batch-checked': selectedBatchIds.includes(msg.messageId)
            }"
            @click="batchMode ? toggleBatchSelect(msg.messageId) : selectMessage(msg)"
          >
            <el-checkbox
              v-if="batchMode"
              class="chat-audit-panel__msg-check"
              :model-value="selectedBatchIds.includes(msg.messageId)"
              @click.stop="toggleBatchSelect(msg.messageId)"
            />
            <div class="chat-audit-panel__msg-head">
              <div class="chat-audit-panel__msg-sender">
                <el-avatar :size="28">{{ msg.sendUserName?.charAt(0) || "?" }}</el-avatar>
                <div>
                  <span class="name">
                    <el-link type="primary" @click.stop="goUser(msg.sendUserId)">
                      {{ msg.sendUserName || msg.sendUserId }}
                    </el-link>
                  </span>
                  <span class="uid">{{ msg.sendUserId }}</span>
                </div>
              </div>
              <div class="chat-audit-panel__msg-meta">
                <el-tag size="small">{{ getMsgTypeLabel(msg.msgType) }}</el-tag>
                <span class="time">{{ msg.createTime }}</span>
              </div>
            </div>
            <div class="chat-audit-panel__msg-body">
              <span v-if="msg.isDeleted" class="chat-audit-panel__deleted-tag">[已删除]</span>
              {{ msg.msgPreview }}
            </div>
            <div class="chat-audit-panel__msg-foot">
              <span class="msg-id">ID: {{ msg.messageId }}</span>
              <div class="msg-ops" @click.stop>
                <el-button v-if="!msg.isDeleted" link type="danger" size="small" @click="handleDeleteMessage(msg)">删除</el-button>
                <el-button v-else link type="success" size="small" @click="handleRestoreMessage(msg)">恢复</el-button>
              </div>
            </div>
          </div>
          <el-empty v-if="!timelineLoading && !timelineMessages.length" description="该会话暂无消息" />
        </template>
        <el-empty v-else description="请从左侧选择好友、群组或会话" :image-size="100" />
      </div>
    </section>

    <aside class="chat-audit-panel__inspector">
      <div class="chat-audit-panel__block">
        <div class="chat-audit-panel__block-title">消息详情</div>
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
                {{ selectedMessage.isDeleted ? "已删除" : "正常" }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="时间">{{ selectedMessage.createTime }}</el-descriptions-item>
            <el-descriptions-item label="预览">{{ selectedMessage.msgPreview }}</el-descriptions-item>
          </el-descriptions>
          <pre v-if="selectedMessageDetail?.msgContent" class="chat-audit-panel__json">{{ formatJson(selectedMessageDetail.msgContent) }}</pre>
        </template>
        <el-empty v-else description="点击消息查看详情" :image-size="60" />
      </div>

      <slot name="inspector-extra" />

      <div v-if="conversationId" class="chat-audit-panel__block">
        <div class="chat-audit-panel__block-title">会话处置</div>
        <el-button type="danger" plain size="small" class="chat-audit-panel__full-btn" @click="handleClearConversation">
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
          <el-button type="warning" plain class="chat-audit-panel__full-btn" :disabled="!deleteByType" @click="handleDeleteByType">
            执行批量删除
          </el-button>
        </el-form>
      </div>
    </aside>
  </div>
</template>

<script lang="ts">
import type { IChatMessageInfo } from "@/types/api/chat"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  batchDeleteChatMessagesApi,
  batchRestoreChatMessagesApi,
  clearConversationApi,
  deleteChatMessageApi,
  deleteMessagesByTypeApi,
  getChatMessageDetailApi,
  getChatMessageListApi,
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
  name: "chatAuditPanel",
  props: {
    conversationId: {
      type: String as PropType<string | null>,
      default: null
    },
    title: {
      type: String,
      default: ""
    },
    participantNames: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ["cleared"],
  setup(props, { emit }) {
    const router = useRouter()

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

    const formatJson = (raw: string) => {
      try {
        return JSON.stringify(JSON.parse(raw), null, 2)
      } catch {
        return raw
      }
    }

    const resetState = () => {
      selectedMessage.value = null
      selectedMessageDetail.value = null
      selectedBatchIds.value = []
      timelinePage.value = 1
      timelineMessages.value = []
      timelineTotal.value = 0
    }

    const loadTimeline = async (reset = false) => {
      if (!props.conversationId) {
        return
      }
      if (reset) {
        timelinePage.value = 1
        timelineMessages.value = []
      }
      timelineLoading.value = true
      const res = await getChatMessageListApi({
        page: timelinePage.value,
        pageSize: PAGE_SIZE,
        conversationId: props.conversationId,
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
      if (!props.conversationId) {
        return
      }
      resetState()
      loadTimeline(true)
    }

    const loadMoreMessages = async () => {
      if (!hasMoreMessages.value) {
        return
      }
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
      if (!props.conversationId) {
        return
      }
      await ElMessageBox.confirm("确认清空该会话全部消息？此操作不可撤销。", "高危操作", { type: "error" })
      const res = await clearConversationApi({ conversationId: props.conversationId })
      if (res.code === 0) {
        ElMessage.success("会话已清空")
        emit("cleared")
        await loadTimeline(true)
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const handleDeleteByType = async () => {
      if (!props.conversationId || !deleteByType.value) {
        return
      }
      await ElMessageBox.confirm("确认按类型批量删除消息？", "审计处置", { type: "warning" })
      const res = await deleteMessagesByTypeApi({
        conversationId: props.conversationId,
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
      if (!selectedBatchIds.value.length) {
        return
      }
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
      if (!selectedBatchIds.value.length) {
        return
      }
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

    watch(
      () => props.conversationId,
      (id) => {
        resetState()
        if (id) {
          loadTimeline(true)
        }
      },
      { immediate: true }
    )

    return {
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
      formatJson,
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

<style lang="less">
.chat-audit-panel {
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
  gap: 12px;

  .chat-audit-panel__timeline {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    min-width: 0;
  }

  .chat-audit-panel__inspector {
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    overflow-y: auto;
  }

  .chat-audit-panel__toolbar {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }

  .chat-audit-panel__toolbar-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
  }

  .chat-audit-panel__conv-id,
  .chat-audit-panel__participants {
    color: #909399;
    font-size: 12px;
  }

  .chat-audit-panel__toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .chat-audit-panel__scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    background: #f8f9fb;
    min-height: 0;
  }

  .chat-audit-panel__msg {
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
  }

  .chat-audit-panel__msg-check {
    margin-bottom: 8px;
  }

  .chat-audit-panel__msg-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .chat-audit-panel__msg-sender {
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

  .chat-audit-panel__msg-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #909399;
  }

  .chat-audit-panel__msg-body {
    font-size: 14px;
    line-height: 1.6;
    color: #303133;
    word-break: break-word;
  }

  .chat-audit-panel__msg-foot {
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

  .chat-audit-panel__deleted-tag {
    color: #f56c6c;
    font-weight: 600;
    margin-right: 6px;
  }

  .chat-audit-panel__block {
    padding: 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .chat-audit-panel__block-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .chat-audit-panel__json {
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

  .chat-audit-panel__full-btn {
    width: 100%;
  }
}
</style>
