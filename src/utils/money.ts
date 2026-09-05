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

// 服务端所有金额字段以「分」存储，费率以「万分比（bps）」存储。
// 这里集中做展示 / 提交时的换算，避免各页面各写一套、精度处理不一致。

/** 分 → 元（字符串，保留两位小数） */
export function fenToYuan(fen: number | null | undefined): string {
  return ((Number(fen) || 0) / 100).toFixed(2)
}

/** 分 → 元（数字，用于表单回显） */
export function fenToYuanNumber(fen: number | null | undefined): number {
  return Math.round(Number(fen) || 0) / 100
}

/** 元 → 分。用四舍五入规避 0.29 * 100 = 28.999999 之类的浮点误差 */
export function yuanToFen(yuan: number | string | null | undefined): number {
  const n = Number(yuan)
  if (!Number.isFinite(n))
    return 0
  return Math.round(n * 100)
}

/** 万分比 → 百分比（数字，60 → 0.6） */
export function bpsToPercent(bps: number | null | undefined): number {
  return Math.round(Number(bps) || 0) / 100
}

/** 百分比 → 万分比（0.6 → 60） */
export function percentToBps(percent: number | string | null | undefined): number {
  const n = Number(percent)
  if (!Number.isFinite(n))
    return 0
  return Math.round(n * 100)
}

/** 服务端时间串统一裁成 `YYYY-MM-DD HH:mm:ss`，空值显示占位符 */
export function formatTime(raw: string | null | undefined): string {
  if (!raw || raw.startsWith("0001-"))
    return "—"
  return raw.replace("T", " ").slice(0, 19)
}
