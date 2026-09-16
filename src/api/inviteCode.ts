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
  IInviteBindUpdateReq,
  IInviteConfigCreateReq,
  IInviteConfigCreateRes,
  IInviteConfigListReq,
  IInviteConfigListRes,
  IInviteConfigUpdateReq,
  IInviteFriendAddReq,
  IInviteFriendListRes,
  IInviteGroupAddReq,
  IInviteGroupListRes,
  IInviteRegistrationsReq,
  IInviteRegistrationsRes,
  IInviteSettingGetRes,
  IInviteSettingSaveReq,
  IInviteStatsRes,
  IInviteUserLineageRes
} from "@/types/api/inviteCode"
import config from "@/config/env"
import { ajax } from "@/utils/request"

const BASE = `${config.baseAPI}/admin/invite-code/v1`

// ---------- 邀请码配置 ----------

export function getInviteConfigListApi(params: IInviteConfigListReq) {
  return ajax<IInviteConfigListRes>({
    method: "GET",
    url: `${BASE}/config/list`,
    params
  })
}

export function createInviteConfigApi(data: IInviteConfigCreateReq) {
  return ajax<IInviteConfigCreateRes>({
    method: "POST",
    url: `${BASE}/config/create`,
    data
  })
}

export function updateInviteConfigApi(data: IInviteConfigUpdateReq) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${BASE}/config/update`,
    data
  })
}

export function deleteInviteConfigApi(id: number) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${BASE}/config/delete`,
    data: { id }
  })
}

// ---------- 自动好友 ----------

export function getInviteFriendListApi(configId: number) {
  return ajax<IInviteFriendListRes>({
    method: "GET",
    url: `${BASE}/friend/list`,
    params: { configId }
  })
}

export function addInviteFriendsApi(data: IInviteFriendAddReq) {
  return ajax<{ added: number }>({
    method: "POST",
    url: `${BASE}/friend/add`,
    data
  })
}

export function updateInviteFriendApi(data: IInviteBindUpdateReq) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${BASE}/friend/update`,
    data
  })
}

export function deleteInviteFriendApi(id: number) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${BASE}/friend/delete`,
    data: { id }
  })
}

// ---------- 自动群 ----------

export function getInviteGroupListApi(configId: number) {
  return ajax<IInviteGroupListRes>({
    method: "GET",
    url: `${BASE}/group/list`,
    params: { configId }
  })
}

export function addInviteGroupsApi(data: IInviteGroupAddReq) {
  return ajax<{ added: number }>({
    method: "POST",
    url: `${BASE}/group/add`,
    data
  })
}

export function updateInviteGroupApi(data: IInviteBindUpdateReq) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${BASE}/group/update`,
    data
  })
}

export function deleteInviteGroupApi(id: number) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${BASE}/group/delete`,
    data: { id }
  })
}

// ---------- 注册名单 / 统计 / 上级链 ----------

export function getInviteRegistrationsApi(params: IInviteRegistrationsReq) {
  return ajax<IInviteRegistrationsRes>({
    method: "GET",
    url: `${BASE}/registrations`,
    params
  })
}

export function getInviteStatsApi(configId: number) {
  return ajax<IInviteStatsRes>({
    method: "GET",
    url: `${BASE}/stats`,
    params: { configId }
  })
}

export function getInviteUserLineageApi(userId: string) {
  return ajax<IInviteUserLineageRes>({
    method: "GET",
    url: `${BASE}/user-lineage`,
    params: { userId }
  })
}

// ---------- 注册设置 ----------

export function getInviteSettingApi() {
  return ajax<IInviteSettingGetRes>({
    method: "GET",
    url: `${BASE}/setting/get`
  })
}

export function saveInviteSettingApi(data: IInviteSettingSaveReq) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${BASE}/setting/save`,
    data
  })
}
