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

import type {
  IGetNotificationTemplatesRes,
  IGetSystemNotificationListReq,
  IGetSystemNotificationListRes,
  ISaveNotificationTemplateReq,
  ISendSystemNotificationReq,
  ISendSystemNotificationRes
} from "@/types/api/notification"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getSystemNotificationListApi(params: IGetSystemNotificationListReq) {
  return ajax<IGetSystemNotificationListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/notification/v1/list`,
    params
  })
}

export function sendSystemNotificationApi(data: ISendSystemNotificationReq) {
  return ajax<ISendSystemNotificationRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/notification/v1/send`,
    data
  })
}

export function revokeSystemNotificationApi(eventId: string) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/notification/v1/revoke`,
    data: { eventId }
  })
}

export function getNotificationTemplatesApi() {
  return ajax<IGetNotificationTemplatesRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/notification/v1/templates`
  })
}

export function saveNotificationTemplateApi(data: ISaveNotificationTemplateReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/notification/v1/template/save`,
    data
  })
}

export function resetNotificationTemplateApi(code: string) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/notification/v1/template/reset`,
    data: { code }
  })
}
