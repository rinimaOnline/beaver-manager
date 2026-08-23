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

// 文件信息
export interface FileInfo {
  url: string
  type: string
}

// 动态信息
export interface MomentInfo {
  momentId: string
  userId: string
  content: string
  files: FileInfo[]
  isDeleted: boolean
  visibility: number
  location: string
  commentCount: number
  likeCount: number
  createdAt: string
  updatedAt: string
}

// 动态评论信息
export interface MomentCommentInfo {
  id: number
  momentId: number
  userId: string
  content: string
  createdAt: string
  updatedAt: string
}

// 动态举报信息
export interface MomentReportInfo {
  id: number
  userId: string
  momentId: number
  reason: string
  images: FileInfo[]
  status: number
  createdAt: string
  updatedAt: string
}

// 获取动态列表请求
export interface GetMomentListReq {
  page?: number
  limit?: number
  userId?: string
  visibility?: number
  keywords?: string
}

// 获取动态列表响应
export interface GetMomentListRes {
  list: MomentInfo[]
  total: number
}

// 获取动态详情请求
export interface GetMomentDetailReq {
  id: number
}

// 获取动态详情响应
export interface GetMomentDetailRes extends MomentInfo {}

// 删除动态请求
export interface DeleteMomentReq {
  id: number
}

// 删除动态响应
export interface DeleteMomentRes {}

// 获取动态评论列表请求
export interface GetMomentCommentListReq {
  page?: number
  limit?: number
  momentId: number
}

// 获取动态评论列表响应
export interface GetMomentCommentListRes {
  list: MomentCommentInfo[]
  total: number
}

// 删除动态评论请求
export interface DeleteMomentCommentReq {
  id: number
}

// 删除动态评论响应
export interface DeleteMomentCommentRes {}

// 获取动态举报列表请求
export interface GetMomentReportListReq {
  page?: number
  limit?: number
  status?: number
  momentId?: number
}

// 获取动态举报列表响应
export interface GetMomentReportListRes {
  list: MomentReportInfo[]
  total: number
}

// 处理动态举报请求
export interface HandleMomentReportReq {
  id: number
  status: number
}

// 处理动态举报响应
export interface HandleMomentReportRes {}

// 可见性枚举
export enum VisibilityType {
  PUBLIC = 0, // 公开
  FRIENDS = 1, // 仅好友可见
  PRIVATE = 2 // 仅自己可见
}

// 举报状态枚举
export enum ReportStatus {
  PENDING = 0, // 待处理
  HANDLED = 1, // 已处理
  REJECTED = 2 // 已驳回
}
