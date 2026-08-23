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

import { PlatformTypes, ArchTypes } from '@/utils/constants/platform'

// 应用信息
export interface IAppInfo {
  id: number
  name: string
  appId: string
  description: string
  developer: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// 架构信息
export interface IArchitectureInfo {
  id: number
  appId: string
  platform: keyof typeof PlatformTypes
  architecture: keyof typeof ArchTypes
  description: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// 版本信息
export interface IVersionInfo {
  versionId: number
  architectureId: number
  version: string
  buildNumber: number
  downloadUrl: string
  description: string
  releaseNotes: string
  releaseDate: string
  size: number
  md5: string
  createdAt: string
  updatedAt: string
}

// 发布策略信息
export interface IReleaseStrategyInfo {
  strategyId: number
  name: string
  versionId: number
  priority: number
  startTime: string
  endTime: string | null
  regions: string
  forceUpdate: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IVersionForm {
  architectureId: number
  version: string
  fileName: string
  description: string
  releaseNotes: string
  releaseDate: string
}

export interface IVersionTableData extends IVersionInfo {
  appName?: string
  architectureName?: string
} 