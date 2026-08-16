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

export function getMomentListApi(params: GetMomentListReq) {
  return ajax<GetMomentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moment/v1/list`,
    params
  })
}

export function getMomentDetailApi(momentId: string) {
  return ajax<GetMomentDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moment/v1/detail`,
    params: { momentId }
  })
}

export function deleteMomentApi(momentId: string) {
  return ajax<DeleteMomentRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moment/v1/delete`,
    data: { momentId }
  })
}

export function getMomentCommentListApi(params: GetMomentCommentListReq) {
  return ajax<GetMomentCommentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moment/v1/comments`,
    params
  })
}

export function deleteMomentCommentApi(id: number) {
  return ajax<DeleteMomentCommentRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moment/v1/delete_comment`,
    data: { commentId: String(id) }
  })
}
