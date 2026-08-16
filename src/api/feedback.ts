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

export function getFeedbackListApi(params: IGetFeedbackListReq) {
  return ajax<IGetFeedbackListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/feedback/v1/list`,
    params
  })
}

export function getFeedbackDetailApi(id: number) {
  return ajax<IGetFeedbackDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/feedback/v1/detail`,
    params: { id }
  })
}

export function handleFeedbackApi(id: number, data: Omit<IHandleFeedbackReq, "id">) {
  return ajax<IHandleFeedbackRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/feedback/v1/handle`,
    data: { id, ...data }
  })
}

export function deleteFeedbackApi(id: number) {
  return ajax<IDeleteFeedbackRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/feedback/v1/delete`,
    data: { id }
  })
}
