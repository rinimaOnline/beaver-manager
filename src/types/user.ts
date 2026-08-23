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

// 用户状态
export type UserStatus = "active" | "inactive"

// 用户信息
export interface IUser {
  id: number
  username: string
  email: string
  fileName: string
  status: UserStatus
  createTime: string
  updateTime: string
}

// 用户列表查询请求参数
export interface IUserListReq {
  page?: number
  size?: number
  keyword?: string
  status?: UserStatus
}

// 分页响应基础结构
export interface IPageRes<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// 用户列表响应
export interface IUserListRes extends IPageRes<IUser> {}

// 获取用户详情响应
export interface IGetUserDetailRes {
  id: number
  username: string
  email: string
  fileName: string
  status: UserStatus
  createTime: string
  updateTime: string
}

// 创建用户请求参数
export interface ICreateUserReq {
  username: string
  email: string
  password: string
  fileName?: string
}

// 创建用户响应
export interface ICreateUserRes {
  id: number
  username: string
  email: string
  fileName: string
  status: UserStatus
  createTime: string
}

// 更新用户请求参数
export interface IUpdateUserReq {
  username?: string
  email?: string
  fileName?: string
  status?: UserStatus
}

// 更新用户响应
export interface IUpdateUserRes {
  id: number
  username: string
  email: string
  fileName: string
  status: UserStatus
  updateTime: string
}

// 批量删除用户请求参数
export interface IBatchDeleteUserReq {
  ids: number[]
}
