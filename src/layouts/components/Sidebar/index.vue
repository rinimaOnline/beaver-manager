<template>
  <div class="sidebar">
    <div class="logo-container">
      <router-link to="/" class="logo-link">
        <div class="logo-content">
          <img src="@/assets/images/common/logo.png" alt="logo" class="logo-img" />
          <span class="logo-text">海狸IM</span>
        </div>
      </router-link>
    </div>

    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        mode="vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#fff"
      >
        <template v-for="item in menuItems">
          <el-sub-menu
            v-if="hasChildren(item)"
            :key="`sub-${item.path}`"
            :index="item.path"
          >
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="child in item.children">
              <el-sub-menu
                v-if="hasChildren(child)"
                :key="`sub-${child.path}`"
                :index="child.path"
              >
                <template #title>
                  <el-icon><component :is="child.icon" /></el-icon>
                  <span>{{ child.title }}</span>
                </template>
                <el-menu-item
                  v-for="grand in child.children"
                  :key="grand.path"
                  :index="grand.path"
                  @click="handleMenuClick(grand.path)"
                >
                  <el-icon><component :is="grand.icon" /></el-icon>
                  <span>{{ grand.title }}</span>
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item
                v-else
                :key="`item-${child.path}`"
                :index="child.path"
                @click="handleMenuClick(child.path)"
              >
                <el-icon><component :is="child.icon" /></el-icon>
                <span>{{ child.title }}</span>
              </el-menu-item>
            </template>
          </el-sub-menu>
          <el-menu-item
            v-else
            :key="`item-${item.path}`"
            :index="item.path"
            @click="handleMenuClick(item.path)"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
import { computed,  ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { MenuItem } from "@/config/menu"
import { menuConfig } from "@/config/menu"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const menuItems = ref(menuConfig)

    const hasChildren = (item: MenuItem) => Boolean(item.children && item.children.length)

    const activeMenu = computed(() => {
      if (typeof route.meta.activeMenu === "string") {
        return route.meta.activeMenu
      }
      return route.path
    })

    const handleMenuClick = (path: string) => {
      router.push(path)
    }

    return {
      menuItems,
      hasChildren,
      activeMenu,
      handleMenuClick
    }
  }
})
</script>

<style lang="less" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;

  .logo-container {
    height: 60px;
    padding: 10px;
    border-bottom: 1px solid #263445;

    .logo-link {
      display: block;
      height: 100%;
      text-decoration: none;

      .logo-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;

        .logo-img {
          width: 32px;
          height: 32px;
          margin-right: 8px;
          border-radius: 8px;
          background: #ffffff;
          object-fit: cover;
        }

        .logo-text {
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
        }
      }
    }

    .logo-link:hover {
      .logo-content {
        opacity: 0.8;
      }
    }
  }

  .el-scrollbar {
    flex: 1;
  }

  .el-menu {
    border: none;
    width: 100%;

    :deep(.el-icon) {
      margin-right: 8px;
      width: 16px;
      height: 16px;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 50px;
      line-height: 50px;
    }

    :deep(.el-menu-item:hover),
    :deep(.el-sub-menu__title:hover) {
      background-color: #263445 !important;
      color: #ffffff !important;
    }

    :deep(.el-menu-item.is-active) {
      background-color: #409eff !important;
      color: #ffffff !important;
    }

    :deep(.el-menu-item.is-active::before) {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      background-color: #ffffff;
    }

    :deep(.el-menu-item.is-active .el-icon) {
      color: #ffffff !important;
    }

    :deep(.el-sub-menu .el-menu-item.is-active) {
      background-color: #409eff !important;
      color: #ffffff !important;
    }

    :deep(.el-sub-menu .el-menu-item.is-active .el-icon) {
      color: #ffffff !important;
    }
  }
}
</style>
