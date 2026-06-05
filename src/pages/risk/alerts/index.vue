<template>
  <div class="risk-alerts" v-loading="loading">
    <div class="risk-alerts__header">
      <h2 class="risk-alerts__title">实时告警</h2>
      <p class="risk-alerts__hint">对接 /admin/overview/dashboard 与 inbox，聚合待办积压</p>
    </div>

    <div class="risk-alerts__stats">
      <div v-for="item in alertStats" :key="item.key" class="risk-alerts__stat" @click="goTo(item.path)">
        <span class="risk-alerts__stat-num">{{ item.value }}</span>
        <span class="risk-alerts__stat-label">{{ item.label }}</span>
      </div>
    </div>

    <div class="risk-alerts__list">
      <div
        v-for="item in alertList"
        :key="`${item.category}-${item.entityId}`"
        class="risk-alerts__item"
        @click="goAction(item.action)"
      >
        <el-tag size="small">{{ categoryLabel(item.category) }}</el-tag>
        <div class="risk-alerts__item-body">
          <div class="risk-alerts__item-title">{{ item.title }}</div>
          <div class="risk-alerts__item-summary">{{ item.summary }}</div>
        </div>
        <span class="risk-alerts__item-time">{{ item.createdAt }}</span>
      </div>
      <el-empty v-if="!loading && !alertList.length" description="暂无告警" :image-size="80" />
    </div>
  </div>
</template>

<script lang="ts">
import type { IDashboardInboxItem, IDashboardOverview } from "@/types/api/overview"
import { ElMessage } from "element-plus"
import { getDashboardInboxApi, getDashboardOverviewApi } from "@/api/overview"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const alertList = ref<IDashboardInboxItem[]>([])
    const overview = ref<IDashboardOverview>({
      userTotal: 0, groupTotal: 0, friendTotal: 0, messageTotal: 0, momentTotal: 0, blockTotal: 0,
      pendingDeveloperCount: 0, pendingAppCount: 0, pendingFeedbackCount: 0,
      pendingReportCount: 0, pendingCaseCount: 0
    })

    const alertStats = computed(() => [
      { key: "report", label: "待处理举报", value: overview.value.pendingReportCount, path: "/safety/reports" },
      { key: "case", label: "待处理工单", value: overview.value.pendingCaseCount, path: "/safety/cases" },
      { key: "feedback", label: "待处理反馈", value: overview.value.pendingFeedbackCount, path: "/service/tickets" },
      { key: "block", label: "拉黑记录", value: overview.value.blockTotal, path: "/risk/blocklist" }
    ])

    const categoryLabel = (category: string) => {
      const map: Record<string, string> = {
        report: "举报", case: "工单", feedback: "反馈", developer: "开发者", app: "应用"
      }
      return map[category] || category
    }

    const fetchData = async () => {
      loading.value = true
      const overviewRes = await getDashboardOverviewApi()
      const inboxRes = await getDashboardInboxApi(30)
      loading.value = false
      if (overviewRes.code === 0) {
        overview.value = overviewRes.result
      }
      if (inboxRes.code === 0) {
        alertList.value = inboxRes.result.list || []
      } else {
        ElMessage.error(inboxRes.msg || "加载告警失败")
      }
    }

    const goTo = (path: string) => router.push(path)
    const goAction = (action: string) => {
      if (action) {
        router.push(action)
      }
    }

    onMounted(fetchData)

    return { loading, alertStats, alertList, categoryLabel, goTo, goAction }
  }
})
</script>

<style lang="less">
.risk-alerts {
  padding: 20px;

  .risk-alerts__header {
    margin-bottom: 16px;

    .risk-alerts__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .risk-alerts__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .risk-alerts__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;

    .risk-alerts__stat {
      padding: 16px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      text-align: center;

      .risk-alerts__stat-num {
        display: block;
        font-size: 24px;
        font-weight: 600;
        color: #f56c6c;
      }

      .risk-alerts__stat-label {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .risk-alerts__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    background-color: #ffffff;
    border-radius: 8px;
    cursor: pointer;

    .risk-alerts__item-body {
      flex: 1;
      min-width: 0;

      .risk-alerts__item-title {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .risk-alerts__item-summary {
        font-size: 13px;
        color: #909399;
      }
    }

    .risk-alerts__item-time {
      font-size: 12px;
      color: #c0c4cc;
      flex-shrink: 0;
    }
  }
}
</style>
