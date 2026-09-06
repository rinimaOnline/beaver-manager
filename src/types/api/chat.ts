/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-manager-header-v1
 */

// 聊天消息信息
export interface IChatMessageInfo {
  id: string
  messageId: string
  conversationId: string
  conversationType?: number
  sendUserId: string
  sendUserName: string
  msgType: number
  msgPreview: string
  msgContent?: string
  isDeleted: boolean
  createTime: string
  updateTime: string
}

// 用户会话摘要
export interface IChatSessionInfo {
  conversationId: string
  conversationType: number
  title: string
  peerUserId: string
  peerUserName: string
  participantIds: string[]
  participantNames: string[]
  lastMessage: string
  lastMessageTime: string
  messageCount: number
}

export interface IGetChatSessionListReq {
  userId: string
  conversationType?: number
  page?: number
  pageSize?: number
}

export interface IGetChatSessionListRes {
  list: IChatSessionInfo[]
  total: number
}

// 聊天消息详情
export interface IChatMessageDetail {
  id: string
  messageId: string
  conversationId: string
  sendUserId: string
  sendUserName: string
  sendUserFileName: string // 发送者头像文件 key（服务端字段名为 sendUserFileName）
  msgType: number
  msgPreview: string
  msgContent: string
  isDeleted: boolean
  createTime: string
  updateTime: string
}

// 获取聊天消息列表请求
export interface IGetChatMessageListReq {
  page?: number
  pageSize?: number
  conversationId?: string
  sendUserId?: string
  sendUserName?: string
  msgType?: number
  isDeleted?: boolean
  startTime?: string
  endTime?: string
  order?: number
  withContent?: boolean
}

// 获取聊天消息列表响应
export interface IGetChatMessageListRes {
  list: IChatMessageInfo[]
  total: number
}

// 获取聊天消息详情请求
export interface IGetChatMessageDetailReq {
  messageId: string
}

// 获取聊天消息详情响应
export interface IGetChatMessageDetailRes extends IChatMessageDetail {}

// 删除聊天消息请求
export interface IDeleteChatMessageReq {
  messageId: string
}

// 删除聊天消息响应
export interface IDeleteChatMessageRes {}

// 批量删除聊天消息请求
export interface IBatchDeleteChatMessagesReq {
  ids: string[]
}

// 批量删除聊天消息响应
export interface IBatchDeleteChatMessagesRes {}

// 恢复聊天消息请求
export interface IRestoreChatMessageReq {
  messageId: string
}

// 恢复聊天消息响应
export interface IRestoreChatMessageRes {}

// 批量恢复聊天消息请求
export interface IBatchRestoreChatMessagesReq {
  ids: string[]
}

// 批量恢复聊天消息响应
export interface IBatchRestoreChatMessagesRes {}

// 清空会话请求
export interface IClearConversationReq {
  conversationId: string
}

// 清空会话响应
export interface IClearConversationRes {}

// 按类型删除消息请求
export interface IDeleteMessagesByTypeReq {
  conversationId?: string
  msgType: number
  startTime?: string
  endTime?: string
}

// 按类型删除消息响应
export interface IDeleteMessagesByTypeRes {
  deletedCount: number
}

// 对话参与者信息
export interface IConversationParticipant {
  userId: string
  nickName: string
  avatar: string
  joinTime: string
}

// 对话信息
export interface IConversationInfo {
  conversationId: string
  conversationType: number // 1: 私聊, 2: 群聊
  participants: IConversationParticipant[]
  lastMessage: string
  lastMessageTime: string
  messageCount: number
}

// 获取对话列表请求
export interface IGetConversationListReq {
  conversationType?: number
  participantName?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// 获取对话列表响应
export interface IGetConversationListRes {
  list: IConversationInfo[]
  total: number
}

// 消息类型枚举
export enum MessageType {
  TEXT = 1, // 文本
  IMAGE = 2, // 图片
  VIDEO = 3, // 视频
  FILE = 4, // 文件
  VOICE = 5, // 语音
  VOICE_CALL = 6, // 语音通话
  VIDEO_CALL = 7, // 视频通话
  RECALL = 8, // 撤回消息
  REPLY = 9, // 回复消息
  QUOTE = 10 // 引用消息
}
