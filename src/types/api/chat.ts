// 聊天消息信息
export interface ChatMessageInfo {
  id: string
  messageId: string
  conversationId: string
  sendUserId: string
  sendUserName: string
  msgType: number
  msgPreview: string
  isDeleted: boolean
  createTime: string
  updateTime: string
}

// 聊天消息详情
export interface ChatMessageDetail {
  id: string
  messageId: string
  conversationId: string
  sendUserId: string
  sendUserName: string
  sendUserAvatar: string
  msgType: number
  msgPreview: string
  msgContent: string
  isDeleted: boolean
  createTime: string
  updateTime: string
}

// 获取聊天消息列表请求
export interface GetChatMessageListReq {
  page?: number
  pageSize?: number
  conversationId?: string
  sendUserId?: string
  sendUserName?: string
  msgType?: number
  isDeleted?: boolean
  startTime?: string
  endTime?: string
}

// 获取聊天消息列表响应
export interface GetChatMessageListRes {
  list: ChatMessageInfo[]
  total: number
}

// 获取聊天消息详情请求
export interface GetChatMessageDetailReq {
  messageId: string
}

// 获取聊天消息详情响应
export interface GetChatMessageDetailRes extends ChatMessageDetail {}

// 删除聊天消息请求
export interface DeleteChatMessageReq {
  messageId: string
}

// 删除聊天消息响应
export interface DeleteChatMessageRes {}

// 批量删除聊天消息请求
export interface BatchDeleteChatMessagesReq {
  ids: string[]
}

// 批量删除聊天消息响应
export interface BatchDeleteChatMessagesRes {}

// 恢复聊天消息请求
export interface RestoreChatMessageReq {
  messageId: string
}

// 恢复聊天消息响应
export interface RestoreChatMessageRes {}

// 批量恢复聊天消息请求
export interface BatchRestoreChatMessagesReq {
  ids: string[]
}

// 批量恢复聊天消息响应
export interface BatchRestoreChatMessagesRes {}

// 清空会话请求
export interface ClearConversationReq {
  conversationId: string
}

// 清空会话响应
export interface ClearConversationRes {}

// 按类型删除消息请求
export interface DeleteMessagesByTypeReq {
  conversationId?: string
  msgType: number
  startTime?: string
  endTime?: string
}

// 按类型删除消息响应
export interface DeleteMessagesByTypeRes {
  deletedCount: number
}

// 对话参与者信息
export interface ConversationParticipant {
  userId: string
  nickName: string
  avatar: string
  joinTime: string
}

// 对话信息
export interface ConversationInfo {
  conversationId: string
  conversationType: number // 1: 私聊, 2: 群聊
  participants: ConversationParticipant[]
  lastMessage: string
  lastMessageTime: string
  messageCount: number
}

// 获取对话列表请求
export interface GetConversationListReq {
  conversationType?: number
  participantName?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// 获取对话列表响应
export interface GetConversationListRes {
  list: ConversationInfo[]
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
