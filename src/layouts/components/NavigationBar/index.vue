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

<template>
  <div class="navigation-bar">
    <div class="left-menu">
      <span class="title">海狸IM 后台管理</span>
    </div>

    <div class="right-menu">
      <el-dropdown>
        <div class="user-info">
          <el-avatar :icon="UserFilled" :size="30" />
          <span class="username">{{ userStore.displayName }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="logout">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from "vue-router"
import { UserFilled } from "@element-plus/icons-vue"
import { useUserStore } from "@/pinia/user/user"

export default defineComponent({
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const logout = () => {
      userStore.logout()
      router.push("/login")
    }

    return {
      UserFilled,
      userStore,
      logout
    }
  }
})
</script>

<style lang="less" scoped>
.navigation-bar {
  height: 50px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;

  .left-menu {
    flex-shrink: 0;

    .title {
      font-size: 18px;
      font-weight: 500;
      color: #333333;
    }
  }

  .right-menu {
    flex-shrink: 0;

    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background-color 0.3s;

      .username {
        margin-left: 8px;
        font-size: 14px;
        color: #333333;
      }
    }

    .user-info:hover {
      background-color: #f5f5f5;
    }
  }
}
</style>
