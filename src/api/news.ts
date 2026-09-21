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

import type {
  ICreateNewsChannelReq,
  ICreateNewsChannelRes,
  ICreateNewsReq,
  ICreateNewsRes,
  IGetNewsChannelListReq,
  IGetNewsChannelListRes,
  IGetNewsListReq,
  IGetNewsListRes,
  IGetNewsRes,
  IUpdateNewsChannelReq,
  IUpdateNewsReq
} from "@/types/api/news"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// -------------------- 频道 --------------------

export function getNewsChannelListApi(params: IGetNewsChannelListReq = {}) {
  return ajax<IGetNewsChannelListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/news/v1/channel/list`,
    params
  })
}

export function createNewsChannelApi(data: ICreateNewsChannelReq) {
  return ajax<ICreateNewsChannelRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/news/v1/channel/create`,
    data
  })
}

export function updateNewsChannelApi(data: IUpdateNewsChannelReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/news/v1/channel/update`,
    data
  })
}

export function deleteNewsChannelApi(channelId: string) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/news/v1/channel/delete`,
    data: { channelId }
  })
}

// -------------------- 文章 --------------------

export function getNewsListApi(params: IGetNewsListReq) {
  return ajax<IGetNewsListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/news/v1/list`,
    params
  })
}

/** 打开编辑弹窗时单独拉一次：列表接口不回正文 */
export function getNewsApi(articleId: string) {
  return ajax<IGetNewsRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/news/v1/detail`,
    params: { articleId }
  })
}

export function createNewsApi(data: ICreateNewsReq) {
  return ajax<ICreateNewsRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/news/v1/create`,
    data
  })
}

export function updateNewsApi(data: IUpdateNewsReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/news/v1/update`,
    data
  })
}

export function deleteNewsApi(articleId: string) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/news/v1/delete`,
    data: { articleId }
  })
}
