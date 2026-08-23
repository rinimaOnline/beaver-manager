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

import type { ICityInfo } from "@/types/api/dictionary"
import { defineStore } from "pinia"
import { getCitiesApi } from "@/api/dictionary"

export const useCommonStore = defineStore("useCommonStore", {
  state: () => ({
    // 城市列表
    cities: [] as ICityInfo[],
    
    // 城市列表加载状态
    citiesLoading: false,
    
    // 城市列表是否已加载
    citiesLoaded: false
  }),

  getters: {
    // 获取城市列表
    getCities: state => state.cities,
    
    // 获取城市名称
    getCityName: state => (cityCode: string): string => {
      const city = state.cities.find(item => item.code === cityCode)
      return city?.name || '未知城市'
    },
    
    // 获取城市代码
    getCityCode: state => (cityName: string): string => {
      const city = state.cities.find(item => item.name === cityName)
      return city?.code || 'ALL'
    },
    
    // 城市列表是否为空
    isCitiesEmpty: state => state.cities.length === 0
  },

  actions: {
    // 设置城市列表
    setCities(cities: ICityInfo[]) {
      this.cities = cities
      this.citiesLoaded = true
    },

    // 设置城市列表加载状态
    setCitiesLoading(loading: boolean) {
      this.citiesLoading = loading
    },

    // 获取城市列表
    async fetchCities() {
      // 如果已经加载过，直接返回
      if (this.citiesLoaded && this.cities.length > 0) {
        return this.cities
      }

      this.setCitiesLoading(true)
      
      try {
        const response = await getCitiesApi({})
        
        if (response.code === 0) {
          this.setCities(response.result.cities)
          return this.cities
        } else {
          throw new Error(response.msg || "获取城市列表失败")
        }
      } catch (error: any) {
        console.error("获取城市列表失败:", error)
        return this.cities
      } finally {
        this.setCitiesLoading(false)
      }
    },

    // 重置城市列表
    resetCities() {
      this.cities = []
      this.citiesLoaded = false
      this.citiesLoading = false
    }
  }
}) 