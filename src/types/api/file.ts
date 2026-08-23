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

// 文件信息
export interface IFileInfo {
  id: number
  fileName: string
  originalName: string
  size: number
  path: string
  md5: string
  type: string
  createdAt: string
  updatedAt: string
}

// 文件上传响应
export interface IUploadFileRes {
  fileName: string
  size: number
  path: string
  hash: string
  type: string
}

// 文件列表请求
export interface IGetFileListReq {
  page?: number
  limit?: number
  type?: string
  keywords?: string
}

// 文件列表响应
export interface IGetFileListRes {
  total: number
  list: IFileInfo[]
}

// 获取文件详情请求参数
export interface IGetFileDetailReq {
  id: number
}

// 获取文件详情响应
export interface IGetFileDetailRes extends IFileInfo {}

// 删除文件请求参数
export interface IDeleteFileReq {
  id: number
}

// 删除文件响应
export interface IDeleteFileRes {}

// 批量删除文件请求参数
export interface IBatchDeleteFileReq {
  ids: number[]
}

// 批量删除文件响应
export interface IBatchDeleteFileRes {}

// 文件类型枚举
export enum FileType {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  OTHER = "other"
}
