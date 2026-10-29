/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-manager-header-v1
 */

import type {
  IBatchDeleteUsersReq,
  IBatchDeleteUsersRes,
  IBatchUpdateUserStatusReq,
  IBatchUpdateUserStatusRes,
  ICreateUserReq,
  ICreateUserRes,
  IDeleteUserRes,
  IGetIdentityListReq,
  IGetIdentityListRes,
  IGetUserDetailRes,
  IGetUserListReq,
  IGetUserListRes,
  IReviewIdentityReq,
  IReviewIdentityRes,
  IResetUserPasswordReq,
  IResetUserPayPasswordReq,
  IResetUserPayPasswordRes,
  IUpdateIdentityReq,
  IUpdateIdentityRes,
  IResetUserPasswordRes,
  IUpdateUserReq,
  IUpdateUserRes
} from "@/types/api/user"
import config from "@/config/env"
import { ajax } from "@/utils/request"
import { encryptSecret } from "@/utils/rsaPassword"

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

export async function createUserApi(data: ICreateUserReq) {
  return ajax<ICreateUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/create`,
    data: { ...data, password: await encryptSecret(data.password) }
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

export async function resetUserPasswordApi(data: IResetUserPasswordReq) {
  return ajax<IResetUserPasswordRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/reset_password`,
    data: { ...data, newPassword: await encryptSecret(data.newPassword) }
  })
}

export async function resetUserPayPasswordApi(data: IResetUserPayPasswordReq) {
  return ajax<IResetUserPayPasswordRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/reset_pay_password`,
    data: {
      userId: data.userId,
      newPassword: await encryptSecret(data.newPassword),
      ...(data.remark ? { remark: data.remark } : {})
    }
  })
}

export function batchUpdateUserStatusApi(data: IBatchUpdateUserStatusReq) {
  return ajax<IBatchUpdateUserStatusRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/batch_update_status`,
    data
  })
}

/** 实名认证列表：人工审核台的数据源 */
export function getIdentityListApi(params: IGetIdentityListReq) {
  return ajax<IGetIdentityListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/user/v1/identity/list`,
    params
  })
}

/** 审核实名认证：逐条人工判定通过或驳回 */
export function reviewIdentityApi(data: IReviewIdentityReq) {
  return ajax<IReviewIdentityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/identity/review`,
    data
  })
}

/** 修改实名信息：姓名、证件号、证件正反面、活体主照和动作帧都能改；没提交过的会落成已通过 */
export function updateIdentityApi(data: IUpdateIdentityReq) {
  return ajax<IUpdateIdentityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/user/v1/identity/update`,
    data
  })
}
