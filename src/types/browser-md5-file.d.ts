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

// browser-md5-file 未随包发布类型声明，这里按 dist/index.esm.js 的实际实现补齐。
declare module "browser-md5-file" {
  /** 成功时 err 为 null；调用 abort() 中断时 err 为字符串 "aborted" 且不回传 md5 */
  type Md5Callback = (err: string | null, md5?: string) => void

  /** 分片读取进度，取值 0 ~ 1 */
  type ProgressCallback = (progress: number) => void

  export default class BMF {
    md5(file: File, callback: Md5Callback, onProgress?: ProgressCallback): void
    abort(): void
  }
}
