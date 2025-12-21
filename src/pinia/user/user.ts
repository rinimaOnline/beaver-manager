import type { IApiResponse, IGetUserInfoRes, ILoginReq, ILoginRes } from "@/types/auth"
import { defineStore } from "pinia"
import { getUserInfoApi, loginApi } from "@/api/auth"

export const useUserStore = defineStore("useUserStore", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    userId: localStorage.getItem("userId") || "",
    phone: localStorage.getItem("phone") || "",
    userInfo: null as any
  }),

  getters: {
    // 是否已登录
    isLoggedIn: state => !!state.token,

    // 获取用户显示名称
    displayName: state => state.phone || "未登录"
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

    // 登出
    logout() {
      this.token = ""
      this.userId = ""
      this.phone = ""
      this.userInfo = null
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
