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
  weliaoId: string // 微聊号
  nickName: string
  avatar: string
  email: string
  phone: string
  userType: number
  codes: string[] // 绑定邀请码，空数组=对无邀请码注册的用户生效
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
  codes: string[] // 绑定邀请码，空数组=对无邀请码注册的用户生效
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
  codes: string[] // 空数组=无邀请码
  sort?: number
  remark?: string
}

export interface IOnboardingAddGroupsReq {
  groupIds: string[]
  codes: string[] // 空数组=无邀请码
  sort?: number
  remark?: string
}

export interface IOnboardingUpdateItemReq {
  id: number
  codes?: string[]
  sort?: number
  status?: number
  remark?: string
}

// ---------- 注册设置 ----------

export interface IOnboardingSettingItem {
  keyName: string
  value: string
  remark: string
  isDefault: boolean
}

export interface IOnboardingSettingGetRes {
  allowEmptyInviteCode: boolean
  /** 强制实名才能聊天：开=实名审核通过前发不出消息 */
  forceIdentityChat: boolean
  list: IOnboardingSettingItem[]
}

export interface IOnboardingSettingSaveReq {
  allowEmptyInviteCode: boolean
  forceIdentityChat: boolean
}

// ---------- 邀请树 ----------

export interface IInviteTreeNode {
  userId: string
  weliaoId: string // 微聊号
  nickName: string
  avatar: string
  inviteCode: string
  inviterId: string
  level: number // 距离根节点的层级，直接下级=1
  childCount: number
}

export interface IInviteTreeReq {
  userId?: string
  code?: string
  depth?: number
}

export interface IInviteTreeRes {
  rootUserId: string
  rootNickName: string
  rootCode: string
  inviterId: string
  inviterName: string
  nodes: IInviteTreeNode[]
  total: number
}
