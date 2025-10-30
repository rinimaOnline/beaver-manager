import type {
  IBatchDeleteUsersReq,
  IBatchDeleteUsersRes,
  IBatchUpdateUserStatusReq,
  IBatchUpdateUserStatusRes,
  ICreateUserReq,
  ICreateUserRes,
  IDeleteUserRes,
  IGetUserDetailRes,
  IGetUserListReq,
  IGetUserListRes,
  IResetUserPasswordReq,
  IResetUserPasswordRes,
  IUpdateUserReq,
  IUpdateUserRes
} from "@/types/api/user"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取用户列表
export function getUserListApi(params: IGetUserListReq) {
  return ajax<IGetUserListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/user/list`,
    params
  })
}

// 获取用户详情
export function getUserDetailApi(id: string) {
  return ajax<IGetUserDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/user/${id}`
  })
}

// 创建用户
export function createUserApi(data: ICreateUserReq) {
  return ajax<ICreateUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/create`,
    data
  })
}

// 更新用户
export function updateUserApi(id: string, data: Omit<IUpdateUserReq, "id">) {
  return ajax<IUpdateUserRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/user/${id}`,
    data
  })
}

// 删除用户
export function deleteUserApi(id: string) {
  return ajax<IDeleteUserRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/user/${id}`
  })
}

// 批量删除用户
export function batchDeleteUsersApi(data: IBatchDeleteUsersReq) {
  return ajax<IBatchDeleteUsersRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/user/batch`,
    data
  })
}

// 重置用户密码
export function resetUserPasswordApi(data: IResetUserPasswordReq) {
  return ajax<IResetUserPasswordRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/user/password`,
    data
  })
}

// 批量更新用户状态
export function batchUpdateUserStatusApi(data: IBatchUpdateUserStatusReq) {
  return ajax<IBatchUpdateUserStatusRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/user/status`,
    data
  })
}
