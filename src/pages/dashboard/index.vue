<template>
  <div class="dashboard" v-loading="loading">
    <div class="dashboard__welcome">
      <div class="dashboard__welcome-text">
        <h1 class="dashboard__welcome-title">欢迎回来，{{ username }}</h1>
        <p class="dashboard__welcome-desc">运营工作台 · {{ todayText }}</p>
      </div>
      <el-button :loading="loading" @click="fetchData">刷新</el-button>
    </div>

    <el-tabs v-model="activeTab" class="dashboard__tabs">
      <el-tab-pane label="概览与待办" name="overview">
        <div class="dashboard__stats">
          <div
            v-for="stat in stats"
            :key="stat.title"
            class="dashboard__stat-card"
            :style="{ borderTopColor: stat.color }"
            @click="goTo(stat.path)"
          >
            <div class="dashboard__stat-card-icon" :style="{ backgroundColor: stat.color }">
              <img class="dashboard__stat-card-icon-img" src="@/pages/dashboard/images/dashboard.svg" alt="" />
            </div>
            <div class="dashboard__stat-card-body">
              <h3 class="dashboard__stat-card-value">{{ stat.value.toLocaleString() }}</h3>
              <p class="dashboard__stat-card-label">{{ stat.title }}</p>
            </div>
          </div>
        </div>

        <div class="dashboard__inbox">
          <div class="dashboard__inbox-header">
            <h2 class="dashboard__inbox-title">待办收件箱</h2>
            <span class="dashboard__inbox-total">共 {{ inboxTotal }} 条</span>
          </div>
          <div v-if="inboxList.length" class="dashboard__inbox-list">
            <div
              v-for="item in inboxList"
              :key="`${item.category}-${item.entityId}`"
              class="dashboard__inbox-item"
              @click="goInboxItem(item)"
            >
              <el-tag class="dashboard__inbox-tag" size="small">{{ categoryLabel(item.category) }}</el-tag>
              <div class="dashboard__inbox-item-body">
                <div class="dashboard__inbox-item-title">{{ item.title }}</div>
                <div class="dashboard__inbox-item-summary">{{ item.summary }}</div>
              </div>
              <span class="dashboard__inbox-item-time">{{ item.createdAt }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无待办" :image-size="80" />
        </div>

        <div class="dashboard__actions">
          <h2 class="dashboard__actions-title">快速操作</h2>
          <div class="dashboard__actions-row">
            <el-button type="primary" size="large" @click="goTo('/user/list')">用户管理</el-button>
            <el-button type="success" size="large" @click="goTo('/compliance/sessions')">会话审计</el-button>
            <el-button type="danger" size="large" @click="goTo('/safety/cases')">待办处置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="近7日趋势" name="trends">
        <div class="dashboard__trends">
          <div v-for="series in trendSeries" :key="series.key" class="dashboard__trend-panel">
            <div class="dashboard__trend-panel-title">{{ series.label }}</div>
            <div class="dashboard__trend-bars">
              <div v-for="(val, idx) in series.values" :key="`${series.key}-${idx}`" class="dashboard__trend-bar-wrap">
                <div
                  class="dashboard__trend-bar"
                  :style="{ height: barHeight(val, series.max) }"
                  :title="`${trendDays[idx]}: ${val}`"
                />
                <span class="dashboard__trend-bar-value">{{ val }}</span>
                <span class="dashboard__trend-bar-label">{{ formatDayLabel(trendDays[idx]) }}</span>
              </div>
            </div>
          </div>
          <el-empty v-if="!trendSeries.length" description="暂无趋势数据" :image-size="80" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import type { IDashboardInboxItem, IDashboardOverview, IDashboardTrendSeries } from "@/types/api/overview"
import { ElMessage } from "element-plus"
import { getDashboardInboxApi, getDashboardOverviewApi, getDashboardTrendsApi } from "@/api/overview"

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const username = localStorage.getItem("username") || "管理员"
    const loading = ref(false)
    const activeTab = ref("overview")
    const todayText = new Date().toLocaleDateString()
    const trendDays = ref<string[]>([])
    const trendSeries = ref<(IDashboardTrendSeries & { max: number })[]>([])

    const overview = ref<IDashboardOverview>({
      userTotal: 0,
      groupTotal: 0,
      friendTotal: 0,
      messageTotal: 0,
      momentTotal: 0,
      blockTotal: 0,
      pendingDeveloperCount: 0,
      pendingAppCount: 0,
      pendingFeedbackCount: 0,
      pendingReportCount: 0,
      pendingCaseCount: 0,
      onlineUserCount: 0
    })

    const inboxList = ref<IDashboardInboxItem[]>([])
    const inboxTotal = ref(0)

    const stats = computed(() => [
      { title: "在线用户", value: overview.value.onlineUserCount, color: "#ff7d45", path: "/system/online" },
      { title: "用户总数", value: overview.value.userTotal, color: "#409eff", path: "/user/list" },
      { title: "群组总数", value: overview.value.groupTotal, color: "#67c23a", path: "/compliance/sessions" },
      { title: "聊天消息", value: overview.value.messageTotal, color: "#f56c6c", path: "/compliance/sessions" },
      { title: "待处理举报", value: overview.value.pendingReportCount, color: "#e6a23c", path: "/safety/cases?tab=reports" },
      { title: "待处理工单", value: overview.value.pendingCaseCount, color: "#909399", path: "/safety/cases?tab=cases" },
      { title: "待处理反馈", value: overview.value.pendingFeedbackCount, color: "#b88230", path: "/service/feedback" }
    ])

    const barHeight = (val: number, max: number) => {
      if (!max) return "4px"
      const pct = Math.max(8, Math.round((val / max) * 100))
      return `${pct}%`
    }

    const formatDayLabel = (day: string) => {
      if (!day || day.length < 10) return day
      return day.slice(5)
    }

    const categoryLabel = (category: string) => {
      const map: Record<string, string> = {
        report: "举报",
        case: "工单",
        feedback: "反馈",
        developer: "开发者",
        app: "应用"
      }
      return map[category] || category
    }

    const fetchData = async () => {
      loading.value = true
      const [overviewRes, inboxRes, trendsRes] = await Promise.all([
        getDashboardOverviewApi(),
        getDashboardInboxApi(20),
        getDashboardTrendsApi(7)
      ])
      loading.value = false
      if (overviewRes.code === 0) {
        overview.value = overviewRes.result
      } else {
        ElMessage.error(overviewRes.msg || "获取概览失败")
      }
      if (inboxRes.code === 0) {
        inboxList.value = inboxRes.result.list || []
        inboxTotal.value = inboxRes.result.total || 0
      }
      if (trendsRes.code === 0) {
        trendDays.value = trendsRes.result.days || []
        trendSeries.value = (trendsRes.result.series || []).map(s => ({
          ...s,
          max: Math.max(...(s.values || []), 1)
        }))
      }
    }

    const goTo = (path: string) => {
      router.push(path)
    }

    const goInboxItem = (item: IDashboardInboxItem) => {
      if (item.action) {
        router.push(item.action)
      }
    }

    onMounted(() => {
      const tab = route.query.tab as string
      if (tab === "trends" || tab === "overview") {
        activeTab.value = tab
      }
      fetchData()
    })

    return {
      username,
      loading,
      activeTab,
      todayText,
      stats,
      inboxList,
      inboxTotal,
      trendDays,
      trendSeries,
      categoryLabel,
      barHeight,
      formatDayLabel,
      goTo,
      goInboxItem,
      fetchData
    }
  }
})
</script>

