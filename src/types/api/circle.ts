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

export interface CircleInfo {
  circleId: string
  name: string
  description: string
  avatar: string
  creatorId: string
  joinType: number
  memberCount: number
  postCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface GetCircleListReq {
  page?: number
  limit?: number
  userId?: string
  keywords?: string
  circleId?: string
}

export interface GetCircleListRes {
  list: CircleInfo[]
  total: number
}

export interface GetCircleDetailRes extends CircleInfo {}

export interface DeleteCircleRes {}

export interface CircleMemberInfo {
  circleId: string
  userId: string
  nickName: string
  role: number
}

export interface GetCircleMemberListReq {
  page?: number
  limit?: number
  circleId: string
}

export interface GetCircleMemberListRes {
  list: CircleMemberInfo[]
  total: number
}

export interface RemoveCircleMemberReq {
  circleId: string
  memberIds: string[]
}

export interface RemoveCircleMemberRes {}

export interface CirclePostInfo {
  postId: string
  circleId: string
  userId: string
  content: string
  isDeleted: boolean
  commentCount: number
  likeCount: number
  createdAt: string
}

export interface GetCirclePostListReq {
  page?: number
  limit?: number
  circleId: string
}

export interface GetCirclePostListRes {
  list: CirclePostInfo[]
  total: number
}

export interface DeleteCirclePostRes {}

export interface CircleCommentInfo {
  commentId: string
  postId: string
  userId: string
  content: string
  isDeleted: boolean
  createdAt: string
}

export interface GetCircleCommentListReq {
  page?: number
  limit?: number
  postId: string
}

export interface GetCircleCommentListRes {
  list: CircleCommentInfo[]
  total: number
}

export interface DeleteCircleCommentRes {}
