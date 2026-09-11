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

export interface IOnboardingFriendItem {
  id: number
  userId: string
  nickName: string
  avatar: string
  email: string
  phone: string
  userType: number
  sort: number
  status: number
  remark: string
  createdAt: string
  updatedAt: string
}

export interface IOnboardingFriendListRes {
  list: IOnboardingFriendItem[]
}

export interface IOnboardingGroupItem {
  id: number
  groupId: string
  title: string
  avatar: string
  status: number
  groupStatus: number
  sort: number
  remark: string
  createdAt: string
  updatedAt: string
}

export interface IOnboardingGroupListRes {
  list: IOnboardingGroupItem[]
}

export interface IOnboardingAddFriendsReq {
  userIds: string[]
  sort?: number
  remark?: string
}

export interface IOnboardingAddGroupsReq {
  groupIds: string[]
  sort?: number
  remark?: string
}

export interface IOnboardingUpdateItemReq {
  id: number
  sort?: number
  status?: number
  remark?: string
}
