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

/**
 * 自托头像库。
 *
 * 刻意不接第三方免费头像 API：那类服务要客户端直连外部域名，国内加载慢甚至不通，
 * 等于把「头像加载不出来」从自己家搬到别人家。这里的图都传到了本项目的文件服务，
 * URL 始终是自己的域名。
 *
 * 图是脚本生成后上传的，换一批的做法：重新生成 → 传到文件服务 → 替换下面的 url。
 *
 * 注意 URL 用的是用户网关端口（20800）而不是上传接口返回的管理网关端口（40800）：
 * 管理网关不路由 /api/file/preview，直接用它返回的地址会全是破图。
 * 分类只是给后台分组展示用，服务端不认识这些分类，存进任务里的就是一行行 URL。
 */

export interface AvatarLibraryItem {
  /** 展示名，网格里 hover 时显示 */
  name: string
  url: string
}

export interface AvatarLibraryCategory {
  key: string
  title: string
  items: AvatarLibraryItem[]
}

export const avatarLibrary: AvatarLibraryCategory[] = [
  {
    key: "geometric",
    title: "点阵",
    items: [
      { name: "geometric-1", url: "http://202.95.21.179:20800/api/file/preview/16015c68bf286fe0f823c2a42a626e69.png" },
      { name: "geometric-2", url: "http://202.95.21.179:20800/api/file/preview/c3f03442d143e05bbe6dcae3171871ae.png" },
      { name: "geometric-3", url: "http://202.95.21.179:20800/api/file/preview/dba0802b9d9395e014c150adb2829282.png" },
      { name: "geometric-4", url: "http://202.95.21.179:20800/api/file/preview/2dae31ca98e71b40b87c459ee4fa6914.png" },
      { name: "geometric-5", url: "http://202.95.21.179:20800/api/file/preview/62e16c95a837eff37ac96124603a60c4.png" },
      { name: "geometric-6", url: "http://202.95.21.179:20800/api/file/preview/059c33f92ee3297c451acab5e28b5cdb.png" },
      { name: "geometric-7", url: "http://202.95.21.179:20800/api/file/preview/9f6a2ecd6b8550ffadf4a1d20904b5c9.png" },
      { name: "geometric-8", url: "http://202.95.21.179:20800/api/file/preview/2f704051583d2ea8a425dcfc79e5e2b1.png" },
    ]
  },
  {
    key: "gradient",
    title: "渐变",
    items: [
      { name: "gradient-1", url: "http://202.95.21.179:20800/api/file/preview/f917186ad0ccb00a4d70037233116d3a.png" },
      { name: "gradient-2", url: "http://202.95.21.179:20800/api/file/preview/109aff89bff09d06cc134fb76ecbb0a8.png" },
      { name: "gradient-3", url: "http://202.95.21.179:20800/api/file/preview/68870afba7e90979e2663d783b85a385.png" },
      { name: "gradient-4", url: "http://202.95.21.179:20800/api/file/preview/7756918b9a0366451987e696fcfbbb74.png" },
      { name: "gradient-5", url: "http://202.95.21.179:20800/api/file/preview/71ddbef3957f1d1deb4f5568f95b8480.png" },
      { name: "gradient-6", url: "http://202.95.21.179:20800/api/file/preview/6242c5c2358021dfa40c221388120695.png" },
      { name: "gradient-7", url: "http://202.95.21.179:20800/api/file/preview/a1cf680e1d7d8236cb819d56979984e6.png" },
      { name: "gradient-8", url: "http://202.95.21.179:20800/api/file/preview/a9089daf9d4434320906b29ede1b3cb4.png" },
    ]
  },
  {
    key: "blob",
    title: "色块",
    items: [
      { name: "blob-1", url: "http://202.95.21.179:20800/api/file/preview/bf81a3575c9eb4dcc7e1e82bc96fb694.png" },
      { name: "blob-2", url: "http://202.95.21.179:20800/api/file/preview/8a1c467bc323ae922c720b322d16989e.png" },
      { name: "blob-3", url: "http://202.95.21.179:20800/api/file/preview/2a963e5a434209a96270d2fc5cc0d69b.png" },
      { name: "blob-4", url: "http://202.95.21.179:20800/api/file/preview/bded607ca0752a39482638238056dfcd.png" },
      { name: "blob-5", url: "http://202.95.21.179:20800/api/file/preview/8c9b94fda5cc8845c317d37ab5995983.png" },
      { name: "blob-6", url: "http://202.95.21.179:20800/api/file/preview/f275b56066af225262902c4f9e42fdb8.png" },
      { name: "blob-7", url: "http://202.95.21.179:20800/api/file/preview/3590ebf2d74dc55f9b50d587ae1b6991.png" },
      { name: "blob-8", url: "http://202.95.21.179:20800/api/file/preview/271d3144cd1d9ca6d166adeb8ac692e0.png" },
    ]
  },
]
