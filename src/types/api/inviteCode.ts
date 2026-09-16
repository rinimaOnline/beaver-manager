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

// ---------- 邀请码配置 ----------

// 邀请码来源：0=独立推广码，1=绑定用户
export interface IInviteConfigItem {
  id: number
  code: string
  name: string
  source: number
  ownerUserId: string
  ownerNickName: string
  ownerWeliaoId: string // 微聊号
  status: number
  propagateEnabled: boolean
  maxDepth: number
  remark: string
  friendCount: number
  groupCount: number
  registerTotal: number
  registerDirect: number
  createdAt: string
  updatedAt: string
}

// status/source 缺省传 -1 表示全部
export interface IInviteConfigListReq {
  keyword?: string
  status?: number
  source?: number
  page?: number
  pageSize?: number
}

export interface IInviteConfigListRes {
  list: IInviteConfigItem[]
  total: number
}

export interface IInviteConfigCreateReq {
  name?: string
  source?: number // 0=独立推广码，1=绑定用户
  ownerUserId?: string // source=1 时必填
  code?: string // 仅独立推广码可选传，留空自动生成
  propagateEnabled?: boolean
  maxDepth?: number
  status?: number // 缺省 1
  remark?: string
}

export interface IInviteConfigCreateRes {
  id: number
  code: string
}

export interface IInviteConfigUpdateReq {
  id: number
  name?: string
  status?: number
  propagateEnabled?: boolean
  maxDepth?: number
  remark?: string
}

// ---------- 自动好友（按 configId 隔离） ----------

export interface IInviteBindFriendItem {
  id: number
  configId: number
  userId: string
  weliaoId: string // 微聊号
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

export interface IInviteFriendListReq {
  configId: number
}

export interface IInviteFriendListRes {
  list: IInviteBindFriendItem[]
}

export interface IInviteFriendAddReq {
  configId: number
  userIds: string[]
  sort?: number
  remark?: string
}

// ---------- 自动群（按 configId 隔离） ----------

export interface IInviteBindGroupItem {
  id: number
  configId: number
  groupId: string
  title: string
  avatar: string
  groupStatus: number
  sort: number
  status: number
  remark: string
  createdAt: string
  updatedAt: string
}

export interface IInviteGroupListReq {
  configId: number
}

export interface IInviteGroupListRes {
  list: IInviteBindGroupItem[]
}

export interface IInviteGroupAddReq {
  configId: number
  groupIds: string[]
  sort?: number
  remark?: string
}

// 好友 / 群 绑定项的通用更新入参
export interface IInviteBindUpdateReq {
  id: number
  sort?: number
  status?: number
  remark?: string
}

// ---------- 注册名单 / 统计 / 上级链 ----------

export interface IInviteRegistrationItem {
  userId: string
  weliaoId: string // 微聊号
  nickName: string
  avatar: string
  phone: string
  email: string
  level: number
  depth: number
  createdAt: string
}

// level=0 表示全部，其余为业务级别（如 2）
export interface IInviteRegistrationsReq {
  configId: number
  level?: number
  page?: number
  pageSize?: number
}

export interface IInviteRegistrationsRes {
  list: IInviteRegistrationItem[]
  total: number
}

export interface IInviteStatsLevel {
  level: number
  depth: number
  count: number
}

export interface IInviteStatsReq {
  configId: number
}

export interface IInviteStatsRes {
  configId: number
  code: string
  name: string
  total: number
  friendCount: number
  groupCount: number
  levels: IInviteStatsLevel[]
}

export interface IInviteLineageItem {
  configId: number
  code: string
  name: string
  depth: number
  level: number
  status: number
  propagateEnabled: boolean
  maxDepth: number
  applied: boolean
}

export interface IInviteUserLineageReq {
  userId: string
}

export interface IInviteUserLineageRes {
  userId: string
  nickName: string
  inviterId: string
  lineage: IInviteLineageItem[]
}

// ---------- 注册设置 ----------

export interface IInviteSettingItem {
  keyName: string
  value: string
  remark: string
  isDefault: boolean
}

export interface IInviteSettingGetRes {
  allowEmptyInviteCode: boolean
  list: IInviteSettingItem[]
}

export interface IInviteSettingSaveReq {
  allowEmptyInviteCode: boolean
}
