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

export interface ImageSize {
  height: number //宽度
  width: number //高度
}

export interface AliOptions {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  bucket: string
  region: string
}

export interface UploadInfo {
  height?: number //图片的高度
  width?: number //图片的宽度
  md5: string //md5
  name: string //名字
  size: number //文件大小
  rate?: number
  sampleCount?: number
  ext: string //后缀名
  duration: number //音频时常
  filePath: string //文件路径
}

export interface UploadOss {
  file: File //文件
  path: string //上传的路径
  fileName?: string //文件名字，如果没有默认为该文件的md5
  argument?: any //自定义参数
  filePath?: string //文件路径
}

export interface AliUploadOss extends UploadOss {
  options: AliOptions //ali oss数据
}

export interface QiNiuUploadOss extends UploadOss {
  token: string //凭证
}