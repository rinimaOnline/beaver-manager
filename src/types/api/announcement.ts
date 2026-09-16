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

/** 公告类型：只影响弹窗上的角标文案，不影响展示逻辑 */
export const ANNOUNCEMENT_TYPE = {
  NOTICE: 0,
  NOTIFY: 1,
  ACTIVITY: 2
} as const

export const ANNOUNCEMENT_TYPE_LABELS: Record<number, string> = {
  [ANNOUNCEMENT_TYPE.NOTICE]: "公告",
  [ANNOUNCEMENT_TYPE.NOTIFY]: "通知",
  [ANNOUNCEMENT_TYPE.ACTIVITY]: "活动"
}

/**
 * 内容形态。纯图片时正文可空，纯文字时图片可空。
 * RICH 的正文按 Markdown 渲染，图片是可选题图（Markdown 里本来就能内嵌图）。
 */
export const ANNOUNCEMENT_CONTENT = {
  TEXT: 0,
  IMAGE: 1,
  BOTH: 2,
  RICH: 3
} as const

export const ANNOUNCEMENT_CONTENT_LABELS: Record<number, string> = {
  [ANNOUNCEMENT_CONTENT.TEXT]: "纯文字",
  [ANNOUNCEMENT_CONTENT.IMAGE]: "纯图片",
  [ANNOUNCEMENT_CONTENT.BOTH]: "图文",
  [ANNOUNCEMENT_CONTENT.RICH]: "富文本"
}

/** 触发时机，判定全在服务端做 */
export const ANNOUNCEMENT_TRIGGER = {
  NEW_DEVICE: 0,
  EVERY_LAUNCH: 1,
  DAILY: 2,
  ONCE: 3
} as const

export const ANNOUNCEMENT_TRIGGER_LABELS: Record<number, string> = {
  [ANNOUNCEMENT_TRIGGER.NEW_DEVICE]: "新设备首次登录",
  [ANNOUNCEMENT_TRIGGER.EVERY_LAUNCH]: "每次进入 App",
  [ANNOUNCEMENT_TRIGGER.DAILY]: "每天首次进入",
  [ANNOUNCEMENT_TRIGGER.ONCE]: "只弹一次"
}

/**
 * 投放人群。默认全员；圈了人群的公告**只发移动端**——目前唯一的「未实名」对应的
 * 实名入口只在手机上，弹到桌面端用户也没地方去。
 */
export const ANNOUNCEMENT_AUDIENCE = {
  ALL: 0,
  UNVERIFIED: 1
} as const

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<number, string> = {
  [ANNOUNCEMENT_AUDIENCE.ALL]: "全员",
  [ANNOUNCEMENT_AUDIENCE.UNVERIFIED]: "未实名用户"
}

/**
 * 弹出位置。launch 是通配：配了它就哪一页都能弹，所以和具体页面互斥。
 *
 * 这里配的位置**只对移动端生效**。桌面端没有发现/我这些 tab，按位置筛会让那些
 * 公告在桌面端永远不出现，所以桌面端一律忽略位置、进 App 就把该弹的都弹了。
 */
export const ANNOUNCEMENT_PAGES = [
  { value: "launch", label: "不限页面（进 App 就弹）" },
  { value: "chat", label: "会话列表" },
  { value: "contact", label: "通讯录" },
  { value: "discover", label: "发现" },
  { value: "mine", label: "我" }
] as const

export const ANNOUNCEMENT_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1
} as const

/**
 * 列表筛选「只要草稿」的哨兵值。
 * 和工作台同一套约定：服务端 status=0 与「未传」分不开，筛草稿时传 -1。
 */
export const ANNOUNCEMENT_STATUS_FILTER_DRAFT = -1

export interface IAnnouncementItem {
  announcementId: string
  title: string
  content: string
  imageUrl: string
  /** 顶部图标，空则客户端显示类型角标 */
  iconUrl: string
  /** 图片原始宽高，客户端靠它在图没下完时按真实比例撑骨架位。0=未知 */
  imageWidth: number
  imageHeight: number
  contentType: number
  type: number
  /** 逗号分隔的弹出位置 */
  pages: string
  trigger: number
  /** 投放人群 0全员 1未实名。非全员只发移动端 */
  audience: number
  buttonText: string
  linkUrl: string
  startTime: string
  endTime: string
  sort: number
  status: number
  remark: string
  /** 已点过确认按钮的人数，只下发没确认的不算 */
  confirmedCount: number
  createdBy: string
  lastModifiedBy: string
  createdAt: string
  updatedAt: string
}

export interface IGetAnnouncementListReq {
  page?: number
  pageSize?: number
  /** 1 已发布；ANNOUNCEMENT_STATUS_FILTER_DRAFT(-1) 只要草稿；不传不过滤 */
  status?: number
  type?: number
  keywords?: string
}

export interface IGetAnnouncementListRes {
  total: number
  list: IAnnouncementItem[]
}

export interface IGetAnnouncementRes {
  detail: IAnnouncementItem
}

export interface ICreateAnnouncementReq {
  title: string
  content?: string
  imageUrl?: string
  iconUrl?: string
  imageWidth?: number
  imageHeight?: number
  contentType?: number
  type?: number
  pages?: string
  trigger?: number
  audience?: number
  buttonText?: string
  linkUrl?: string
  startTime?: string
  endTime?: string
  sort?: number
  status?: number
  remark?: string
}

export interface ICreateAnnouncementRes {
  announcementId: string
}

export interface IUpdateAnnouncementReq {
  announcementId: string
  title?: string
  content?: string
  imageUrl?: string
  iconUrl?: string
  imageWidth?: number
  imageHeight?: number
  contentType?: number
  type?: number
  pages?: string
  trigger?: number
  audience?: number
  buttonText?: string
  linkUrl?: string
  /** 传空串清空生效时间 */
  startTime?: string
  endTime?: string
  sort?: number
  status?: number
  remark?: string
}
