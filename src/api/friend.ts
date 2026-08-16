import type {
  IBatchDeleteFriendsReq,
  IBatchDeleteFriendsRes,
  IBatchDeleteFriendVerifyReq,
  IBatchDeleteFriendVerifyRes,
  IDeleteFriendRes,
  IDeleteFriendVerifyReq,
  IDeleteFriendVerifyRes,
  IGetFriendBlockListReq,
  IGetFriendBlockListRes,
  IGetFriendDetailRes,
  IGetFriendListReq,
  IGetFriendListRes,
  IGetFriendVerifyDetailReq,
  IGetFriendVerifyDetailRes,
  IGetFriendVerifyListReq,
  IGetFriendVerifyListRes,
  IRestoreFriendReq,
  IRestoreFriendRes,
  IUnblockFriendUsersReq,
  IUnblockFriendUsersRes
} from "@/types/api/friend"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getFriendListApi(params: IGetFriendListReq) {
  return ajax<IGetFriendListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/v1/list`,
    params
  })
}

export function getFriendDetailApi(id: string) {
  return ajax<IGetFriendDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/v1/detail`,
    params: { id }
  })
}

export function deleteFriendApi(id: string) {
  return ajax<IDeleteFriendRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/friend/v1/delete`,
    data: { id }
  })
}

export function batchDeleteFriendsApi(data: IBatchDeleteFriendsReq) {
  return ajax<IBatchDeleteFriendsRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/friend/v1/batch_delete`,
    data
  })
}

export function restoreFriendApi(data: IRestoreFriendReq) {
  return ajax<IRestoreFriendRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/friend/v1/restore`,
    data
  })
}

export function getFriendVerifyListApi(params: IGetFriendVerifyListReq) {
  return ajax<IGetFriendVerifyListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/v1/verify_list`,
    params
  })
}

export function getFriendVerifyDetailApi(params: IGetFriendVerifyDetailReq) {
  return ajax<IGetFriendVerifyDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/v1/verify_detail`,
    params
  })
}

export function deleteFriendVerifyApi(data: IDeleteFriendVerifyReq) {
  return ajax<IDeleteFriendVerifyRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/friend/v1/delete_verify`,
    data
  })
}

export function batchDeleteFriendVerifyApi(data: IBatchDeleteFriendVerifyReq) {
  return ajax<IBatchDeleteFriendVerifyRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/friend/v1/batch_delete_verify`,
    data
  })
}

export function getFriendBlockListApi(params: IGetFriendBlockListReq) {
  return ajax<IGetFriendBlockListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/v1/block_list`,
    params
  })
}

export function unblockFriendUsersApi(data: IUnblockFriendUsersReq) {
  return ajax<IUnblockFriendUsersRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/friend/v1/unblock_batch`,
    data
  })
}
