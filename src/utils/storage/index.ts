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
 * 存储相关工具函数
 */

export interface StorageOptions {
  /**
   * 过期时间（毫秒）
   */
  expireTime?: number
}

interface StorageData {
  value: any
  expireTime?: number
}

/**
 * localStorage 工具类
 */
export class LocalStorage {
  /**
   * 获取数据
   */
  static get<T = any>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const data: StorageData = JSON.parse(item)

      // 检查是否过期
      if (data.expireTime && Date.now() > data.expireTime) {
        this.remove(key)
        return null
      }

      return data.value
    } catch {
      // 如果解析失败，尝试直接返回字符串
      return localStorage.getItem(key) as T
    }
  }

  /**
   * 设置数据
   */
  static set(key: string, value: any, options?: StorageOptions): void {
    try {
      const data: StorageData = { value }

      if (options?.expireTime) {
        data.expireTime = Date.now() + options.expireTime
      }

      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("LocalStorage set error:", error)
    }
  }

  /**
   * 删除数据
   */
  static remove(key: string): void {
    localStorage.removeItem(key)
  }

  /**
   * 清空所有数据
   */
  static clear(): void {
    localStorage.clear()
  }

  /**
   * 获取所有key
   */
  static keys(): string[] {
    return Object.keys(localStorage)
  }
}

/**
 * sessionStorage 工具类
 */
export class SessionStorage {
  /**
   * 获取数据
   */
  static get<T = any>(key: string): T | null {
    try {
      const value = sessionStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch {
      return sessionStorage.getItem(key) as T
    }
  }

  /**
   * 设置数据
   */
  static set(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value))
    } catch (error) {
      console.error("SessionStorage set error:", error)
    }
  }

  /**
   * 删除数据
   */
  static remove(key: string): void {
    sessionStorage.removeItem(key)
  }

  /**
   * 清空所有数据
   */
  static clear(): void {
    sessionStorage.clear()
  }
}

// 为了保持向后兼容，导出一个简单的storage对象
export const storage = LocalStorage
