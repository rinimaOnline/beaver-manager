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
  ICreateAdminUserReq,
  ICreateAdminUserRes,
  ICreateAuthorityReq,
  ICreateAuthorityRes,
  IDeleteAuthorityReq,
  IDeleteAuthorityRes,
  ICreateMenuReq,
  ICreateMenuRes,
  IDeleteMenuReq,
  IDeleteMenuRes,
  IGetAdminUserListReq,
  IGetAdminUserListRes,
  IGetAuthorityListRes,
  IGetAuthorityMenusRes,
  IGetAuthorityModulesRes,
  IGetMenuListReq,
  IGetMenuListRes,
  IListAdminModulesRes,
  IUpdateAuthorityModuleReq,
  IUpdateAuthorityModuleRes,
  IUpdateAdminUserReq,
  IUpdateAdminUserRes,
  IUpdateAuthorityMenuReq,
  IUpdateAuthorityMenuRes,
  IUpdateAuthorityReq,
  IUpdateAuthorityRes,
  IUpdateMenuReq,
  IUpdateMenuRes
} from "@/types/api/system"
import config from "@/config/env"
import { ajax } from "@/utils/request"
import { encryptSecret } from "@/utils/rsaPassword"

export function getMenuListApi(params: IGetMenuListReq) {
  return ajax<IGetMenuListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/list_menus`,
    params
  })
}

export function createMenuApi(data: ICreateMenuReq) {
  return ajax<ICreateMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/create_menu`,
    data
  })
}

export function updateMenuApi(data: IUpdateMenuReq) {
  return ajax<IUpdateMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_menu`,
    data
  })
}

export function deleteMenuApi(data: IDeleteMenuReq) {
  return ajax<IDeleteMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/delete_menu`,
    data
  })
}

export function createAuthorityApi(data: ICreateAuthorityReq) {
  return ajax<ICreateAuthorityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/create_authority`,
    data
  })
}

export function updateAuthorityMenuApi(data: IUpdateAuthorityMenuReq) {
  return ajax<IUpdateAuthorityMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_authority_menu`,
    data
  })
}

export function getAuthorityListApi() {
  return ajax<IGetAuthorityListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/list_authorities`
  })
}

export function updateAuthorityApi(data: IUpdateAuthorityReq) {
  return ajax<IUpdateAuthorityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_authority`,
    data
  })
}

export function deleteAuthorityApi(data: IDeleteAuthorityReq) {
  return ajax<IDeleteAuthorityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/delete_authority`,
    data
  })
}

export function getAuthorityMenusApi(authorityId: number) {
  return ajax<IGetAuthorityMenusRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/authority_menus`,
    params: { id: authorityId }
  })
}

// 可授权的后台模块目录。模块决定接口能不能调，和菜单（决定页面能不能看）是两回事
export function listAdminModulesApi() {
  return ajax<IListAdminModulesRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/list_modules`
  })
}

export function getAuthorityModulesApi(authorityId: number) {
  return ajax<IGetAuthorityModulesRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/authority_modules`,
    params: { id: authorityId }
  })
}

export function updateAuthorityModuleApi(data: IUpdateAuthorityModuleReq) {
  return ajax<IUpdateAuthorityModuleRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_authority_module`,
    data
  })
}

export function getAdminUserListApi(params: IGetAdminUserListReq) {
  return ajax<IGetAdminUserListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/list_admins`,
    params
  })
}

export async function createAdminUserApi(data: ICreateAdminUserReq) {
  return ajax<ICreateAdminUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/create_admin`,
    data: { ...data, password: await encryptSecret(data.password) }
  })
}

export async function updateAdminUserApi(userId: string, data: IUpdateAdminUserReq) {
  const payload: IUpdateAdminUserReq = { ...data }
  if (payload.password)
    payload.password = await encryptSecret(payload.password)
  return ajax<IUpdateAdminUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_admin`,
    data: { ...payload, userId }
  })
}
