<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-manager-header-v1
-->

<template>
  <div class="operations" v-loading="loading">
    <header class="operations__header">
      <div class="operations__header-main">
        <h1 class="operations__title">运营工作台</h1>
        <p class="operations__subtitle">欢迎回来，{{ username }} · {{ todayText }}</p>
      </div>
      <el-button :icon="Refresh" :loading="loading" @click="fetchData">刷新数据</el-button>
    </header>

    <el-tabs v-model="activeTab" class="operations__tabs">
      <el-tab-pane label="数据概览" name="overview">
        <div class="operations__metrics">
          <div
            v-for="stat in stats"
            :key="stat.title"
            class="operations__metric"
            :class="{ 'operations__metric--alert': stat.alert && stat.value > 0 }"
            @click="goTo(stat.path)"
          >
            <div class="operations__metric-icon" :style="{ background: stat.bg }">
              <el-icon :size="22"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="operations__metric-body">
              <div class="operations__metric-value">{{ stat.value.toLocaleString() }}</div>
              <div class="operations__metric-label">{{ stat.title }}</div>
            </div>
          </div>
        </div>

        <div class="operations__body">
          <el-card class="operations__inbox" shadow="never">
            <template #header>
              <div class="operations__card-head">
                <span>收件箱</span>
                <el-tag v-if="inboxTotal" type="warning" size="small" effect="plain">{{ inboxTotal }} 条</el-tag>
              </div>
            </template>

            <el-scrollbar v-if="inboxList.length" max-height="420px">
              <div
                v-for="item in inboxList"
                :key="`${item.category}-${item.entityId}`"
                class="operations__inbox-item"
                @click="goInboxItem(item)"
              >
                <el-tag size="small" :type="categoryTagType(item.category)">{{ categoryLabel(item.category) }}</el-tag>
                <div class="operations__inbox-content">
                  <div class="operations__inbox-title">{{ item.title }}</div>
                  <div class="operations__inbox-summary">{{ item.summary }}</div>
                </div>
                <span class="operations__inbox-time">{{ item.createdAt }}</span>
              </div>
            </el-scrollbar>
            <el-empty v-else description="暂无收件项" :image-size="72" />
          </el-card>

          <div class="operations__aside">
            <el-card class="operations__shortcuts" shadow="never">
              <template #header>
                <span>快捷入口</span>
              </template>
              <div
                v-for="link in shortcuts"
                :key="link.path"
                class="operations__shortcut"
                @click="goTo(link.path)"
              >
                <div class="operations__shortcut-icon" :style="{ background: link.bg }">
                  <el-icon :size="18"><component :is="link.icon" /></el-icon>
                </div>
                <div class="operations__shortcut-text">
                  <div class="operations__shortcut-title">{{ link.title }}</div>
                  <div class="operations__shortcut-desc">{{ link.desc }}</div>
                </div>
                <el-icon class="operations__shortcut-arrow"><ArrowRight /></el-icon>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="近7日趋势" name="trends">
        <div v-if="trendSeries.length" class="operations__trends">
          <el-card
            v-for="series in trendSeries"
            :key="series.key"
            class="operations__trend-card"
            shadow="never"
          >
            <template #header>
              <span>{{ series.label }}</span>
            </template>
            <div class="operations__trend-chart">
              <div
                v-for="(val, idx) in series.values"
                :key="`${series.key}-${idx}`"
                class="operations__trend-col"
              >
                <span class="operations__trend-num">{{ val }}</span>
                <div class="operations__trend-track">
                  <div
                    class="operations__trend-bar"
                    :style="{ height: barHeight(val, series.max), background: series.color }"
                  />
                </div>
                <span class="operations__trend-day">{{ formatDayLabel(trendDays[idx]) }}</span>
              </div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无趋势数据" :image-size="80" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import type { Component } from "vue"
import type { IDashboardInboxItem, IDashboardOverview, IDashboardTrendSeries } from "@/types/api/overview"
import type { TagType } from "@/types/common"
import {
  ArrowRight,
  ChatDotRound,
  ChatLineRound,
  Connection,
  Grid,
  Refresh,
  User,
  UserFilled,
  Warning
} from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { getDashboardInboxApi, getDashboardOverviewApi, getDashboardTrendsApi } from "@/api/overview"

