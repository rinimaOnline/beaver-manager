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

export function getUserListApi(params: IGetUserListReq) {
  return ajax<IGetUserListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/user/v1/list`,
    params
  })
}

export function getUserDetailApi(id: string) {
  return ajax<IGetUserDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/user/v1/detail`,
    params: { id }
  })
}

export function createUserApi(data: ICreateUserReq) {
  return ajax<ICreateUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/create`,
    data
  })
}

export function updateUserApi(id: string, data: Omit<IUpdateUserReq, "id">) {
  return ajax<IUpdateUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/update`,
    data: { id, ...data }
  })
}

export function deleteUserApi(id: string) {
  return ajax<IDeleteUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/delete`,
    data: { id }
  })
}

export function batchDeleteUsersApi(data: IBatchDeleteUsersReq) {
  return ajax<IBatchDeleteUsersRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/batch_delete`,
    data
  })
}

export function resetUserPasswordApi(data: IResetUserPasswordReq) {
  return ajax<IResetUserPasswordRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/reset_password`,
    data
  })
}

export function batchUpdateUserStatusApi(data: IBatchUpdateUserStatusReq) {
  return ajax<IBatchUpdateUserStatusRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/batch_update_status`,
    data
  })
}
