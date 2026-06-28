<script lang="ts">
export default defineComponent({
  setup() {
    const router = useRouter()

    const goBack = () => {
      router.back()
    }

    const goHome = () => {
      router.push("/")
    }

    onMounted(() => {})

    return {
      goBack,
      goHome
    }
  }
})
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">
        404
      </div>
      <div class="error-message">
        页面不存在
      </div>
      <div class="error-desc">
        抱歉，您访问的页面不存在或已被删除
      </div>
      <div class="error-actions">
        <el-button @click="goBack">
          返回上页
        </el-button>
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.error-content {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 72px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 20px;
}

.error-message {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.error-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.error-actions {
  .el-button {
    margin: 0 8px;
  }
}
</style>