interface IStatItem {
  title: string
  value: number
  path: string
  icon: Component
  bg: string
  alert?: boolean
}

interface IShortcutItem {
  title: string
  desc: string
  path: string
  icon: Component
  bg: string
}

const trendColors = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"]

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const username = localStorage.getItem("username") || "管理员"
    const loading = ref(false)
    const activeTab = ref("overview")
    const todayText = new Date().toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    })
    const trendDays = ref<string[]>([])
    const trendSeries = ref<(IDashboardTrendSeries & { max: number; color: string })[]>([])

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

    const stats = computed<IStatItem[]>(() => [
      {
        title: "在线用户",
        value: overview.value.onlineUserCount,
        path: "/system/online",
        icon: Connection,
        bg: "linear-gradient(135deg, #ff9a56, #ff7d45)"
      },
      {
        title: "用户总数",
        value: overview.value.userTotal,
        path: "/user/list",
        icon: User,
        bg: "linear-gradient(135deg, #79bbff, #409eff)"
      },
      {
        title: "群组总数",
        value: overview.value.groupTotal,
        path: "/compliance/sessions",
        icon: UserFilled,
        bg: "linear-gradient(135deg, #95d475, #67c23a)"
      },
      {
        title: "聊天消息",
        value: overview.value.messageTotal,
        path: "/compliance/sessions",
        icon: ChatDotRound,
        bg: "linear-gradient(135deg, #f89898, #f56c6c)"
      },
      {
        title: "待处理反馈",
        value: overview.value.pendingFeedbackCount,
        path: "/service/feedback",
        icon: ChatLineRound,
        bg: "linear-gradient(135deg, #d4b06a, #b88230)",
        alert: true
      },
      {
        title: "待处理举报",
        value: overview.value.pendingReportCount,
        path: "/safety/reports",
        icon: Warning,
        bg: "linear-gradient(135deg, #f89898, #f56c6c)",
        alert: true
      },
      {
        title: "待审开发者",
        value: overview.value.pendingDeveloperCount,
        path: "/open/developers",
        icon: User,
        bg: "linear-gradient(135deg, #b3a0e8, #8a6fd6)",
        alert: true
      },
      {
        title: "待审应用",
        value: overview.value.pendingAppCount,
        path: "/open/apps",
        icon: Grid,
        bg: "linear-gradient(135deg, #7bd3d3, #3ba9a9)",
        alert: true
      }
    ])

    const shortcuts: IShortcutItem[] = [
      { title: "用户管理", desc: "查询、创建与封禁用户", path: "/user/list", icon: User, bg: "#ecf5ff" },
      { title: "会话审计", desc: "查看会话与消息记录", path: "/compliance/sessions", icon: ChatDotRound, bg: "#f0f9eb" },
      { title: "连接监控", desc: "实时在线用户与终端", path: "/system/online", icon: Connection, bg: "#fdf6ec" }
    ]

    const barHeight = (val: number, max: number) => {
      if (!max) return "4px"
      return `${Math.max(8, Math.round((val / max) * 100))}%`
    }

    const formatDayLabel = (day: string) => {
      if (!day || day.length < 10) return day
      return day.slice(5)
    }

    const categoryLabel = (category: string) => {
      const map: Record<string, string> = {
        feedback: "反馈",
        developer: "开发者",
        app: "应用"
      }
      return map[category] || category
    }

    const categoryTagType = (category: string): TagType => {
      const map: Record<string, TagType> = {
        feedback: "primary",
        developer: "info",
        app: "success"
      }
      return map[category] || "info"
    }

    const fetchData = async () => {
      loading.value = true
      try {
        const [overviewRes, inboxRes, trendsRes] = await Promise.all([
          getDashboardOverviewApi(),
          getDashboardInboxApi(20),
          getDashboardTrendsApi(7)
        ])
        if (overviewRes.code === 0) {
          overview.value = overviewRes.result
        } else {
          ElMessage.error(overviewRes.msg || "获取概览失败")
        }
        if (inboxRes.code === 0) {
          inboxList.value = inboxRes.result.list || []
          // 这里只取了前 20 条，条数要用服务端返回的 total，不能用当前页长度
          inboxTotal.value = inboxRes.result.total ?? inboxList.value.length
        }
        if (trendsRes.code === 0) {
          trendDays.value = trendsRes.result.days || []
          trendSeries.value = (trendsRes.result.series || []).map((s, i) => ({
            ...s,
            max: Math.max(...(s.values || []), 1),
            color: trendColors[i % trendColors.length]
          }))
        }
      } catch (error: any) {
        ElMessage.error(error?.message || "工作台数据加载失败")
      } finally {
        loading.value = false
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
      shortcuts,
      inboxList,
      inboxTotal,
      trendDays,
      trendSeries,
      categoryLabel,
      categoryTagType,
      barHeight,
      formatDayLabel,
      goTo,
      goInboxItem,
      fetchData,
      Refresh,
      ArrowRight
    }
  }
})
</script>

