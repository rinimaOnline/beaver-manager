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
  <div class="open-integrations">
    <div class="open-integrations__header">
      <h2 class="open-integrations__title">机器人与 Webhook</h2>
      <p class="open-integrations__hint">服务端按能力筛选集成应用，Webhook 投递日志对接 /admin/open/webhook/logs</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="集成应用" name="apps">
        <el-form :inline="true" class="open-integrations__form">
          <el-form-item label="关键词">
            <el-input v-model="keyword" placeholder="应用名 / AppID" clearable @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item label="能力">
            <el-select v-model="capFilter" placeholder="全部" clearable style="width: 120px">
              <el-option label="机器人" value="robot" />
              <el-option label="Webhook" value="webhook" />
            </el-select>
          </el-form-item>
          <el-form-item label="发布状态">
            <el-select v-model="statusFilter" placeholder="全部" clearable style="width: 120px">
              <el-option label="已发布" :value="OPEN_APP_STATUS_FILTER.PUBLISHED" />
              <el-option label="已禁用" :value="OPEN_APP_STATUS_FILTER.DISABLED" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
            <el-button @click="goApps">应用管理</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="appList" border stripe>
          <el-table-column prop="name" label="应用名" min-width="140" />
          <el-table-column prop="appId" label="AppID" min-width="160" show-overflow-tooltip />
          <el-table-column label="所有者" width="140">
            <template #default="{ row }">
              <el-link type="primary" @click="goUser(row.ownerUserId)">{{ row.ownerUserName || row.ownerUserId }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="能力" width="180">
            <template #default="{ row }">
              <el-tag v-if="row.enableRobot" size="small" type="primary">机器人</el-tag>
              <el-tag v-if="row.enableWebhook" size="small" type="success">Webhook</el-tag>
              <el-tag v-if="row.enableOAuth" size="small" type="info">OAuth</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="(OPEN_APP_STATUS[row.status]?.type as any) || 'info'" size="small">
                {{ OPEN_APP_STATUS[row.status]?.text || row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openDetail(row)">详情</el-button>
              <el-button link @click="viewWebhookLogs(row.appId)">投递日志</el-button>
              <el-button v-if="row.status === 1" link type="danger" @click="toggleStatus(row, 3)">禁用</el-button>
              <el-button v-else-if="row.status === 2" link type="success" @click="toggleStatus(row, 4)">启用</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="open-integrations__pagination"
          background
          layout="total, prev, pager, next"
          :total="appPagination.total"
          :page-size="appPagination.pageSize"
          :current-page="appPagination.page"
          @current-change="onAppPageChange"
        />
      </el-tab-pane>

      <el-tab-pane label="Webhook 日志" name="logs">
        <el-form :inline="true" class="open-integrations__form">
          <el-form-item label="AppID">
            <el-input v-model="logFilter.appId" placeholder="应用 ID" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="事件类型">
            <el-input v-model="logFilter.eventType" placeholder="如 message.created" clearable style="width: 160px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="logFilter.status" placeholder="全部" clearable style="width: 100px">
              <el-option label="成功" :value="1" />
              <el-option label="失败" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="logLoading" @click="handleLogSearch">查询</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="logLoading" :data="webhookLogs" border stripe size="small">
          <el-table-column prop="appId" label="AppID" min-width="140" show-overflow-tooltip />
          <el-table-column prop="eventType" label="事件" width="140" show-overflow-tooltip />
          <el-table-column prop="targetUrl" label="目标 URL" min-width="180" show-overflow-tooltip />
          <el-table-column prop="httpStatus" label="HTTP" width="70" />
          <el-table-column prop="latencyMs" label="耗时(ms)" width="90" />
          <el-table-column prop="retryCount" label="重试" width="60" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="(OPEN_WEBHOOK_LOG_STATUS[row.status]?.type as any) || 'info'" size="small">
                {{ OPEN_WEBHOOK_LOG_STATUS[row.status]?.text || row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="errorMessage" label="错误" min-width="140" show-overflow-tooltip />
          <el-table-column label="时间" width="170">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="open-integrations__pagination"
          background
          layout="total, prev, pager, next"
          :total="logPagination.total"
          :page-size="logPagination.pageSize"
          :current-page="logPagination.page"
          @current-change="onLogPageChange"
        />
      </el-tab-pane>
    </el-tabs>

    <el-drawer v-model="drawerVisible" title="集成详情" size="440px">
      <el-descriptions v-if="currentApp" :column="1" border size="small">
        <el-descriptions-item label="应用名">{{ currentApp.name }}</el-descriptions-item>
        <el-descriptions-item label="AppID">{{ currentApp.appId }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentApp.description || "-" }}</el-descriptions-item>
        <el-descriptions-item label="所有者">
          <el-button link type="primary" @click="goUser(currentApp.ownerUserId)">
            {{ currentApp.ownerUserName }} ({{ currentApp.ownerUserId }})
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="机器人">{{ currentApp.enableRobot ? "已开启" : "未开启" }}</el-descriptions-item>
        <el-descriptions-item label="Webhook">{{ currentApp.enableWebhook ? "已开启" : "未开启" }}</el-descriptions-item>
        <el-descriptions-item label="OAuth">{{ currentApp.enableOAuth ? "已开启" : "未开启" }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="(OPEN_APP_STATUS[currentApp.status]?.type as any) || 'info'" size="small">
            {{ OPEN_APP_STATUS[currentApp.status]?.text }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核">
          {{ OPEN_AUDIT_STATUS[currentApp.auditStatus]?.text || currentApp.auditStatus }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(currentApp.createdAt) }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="currentApp" class="drawer-actions">
        <el-button type="primary" @click="viewWebhookLogs(currentApp.appId)">查看投递日志</el-button>
        <el-button @click="goApps">前往应用管理</el-button>
        <el-button v-if="currentApp.status === 1" type="danger" @click="toggleStatus(currentApp, 3)">禁用应用</el-button>
        <el-button v-else-if="currentApp.status === 2" type="success" @click="toggleStatus(currentApp, 4)">启用应用</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import type { IOpenAppInfo, IOpenWebhookLogInfo } from "@/types/api/open"
import {
  OPEN_APP_STATUS,
  OPEN_APP_STATUS_FILTER,
  OPEN_AUDIT_STATUS,
  OPEN_CAPABILITY_TYPE,
  OPEN_WEBHOOK_LOG_STATUS
} from "@/types/api/open"
import { ElMessage, ElMessageBox } from "element-plus"
import { getOpenAppListApi, getOpenWebhookLogListApi, updateOpenAppStatusApi } from "@/api/open"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const activeTab = ref("apps")
    const loading = ref(false)
    const logLoading = ref(false)
    const keyword = ref("")
    const capFilter = ref("")
    const statusFilter = ref<number | undefined>()
    const drawerVisible = ref(false)
    const currentApp = ref<IOpenAppInfo | null>(null)
    const appList = ref<IOpenAppInfo[]>([])
    const webhookLogs = ref<IOpenWebhookLogInfo[]>([])
    const appPagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const logPagination = reactive({ page: 1, pageSize: 20, total: 0 })
    const logFilter = reactive({ appId: "", eventType: "", status: undefined as number | undefined })

    const resolveCapabilityType = () => {
      if (capFilter.value === "robot") return OPEN_CAPABILITY_TYPE.ROBOT
      if (capFilter.value === "webhook") return OPEN_CAPABILITY_TYPE.WEBHOOK
      return OPEN_CAPABILITY_TYPE.ROBOT_OR_WEBHOOK
    }

    const fetchAppList = async () => {
      loading.value = true
      const res = await getOpenAppListApi({
        page: appPagination.page,
        pageSize: appPagination.pageSize,
        keyword: keyword.value.trim() || undefined,
        status: statusFilter.value,
        auditStatus: 2,
        capabilityType: resolveCapabilityType()
      })
      loading.value = false
      if (res.code === 0) {
        appList.value = res.result.list || []
        appPagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const fetchWebhookLogs = async () => {
      logLoading.value = true
      const res = await getOpenWebhookLogListApi({
        page: logPagination.page,
        pageSize: logPagination.pageSize,
        appId: logFilter.appId.trim() || undefined,
        eventType: logFilter.eventType.trim() || undefined,
        status: logFilter.status
      })
      logLoading.value = false
      if (res.code === 0) {
        webhookLogs.value = res.result.list || []
        logPagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载日志失败")
      }
    }

    const handleSearch = () => {
      appPagination.page = 1
      fetchAppList()
    }

    const handleLogSearch = () => {
      logPagination.page = 1
      fetchWebhookLogs()
    }

    const onAppPageChange = (page: number) => {
      appPagination.page = page
      fetchAppList()
    }

    const onLogPageChange = (page: number) => {
      logPagination.page = page
      fetchWebhookLogs()
    }

    const openDetail = (row: IOpenAppInfo) => {
      currentApp.value = row
      drawerVisible.value = true
    }

    const viewWebhookLogs = (appId: string) => {
      logFilter.appId = appId
      activeTab.value = "logs"
      drawerVisible.value = false
      handleLogSearch()
    }

    const toggleStatus = async (row: IOpenAppInfo, action: number) => {
      const label = action === 3 ? "禁用" : "启用"
      await ElMessageBox.confirm(`确认${label}应用「${row.name}」？`, label, { type: "warning" })
      const res = await updateOpenAppStatusApi({ appIds: [row.appId], action })
      if (res.code === 0) {
        ElMessage.success(`已${label}`)
        drawerVisible.value = false
        fetchAppList()
      } else {
        ElMessage.error(res.msg || `${label}失败`)
      }
    }

    const formatTime = (ts: number) => {
      if (!ts) return "-"
      return new Date(ts * 1000).toLocaleString()
    }

    const goApps = () => router.push("/open/apps")
    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    watch(activeTab, tab => {
      if (tab === "logs" && !webhookLogs.value.length) fetchWebhookLogs()
    })

    onMounted(() => {
      const qAppId = route.query.appId as string
      if (qAppId) {
        keyword.value = qAppId
        logFilter.appId = qAppId
      }
      fetchAppList()
    })

    return {
      activeTab, loading, logLoading, keyword, capFilter, statusFilter,
      drawerVisible, currentApp, appList, webhookLogs,
      appPagination, logPagination, logFilter,
      OPEN_APP_STATUS, OPEN_APP_STATUS_FILTER, OPEN_AUDIT_STATUS, OPEN_WEBHOOK_LOG_STATUS,
      handleSearch, handleLogSearch, onAppPageChange, onLogPageChange,
      openDetail, viewWebhookLogs, toggleStatus, formatTime, goApps, goUser
    }
  }
})
</script>

<style lang="less" scoped>
.open-integrations {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__pagination { margin-top: 16px; justify-content: flex-end; }

  .drawer-actions {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
