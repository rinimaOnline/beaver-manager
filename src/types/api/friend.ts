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

// 好友关系信息
export interface IFriendInfo {
  id: string
  sendUserId: string
  sendUserName: string
  revUserId: string
  revUserName: string
  sendUserNotice: string
  revUserNotice: string
  isDeleted: boolean
  createTime: string
  updateTime: string
}

// 好友关系详情信息
export interface IFriendDetailInfo {
  id: string
  sendUserId: string
  sendUserName: string
  sendUserFileName: string // 发起方头像文件 key
  revUserId: string
  revUserName: string
  revUserFileName: string // 接收方头像文件 key
  sendUserNotice: string
  revUserNotice: string
  isDeleted: boolean
  createTime: string
  updateTime: string
}

// 好友验证信息
export interface IFriendVerifyInfo {
  id: string
  sendUserId: string
  sendUserName: string
  revUserId: string
  revUserName: string
  sendStatus: number
  revStatus: number
  message: string
  createTime: string
  updateTime: string
}

// 好友验证详情信息
export interface IFriendVerifyDetailInfo {
  id: string
  sendUserId: string
  sendUserName: string
  sendUserFileName: string // 发起方头像文件 key
  revUserId: string
  revUserName: string
  revUserFileName: string // 接收方头像文件 key
  sendStatus: number
  revStatus: number
  message: string
  createTime: string
  updateTime: string
}

// 获取好友关系列表请求参数
export interface IGetFriendListReq {
  page?: number
  pageSize?: number
  userId?: string
  friendId?: string
  isDeleted?: boolean
  startTime?: string
  endTime?: string
}

// 获取好友关系列表响应
export interface IGetFriendListRes {
  list: IFriendInfo[]
  total: number
}

// 获取好友关系详情请求参数
export interface IGetFriendDetailReq {
  id: string
}

// 获取好友关系详情响应
export interface IGetFriendDetailRes extends IFriendDetailInfo {}

// 删除好友关系请求参数
export interface IDeleteFriendReq {
  id: string
}

// 删除好友关系响应
export interface IDeleteFriendRes {}

// 批量删除好友关系请求参数
export interface IBatchDeleteFriendsReq {
  ids: string[]
}

// 批量删除好友关系响应
export interface IBatchDeleteFriendsRes {}

// 恢复好友关系请求参数
export interface IRestoreFriendReq {
  friendId: string
}

// 恢复好友关系响应
export interface IRestoreFriendRes {}

// 获取好友验证列表请求参数
export interface IGetFriendVerifyListReq {
  page?: number
  pageSize?: number
  sendUserId?: string
  revUserId?: string
  sendStatus?: number // 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  revStatus?: number
  startTime?: string
  endTime?: string
}

// 获取好友验证列表响应
export interface IGetFriendVerifyListRes {
  list: IFriendVerifyInfo[]
  total: number
}

// 获取好友验证详情请求参数
export interface IGetFriendVerifyDetailReq {
  verifyId: string
}

// 获取好友验证详情响应
export interface IGetFriendVerifyDetailRes extends IFriendVerifyDetailInfo {}

// 删除好友验证记录请求参数
export interface IDeleteFriendVerifyReq {
  verifyId: string
}

// 删除好友验证记录响应
export interface IDeleteFriendVerifyRes {}

// 批量删除好友验证记录请求参数
export interface IBatchDeleteFriendVerifyReq {
  ids: string[]
}

// 批量删除好友验证记录响应
export interface IBatchDeleteFriendVerifyRes {}

// 好友黑名单信息
export interface IFriendBlockInfo {
  id: string
  userId: string
  userName: string
  blockedUserId: string
  blockedUserName: string
  createTime: string
}

export interface IGetFriendBlockListReq {
  page?: number
  pageSize?: number
  userId?: string
  blockedUserId?: string
}

export interface IGetFriendBlockListRes {
  list: IFriendBlockInfo[]
  total: number
}

export interface IUnblockFriendUsersReq {
  ids: string[]
}

export interface IUnblockFriendUsersRes {}

// 好友验证状态枚举
export enum FriendVerifyStatus {
  PENDING = 0, // 未处理
  ACCEPTED = 1, // 已通过
  REJECTED = 2, // 已拒绝
  IGNORED = 3, // 忽略
  DELETED = 4 // 删除
}
