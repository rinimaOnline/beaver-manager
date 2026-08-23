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

import type { ILogEntry } from "@/types/api/track"

export const logTimePresets = [
  { label: "最近15分钟", value: "15m", minutes: 15 },
  { label: "最近1小时", value: "1h", minutes: 60 },
  { label: "最近6小时", value: "6h", minutes: 360 },
  { label: "最近24小时", value: "24h", minutes: 1440 },
  { label: "自定义", value: "custom", minutes: 0 }
]

export type LogViewMode = "raw" | "table"

export interface LogHistogramBar {
  label: string
  count: number
  height: number
}

export interface LogQueryFilters {
  level: string
  keyword: string
  userFilter: string
}

export function normalizeLogData(data: ILogEntry["data"]): Record<string, unknown> {
  if (!data) {
    return {}
  }
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data)
      return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : { raw: data }
    } catch {
      return { raw: data }
    }
  }
  return data
}

export function normalizeLogEntry(log: ILogEntry): ILogEntry {
  return {
    ...log,
    data: normalizeLogData(log.data)
  }
}

export function getLogTimeRange(preset: string, customRange: string[]) {
  const endTime = Date.now()
  if (preset === "custom" && customRange.length === 2) {
    return {
      startTime: new Date(customRange[0]).getTime(),
      endTime: new Date(customRange[1]).getTime()
    }
  }
  const item = logTimePresets.find(p => p.value === preset)
  const minutes = item?.minutes || 15
  return { startTime: endTime - minutes * 60 * 1000, endTime }
}

export function parseLogQuery(query: string): LogQueryFilters {
  const result: LogQueryFilters = { level: "", keyword: "", userFilter: "" }
  const trimmed = query.trim()
  if (!trimmed || trimmed === "*") {
    return result
  }
  const keywords: string[] = []
  for (const part of trimmed.split(/\s+AND\s+/i).map(s => s.trim()).filter(Boolean)) {
    const match = part.match(/^([\w.]+)\s*:\s*(.+)$/i)
    if (!match) {
      keywords.push(part)
      continue
    }
    const key = match[1].toLowerCase()
    const value = match[2].trim()
    if (key === "level") {
      result.level = value
    } else if (key === "userid" || key === "user_id") {
      result.userFilter = value
    } else {
      keywords.push(part)
    }
  }
  result.keyword = keywords.join(" ")
  return result
}

export function buildHistogramBars(logs: ILogEntry[]): LogHistogramBar[] {
  if (!logs.length) {
    return []
  }
  const bucketMap = new Map<string, number>()
  for (const log of logs) {
    const d = new Date(log.timestamp)
    const label = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    bucketMap.set(label, (bucketMap.get(label) || 0) + 1)
  }
  const entries = [...bucketMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const max = Math.max(...entries.map(([, c]) => c), 1)
  return entries.map(([label, count]) => ({
    label,
    count,
    height: Math.max(8, Math.round((count / max) * 100))
  }))
}

export function sortLogs(logs: ILogEntry[], sortDesc: boolean) {
  return [...logs].sort((a, b) => {
    const diff = (a.timestamp || 0) - (b.timestamp || 0)
    return sortDesc ? -diff : diff
  })
}

export function formatTs(ts: number) {
  return ts ? new Date(ts).toLocaleString() : "-"
}

export function formatTsFull(ts: number) {
  if (!ts) return "-"
  const d = new Date(ts)
  const pad = (n: number, len = 2) => String(n).padStart(len, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}

export function getLogData(log: ILogEntry) {
  return normalizeLogData(log.data)
}

export function getLogLevel(log: ILogEntry) {
  return String(getLogData(log).level ?? "")
}

export function getLogUserId(log: ILogEntry) {
  return String(getLogData(log).userId ?? "")
}

export function getLogModule(log: ILogEntry) {
  return String(getLogData(log).module ?? "")
}

export function getLogMessage(log: ILogEntry) {
  return String(getLogData(log).message ?? "")
}

export function formatLogJson(log: ILogEntry) {
  return JSON.stringify(getLogData(log), null, 2)
}

export function getLevelType(level: string) {
  switch ((level || "").toLowerCase()) {
    case "error": return "danger"
    case "warn": return "warning"
    case "info": return "success"
    default: return "info"
  }
}
