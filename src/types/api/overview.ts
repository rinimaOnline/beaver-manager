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

export interface IDashboardOverview {
  userTotal: number
  groupTotal: number
  friendTotal: number
  messageTotal: number
  momentTotal: number
  blockTotal: number
  pendingDeveloperCount: number
  pendingAppCount: number
  pendingFeedbackCount: number
  pendingReportCount: number
  pendingCaseCount: number
  onlineUserCount: number
}

export interface IDashboardInboxItem {
  category: string
  title: string
  summary: string
  entityId: string
  createdAt: string
  action: string
}

export interface IGetDashboardInboxReq {
  limit?: number
}

export interface IGetDashboardInboxRes {
  list: IDashboardInboxItem[]
  total: number
}

export interface IDashboardTrendSeries {
  key: string
  label: string
  values: number[]
}

export interface IDashboardTrends {
  days: string[]
  series: IDashboardTrendSeries[]
}

export interface IGetDashboardTrendsReq {
  days?: number
}
