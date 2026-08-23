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
  <div class="data-logs">
    <logQueryBar
      :bucket-id="logBucketId"
      v-model:query-text="queryText"
      v-model:time-preset="timePreset"
      v-model:custom-time-range="customTimeRange"
      :loading="loading"
      @search="handleSearch"
    />

    <logHistogram :total="pagination.total" :bars="histogramBars" />

    <logListPanel
      v-model:view-mode="viewMode"
      v-model:wrap-line="wrapLine"
      :loading="loading"
      :logs="displayLogs"
      :pagination="pagination"
      :sort-desc="sortDesc"
      @toggle-sort="toggleSort"
      @size-change="onSizeChange"
      @page-change="onPageChange"
    />
  </div>
</template>

<script lang="ts">
import type { ILogEntry } from "@/types/api/track"
import { ElMessage } from "element-plus"
import { DEFAULT_LOG_BUCKET_ID } from "@/config/track"
import { queryLogsApi } from "@/api/track"
import logQueryBar from "./components/logQueryBar.vue"
import logHistogram from "./components/logHistogram.vue"
import logListPanel from "./components/logListPanel.vue"
import {
  buildHistogramBars,
  getLogTimeRange,
  normalizeLogEntry,
  parseLogQuery,
  sortLogs,
  type LogViewMode
} from "./utils/logUtils"

export default defineComponent({
  components: {
    logQueryBar,
    logHistogram,
    logListPanel
  },
  setup() {
    const loading = ref(false)
    const logList = ref<ILogEntry[]>([])
    const logBucketId = DEFAULT_LOG_BUCKET_ID
    const queryText = ref("*")
    const timePreset = ref("15m")
    const customTimeRange = ref<string[]>([])
    const viewMode = ref<LogViewMode>("raw")
    const wrapLine = ref(true)
    const sortDesc = ref(true)
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const displayLogs = computed(() => sortLogs(logList.value, sortDesc.value))
    const histogramBars = computed(() => buildHistogramBars(logList.value))

    const fetchLogList = async () => {
      if (timePreset.value === "custom" && customTimeRange.value.length !== 2) {
        ElMessage.warning("请选择自定义时间范围")
        return
      }
      const { startTime, endTime } = getLogTimeRange(timePreset.value, customTimeRange.value)
      const filters = parseLogQuery(queryText.value)

      loading.value = true
      const res = await queryLogsApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        bucketId: logBucketId,
        level: filters.level || undefined,
        keyword: filters.keyword || undefined,
        userFilter: filters.userFilter || undefined,
        startTime,
        endTime
      })
      loading.value = false
      if (res.code === 0) {
        logList.value = (res.result.logs || []).map(normalizeLogEntry)
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "查询失败")
      }
    }

    const toggleSort = () => {
      sortDesc.value = !sortDesc.value
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchLogList()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchLogList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchLogList()
    }

    onMounted(fetchLogList)

    return {
      logBucketId,
      loading,
      displayLogs,
      histogramBars,
      queryText,
      timePreset,
      customTimeRange,
      viewMode,
      wrapLine,
      sortDesc,
      pagination,
      toggleSort,
      handleSearch,
      onSizeChange,
      onPageChange
    }
  }
})
</script>

<style lang="less">
.data-logs {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 120px);
  padding: 12px 16px;
  background: #f5f7fa;
  box-sizing: border-box;
}
</style>
