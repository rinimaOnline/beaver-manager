import type {
  IBatchDeleteFriendsReq,
  IBatchDeleteFriendsRes,
  IBatchDeleteFriendVerifyReq,
  IBatchDeleteFriendVerifyRes,
  IDeleteFriendRes,
  IDeleteFriendVerifyReq,
  IDeleteFriendVerifyRes,
  IGetFriendDetailRes,
  IGetFriendListReq,
  IGetFriendListRes,
  IGetFriendVerifyDetailReq,
  IGetFriendVerifyDetailRes,
  IGetFriendVerifyListReq,
  IGetFriendVerifyListRes,
  IRestoreFriendReq,
  IRestoreFriendRes
} from "@/types/api/friend"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取好友关系列表
export function getFriendListApi(params: IGetFriendListReq) {
  return ajax<IGetFriendListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/list`,
    params
  })
}

// 获取好友关系详情
export function getFriendDetailApi(id: string) {
  return ajax<IGetFriendDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/${id}`
  })
}

// 强制删除好友关系
export function deleteFriendApi(id: string) {
  return ajax<IDeleteFriendRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/friend/${id}`
  })
}

// 批量删除好友关系
export function batchDeleteFriendsApi(data: IBatchDeleteFriendsReq) {
  return ajax<IBatchDeleteFriendsRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/friend/batch`,
    data
  })
}

// 恢复好友关系
export function restoreFriendApi(data: IRestoreFriendReq) {
  return ajax<IRestoreFriendRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/friend/restore`,
    data
  })
}

// 获取好友验证列表
export function getFriendVerifyListApi(params: IGetFriendVerifyListReq) {
  return ajax<IGetFriendVerifyListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/verifylist`,
    params
  })
}

// 获取好友验证详情
export function getFriendVerifyDetailApi(params: IGetFriendVerifyDetailReq) {
  return ajax<IGetFriendVerifyDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/friend/verify`,
    params
  })
}

// 删除好友验证记录
export function deleteFriendVerifyApi(data: IDeleteFriendVerifyReq) {
  return ajax<IDeleteFriendVerifyRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/friend/verify`,
    data
  })
}

// 批量删除好友验证记录
export function batchDeleteFriendVerifyApi(data: IBatchDeleteFriendVerifyReq) {
  return ajax<IBatchDeleteFriendVerifyRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/friend/verifybatch`,
    data
  })
}
