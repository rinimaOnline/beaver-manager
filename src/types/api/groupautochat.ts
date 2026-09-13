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

/** 群自动发言任务 */
export interface IAutoChatTask {
  id: number
  groupId: string
  /** 群名，列表回显用 */
  groupTitle: string
  name: string
  /** 1 启用 0 停用 */
  status: number
  /** 1 顺序循环 2 随机 */
  mode: number
  minIntervalSec: number
  maxIntervalSec: number
  /** 活跃时段（0-23），起止相等表示全天；结束小于开始表示跨零点 */
  activeStartHour: number
  activeEndHour: number
  /** 每天最多发多少条，0 不限 */
  dailyLimit: number
  sentToday: number
  /** 任务需要的虚拟号数量 */
  botCount: number
  /** 已经建好的虚拟号数量 */
  botReadyCount: number
  /** 建号时轮流取用的头像 URL，一行一个 */
  botAvatars: string
  scriptCount: number
  sentTotal: number
  nextRunAt: number
  lastSentAt: number
  lastError: string
  remark: string
  createdAt: string
  updatedAt: string
}

export interface IAutoChatTaskListRes {
  list: IAutoChatTask[]
}

export interface IAutoChatSaveTaskReq {
  /** 0 表示新建 */
  id?: number
  groupId: string
  name: string
  status?: number
  mode?: number
  minIntervalSec?: number
  maxIntervalSec?: number
  activeStartHour?: number
  activeEndHour?: number
  dailyLimit?: number
  botCount?: number
  botAvatars?: string
  remark?: string
}

/** 任务文案 */
export interface IAutoChatScript {
  id: number
  taskId: number
  sort: number
  content: string
  status: number
}

export interface IAutoChatScriptListRes {
  list: IAutoChatScript[]
}

/**
 * 写入用的文案条目。
 *
 * 刻意不复用 IAutoChatScript：那是「读」的形状带 id / taskId，
 * 服务端会把它们当必填校验，新建文案时没有 id，提交必然被拒。
 */
export interface IAutoChatScriptInput {
  /** 省略时服务端按提交顺序编号 */
  sort?: number
  content: string
}

export interface IAutoChatSaveScriptsReq {
  taskId: number
  /** 整组覆盖：提交什么就是什么，没带上的会被删掉 */
  list: IAutoChatScriptInput[]
}

/** 任务的虚拟账号 */
export interface IAutoChatBot {
  id: number
  taskId: number
  userId: string
  nickName: string
  avatar: string
  status: number
  /** true 表示任务自动建的号 */
  managed: boolean
}

export interface IAutoChatBotListRes {
  list: IAutoChatBot[]
}
