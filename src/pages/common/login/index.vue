<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-manager-header-v1
-->

<script lang="ts">
import type { FormRules } from "element-plus"
import { Lock, User } from "@element-plus/icons-vue"
import { MD5 } from "crypto-js"
import { useUserStore } from "@/pinia/user/user"

export default defineComponent({
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    // 表单引用
    const loginFormRef = ref()

    // 加载状态
    const loading = ref(false)

    // 表单数据
    const loginForm = reactive({
      phone: "",
      password: ""
    })

    // 表单验证规则
    const loginRules: FormRules = {
      phone: [
        { required: true, message: "请输入手机号", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
      ],
      password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, max: 20, message: "密码长度为6-20位", trigger: "blur" }
      ]
    }

    // 登录处理
    const handleLogin = async () => {
      try {
        const valid = await loginFormRef.value?.validate()
        if (!valid) {
          ElMessage.error("请检查输入信息")
          return
        }

        loading.value = true

        // 使用 pinia store 登录
        const result = await userStore.login({
          phone: loginForm.phone,
          password: MD5(loginForm.password).toString()
        })

        if (result.success) {
          ElMessage.success("登录成功")
          router.push("/")
        }
      } catch (error: any) {
        ElMessage.error(error.message || "登录失败")
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {})

    return {
      loginFormRef,
      loading,
      loginForm,
      loginRules,
      handleLogin,
      User,
      Lock
    }
  }
})
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>Beaver IM 后台管理系统</h2>
        <p>欢迎登录</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="phone">
          <el-input
            v-model.trim="loginForm.phone"
            placeholder="请输入手机号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model.trim="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<style lang="less" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #333;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

</style>
