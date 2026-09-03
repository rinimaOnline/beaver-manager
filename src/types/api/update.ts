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

// App Management
export interface IAddAppReq {
  name: string
  description?: string
}

export interface IAddAppRes {
  id: number
  appId: string
}

export interface IGetAppsReq {
  page?: number
  pageSize?: number
  isActive?: boolean
}

export interface IAppInfo {
  id: number
  appId: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IGetAppsRes {
  total: number
  apps: IAppInfo[]
}

// Architecture Management
export interface IAddArchitectureReq {
  appId: string
  platformId: number
  archId: number
  description?: string
}

export interface IAddArchitectureRes {
  id: number
}

export interface IUpdateArchitectureReq {
  id: number
  description?: string
  isActive?: boolean
}

export interface IArchitectureInfo {
  id: number
  appId: string
  appName: string
  platformId: number
  archId: number
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IGetArchitecturesReq {
  appId?: string
  page?: number
  pageSize?: number
  isActive?: boolean
}

export interface IGetArchitecturesRes {
  total: number
  architectures: IArchitectureInfo[]
}

// Version Management
export interface IAddVersionReq {
  architectureId: number
  version: string
  fileUrl: string
  description?: string
  releaseNotes?: string
}

export interface IAddVersionRes {
  versionId: number
}

export interface IVersionInfo {
  versionId: number
  architectureId: number
  version: string
  fileUrl: string
  description: string
  releaseNotes: string
  releaseDate: string
  createdAt: string
  updatedAt: string
}

export interface IGetVersionListReq {
  architectureId: number
  appId?: string
  page?: number
  pageSize?: number
}

export interface IGetVersionListRes {
  total: number
  versions: IVersionInfo[]
}

// Release Policy
export interface IUpsertReleasePolicyReq {
  appId: string
  architectureId: number
  stableVersionId: number
  grayVersionId?: number
  rolloutPercent: number
  minVersion?: string
  forceUpdate?: boolean
  isActive?: boolean
}

export interface IUpsertReleasePolicyRes {
  id: number
}

export interface IReleasePolicyItem {
  id: number
  appId: string
  architectureId: number
  stableVersionId: number
  grayVersionId: number
  rolloutPercent: number
  minVersion: string
  forceUpdate: boolean
  isActive: boolean
  stableVersion: string
  grayVersion: string
  createdAt: string
  updatedAt: string
}

export interface IGetReleasePoliciesReq {
  appId: string
}

export interface IGetReleasePoliciesRes {
  policies: IReleasePolicyItem[]
}

// Upload File
export interface IUploadFileRes {
  fileName: string
} 