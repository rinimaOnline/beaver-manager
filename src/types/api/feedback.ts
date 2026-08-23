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

// 反馈信息
export interface IFeedbackInfo {
  id: number
  userId: string
  content: string
  type: number
  status: number
  fileNames: string[]
  handlerId: number
  handleTime: string
  handleResult: string
  createdAt: string
  updatedAt: string
}

// 获取反馈列表请求参数
export interface IGetFeedbackListReq {
  page?: number
  limit?: number
  status?: number
  type?: number
  userId?: string
  keywords?: string
}

// 获取反馈列表响应
export interface IGetFeedbackListRes {
  list: IFeedbackInfo[]
  total: number
}

// 获取反馈详情请求参数
export interface IGetFeedbackDetailReq {
  id: number
}

// 获取反馈详情响应
export interface IGetFeedbackDetailRes extends IFeedbackInfo {}

// 处理反馈请求参数（处理人由后端从 Beaver-User-Id 请求头写入）
export interface IHandleFeedbackReq {
  id: number
  status: number
  handleResult: string
}

// 处理反馈响应
export interface IHandleFeedbackRes {}

// 删除反馈请求参数
export interface IDeleteFeedbackReq {
  id: number
}

// 删除反馈响应
export interface IDeleteFeedbackRes {}

// 反馈类型枚举
export enum FeedbackType {
  BUG_REPORT = 1, // 错误报告
  FEATURE_REQUEST = 2, // 功能请求
  GENERAL_FEEDBACK = 3, // 一般反馈
  COMPLAINT = 4, // 投诉建议
  OTHER = 5 // 其他
}

// 反馈状态枚举
export enum FeedbackStatus {
  PENDING = 1, // 待处理
  IN_PROGRESS = 2, // 处理中
  RESOLVED = 3, // 已解决
  REJECTED = 4, // 已拒绝
  CLOSED = 5 // 已关闭
}
