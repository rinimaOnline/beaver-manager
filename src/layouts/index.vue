<template>
  <div class="app-wrapper">
    <div class="sidebar-container">
      <Sidebar />
    </div>

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
import NavigationBar from "@/layouts/components/NavigationBar/index.vue"
import Sidebar from "@/layouts/components/Sidebar/index.vue"

export default defineComponent({
  components: {
    Sidebar,
    NavigationBar
  },
  setup() {
    return {}
  }
})
</script>

<style lang="less" scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #b7b3b3;

  .sidebar-container {
    width: 210px;
    background-color: #304156;
  }

  .main-container {
    flex: 1;
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
</style>
