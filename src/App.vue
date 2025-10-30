<script lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn"
import { useUserStore } from "@/pinia/user/user"

export default defineComponent({
  setup() {
    const userStore = useUserStore()

    onMounted(() => {
      // 页面刷新时初始化用户信息
      userStore.initUserInfo()
    })

    return {
      zhCn
    }
  }
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
</style>
