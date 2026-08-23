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

export interface IUserOpsProfileInfo {
  userId: string
  nickName: string
  email: string
  avatar: string
  abstract: string
  status: number
  source: number
  createTime: string
}

export interface IUserOpsFriendItem {
  peerUserId: string
  peerUserName: string
  createTime: string
}

export interface IUserOpsGroupItem {
  groupId: string
  title: string
  role: number
  status: number
}

export interface IUserOpsSessionItem {
  conversationId: string
  conversationType: number
  title: string
  lastMessage: string
  lastMessageTime: string
  messageCount: number
}

export interface IUserOpsMomentItem {
  momentId: string
  content: string
  isDeleted: boolean
  createdAt: string
}

export interface IUserOpsCircleItem {
  circleId: string
  name: string
  role: number
  memberCount: number
  postCount: number
  isDeleted: boolean
}

export interface IUserOpsReportItem {
  id: number
  targetType: number
  targetId: string
  reasonType: number
  status: number
  createdAt: string
}

export interface IUserOpsBlockItem {
  id: string
  blockedUserId: string
  blockedUserName: string
  createTime: string
}

export interface IGetUserOperationsProfileRes {
  profile: IUserOpsProfileInfo
  friendTotal: number
  groupTotal: number
  sessionTotal: number
  momentTotal: number
  circleTotal: number
  reportTotal: number
  blockTotal: number
  friends: IUserOpsFriendItem[]
  groups: IUserOpsGroupItem[]
  sessions: IUserOpsSessionItem[]
  moments: IUserOpsMomentItem[]
  circles: IUserOpsCircleItem[]
  reports: IUserOpsReportItem[]
  blocks: IUserOpsBlockItem[]
}

export interface IGroupOpsProfileInfo {
  groupId: string
  title: string
  avatar: string
  creatorId: string
  notice: string
  status: number
  muteAll: boolean
  createdAt: string
}

export interface IGroupOpsMemberItem {
  userId: string
  nickName: string
  role: number
  status: number
  joinTime: string
}

export interface IGroupOpsMessageItem {
  messageId: string
  sendUserId: string
  sendName: string
  msgPreview: string
  isDeleted: boolean
  createTime: string
}

export interface IGroupOpsReportItem {
  id: number
  reporterUserId: string
  reporterName: string
  reasonType: number
  status: number
  createdAt: string
}

export interface IGetGroupOperationsProfileRes {
  profile: IGroupOpsProfileInfo
  memberTotal: number
  messageTotal: number
  reportTotal: number
  members: IGroupOpsMemberItem[]
  messages: IGroupOpsMessageItem[]
  reports: IGroupOpsReportItem[]
}
