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
  IAuditDeveloperReq,
  IAuditDeveloperRes,
  IApplyDeveloperReq,
  IApplyDeveloperRes,
  IAuditOpenAppReq,
  IAuditOpenAppRes,
  IGetDeveloperListReq,
  IGetDeveloperListRes,
  IGetOpenAppListReq,
  IGetOpenAppListRes,
  IGetOpenWebhookLogListReq,
  IGetOpenWebhookLogListRes,
  IUpdateOpenAppStatusReq,
  IUpdateOpenAppStatusRes
} from "@/types/api/open"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getDeveloperListApi(params: IGetDeveloperListReq) {
  return ajax<IGetDeveloperListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/v1/developer/list`,
    params
  })
}

export function auditDeveloperApi(data: IAuditDeveloperReq) {
  return ajax<IAuditDeveloperRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/v1/developer/audit`,
    data
  })
}

export function applyDeveloperApi(data: IApplyDeveloperReq) {
  return ajax<IApplyDeveloperRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/v1/developer/apply`,
    data
  })
}

export function getOpenAppListApi(params: IGetOpenAppListReq) {
  return ajax<IGetOpenAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/v1/app/list`,
    params
  })
}

export function auditOpenAppApi(data: IAuditOpenAppReq) {
  return ajax<IAuditOpenAppRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/v1/app/audit`,
    data
  })
}

export function updateOpenAppStatusApi(data: IUpdateOpenAppStatusReq) {
  return ajax<IUpdateOpenAppStatusRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/v1/app/update_status`,
    data
  })
}

export function getOpenWebhookLogListApi(params: IGetOpenWebhookLogListReq) {
  return ajax<IGetOpenWebhookLogListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/v1/webhook/list_logs`,
    params
  })
}
