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

export interface IModerationCaseInfo {
  id: number
  caseNo: string
  source: number
  sourceId: number
  targetType: number
  targetId: string
  title: string
  description: string
  priority: number
  status: number
  handlerId: string
  handleRemark: string
  handleTime: string
  createdAt: string
}

export interface IGetModerationCaseListReq {
  page?: number
  pageSize?: number
  status?: number
  targetType?: number
  keyword?: string
}

export interface IGetModerationCaseListRes {
  list: IModerationCaseInfo[]
  total: number
}

export interface IGetModerationCaseDetailRes {
  case: IModerationCaseInfo
}

export interface ICaseContextUser {
  userId: string
  nickName: string
  email: string
  status: number
}

export interface ICaseContextMessage {
  messageId: string
  conversationId: string
  sendUserId: string
  sendUserName: string
  msgPreview: string
  isDeleted: boolean
  createTime: string
}

export interface ICaseContextMoment {
  momentId: string
  userId: string
  content: string
}

export interface ICaseContextGroup {
  groupId: string
  title: string
  status: number
}

export interface IGetModerationCaseContextRes {
  case: IModerationCaseInfo
  targetUser?: ICaseContextUser
  targetMessage?: ICaseContextMessage
  targetMoment?: ICaseContextMoment
  targetGroup?: ICaseContextGroup
  relatedReports: IContentReportInfo[]
  recentMessages: ICaseContextMessage[]
}

export interface ICreateModerationCaseReq {
  targetType: number
  targetId: string
  title: string
  description?: string
  priority?: number
}

export interface ICreateModerationCaseRes {
  caseId: number
  caseNo: string
}

export interface IModerationControlAction {
  action: string
  target?: string
  reason?: string
  extra?: string
}

export interface IHandleModerationCaseReq {
  id: number
  status: number
  handleRemark?: string
  actions?: IModerationControlAction[]
}

export interface IOperationLogInfo {
  id: number
  operatorId: string
  action: string
  targetType: string
  targetId: string
  caseId: number
  detail: string
  result: string
  errorMessage: string
  createdAt: string
}

export interface IGetOperationLogListReq {
  page?: number
  pageSize?: number
  operatorId?: string
  action?: string
  actions?: string
  targetType?: string
  targetId?: string
  caseId?: number
}

export interface IGetOperationLogListRes {
  list: IOperationLogInfo[]
  total: number
}

export interface ISensitiveWordInfo {
  id: number
  word: string
  category: string
  level: number
  isActive: boolean
  remark: string
  createdAt: string
}

/**
 * isActive 在服务端是非指针 bool：只有传 true 时才会附加 is_active = true 条件，
 * 传 false 等于不筛选。所以这里只能表达「全部」和「仅启用」，没有「仅停用」。
 */
export interface IGetSensitiveWordListReq {
  page?: number
  pageSize?: number
  keyword?: string
  isActive?: boolean
}

export interface IGetSensitiveWordListRes {
  list: ISensitiveWordInfo[]
  total: number
}

export interface ICreateSensitiveWordReq {
  word: string
  category?: string
  level?: number
  remark?: string
}

export interface ICreateSensitiveWordRes {
  id: number
}

export interface IUpdateSensitiveWordReq {
  id: number
  word?: string
  category?: string
  level?: number
  isActive: boolean
  remark?: string
}

export interface IDeleteSensitiveWordReq {
  id: number
}
