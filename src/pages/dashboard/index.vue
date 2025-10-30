<script lang="ts">
export default defineComponent({
  setup() {
    const username = localStorage.getItem("username") || "管理员"

    const stats = ref([
      { title: "今日访问", value: "1,234", color: "#409eff" },
      { title: "用户总数", value: "5,678", color: "#67c23a" },
      { title: "订单总数", value: "9,012", color: "#e6a23c" },
      { title: "营业额", value: "¥12,345", color: "#f56c6c" }
    ])

    onMounted(() => {})

    return {
      username,
      stats
    }
  }
})
</script>

<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h1>欢迎回来，{{ username }}！</h1>
      <p>今天是 {{ new Date().toLocaleDateString() }}，祝您工作愉快！</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="stat-card"
        :style="{ borderTopColor: stat.color }"
      >
        <div class="stat-icon" :style="{ backgroundColor: stat.color }">
          📊
        </div>
        <div class="stat-content">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.title }}</p>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h2>快速操作</h2>
      <div class="actions-grid">
        <el-button type="primary" size="large">
          用户管理
        </el-button>
        <el-button type="success" size="large">
          数据统计
        </el-button>
        <el-button type="warning" size="large">
          系统设置
        </el-button>
        <el-button type="info" size="large">
          帮助文档
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.dashboard {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border-top: 4px solid #409eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 15px;
    color: #fff;
  }

  .stat-content {
    h3 {
      margin: 0 0 5px 0;
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
}

.quick-actions {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #333;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style>
