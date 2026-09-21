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

import type { IVersionInfo } from '@/types/api/update'

export interface IVersionForm {
  architectureId: number
  version: string
  fileUrl: string
  description: string
  releaseNotes: string
  releaseDate: string
  /**
   * 安装包校验值与体积。客户端下载完拿它比对，防止装到半截或被掉包的包。
   * 上传时算不出来就留空 / 0，发版照常，只是这一版不带校验。
   */
  md5: string
  sha256: string
  size: number
}

export interface IVersionState {
  loading: boolean
  dialogVisible: boolean
  deleteDialogVisible: boolean
  dialogTitle: string
  currentPage: number
  pageSize: number
  total: number
  tableData: IVersionInfo[]
  apps: Array<{
    appId: string
    name: string
  }>
  architectures: Array<{
    id: number
    archId: number
  }>
  selectedAppId: string
  selectedArchId: number
  form: IVersionForm
  toDeleteVersion: IVersionInfo | null
} 