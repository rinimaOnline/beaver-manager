<template>
  <div class="app-main">
    <router-view />
  </div>
</template>

<script lang="ts">
export default defineComponent({
  setup() {
    return {}
  }
})
</script>

<style lang="less" scoped>
.app-main {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
