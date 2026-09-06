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

import BMF from 'browser-md5-file'
import type { ImageSize } from '@/types/utils/upload'
import config from '@/config/env'

/**
 * @description: 获取文件的md5
 * @param {File} file
 * @return {*}
 */
export const getMd5 = (file: File): Promise<string> => {
  const bmf = new BMF()
  return new Promise((resolve, reject) => {
    bmf.md5(file, (err, md5) => {
      if (err || !md5) {
        return reject(new Error(err || '计算文件 MD5 失败'))
      }
      resolve(md5)
    })
  })
}

/**
 * @description: 获取图片的宽度和高度
 * @param {File} file
 * @return {Promise<ImageSize>}
 */
export const getImageAttribute = (file: File): Promise<ImageSize> => {
  return new Promise((resolve) => {
    let reader = new FileReader()
    reader.onload = function (e: ProgressEvent<FileReader>) {
      let result = e.target?.result
      let img: HTMLImageElement = document.createElement('img')
      img.src = result as string
      img.onload = function () {
        resolve({
          width: img.width,
          height: img.height
        })
      }
    }
    reader.onerror = function () {
      resolve({ width: 0, height: 0 })
    }
    reader.readAsDataURL(file)
  })
}

/**
 * @description: 获取音频文件的详细信息
 * @param {File} file
 * @return {Promise<{ duration: number }>}
 */
export const getAudioInfo = (file: File): Promise<{ duration: number }> => {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)

    audio.addEventListener('loadedmetadata', () => {
      resolve({
        duration: Math.round(audio.duration),
      })
      URL.revokeObjectURL(url)
    })

    audio.addEventListener('error', () => {
      resolve({ duration: 0 })
      URL.revokeObjectURL(url)
    })

    audio.src = url
  })
}

/**
 * @description: 获取视频文件的详细信息
 * @param {File} file
 * @return {Promise<{ width: number; height: number; duration: number }>}
 */
export const getVideoInfo = (file: File): Promise<{ width: number; height: number; duration: number }> => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.addEventListener('loadedmetadata', () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.round(video.duration),
      })
      URL.revokeObjectURL(url)
    })

    video.addEventListener('error', () => {
      resolve({ width: 0, height: 0, duration: 0 })
      URL.revokeObjectURL(url)
    })

    video.src = url
  })
}

/**
 * @description: 判断当前文件的类型
 * @param {string} mimeType
 * @return {string} 'audio' | 'image' | 'video' | 'other'
 */
export const fileType = (mimeType: string): string => {
  if (mimeType.includes('audio')) {
    return 'audio'
  } else if (mimeType.includes('image')) {
    return 'image'
  } else if (mimeType.includes('video')) {
    return 'video'
  } else {
    return 'other'
  }
}

/**
 * @description: 获取文件类型（更详细的版本）
 * @param {string} mimeType
 * @return {'audio' | 'image' | 'video' | 'other'}
 */
export const getFileType = (mimeType: string): 'audio' | 'image' | 'video' | 'other' => {
  if (mimeType.includes('audio')) {
    return 'audio'
  } else if (mimeType.includes('image')) {
    return 'image'
  } else if (mimeType.includes('video')) {
    return 'video'
  } else {
    return 'other'
  }
}

// 文件信息类型
interface FileInfo {
  type: string
  imageFile?: ImageSize
  audioFile?: { duration: number }
  videoFile?: { width: number; height: number; duration: number }
}

/**
 * @description: 获取文件的完整信息（根据类型返回对应信息）
 * @param {File} file
 * @return {Promise<FileInfo>}
 */
export const getFileInfo = async (file: File): Promise<FileInfo> => {
  const fileType = getFileType(file.type)

  switch (fileType) {
    case 'image': {
      const imageInfo = await getImageAttribute(file)
      return { type: fileType, imageFile: imageInfo }
    }

    case 'audio': {
      const audioInfo = await getAudioInfo(file)
      return { type: fileType, audioFile: audioInfo }
    }

    case 'video': {
      const videoInfo = await getVideoInfo(file)
      return { type: fileType, videoFile: videoInfo }
    }

    default:
      return { type: fileType }
  }
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic']
const VIDEO_EXTS = ['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv', '3gp']
const AUDIO_EXTS = ['mp3', 'aac', 'wav', 'm4a', 'ogg', 'amr', 'flac']

/**
 * @description: 按文件名扩展名判断类型（服务端多数接口只回文件 key，没有 MIME）
 * @param {string} fileName 文件 key 或文件名
 * @return {'audio' | 'image' | 'video' | 'other'}
 */
export const getFileTypeByName = (fileName: string): 'audio' | 'image' | 'video' | 'other' => {
  const ext = (fileName || '').split(/[?#]/)[0].split('.').pop()?.toLowerCase() || ''
  if (IMAGE_EXTS.includes(ext)) return 'image'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  if (AUDIO_EXTS.includes(ext)) return 'audio'
  return 'other'
}

/**
 * @description: 把服务端返回的文件 key 拼成可访问的预览 URL（file_api `/api/file/preview/:fileKey`，网关放行无需鉴权）。
 *               已是 http(s) 完整地址的原样返回。
 * @param {string} fileName 文件 key
 * @return {string}
 */
export const getFilePreviewUrl = (fileName: string): string => {
  if (!fileName) return ''
  if (/^https?:\/\//i.test(fileName)) return fileName
  return `${config.apiApi}/api/file/preview/${fileName}`
}