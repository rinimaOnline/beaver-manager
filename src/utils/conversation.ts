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

export function buildPrivateConversationId(userIdA: string, userIdB: string): string {
  const ids = [userIdA, userIdB].filter(Boolean).sort()
  if (ids.length === 1) {
    return `private_${ids[0]}`
  }
  return `private_${ids[0]}_${ids[1]}`
}

export function buildGroupConversationCandidates(groupUuid: string): string[] {
  const id = groupUuid.trim()
  if (!id) {
    return []
  }
  if (id.startsWith("group_")) {
    return [id]
  }
  return [`group_${id}`, id]
}

export function getConversationType(conversationId: string): number {
  if (conversationId.startsWith("group_")) {
    return 2
  }
  if (conversationId.startsWith("private_")) {
    return 1
  }
  return conversationId.includes("_") ? 1 : 2
}
