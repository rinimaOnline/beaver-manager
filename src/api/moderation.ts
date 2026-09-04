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
  ICreateModerationCaseReq,
  ICreateModerationCaseRes,
  ICreateSensitiveWordReq,
  ICreateSensitiveWordRes,
  IDeleteSensitiveWordReq,
  IEscalateContentReportReq,
  IEscalateContentReportRes,
  IExecuteUserControlReq,
  IExecuteUserControlRes,
  IGetContentReportListReq,
  IGetContentReportListRes,
  IGetModerationCaseContextRes,
  IGetModerationCaseDetailRes,
  IGetModerationCaseListReq,
  IGetModerationCaseListRes,
  IGetOperationLogListReq,
  IGetOperationLogListRes,
  IGetSensitiveWordListReq,
  IGetSensitiveWordListRes,
  IHandleModerationCaseReq,
  IRejectContentReportReq,
  IUpdateSensitiveWordReq
} from "@/types/api/moderation"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function executeUserControlApi(data: IExecuteUserControlReq) {
  return ajax<IExecuteUserControlRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/execute_user_control`,
    data
  })
}

export function getContentReportListApi(params: IGetContentReportListReq) {
  return ajax<IGetContentReportListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/v1/list_reports`,
    params
  })
}

export function escalateContentReportApi(data: IEscalateContentReportReq) {
  return ajax<IEscalateContentReportRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/escalate_report`,
    data
  })
}

export function rejectContentReportApi(data: IRejectContentReportReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/reject_report`,
    data
  })
}

export function getModerationCaseListApi(params: IGetModerationCaseListReq) {
  return ajax<IGetModerationCaseListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/v1/list_cases`,
    params
  })
}

export function getModerationCaseDetailApi(id: number) {
  return ajax<IGetModerationCaseDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/v1/case_detail`,
    params: { id }
  })
}

export function getModerationCaseContextApi(id: number) {
  return ajax<IGetModerationCaseContextRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/v1/case_context`,
    params: { id }
  })
}

export function createModerationCaseApi(data: ICreateModerationCaseReq) {
  return ajax<ICreateModerationCaseRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/create_case`,
    data
  })
}

export function handleModerationCaseApi(data: IHandleModerationCaseReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/handle_case`,
    data
  })
}

export function getOperationLogListApi(params: IGetOperationLogListReq) {
  return ajax<IGetOperationLogListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/v1/list_logs`,
    params
  })
}

export function getSensitiveWordListApi(params: IGetSensitiveWordListReq) {
  return ajax<IGetSensitiveWordListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/v1/list_sensitive_words`,
    params
  })
}

export function createSensitiveWordApi(data: ICreateSensitiveWordReq) {
  return ajax<ICreateSensitiveWordRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/create_sensitive_word`,
    data
  })
}

export function updateSensitiveWordApi(data: IUpdateSensitiveWordReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/update_sensitive_word`,
    data
  })
}

export function deleteSensitiveWordApi(data: IDeleteSensitiveWordReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/delete_sensitive_word`,
    data
  })
}
