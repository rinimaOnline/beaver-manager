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

// el-tag / el-badge 等组件 type 属性的取值集合，Element Plus 只接受这几个字面量，
// 返回 string 的映射函数会被判定为不兼容
export type TagType = "primary" | "success" | "warning" | "info" | "danger"

// 基础API响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页查询参数
export interface PageParams {
  page?: number
  size?: number
}

// 分页响应结构
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// 统计数据项
export interface StatItem {
  title: string
  value: string | number
  color: string
  icon?: string
}

// 菜单项
export interface MenuItem {
  path: string
  title: string
  icon?: string
  children?: MenuItem[]
}

// 表格列配置
export interface TableColumn {
  prop: string
  label: string
  width?: number | string
  fixed?: boolean | "left" | "right"
  sortable?: boolean
}
