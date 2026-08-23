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

import { uploadFileApi } from '@/api/file'
import { getAudioInfo, getFileType, getImageAttribute, getVideoInfo } from '@/utils/tools'

// 上传文件类型
export type UploadFileType = 'image' | 'video' | 'audio' | 'file'

// 上传结果的基础结构
export interface UploadResult {
  fileUrl: string
  style: UploadStyle
  type: UploadFileType
  originalName?: string
  size?: number
  thumbnailKey?: string // 视频封面图文件ID（仅视频类型）
}

// 不同类型文件的样式信息
export interface UploadStyle {
  // 图片和视频共有
  width?: number
  height?: number
  // 视频和音频共有
  duration?: number
}

/**
 * @description: 将base64图片转换为File对象
 */
const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}


/**
 * @description: 根据文件类型获取样式信息
 */
const getFileStyle = async (file: File, type: UploadFileType): Promise<UploadStyle> => {
  switch (type) {
    case 'image': {
      const imageInfo = await getImageAttribute(file)
      return {
        width: imageInfo.width,
        height: imageInfo.height,
      }
    }

    case 'video': {
      const videoInfo = await getVideoInfo(file)
      return {
        width: videoInfo.width,
        height: videoInfo.height,
        duration: videoInfo.duration,
      }
    }

    case 'audio': {
      const audioInfo = await getAudioInfo(file)
      return {
        duration: audioInfo.duration,
      }
    }

    case 'file':
    default:
      return {}
  }
}

/**
 * @description: 选择文件（统一入口）
 * @param accept 接受的文件类型，例如 'image/*', 'video/*', 'audio/*'，不传则允许所有文件
 * @param multiple 是否支持多选，默认 false
 * @returns Promise<File[]>
 */
const selectFile = (accept?: string, multiple: boolean = false): Promise<File[]> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = multiple
    if (accept) {
      input.accept = accept
    }

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        resolve(Array.from(target.files))
      }
      else {
        resolve([])
      }
    }

    input.oncancel = () => {
      resolve([])
    }

    input.click()
  })
}

/**
 * @description: 统一的文件上传方法
 * @param file 要上传的文件
 * @returns Promise<UploadResult>
 */
export const uploadFile = async (file: File): Promise<UploadResult> => {
  // 自动检测文件类型
  const detectedType = getFileType(file.type)
  const fileType: UploadFileType = detectedType === 'other' ? 'file' : detectedType as UploadFileType

  // 先上传文件
  const uploadResult = await uploadFileApi(file)

  // 根据类型获取样式信息
  const style = await getFileStyle(file, fileType)

  return {
    fileUrl: uploadResult.fileUrl,
    style,
    type: fileType,
    originalName: uploadResult.originalName,
    size: file.size,
  }
}


/**
 * @description: 选择并上传文件（统一入口，支持多选）
 * @param accept 接受的文件类型，例如 'image/*', 'video/*', 'audio/*'，不传则允许所有文件
 * @param multiple 是否支持多选，默认 false
 * @returns Promise<UploadResult[]> 返回上传结果数组
 */
export const selectAndUploadFile = async (accept?: string, multiple: boolean = false): Promise<UploadResult[]> => {
  const files = await selectFile(accept, multiple)
  if (files.length === 0) {
    return []
  }

  // 并发上传所有文件
  const uploadPromises = files.map(file => uploadFile(file))
  return Promise.all(uploadPromises)
}
