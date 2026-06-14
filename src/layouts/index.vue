<script lang="ts">
import NavigationBar from "./components/NavigationBar/index.vue"
import Sidebar from "./components/Sidebar/index.vue"

export default defineComponent({
  components: {
    Sidebar,
    NavigationBar
  },
  setup() {
    onMounted(() => {})

    return {}
  }
})
</script>

<template>
  <div class="app-wrapper">
    <!-- 左侧菜单 -->
    <div class="sidebar-container">
      <Sidebar />
    </div>

    <!-- 右侧内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <NavigationBar />
      </div>

      <!-- 主要内容 -->
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #b7b3b3;
}

.sidebar-container {
  width: 210px;
  background-color: #304156;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 50px;
  background-color: #fff;
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
  background: #fff;
}
</style>
