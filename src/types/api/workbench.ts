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

export interface IGetWorkbenchAppListReq {
  page?: number
  pageSize?: number
  status?: number
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