<style lang="less">
.dashboard {
  padding: 20px;

  .dashboard__welcome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .dashboard__welcome-title {
      margin-top: 0;
      margin-bottom: 8px;
      margin-left: 0;
      margin-right: 0;
      font-size: 22px;
    }

    .dashboard__welcome-desc {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 14px;
    }
  }

  .dashboard__tabs {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 0 20px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .dashboard__stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
    padding-top: 8px;
  }

  .dashboard__stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    border-top-width: 3px;
    border-top-style: solid;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;

    .dashboard__stat-card-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      .dashboard__stat-card-icon-img {
        width: 24px;
        height: 24px;
      }
    }

    .dashboard__stat-card-body {
      .dashboard__stat-card-value {
        margin-top: 0;
        margin-bottom: 4px;
        margin-left: 0;
        margin-right: 0;
        font-size: 24px;
      }

      .dashboard__stat-card-label {
        margin-top: 0;
        margin-bottom: 0;
        margin-left: 0;
        margin-right: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .dashboard__inbox {
    margin-bottom: 24px;
    padding: 20px;
    background-color: #fafafa;
    border-radius: 8px;

    .dashboard__inbox-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .dashboard__inbox-title {
        margin-top: 0;
        margin-bottom: 0;
        margin-left: 0;
        margin-right: 0;
        font-size: 18px;
      }

      .dashboard__inbox-total {
        color: #909399;
        font-size: 13px;
      }
    }

    .dashboard__inbox-list {
      .dashboard__inbox-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 0;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom-color: #ebeef5;
        cursor: pointer;

        .dashboard__inbox-tag {
          flex-shrink: 0;
        }

        .dashboard__inbox-item-body {
          flex: 1;
          min-width: 0;

          .dashboard__inbox-item-title {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .dashboard__inbox-item-summary {
            color: #606266;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .dashboard__inbox-item-time {
          flex-shrink: 0;
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }

  .dashboard__actions {
    padding: 20px;
    background-color: #fafafa;
    border-radius: 8px;

    .dashboard__actions-title {
      margin-top: 0;
      margin-bottom: 16px;
      margin-left: 0;
      margin-right: 0;
      font-size: 18px;
    }

    .dashboard__actions-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .dashboard__trends {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    padding-top: 8px;

    .dashboard__trend-panel {
      padding: 16px;
      background-color: #fafafa;
      border-radius: 8px;

      .dashboard__trend-panel-title {
        font-weight: 500;
        margin-bottom: 12px;
      }

      .dashboard__trend-bars {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        min-height: 120px;
      }

      .dashboard__trend-bar-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .dashboard__trend-bar {
        width: 100%;
        max-width: 32px;
        background-color: #409eff;
        border-radius: 4px 4px 0 0;
        min-height: 4px;
      }

      .dashboard__trend-bar-value {
        font-size: 11px;
        color: #606266;
      }

      .dashboard__trend-bar-label {
        font-size: 10px;
        color: #909399;
      }
    }
  }
}
</style>
