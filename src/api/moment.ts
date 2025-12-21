import type {
  DeleteMomentCommentRes,
  DeleteMomentRes,
  GetMomentCommentListReq,
  GetMomentCommentListRes,
  GetMomentDetailRes,
  GetMomentListReq,
  GetMomentListRes,
  GetMomentReportListReq,
  GetMomentReportListRes,
  HandleMomentReportReq,
  HandleMomentReportRes
} from "@/types/api/moment"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取动态列表
export function getMomentListApi(params: GetMomentListReq) {
  return ajax<GetMomentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moment/list`,
    params
  })
}

// 获取动态详情
export function getMomentDetailApi(id: number) {
  return ajax<GetMomentDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moment/${id}`
  })
}

// 删除动态
export function deleteMomentApi(id: number) {
  return ajax<DeleteMomentRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/moment/${id}`
  })
}

// 获取动态评论列表
export function getMomentCommentListApi(params: GetMomentCommentListReq) {
  return ajax<GetMomentCommentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moment/comments`,
    params
  })
}

// 删除动态评论
export function deleteMomentCommentApi(id: number) {
  return ajax<DeleteMomentCommentRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/moment/comment/${id}`
  })
}

// 获取动态举报列表
export function getMomentReportListApi(params: GetMomentReportListReq) {
  return ajax<GetMomentReportListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moment/reports`,
    params
  })
}

// 处理动态举报
export function handleMomentReportApi(id: number, data: Omit<HandleMomentReportReq, "id">) {
  return ajax<HandleMomentReportRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/moment/report/${id}`,
    data
  })
}
