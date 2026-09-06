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

// 群组信息
export interface GroupInfo {
  id: number
  // 服务端 GetGroupListItem / GetGroupDetailRes 返回的字段名是 groupId（群 UUID），
  // 不是 uuid。`id` 才是数据库自增行号，两者不能混用：成员相关接口收的是 groupId。
  groupId: string
  type: number
  title: string
  abstract: string
  fileName: string
  creatorId: string
  notice: string
  tags: string
  maxMembers: number
  currentMembers: number
  status: number
  muteAll: boolean
  dissolveTime: string
  category: string
  createdAt: string
  updatedAt: string
}

// 群组列表请求
export interface GetGroupListReq {
  page?: number
  limit?: number
  status?: number
  type?: number
  keywords?: string
}
export interface GetGroupListRes {
  list: GroupInfo[]
  total: number
}

// 群组详情
export interface GetGroupDetailReq { id: number }
export interface GetGroupDetailRes extends GroupInfo {}

// 更新群组
export interface UpdateGroupReq {
  id: number
  title?: string
  abstract?: string
  fileName?: string
  notice?: string
  tags?: string
  maxMembers?: number
  status?: number
  muteAll?: boolean
  category?: string
}
export interface UpdateGroupRes {}

// 删除群组
export interface DeleteGroupReq { id: number }
export interface DeleteGroupRes {}

// 群成员信息
export interface GroupMemberInfo {
  id: number
  groupId: string
  userId: string
  memberNickname: string
  role: number
  prohibitionTime: number
  inviterId: string
  status: number
  notifyLevel: number
  displayName: string
  createdAt: string
  updatedAt: string
}

// 群成员列表
export interface GetGroupMemberListReq {
  page?: number
  limit?: number
  groupId: string
  role?: number
  status?: number
}
export interface GetGroupMemberListRes {
  list: GroupMemberInfo[]
  total: number
}

// 移除群成员
export interface RemoveGroupMemberReq {
  groupId: string
  memberIds: string[]
}
export interface RemoveGroupMemberRes {}

// 更新成员角色
export interface UpdateMemberRoleReq {
  id: number
  role: number
}
export interface UpdateMemberRoleRes {}

// 禁言成员
export interface MuteGroupMemberReq {
  id: number
  prohibitionTime: number
}
export interface MuteGroupMemberRes {}
