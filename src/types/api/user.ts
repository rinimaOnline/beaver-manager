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
  weliaoId: string // 微聊号（用户对外展示的账号）
  nickName: string
  email: string
  phone: string
  abstract: string
  avatar: string
  status: number
  source: number
  userType: number
  /** 官方标识，客户端在昵称后挂「官方」徽标；只有后台能改 */
  isOfficial: boolean
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
  /** 官方标识筛选，不传表示全部 */
  isOfficial?: boolean
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
  /** 与手机号二选一 */
  email?: string
  /** 与邮箱二选一 */
  phone?: string
  avatar?: string
  abstract?: string
  status?: number
  source?: number
  /** 官方标识，只有后台建号能给 */
  isOfficial?: boolean
}

// 创建用户响应
export interface ICreateUserRes {
  id: string
}

// 更新用户请求参数
export interface IUpdateUserReq {
  id: string
  /** 微聊号，唯一性由服务端校验 */
  weliaoId?: string
  nickName?: string
  email?: string
  /** 手机号，唯一性由服务端校验 */
  phone?: string
  avatar?: string
  abstract?: string
  status?: number
  /** 官方标识，不传表示不改 */
  isOfficial?: boolean
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

// 实名认证记录（人工审核台）
export interface IIdentityInfo {
  userId: string
  weliaoId: string // 微聊号
  nickName: string
  avatar: string
  realName: string
  idNumber: string
  portraitUrl: string
  emblemUrl: string
  faceUrl: string
  faceFrames: string[]
  status: number
  rejectReason: string
  reviewerId: string
  reviewedAt: string
  submitTime: string
  updateTime: string
}

// 实名认证列表请求参数
export interface IGetIdentityListReq {
  page?: number
  pageSize?: number
  status?: number
  keyword?: string
}

// 实名认证列表响应
export interface IGetIdentityListRes {
  list: IIdentityInfo[]
  total: number
}

// 审核实名认证请求参数
export interface IReviewIdentityReq {
  userId: string
  status: number
  rejectReason?: string
}

// 审核实名认证响应
export interface IReviewIdentityRes {}

// 实名认证状态枚举
export enum IdentityStatus {
  NONE = 0, // 未提交
  PENDING = 1, // 待人工审核
  APPROVED = 2, // 审核通过
  REJECTED = 3 // 审核驳回
}

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
