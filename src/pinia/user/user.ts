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

import type { IApiResponse, IGetUserInfoRes, ILoginReq, ILoginRes } from "@/types/auth"
import { defineStore } from "pinia"
import { getUserInfoApi, loginApi } from "@/api/auth"
import { getMyModulesApi } from "@/api/system"

export const useUserStore = defineStore("useUserStore", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    userId: localStorage.getItem("userId") || "",
    phone: localStorage.getItem("phone") || "",
    userInfo: null as any,

    // 当前管理员的后台模块授权，用来过滤侧边栏。
    // 只放内存不落 localStorage：权限改完最多 30 秒生效（服务端有缓存），
    // 再叠一层浏览器缓存会让「改了权限怎么还不变」更难解释。
    modules: [] as string[],
    isSuper: false,
    // 没加载完之前不渲染菜单，否则会先闪一下全量菜单再收起来
    permissionsLoaded: false
  }),

  getters: {
    // 是否已登录
    isLoggedIn: state => !!state.token,

    // 获取用户显示名称
    displayName: state => state.phone || "未登录",

    // 能不能访问某个后台模块。超管豁免全部模块，它的 modules 是空数组
    canAccessModule: state => (module?: string) => {
      if (!module) {
        return true
      }
      return state.isSuper || state.modules.includes(module)
    }
  },

  actions: {
    // 设置token
    setToken(token: string) {
      this.token = token
      localStorage.setItem("token", token)
    },

    // 设置用户ID
    setUserId(userId: string) {
      this.userId = userId
      localStorage.setItem("userId", userId)
    },

    // 设置手机号
    setPhone(phone: string) {
      this.phone = phone
      localStorage.setItem("phone", phone)
    },

    // 设置用户信息
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo
    },

    // 登录
    async login(loginData: ILoginReq) {
      try {
        const response: IApiResponse<ILoginRes> = await loginApi(loginData)

        if (response.code === 0) {
          const { token, userId } = response.result

          this.setToken(token)
          this.setUserId(userId)
          this.setPhone(loginData.phone)

          return { success: true, data: response.result }
        } else {
          throw new Error(response.msg || "登录失败")
        }
      } catch (error: any) {
        throw new Error(error.message || "登录失败")
      }
    },

    // 拉取自己的模块授权。
    //
    // 失败时不退回「显示全部菜单」——那正是这次要修的旧行为，
    // 一次网络抖动就会让运营又看到满屏点不开的菜单。宁可只留免授权的项，
    // 让人一眼看出是加载失败并刷新。后端鉴权始终生效，两种处理都不影响安全。
    async loadPermissions() {
      if (!this.token) {
        return
      }
      const res = await getMyModulesApi()
      if (res.code !== 0) {
        throw new Error(res.msg || "获取权限失败")
      }
      this.modules = res.result.modules || []
      this.isSuper = res.result.isSuper
      this.permissionsLoaded = true
    },

    // 登出
    logout() {
      this.token = ""
      this.userId = ""
      this.phone = ""
      this.userInfo = null
      this.modules = []
      this.isSuper = false
      this.permissionsLoaded = false
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("phone")
    },

    // 获取用户信息 - 调用authentication接口
    async getUserInfo() {
      if (!this.token) {
        throw new Error("未登录")
      }

      try {
        const response: IApiResponse<IGetUserInfoRes> = await getUserInfoApi()

        if (response.code === 0) {
          // 更新userId（以防不一致）
          this.setUserId(response.result.userId)

          // 构建用户信息对象
          const userInfo = {
            userId: response.result.userId,
            phone: this.phone,
            displayName: this.phone
          }

          this.setUserInfo(userInfo)
          return userInfo
        } else {
          throw new Error(response.msg || "获取用户信息失败")
        }
      } catch (error: any) {
        // 获取用户信息失败，可能token过期，清除登录状态
        this.logout()
        throw new Error(error.message || "获取用户信息失败")
      }
    },

    // 初始化用户信息 - 页面刷新时调用
    async initUserInfo() {
      if (this.token) {
        try {
          await this.getUserInfo()
        } catch (error) {
          console.error("初始化用户信息失败:", error)
          // 静默处理，不抛出错误
        }
      }
    }
  }
})
