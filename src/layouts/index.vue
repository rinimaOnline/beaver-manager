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
  <div class="app-wrapper">
    <div class="sidebar-container" :class="{ 'is-open': appStore.mobileSidebarOpen }">
      <Sidebar />
    </div>

    <!-- 窄屏抽屉的遮罩：点一下收起侧栏 -->
    <div
      v-if="appStore.isMobile && appStore.mobileSidebarOpen"
      class="sidebar-mask"
      @click="appStore.closeMobileSidebar()"
    />

    <div class="main-container">
      <div class="navbar">
        <NavigationBar />
      </div>

      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRoute } from "vue-router"
import NavigationBar from "@/layouts/components/NavigationBar/index.vue"
import Sidebar from "@/layouts/components/Sidebar/index.vue"
import { useAppStore } from "@/pinia/app/app"

// 和 styles/responsive.less 里的断点保持一致，两处一起改
const MOBILE_BREAKPOINT = 768

export default defineComponent({
  components: {
    Sidebar,
    NavigationBar
  },
  setup() {
    const appStore = useAppStore()
    const route = useRoute()

    const syncDevice = () => {
      appStore.setDevice(window.innerWidth <= MOBILE_BREAKPOINT ? "mobile" : "desktop")
    }

    onMounted(() => {
      syncDevice()
      window.addEventListener("resize", syncDevice)
    })

    onUnmounted(() => {
      window.removeEventListener("resize", syncDevice)
    })

    // 跳转后收起抽屉，否则点完菜单侧栏还盖在新页面上
    watch(() => route.path, () => appStore.closeMobileSidebar())

    return {
      appStore
    }
  }
})
</script>

<style lang="less" scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  /* 手机浏览器的 100vh 含地址栏，底部会被切掉一截；dvh 才是实际可视高度 */
  height: 100dvh;
  background: #b7b3b3;

  .sidebar-container {
    width: 210px;
    flex-shrink: 0;
    background-color: #304156;
  }

  .main-container {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .navbar {
      height: 50px;
      background-color: #ffffff;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      position: relative;
      z-index: 999;
    }

    .app-main {
      flex: 1;
      margin: 20px 10px;
      overflow: hidden;
      box-sizing: border-box;
      border-radius: 10px;
      background: #ffffff;
    }
  }
}

/**
 * 窄屏：侧栏脱离文档流变成左侧抽屉，由导航栏的汉堡按钮控制。
 * 210px 的固定侧栏在手机上要吃掉一半屏宽，正文就没法看了。
 */
@media (max-width: 768px) {
  .app-wrapper {
    .sidebar-container {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 2001;
      width: 220px;
      transform: translateX(-100%);
      transition: transform 0.25s ease;

      &.is-open {
        transform: translateX(0);
      }
    }

    .main-container .app-main {
      margin: 10px;
      /* 窄屏改成整页纵向滚动，页面内部不再分区滚动（见 styles/responsive.less） */
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  .sidebar-mask {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.4);
  }
}
</style>
