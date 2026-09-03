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

import type { AxiosError, AxiosRequestConfig } from "axios"
import axios from "axios"

/**
 * 统一的响应数据结构
 */
export interface IResponseSuccessData<T> {
  code: number
  msg: string
  result: T
}

/**
 * 请求头配置
 */
export interface HeaderRequest {
  [key: string]: string | number
}

/**
 * 创建axios实例
 */
const request = axios.create({
  timeout: 600000, // 请求超时时间，10分钟，文件上传需要更长的超时时间
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (requestConfig) => {
    // 添加token和其他公共头部
    const token = localStorage.getItem("token") || ""

    const headers: HeaderRequest = {
      Token: token, // 对应auth_admin.api中的Token header
      deviceId: localStorage.getItem("deviceId") || ""
    }

    requestConfig.headers = Object.assign({}, requestConfig.headers, headers)
    return requestConfig
  },
  (error: Error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    const data = response.data as IResponseSuccessData<any>

    // 处理认证失败的情况
    if (data.code !== 0 && response.config.url?.includes("authentication")) {
      // 清除token并跳转到登录页
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("phone")

      // 项目使用 hash 路由（createWebHashHistory），必须带上 #，
      // 否则会请求服务器上并不存在的 /login 路径
      window.location.hash = "#/login"

      return Promise.reject(new Error("认证失败，请重新登录"))
    }

    return response.data
  },
  (error: AxiosError) => {
    // 后台加了身份中间件后，token 过期或被顶下线会在任意接口上返回 401。
    // 原来只在 authentication 失败时跳登录，别的接口拿到 401 会静静卡住，
    // 用户看到一片加载失败但不知道要重新登录。
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("phone")
      window.location.hash = "#/login"
      return Promise.reject(new Error("登录已失效，请重新登录"))
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error("无权访问该功能，请联系管理员分配权限"))
    }
    return Promise.reject(error)
  }
)

/**
 * 统一的请求方法
 * @param config axios请求配置
 * @returns 返回统一格式的数据
 */
function ajax<T>(config: AxiosRequestConfig): Promise<IResponseSuccessData<T>> {
  return request(config)
    .then((response) => {
      return response as unknown as IResponseSuccessData<T>
    })
    .catch((err: AxiosError) => {
      return Promise.reject(err)
    }) as Promise<IResponseSuccessData<T>>
}

export { ajax }
