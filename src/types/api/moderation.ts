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

export interface IExecuteUserControlRes {}

export interface IExecuteUserControlReq {
  userId: string
  action: string
  reason?: string
  caseId?: number
}

export interface IContentReportInfo {
  id: number
  reporterUserId: string
  reporterName: string
  targetType: number
  targetId: string
  reasonType: number
  content: string
  status: number
  caseId: number
  createdAt: string
}

export interface IGetContentReportListReq {
  page?: number
  pageSize?: number
  status?: number
  targetType?: number
  targetId?: string
}

export interface IGetContentReportListRes {
  list: IContentReportInfo[]
  total: number
}

export interface IEscalateContentReportReq {
  reportId: number
  priority?: number
}

export interface IEscalateContentReportRes {
  caseId: number
  caseNo: string
}

export interface IRejectContentReportReq {
  reportId: number
  handleRemark?: string
}
