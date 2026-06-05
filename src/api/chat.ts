import type {
  IBatchDeleteChatMessagesReq,
  IBatchDeleteChatMessagesRes,
  IBatchRestoreChatMessagesReq,
  IBatchRestoreChatMessagesRes,
  IClearConversationReq,
  IClearConversationRes,
  IDeleteChatMessageRes,
  IDeleteMessagesByTypeReq,
  IDeleteMessagesByTypeRes,
  IGetChatMessageDetailRes,
  IGetChatMessageListReq,
  IGetChatMessageListRes,
  IGetChatSessionListReq,
  IGetChatSessionListRes,
  IRestoreChatMessageReq,
  IRestoreChatMessageRes
} from "@/types/api/chat"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取用户会话列表
export function getChatSessionListApi(params: IGetChatSessionListReq) {
  return ajax<IGetChatSessionListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/sessions`,
    params
  })
}

// 获取聊天消息列表
export function getChatMessageListApi(params: IGetChatMessageListReq) {
  return ajax<IGetChatMessageListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/list`,
    params
  })
}

// 获取聊天消息详情
export function getChatMessageDetailApi(messageId: string) {
  return ajax<IGetChatMessageDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/${messageId}`
  })
}

// 删除聊天消息
export function deleteChatMessageApi(messageId: string) {
  return ajax<IDeleteChatMessageRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/chat/${messageId}`
  })
}

// 批量删除聊天消息
export function batchDeleteChatMessagesApi(data: IBatchDeleteChatMessagesReq) {
  return ajax<IBatchDeleteChatMessagesRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/chat/batch`,
    data
  })
}

// 恢复已删除的消息
export function restoreChatMessageApi(data: IRestoreChatMessageReq) {
  return ajax<IRestoreChatMessageRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/chat/restore`,
    data
  })
}

// 批量恢复消息
export function batchRestoreChatMessagesApi(data: IBatchRestoreChatMessagesReq) {
  return ajax<IBatchRestoreChatMessagesRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/chat/restorebatch`,
    data
  })
}

// 清空会话消息
export function clearConversationApi(data: IClearConversationReq) {
  return ajax<IClearConversationRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/chat/clearconv`,
    data
  })
}

// 按消息类型删除
export function deleteMessagesByTypeApi(data: IDeleteMessagesByTypeReq) {
  return ajax<IDeleteMessagesByTypeRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/chat/bytype`,
    data
  })
}

