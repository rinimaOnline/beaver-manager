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
  IOnboardingAddFriendsReq,
  IOnboardingAddGroupsReq,
  IOnboardingFriendListRes,
  IOnboardingGroupListRes,
  IOnboardingUpdateItemReq
} from "@/types/api/onboarding"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getOnboardingFriendsApi() {
  return ajax<IOnboardingFriendListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/onboarding/v1/friend/list`
  })
}

export function addOnboardingFriendsApi(data: IOnboardingAddFriendsReq) {
  return ajax<{ added: number }>({
    method: "POST",
    url: `${config.baseAPI}/admin/onboarding/v1/friend/add`,
    data
  })
}

export function updateOnboardingFriendApi(data: IOnboardingUpdateItemReq) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${config.baseAPI}/admin/onboarding/v1/friend/update`,
    data
  })
}

export function deleteOnboardingFriendApi(id: number) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${config.baseAPI}/admin/onboarding/v1/friend/delete`,
    data: { id }
  })
}

export function getOnboardingGroupsApi() {
  return ajax<IOnboardingGroupListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/onboarding/v1/group/list`
  })
}

export function addOnboardingGroupsApi(data: IOnboardingAddGroupsReq) {
  return ajax<{ added: number }>({
    method: "POST",
    url: `${config.baseAPI}/admin/onboarding/v1/group/add`,
    data
  })
}

export function updateOnboardingGroupApi(data: IOnboardingUpdateItemReq) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${config.baseAPI}/admin/onboarding/v1/group/update`,
    data
  })
}

export function deleteOnboardingGroupApi(id: number) {
  return ajax<Record<string, never>>({
    method: "POST",
    url: `${config.baseAPI}/admin/onboarding/v1/group/delete`,
    data: { id }
  })
}
