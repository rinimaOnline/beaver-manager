import type {
  GetMomentCommentListReq,
  GetMomentCommentListRes,
  GetMomentDetailRes,
  GetMomentListReq,
  GetMomentListRes,
  DeleteMomentCommentRes,
  DeleteMomentRes
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
export function getMomentDetailApi(momentId: string) {
  return ajax<GetMomentDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moment/${momentId}`
  })
}

// 删除动态
export function deleteMomentApi(momentId: string) {
  return ajax<DeleteMomentRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/moment/${momentId}`
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
