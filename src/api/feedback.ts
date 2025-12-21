import type {
  IDeleteFeedbackRes,
  IGetFeedbackDetailRes,
  IGetFeedbackListReq,
  IGetFeedbackListRes,
  IHandleFeedbackReq,
  IHandleFeedbackRes
} from "@/types/api/feedback"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取反馈列表
export function getFeedbackListApi(params: IGetFeedbackListReq) {
  return ajax<IGetFeedbackListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/feedback/list`,
    params
  })
}

// 获取反馈详情
export function getFeedbackDetailApi(id: number) {
  return ajax<IGetFeedbackDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/feedback/${id}`
  })
}

// 处理反馈
export function handleFeedbackApi(id: number, data: Omit<IHandleFeedbackReq, "id">) {
  return ajax<IHandleFeedbackRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/feedback/${id}`,
    data
  })
}

// 删除反馈
export function deleteFeedbackApi(id: number) {
  return ajax<IDeleteFeedbackRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/feedback/${id}`
  })
}
