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

import { defineStore } from "pinia"

export const useAppStore = defineStore("useAppStore", {
  state: () => ({
    // 侧边栏是否折叠
    sidebarCollapsed: false,

    // 当前设备类型
    device: "desktop" as "desktop" | "mobile",

    // 加载状态
    loading: false,

    // 页面标题
    title: "后台管理系统"
  }),

  getters: {
    // 是否移动端
    isMobile: state => state.device === "mobile"
  },

  actions: {
    // 切换侧边栏
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    // 设置设备类型
    setDevice(device: "desktop" | "mobile") {
      this.device = device
    },

    // 设置加载状态
    setLoading(loading: boolean) {
      this.loading = loading
    },

    // 设置页面标题
    setTitle(title: string) {
      this.title = title
      document.title = title
    }
  }
})
