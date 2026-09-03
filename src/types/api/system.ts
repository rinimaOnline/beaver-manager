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

// 菜单项
export interface IGetMenuListItem {
  id: number
  parentId: number
  path: string
  name: string
  hidden: boolean
  sort: number
  title: string
  icon: string
}

// 获取菜单列表
export interface IGetMenuListReq {
  userID?: string
}

export interface IGetMenuListRes {
  list: IGetMenuListItem[]
}

// 创建菜单
export interface ICreateMenuReq {
  parentId: number
  path: string
  name: string
  hidden: boolean
  sort: number
  title: string
  icon: string
}

export interface ICreateMenuRes {}

// 更新菜单
export interface IUpdateMenuReq {
  id: number
  parentId: number
  path: string
  name: string
  hidden: boolean
  sort: number
  title: string
  icon: string
}

export interface IUpdateMenuRes {}

// 删除菜单
export interface IDeleteMenuReq {
  id: number
}

export interface IDeleteMenuRes {}

// 创建权限
export interface ICreateAuthorityReq {
  name: string
  description: string
}

export interface ICreateAuthorityRes {}

// 更新权限菜单
export interface IUpdateAuthorityMenuMenuItem {
  id: number
}

export interface IUpdateAuthorityMenuReq {
  id: number
  menus: IUpdateAuthorityMenuMenuItem[]
}

export interface IUpdateAuthorityMenuRes {}

export interface IAuthorityInfo {
  id: number
  name: string
  description: string
  status: number
  sort: number
  menuCount: number
}

export interface IGetAuthorityListRes {
  list: IAuthorityInfo[]
}

export interface IUpdateAuthorityReq {
  id: number
  name: string
  description: string
  status: number
  sort: number
}

export interface IUpdateAuthorityRes {}

export interface IDeleteAuthorityReq {
  id: number
}

export interface IDeleteAuthorityRes {}

export interface IGetAuthorityMenusRes {
  menuIds: number[]
}

/** 可授权的后台模块。module 是 /admin/<module>/v1/* 里的模块段 */
export interface IAdminModuleItem {
  module: string
  title: string
}

export interface IListAdminModulesRes {
  list: IAdminModuleItem[]
}

export interface IGetAuthorityModulesRes {
  modules: string[]
  /** 超管角色豁免全部模块，前端据此禁用配置 */
  isSuper: boolean
}

export interface IUpdateAuthorityModuleReq {
  id: number
  modules: string[]
}

export interface IUpdateAuthorityModuleRes {}

export interface IAdminUserInfo {
  id: number
  userId: string
  nickName: string
  phone: string
  status: number
  lastLoginAt: number
  createdAt: string
  authorityIds: number[]
  authorityNames: string[]
}

export interface IGetAdminUserListReq {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

export interface IGetAdminUserListRes {
  list: IAdminUserInfo[]
  total: number
}

export interface ICreateAdminUserReq {
  nickName: string
  phone: string
  password: string
  authorityIds: number[]
}

export interface ICreateAdminUserRes {
  userId: string
}

export interface IUpdateAdminUserReq {
  nickName?: string
  status?: number
  password?: string
  authorityIds?: number[]
}

export interface IUpdateAdminUserRes {}

