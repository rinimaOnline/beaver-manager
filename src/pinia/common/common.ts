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