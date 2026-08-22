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

export function getChatSessionListApi(params: IGetChatSessionListReq) {
  return ajax<IGetChatSessionListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/v1/sessions`,
    params
  })
}

export function getChatMessageListApi(params: IGetChatMessageListReq) {
  return ajax<IGetChatMessageListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/v1/list`,
    params
  })
}

export function getChatMessageDetailApi(messageId: string) {
  return ajax<IGetChatMessageDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/chat/v1/detail`,
    params: { id: messageId }
  })
}

export function deleteChatMessageApi(messageId: string) {
  return ajax<IDeleteChatMessageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/chat/v1/delete`,
    data: { id: messageId }
  })
}

export function batchDeleteChatMessagesApi(data: IBatchDeleteChatMessagesReq) {
  return ajax<IBatchDeleteChatMessagesRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/chat/v1/batch_delete`,
    data
  })
}

export function restoreChatMessageApi(data: IRestoreChatMessageReq) {
  return ajax<IRestoreChatMessageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/chat/v1/restore`,
    data
  })
}

export function batchRestoreChatMessagesApi(data: IBatchRestoreChatMessagesReq) {
  return ajax<IBatchRestoreChatMessagesRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/chat/v1/batch_restore`,
    data
  })
}

export function clearConversationApi(data: IClearConversationReq) {
  return ajax<IClearConversationRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/chat/v1/clear_conversation`,
    data
  })
}

export function deleteMessagesByTypeApi(data: IDeleteMessagesByTypeReq) {
  return ajax<IDeleteMessagesByTypeRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/chat/v1/delete_by_type`,
    data
  })
}
