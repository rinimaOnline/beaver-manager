<template>
  <div class="analytics-overview" v-loading="loading">
    <div class="analytics-overview__header">
      <h2 class="analytics-overview__title">数据大盘</h2>
      <p class="analytics-overview__hint">全站核心指标、近7日运营趋势与待办积压，点击卡片可下钻</p>
    </div>

    <div class="analytics-overview__section">
      <h3 class="analytics-overview__section-title">业务规模</h3>
      <div class="analytics-overview__grid">
        <div
          v-for="item in scaleStats"
          :key="item.key"
          class="analytics-overview__card"
          :style="{ borderTopColor: item.color }"
          @click="goTo(item.path)"
        >
          <span class="analytics-overview__card-value">{{ item.value.toLocaleString() }}</span>
          <span class="analytics-overview__card-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="analytics-overview__section">
      <h3 class="analytics-overview__section-title">近7日趋势</h3>
      <div class="analytics-overview__trends">
        <div
          v-for="series in trendSeries"
          :key="series.key"
          class="analytics-overview__trend-panel"
        >
          <div class="analytics-overview__trend-panel-title">{{ series.label }}</div>
          <div class="analytics-overview__trend-bars">
            <div
              v-for="(val, idx) in series.values"
              :key="`${series.key}-${idx}`"
              class="analytics-overview__trend-bar-wrap"
            >
              <div
                class="analytics-overview__trend-bar"
                :style="{ height: barHeight(val, series.max) }"
                :title="`${trendDays[idx]}: ${val}`"
              />
              <span class="analytics-overview__trend-bar-value">{{ val }}</span>
              <span class="analytics-overview__trend-bar-label">{{ formatDayLabel(trendDays[idx]) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="analytics-overview__section">
      <h3 class="analytics-overview__section-title">待办积压</h3>
      <div class="analytics-overview__grid">
        <div
          v-for="item in pendingStats"
          :key="item.key"
          class="analytics-overview__card analytics-overview__card--pending"
          :style="{ borderTopColor: item.color }"
          @click="goTo(item.path)"
        >
          <span class="analytics-overview__card-value">{{ item.value.toLocaleString() }}</span>
          <span class="analytics-overview__card-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="analytics-overview__section">
      <h3 class="analytics-overview__section-title">快捷入口</h3>
      <div class="analytics-overview__actions">
        <el-button type="primary" @click="goTo('/search')">统一检索</el-button>
        <el-button @click="goTo('/compliance/sessions')">会话审计</el-button>
        <el-button @click="goTo('/safety/reports')">举报中心</el-button>
        <el-button @click="goTo('/system/audit-logs')">全量审计</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IDashboardOverview, IDashboardTrendSeries } from "@/types/api/overview"
import { ElMessage } from "element-plus"
import { getDashboardOverviewApi, getDashboardTrendsApi } from "@/api/overview"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
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
      pendingCaseCount: 0
    })

    const scaleStats = computed(() => [
      { key: "user", label: "用户总数", value: overview.value.userTotal, color: "#409eff", path: "/user/search" },
      { key: "group", label: "群组总数", value: overview.value.groupTotal, color: "#67c23a", path: "/group/search" },
      { key: "friend", label: "好友关系", value: overview.value.friendTotal, color: "#e6a23c", path: "/friend/relations" },
      { key: "message", label: "聊天消息", value: overview.value.messageTotal, color: "#f56c6c", path: "/compliance/messages" },
      { key: "moment", label: "社区动态", value: overview.value.momentTotal, color: "#909399", path: "/community/moments" },
      { key: "block", label: "拉黑记录", value: overview.value.blockTotal, color: "#b88230", path: "/friend/blocks" }
    ])

    const pendingStats = computed(() => [
      { key: "report", label: "待处理举报", value: overview.value.pendingReportCount, color: "#f56c6c", path: "/safety/reports" },
      { key: "case", label: "待处理工单", value: overview.value.pendingCaseCount, color: "#e6a23c", path: "/safety/cases" },
      { key: "feedback", label: "待处理反馈", value: overview.value.pendingFeedbackCount, color: "#409eff", path: "/service/feedback" },
      { key: "developer", label: "待审开发者", value: overview.value.pendingDeveloperCount, color: "#67c23a", path: "/open/developers" },
      { key: "app", label: "待审应用", value: overview.value.pendingAppCount, color: "#909399", path: "/open/apps?auditStatus=0" }
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

    const fetchData = async () => {
      loading.value = true
      const [overviewRes, trendsRes] = await Promise.all([
        getDashboardOverviewApi(),
        getDashboardTrendsApi(7)
      ])
      loading.value = false

      if (overviewRes.code === 0) {
        overview.value = overviewRes.result
      } else {
        ElMessage.error(overviewRes.msg || "加载概览失败")
      }

      if (trendsRes.code === 0) {
        trendDays.value = trendsRes.result.days || []
        trendSeries.value = (trendsRes.result.series || []).map(s => ({
          ...s,
          max: Math.max(...(s.values || []), 1)
        }))
      }
    }

    const goTo = (path: string) => router.push(path)

    onMounted(fetchData)

    return { loading, scaleStats, pendingStats, trendDays, trendSeries, barHeight, formatDayLabel, goTo }
  }
})
</script>

<style lang="less">
.analytics-overview {
  padding: 20px;

  .analytics-overview__header {
    margin-bottom: 24px;

    .analytics-overview__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .analytics-overview__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .analytics-overview__section {
    margin-bottom: 28px;

    .analytics-overview__section-title {
      margin-top: 0;
      margin-bottom: 12px;
      margin-left: 0;
      margin-right: 0;
      font-size: 15px;
      color: #303133;
    }
  }

  .analytics-overview__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .analytics-overview__card {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    border-top-width: 3px;
    border-top-style: solid;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .analytics-overview__card-value {
      display: block;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 6px;
    }

    .analytics-overview__card-label {
      font-size: 13px;
      color: #909399;
    }
  }

  .analytics-overview__trends {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .analytics-overview__trend-panel {
      padding: 16px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .analytics-overview__trend-panel-title {
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .analytics-overview__trend-bars {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 120px;

        .analytics-overview__trend-bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;

          .analytics-overview__trend-bar {
            width: 100%;
            max-width: 36px;
            min-height: 4px;
            background-color: #409eff;
            border-radius: 4px 4px 0 0;
            transition: height 0.2s;
          }

          .analytics-overview__trend-bar-value {
            margin-top: 4px;
            font-size: 11px;
            color: #606266;
          }

          .analytics-overview__trend-bar-label {
            margin-top: 2px;
            font-size: 10px;
            color: #909399;
          }
        }
      }
    }
  }

  .analytics-overview__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