<style lang="less" scoped>
.operations {
  height: 100%;
  padding: 20px 24px;
  box-sizing: border-box;
  overflow: auto;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 600;
    color: #303133;
  }

  &__subtitle {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }

  &__tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }
  }

  &__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__metric {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

    &:hover {
      border-color: #c6e2ff;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
      transform: translateY(-1px);
    }

    &--alert {
      border-color: #fde2e2;

      &:hover {
        border-color: #fab6b6;
        box-shadow: 0 4px 12px rgba(245, 108, 108, 0.12);
      }
    }
  }

  &__metric-icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  &__metric-value {
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
    color: #303133;
  }

  &__metric-label {
    margin-top: 4px;
    font-size: 13px;
    color: #909399;
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 16px;
    align-items: start;

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  }

  &__inbox,
  &__shortcuts {
    border: 1px solid #ebeef5;
    border-radius: 10px;

    :deep(.el-card__header) {
      padding: 14px 18px;
      border-bottom: 1px solid #f0f2f5;
    }

    :deep(.el-card__body) {
      padding: 8px 18px 14px;
    }
  }

  &__card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    color: #303133;
  }

  &__inbox-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f2f3f5;
    cursor: pointer;
    transition: background 0.15s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #fafafa;
      margin: 0 -18px;
      padding-left: 18px;
      padding-right: 18px;
    }
  }

  &__inbox-content {
    flex: 1;
    min-width: 0;
  }

  &__inbox-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
  }

  &__inbox-summary {
    font-size: 13px;
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__inbox-time {
    flex-shrink: 0;
    font-size: 12px;
    color: #c0c4cc;
    line-height: 22px;
  }

  &__shortcut {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f2f3f5;
    cursor: pointer;
    transition: opacity 0.15s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      opacity: 0.85;

      .operations__shortcut-arrow {
        transform: translateX(2px);
      }
    }
  }

  &__shortcut-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606266;
  }

  &__shortcut-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  &__shortcut-desc {
    margin-top: 2px;
    font-size: 12px;
    color: #909399;
  }

  &__shortcut-arrow {
    margin-left: auto;
    color: #c0c4cc;
    transition: transform 0.15s;
  }

  &__trends {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }

  &__trend-card {
    border: 1px solid #ebeef5;
    border-radius: 10px;

    :deep(.el-card__header) {
      padding: 14px 18px;
      font-weight: 600;
      color: #303133;
    }

    :deep(.el-card__body) {
      padding: 12px 18px 18px;
    }
  }

  &__trend-chart {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    height: 160px;
  }

  &__trend-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    min-width: 0;
  }

  &__trend-num {
    font-size: 11px;
    color: #606266;
    margin-bottom: 6px;
  }

  &__trend-track {
    flex: 1;
    width: 100%;
    max-width: 36px;
    display: flex;
    align-items: flex-end;
    background: #f5f7fa;
    border-radius: 6px 6px 0 0;
  }

  &__trend-bar {
    width: 100%;
    border-radius: 6px 6px 0 0;
    min-height: 4px;
    transition: height 0.3s ease;
  }

  &__trend-day {
    margin-top: 8px;
    font-size: 11px;
    color: #909399;
  }
}
</style>
