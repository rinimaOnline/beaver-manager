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

/**
 * 内容形态。
 *
 * 富文本正文按 **Markdown** 存，不是 HTML —— 和运营公告同一个决定：两端已有现成的
 * 渲染器和净化规则（移动端 flutter_markdown、桌面端 marked + DOMPurify），
 * 不为新闻引新依赖，也不自己做一遍 HTML 净化。
 *
 * 纯外链没有站内正文，客户端点了直接开链接（移动端内嵌 webview，桌面端系统浏览器）。
 */
export const NEWS_CONTENT = {
  RICH: 0,
  LINK: 1
} as const

export const NEWS_CONTENT_LABELS: Record<number, string> = {
  [NEWS_CONTENT.RICH]: "富文本",
  [NEWS_CONTENT.LINK]: "纯外链"
}

/** 列表里封面的版式，逐条挑，像腾讯新闻那样混排 */
export const NEWS_COVER = {
  SMALL: 0,
  LARGE: 1,
  NONE: 2
} as const

export const NEWS_COVER_LABELS: Record<number, string> = {
  [NEWS_COVER.SMALL]: "右侧小图",
  [NEWS_COVER.LARGE]: "宽幅大图",
  [NEWS_COVER.NONE]: "无图"
}

export const NEWS_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1
} as const

/**
 * 列表筛选「只要草稿 / 只要下架」的哨兵值。
 * 和公告、工作台同一套约定：服务端 status=0 与「未传」分不开，筛草稿时传 -1。
 */
export const NEWS_STATUS_FILTER_DRAFT = -1

// -------------------- 频道 --------------------

export interface INewsChannelItem {
  channelId: string
  name: string
  sort: number
  status: number
  /** 频道下文章数（含草稿）。删频道前看它：还有文章时服务端会拒绝删除 */
  articleCount: number
  createdBy: string
  lastModifiedBy: string
  createdAt: string
  updatedAt: string
}

export interface IGetNewsChannelListReq {
  status?: number
}

export interface IGetNewsChannelListRes {
  total: number
  list: INewsChannelItem[]
}

export interface ICreateNewsChannelReq {
  name: string
  sort?: number
  status?: number
}

export interface ICreateNewsChannelRes {
  channelId: string
}

export interface IUpdateNewsChannelReq {
  channelId: string
  name?: string
  sort?: number
  status?: number
}

// -------------------- 文章 --------------------

/** 列表项不带正文，正文在 detail 里（富文本能有几千字，列表上一个字都不显示） */
export interface INewsArticleItem {
  articleId: string
  channelId: string
  channelName: string
  title: string
  summary: string
  source: string
  coverUrl: string
  coverLayout: number
  contentType: number
  linkUrl: string
  isTop: boolean
  sort: number
  status: number
  /** 发布时间，草稿为空 */
  publishedAt: string
  remark: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface INewsArticleDetail extends INewsArticleItem {
  content: string
  /** 封面原始宽高，客户端靠它在图没下完时按真实比例撑骨架位。0=未知 */
  coverWidth: number
  coverHeight: number
  lastModifiedBy: string
}

export interface IGetNewsListReq {
  page?: number
  pageSize?: number
  channelId?: string
  status?: number
  keywords?: string
}

export interface IGetNewsListRes {
  total: number
  list: INewsArticleItem[]
}

export interface IGetNewsRes {
  detail: INewsArticleDetail
}

export interface ICreateNewsReq {
  channelId: string
  title: string
  summary?: string
  source?: string
  coverUrl?: string
  coverWidth?: number
  coverHeight?: number
  coverLayout?: number
  contentType?: number
  content?: string
  linkUrl?: string
  isTop?: boolean
  sort?: number
  status?: number
  /** 留空且直接按已发布保存时，服务端补当前时间 */
  publishedAt?: string
  remark?: string
}

export interface ICreateNewsRes {
  articleId: string
}

export interface IUpdateNewsReq {
  articleId: string
  channelId?: string
  title?: string
  summary?: string
  source?: string
  coverUrl?: string
  coverWidth?: number
  coverHeight?: number
  coverLayout?: number
  contentType?: number
  content?: string
  linkUrl?: string
  isTop?: boolean
  sort?: number
  status?: number
  publishedAt?: string
  remark?: string
}
