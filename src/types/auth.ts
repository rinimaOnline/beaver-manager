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

// 登录请求参数
export interface ILoginReq {
  phone: string
  password: string
}

// 用户信息
export interface IUserInfo {
  id: number
  phone: string
  email: string
  fileName: string
}

// 登录响应数据 - 修改为匹配实际API返回结构
export interface ILoginRes {
  token: string
  userId: string
}

// API通用响应结构
export interface IApiResponse<T = any> {
  code: number
  msg: string
  result: T
}

// 认证/获取用户信息响应 - 匹配authentication接口返回值
export interface IGetUserInfoRes {
  userId: string
}

// 刷新token响应
export interface IRefreshTokenRes {
  token: string
}
