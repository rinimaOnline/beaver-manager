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
  IAutoChatBotListRes,
  IAutoChatSaveScriptsReq,
  IAutoChatSaveTaskReq,
  IAutoChatScriptListRes,
  IAutoChatTaskListRes
} from "@/types/api/groupautochat"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getAutoChatTasksApi(params?: { groupId?: string }) {
  return ajax<IAutoChatTaskListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/autochat/v1/task/list`,
    params
  })
}

export function saveAutoChatTaskApi(data: IAutoChatSaveTaskReq) {
  return ajax<{ id: number }>({
    method: "POST",
    url: `${config.baseAPI}/admin/autochat/v1/task/save`,
    data
  })
}

export function deleteAutoChatTaskApi(data: { id: number }) {
  return ajax<object>({
    method: "POST",
    url: `${config.baseAPI}/admin/autochat/v1/task/delete`,
    data
  })
}

export function getAutoChatScriptsApi(params: { taskId: number }) {
  return ajax<IAutoChatScriptListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/autochat/v1/script/list`,
    params
  })
}

export function saveAutoChatScriptsApi(data: IAutoChatSaveScriptsReq) {
  return ajax<{ saved: number }>({
    method: "POST",
    url: `${config.baseAPI}/admin/autochat/v1/script/save`,
    data
  })
}

export function getAutoChatBotsApi(params: { taskId: number }) {
  return ajax<IAutoChatBotListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/autochat/v1/bot/list`,
    params
  })
}
