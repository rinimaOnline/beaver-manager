<script lang="ts">
export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()

    onMounted(() => {
      router.replace({ path: `/${route.params.path}`, query: route.query })
    })

    return {}
  }
})
</script>

<template>
  <div class="redirect-page">
    <div class="loading">
      <el-loading-text>页面跳转中...</el-loading-text>
    </div>
  </div>
</template>

<style lang="less" scoped>
.redirect-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.loading {
  text-align: center;
  color: #666;
}
</style>
