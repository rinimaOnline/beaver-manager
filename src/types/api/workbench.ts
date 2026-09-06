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

export interface IWorkbenchEntryConfig {
  /** 0 路由 key，1 H5 地址 */
  type: number
  pc?: string
  mobile?: string
}

export interface IWorkbenchAppItem {
  workbenchAppId: string
  name: string
  description: string
  icon: string
  appType: number
  clientScope: number
  entryConfig: IWorkbenchEntryConfig
  openMode: number
  category: number
  sort: number
  status: number
  remark: string
  createdBy: string
  lastModifiedBy: string
  createdAt: string
  updatedAt: string
}

/**
 * 列表筛选"只要下架"的哨兵值。
 * 服务端 status=0 与"未传"无法区分，筛选下架（status=0）时传 -1，服务端翻译为 WHERE status = 0。
 * 仅用于筛选参数，不影响列表行里 status 的显示（仍是 0 下架 / 1 上架）。
 */
export const WORKBENCH_STATUS_FILTER_OFFLINE = -1

export interface IGetWorkbenchAppListReq {
  page?: number
  pageSize?: number
  status?: number // 1 上架；WORKBENCH_STATUS_FILTER_OFFLINE(-1) 只要下架；不传不过滤
  category?: number
  keywords?: string
}

export interface IGetWorkbenchAppListRes {
  total: number
  list: IWorkbenchAppItem[]
}

export interface ICreateWorkbenchAppReq {
  name: string
  description?: string
  icon?: string
  appType?: number
  clientScope?: number
  entryConfig: IWorkbenchEntryConfig
  openMode?: number
  category?: number
  sort?: number
  status?: number
  remark?: string
}

export interface ICreateWorkbenchAppRes {
  workbenchAppId: string
}

export interface IUpdateWorkbenchAppReq {
  workbenchAppId: string
  name?: string
  description?: string
  icon?: string
  appType?: number
  clientScope?: number
  entryConfig?: IWorkbenchEntryConfig
  openMode?: number
  category?: number
  sort?: number
  status?: number
  remark?: string
}

export interface IDeleteWorkbenchAppReq {
  workbenchAppId: string
}
