import type {
  DeleteCircleCommentRes,
  DeleteCirclePostRes,
  DeleteCircleRes,
  GetCircleCommentListReq,
  GetCircleCommentListRes,
  GetCircleDetailRes,
  GetCircleListReq,
  GetCircleListRes,
  GetCircleMemberListReq,
  GetCircleMemberListRes,
  GetCirclePostListReq,
  GetCirclePostListRes,
  RemoveCircleMemberReq,
  RemoveCircleMemberRes
} from "@/types/api/circle"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getCircleListApi(params: GetCircleListReq) {
  return ajax<GetCircleListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/circle/v1/list`,
    params
  })
}

export function getCircleDetailApi(circleId: string) {
  return ajax<GetCircleDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/circle/v1/detail`,
    params: { circleId }
  })
}

export function deleteCircleApi(circleId: string) {
  return ajax<DeleteCircleRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/circle/v1/delete`,
    data: { circleId }
  })
}

export function getCircleMemberListApi(params: GetCircleMemberListReq) {
  return ajax<GetCircleMemberListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/circle/v1/members`,
    params
  })
}

export function removeCircleMemberApi(data: RemoveCircleMemberReq) {
  return ajax<RemoveCircleMemberRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/circle/v1/remove_member`,
    data
  })
}

export function getCirclePostListApi(params: GetCirclePostListReq) {
  return ajax<GetCirclePostListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/circle/v1/posts`,
    params
  })
}

export function deleteCirclePostApi(postId: string) {
  return ajax<DeleteCirclePostRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/circle/v1/delete_post`,
    data: { postId }
  })
}

export function getCircleCommentListApi(params: GetCircleCommentListReq) {
  return ajax<GetCircleCommentListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/circle/v1/comments`,
    params
  })
}

export function deleteCircleCommentApi(commentId: string) {
  return ajax<DeleteCircleCommentRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/circle/v1/delete_comment`,
    data: { commentId }
  })
}
