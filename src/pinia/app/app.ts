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
