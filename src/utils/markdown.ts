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

import DOMPurify from "dompurify"
import { marked } from "marked"

marked.setOptions({
  breaks: true, // 单个换行也当换行，运营不用刻意敲两下回车
  gfm: true
})

/**
 * Markdown → 净化后的 HTML。
 *
 * 净化规则和桌面端渲染公告时用的那套保持一致（见 beaver-desktop 的
 * markdown.vue）：后台预览要是比客户端宽松，运营就会写出一段在这里好好的、
 * 发到客户端却被剥掉的内容。
 */
export function renderMarkdown(source: string): string {
  if (!source)
    return ""
  try {
    const html = marked.parse(source, { async: false }) as string
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"]
    })
  }
  catch {
    return ""
  }
}
