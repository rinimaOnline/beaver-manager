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

export const ID_TYPE_OPTIONS = [
  { code: 1, label: "居民身份证", front: "人像面", back: "国徽面" },
  { code: 2, label: "香港身份证", front: "正面", back: "背面" },
  { code: 3, label: "澳门身份证", front: "正面", back: "背面" },
  { code: 4, label: "台湾身分证", front: "正面", back: "背面" }
] as const

export function idTypeLabel(code?: number) {
  return ID_TYPE_OPTIONS.find(item => item.code === code)?.label || "居民身份证"
}

export function idTypeMeta(code?: number) {
  return ID_TYPE_OPTIONS.find(item => item.code === code) || ID_TYPE_OPTIONS[0]
}

/** 实名影像的来源字段，「实名审核」和「用户管理」两处的行对象都满足 */
export interface IIdentityMedia {
  idType?: number
  portraitUrl?: string
  emblemUrl?: string
  faceUrl?: string
  faceFrames?: string[]
}

export interface IIdentityGalleryItem {
  url: string
  label: string
}

/**
 * 证件正反面 + 活体帧，按审核人来回比对的顺序排。
 *
 * 活体这里有个取舍：有 faceFrames 就用它，没有才回落到 faceUrl 那一张。
 * 两个都铺出来的话，主照会和 frames 里的第一帧重复——它们本来就是同一次采集。
 */
export function identityGallery(row: IIdentityMedia): IIdentityGalleryItem[] {
  const items: IIdentityGalleryItem[] = []
  const meta = idTypeMeta(row.idType)
  if (row.portraitUrl) items.push({ url: row.portraitUrl, label: meta.front })
  if (row.emblemUrl) items.push({ url: row.emblemUrl, label: meta.back })
  const frames = row.faceFrames?.length ? row.faceFrames : (row.faceUrl ? [row.faceUrl] : [])
  frames.forEach((url, index) => items.push({ url, label: `活体帧 ${index + 1}` }))
  return items
}

/** 预览大图用的 URL 列表，和 identityGallery 同序 */
export function identityGalleryUrls(row: IIdentityMedia): string[] {
  return identityGallery(row).map(item => item.url)
}

export interface IIdentityEditValue {
  realName: string
  idNumber: string
  idType: number
  portraitUrl: string
  emblemUrl: string
  faceUrl: string
  faceFrames: string[]
}

export function emptyIdentityEdit(): IIdentityEditValue {
  return {
    realName: "",
    idNumber: "",
    idType: 1,
    portraitUrl: "",
    emblemUrl: "",
    faceUrl: "",
    faceFrames: []
  }
}

export function identityEditFrom(row: IIdentityMedia & { realName?: string, idNumber?: string, idType?: number }): IIdentityEditValue {
  const frames = (row.faceFrames || []).filter(url => !!url)
  return {
    realName: row.realName || "",
    idNumber: row.idNumber || "",
    idType: row.idType || 1,
    portraitUrl: row.portraitUrl || "",
    emblemUrl: row.emblemUrl || "",
    faceUrl: row.faceUrl || "",
    faceFrames: frames
  }
}

export function identityEditFilled(form: IIdentityEditValue) {
  return !!(
    form.realName.trim()
    || form.idNumber.trim()
    || form.portraitUrl
    || form.emblemUrl
    || form.faceUrl
    || form.faceFrames.some(url => !!url)
  )
}
