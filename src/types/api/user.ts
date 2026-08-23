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

// 用户基础信息
export interface IUserInfo {
  id: string
  nickName: string
  email: string
  abstract: string
  avatar: string
  status: number
  source: number
  userType: number
  lastLoginIp: string
  createTime: string
  updateTime: string
}

// 获取用户列表请求参数
export interface IGetUserListReq {
  page?: number
  pageSize?: number
  email?: string
  keyword?: string
  status?: number
  source?: number
  userType?: number
}

// 获取用户列表响应
export interface IGetUserListRes {
  list: IUserInfo[]
  total: number
}

// 获取用户详情请求参数
export interface IGetUserDetailReq {
  id: string
}

// 获取用户详情响应
export interface IGetUserDetailRes extends IUserInfo {}

// 创建用户请求参数
export interface ICreateUserReq {
  nickName: string
  password: string
  email: string
  avatar?: string
  abstract?: string
  status?: number
  source?: number
}

// 创建用户响应
export interface ICreateUserRes {
  id: string
}

// 更新用户请求参数
export interface IUpdateUserReq {
  id: string
  nickName?: string
  email?: string
  avatar?: string
  abstract?: string
  status?: number
}

// 更新用户响应
export interface IUpdateUserRes {}

// 删除用户请求参数
export interface IDeleteUserReq {
  id: string
}

// 删除用户响应
export interface IDeleteUserRes {}

// 批量删除用户请求参数
export interface IBatchDeleteUsersReq {
  ids: string[]
}

// 批量删除用户响应
export interface IBatchDeleteUsersRes {}

// 重置用户密码请求参数
export interface IResetUserPasswordReq {
  userId: string
  newPassword: string
}

// 重置用户密码响应
export interface IResetUserPasswordRes {}

// 批量更新用户状态请求参数
export interface IBatchUpdateUserStatusReq {
  ids: string[]
  status: number
}

// 批量更新用户状态响应
export interface IBatchUpdateUserStatusRes {}

// 用户状态枚举
export enum UserStatus {
  NORMAL = 1, // 正常
  DISABLED = 2, // 禁用
  DELETED = 3 // 删除
}

// 用户来源枚举
export enum UserSource {
  REGISTER = 1, // 注册
  ADMIN = 2, // 管理员创建
  IMPORT = 3 // 导入
}

// 用户类型枚举
export enum UserType {
  NORMAL = 1, // 普通用户
  BOT = 2, // 推送机器人
  ROBOT = 3 // 智能机器人
}
