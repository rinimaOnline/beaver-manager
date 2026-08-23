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

export interface IOnlineStats {
  userCount: number
  desktopCount: number
  mobileCount: number
}

export interface IOnlineUserSlotItem {
  instanceId: string
  slot: string
}

export interface IOnlineUserItem {
  userId: string
  nickName: string
  email: string
  avatar: string
  slots: IOnlineUserSlotItem[]
}

export interface IGetOnlineUserListReq {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface IGetOnlineUserListRes {
  list: IOnlineUserItem[]
  total: number
}

export interface IUserOnlineDeviceItem {
  deviceId: string
  deviceType: string
  deviceName: string
  deviceOs: string
  deviceModel: string
  deviceOsVersion: string
  lastLoginTime: string
  lastLoginIp: string
  isOnline: boolean
}

export interface IGetUserOnlineDevicesRes {
  list: IUserOnlineDeviceItem[]
}
