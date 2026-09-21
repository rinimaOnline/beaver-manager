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
  /** 展示用人数文案，非空时客户端用它顶替真实人数展示（官方群「100万+」） */
  displayMemberText: string
  /** 官方群标识，客户端在群名后挂「官方」徽标；只有后台能改 */
  isOfficial: boolean
  /** 隐藏成员列表：开启后普通成员看不到群里有谁，只看得到人数。群主和管理员不受影响 */
  hideMemberList: boolean
  /** 隐藏成员变动灰条：开启后本群不再发「xxx 加入了群聊」这类系统提示 */
  hideMemberNotice: boolean
  /** 真实在册成员数（status=1），和 displayMemberText 无关 */
  memberCount: number
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
  /** 官方群筛选，不传表示全部 */
  isOfficial?: boolean
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
  /** 展示用人数文案。不传表示不改，传空串表示清掉、恢复真实人数 */
  displayMemberText?: string
  /** 官方群标识。不传表示不改 */
  isOfficial?: boolean
  /** 隐藏成员列表。不传表示不改 */
  hideMemberList?: boolean
  /** 隐藏成员变动灰条。不传表示不改 */
  hideMemberNotice?: boolean
}
export interface UpdateGroupRes {}

// 后台建群
//
// 群主必须是已存在的用户（官方群一般挂在官方客服号下）。memberIds 是可选的初始成员，
// 建完不会给成员推 WS，真人被这样拉进来要等下一轮同步才看得到群——这里只适合放
// 官方号、运营虚拟号，普通用户让他们自己走邀请链接进。
export interface CreateGroupReq {
  /** 群主用户ID */
  creatorId: string
  title: string
  /** 群头像，空表示用默认头像 */
  fileName?: string
  notice?: string
  /** 初始成员（不含群主） */
  memberIds?: string[]
  isOfficial?: boolean
  displayMemberText?: string
  hideMemberList?: boolean
  hideMemberNotice?: boolean
}
export interface CreateGroupRes {
  groupId: string
}

// 删除群组
export interface DeleteGroupReq { id: number }
export interface DeleteGroupRes {}

// 群成员信息
export interface GroupMemberInfo {
  id: number
  groupId: string
  userId: string
  weliaoId: string // 微聊号
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
