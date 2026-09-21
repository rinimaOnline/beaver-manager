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

/** 投放范围：0 定向（写收件箱）1 全员广播（只写事件，客户端按已读游标算未读） */
export const NotificationScope = {
  targeted: 0,
  broadcast: 1
} as const

export interface ISendSystemNotificationReq {
  title: string
  content: string
  linkUrl?: string
  scope?: number
  /** 定向收件人；scope=1 时忽略。一次最多 500 人 */
  userIds?: string[]
}

export interface ISendSystemNotificationRes {
  eventId: string
  recipients: number
}

export interface ISystemNotificationItem {
  eventId: string
  eventType: string
  title: string
  content: string
  linkUrl: string
  scope: number
  /** 1 有效 2 已撤回 */
  status: number
  recipients: number
  createdBy: string
  createdAt: string
}

export interface IGetSystemNotificationListReq {
  page?: number
  pageSize?: number
  keywords?: string
}

export interface IGetSystemNotificationListRes {
  total: number
  list: ISystemNotificationItem[]
}

export interface INotificationTemplatePlaceholder {
  key: string
  desc: string
}

export interface INotificationTemplateItem {
  code: string
  name: string
  desc: string
  placeholders: INotificationTemplatePlaceholder[]
  title: string
  content: string
  linkUrl: string
  enabled: boolean
  popup: boolean
  /** 还没被运营改过，用的是代码里的缺省文案 */
  isDefault: boolean
  updatedBy: string
  updatedAt: string
}

export interface IGetNotificationTemplatesRes {
  list: INotificationTemplateItem[]
}

export interface ISaveNotificationTemplateReq {
  code: string
  title: string
  content: string
  linkUrl?: string
  enabled?: boolean
  popup?: boolean
}
