import type {
  BatchDeleteChatMessagesReq,
  BatchDeleteChatMessagesRes,
  BatchRestoreChatMessagesReq,
  BatchRestoreChatMessagesRes,
  ClearConversationReq,
  ClearConversationRes,
  DeleteChatMessageRes,
  DeleteMessagesByTypeReq,
  DeleteMessagesByTypeRes,
  GetChatMessageDetailRes,
  GetChatMessageListReq,
  GetChatMessageListRes,
  GetConversationListReq,
  GetConversationListRes,
  RestoreChatMessageReq,
  RestoreChatMessageRes
} from "@/types/api/chat"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取聊天消息列表
export function getChatMessageListApi(params: GetChatMessageListReq) {
  return ajax<GetChatMessageListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/list`,
    params
  })
}

// 获取聊天消息详情
export function getChatMessageDetailApi(messageId: string) {
  return ajax<GetChatMessageDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/${messageId}`
  })
}

// 删除聊天消息
export function deleteChatMessageApi(messageId: string) {
  return ajax<DeleteChatMessageRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/chat/${messageId}`
  })
}

// 批量删除聊天消息
export function batchDeleteChatMessagesApi(data: BatchDeleteChatMessagesReq) {
  return ajax<BatchDeleteChatMessagesRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/chat/batch`,
    data
  })
}

// 恢复已删除的消息
export function restoreChatMessageApi(data: RestoreChatMessageReq) {
  return ajax<RestoreChatMessageRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/chat/restore`,
    data
  })
}

// 批量恢复消息
export function batchRestoreChatMessagesApi(data: BatchRestoreChatMessagesReq) {
  return ajax<BatchRestoreChatMessagesRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/chat/restorebatch`,
    data
  })
}

// 清空会话消息
export function clearConversationApi(data: ClearConversationReq) {
  return ajax<ClearConversationRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/chat/clearconv`,
    data
  })
}

// 按消息类型删除
export function deleteMessagesByTypeApi(data: DeleteMessagesByTypeReq) {
  return ajax<DeleteMessagesByTypeRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/chat/bytype`,
    data
  })
}

// 获取对话列表
export function getConversationListApi(params: GetConversationListReq) {
  return ajax<GetConversationListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/conversations`,
    params
  })
}
