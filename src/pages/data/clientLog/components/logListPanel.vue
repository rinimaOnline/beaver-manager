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
  <section class="log-list-panel">
    <div class="log-list-panel__head">
      <el-tabs model-value="raw" class="log-list-panel__tabs">
        <el-tab-pane label="原始日志" name="raw" />
      </el-tabs>
      <div class="log-list-panel__tools">
        <el-radio-group :model-value="viewMode" size="small" @update:model-value="onViewModeChange">
          <el-radio-button value="raw">原始</el-radio-button>
          <el-radio-button value="table">表格</el-radio-button>
        </el-radio-group>
        <span class="log-list-panel__tool-label">换行</span>
        <el-switch :model-value="wrapLine" size="small" @update:model-value="onWrapLineChange" />
        <el-button link type="primary" @click="emit('toggle-sort')">
          时间{{ sortDesc ? "降序" : "升序" }}
        </el-button>
      </div>
    </div>

    <div class="log-list-panel__pager log-list-panel__pager--top">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :page-sizes="[20, 50, 100]"
        small
        @size-change="onSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <div v-loading="loading" class="log-list-panel__content">
      <template v-if="viewMode === 'raw'">
        <div v-if="!logs.length" class="log-list-panel__empty">暂无日志</div>
        <div v-for="log in logs" :key="log.id" class="log-list-panel__entry">
          <div class="log-list-panel__entry-time">{{ formatTsFull(log.timestamp) }}</div>
          <pre class="log-list-panel__entry-json" :class="{ 'is-wrap': wrapLine }">{{ formatLogJson(log) }}</pre>
        </div>
      </template>

      <el-table v-else :data="logs" border stripe size="small">
        <el-table-column label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getLevelType(getLogLevel(row))" size="small">{{ getLogLevel(row) || "-" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模块" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ getLogModule(row) || "-" }}</template>
        </el-table-column>
        <el-table-column label="用户ID" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ getLogUserId(row) || "-" }}</template>
        </el-table-column>
        <el-table-column label="时间" width="168">
          <template #default="{ row }">{{ formatTs(row.timestamp) }}</template>
        </el-table-column>
        <el-table-column label="消息" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="log-list-panel__table-message">{{ getLogMessage(row) || "-" }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="log-list-panel__pager">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :page-sizes="[20, 50, 100]"
        small
        @size-change="onSizeChange"
        @current-change="onPageChange"
      />
    </div>
  </section>
</template>

<script lang="ts">
import type { ILogEntry } from "@/types/api/track"
import type { LogViewMode } from "../utils/logUtils"
import {
  formatLogJson,
  formatTs,
  formatTsFull,
  getLevelType,
  getLogLevel,
  getLogMessage,
  getLogModule,
  getLogUserId
} from "../utils/logUtils"

interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export default defineComponent({
  name: "LogListPanel",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    logs: {
      type: Array as PropType<ILogEntry[]>,
      default: () => []
    },
    pagination: {
      type: Object as PropType<PaginationState>,
      required: true
    },
    viewMode: {
      type: String as PropType<LogViewMode>,
      default: "raw"
    },
    wrapLine: {
      type: Boolean,
      default: true
    },
    sortDesc: {
      type: Boolean,
      default: true
    }
  },
  emits: ["update:viewMode", "update:wrapLine", "toggle-sort", "size-change", "page-change"],
  setup(_, { emit }) {
    // el-radio-group / el-switch 回调的载荷类型是宽松的联合类型，这里收敛回本组件的取值
    const onViewModeChange = (value: string | number | boolean | undefined) => {
      emit("update:viewMode", value === "table" ? "table" : "raw")
    }
    const onWrapLineChange = (value: string | number | boolean) => {
      emit("update:wrapLine", Boolean(value))
    }
    const onSizeChange = (size: number) => emit("size-change", size)
    const onPageChange = (page: number) => emit("page-change", page)

    return {
      emit,
      onViewModeChange,
      onWrapLineChange,
      onSizeChange,
      onPageChange,
      formatTs,
      formatTsFull,
      formatLogJson,
      getLogLevel,
      getLogUserId,
      getLogModule,
      getLogMessage,
      getLevelType
    }
  }
})
</script>

<style lang="less">
.log-list-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  flex-direction: column;

  .log-list-panel__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid #ebeef5;
    gap: 12px;
  }

  .log-list-panel__tabs {
    .el-tabs__header {
      margin: 0;
    }

    .el-tabs__nav-wrap::after {
      display: none;
    }
  }

  .log-list-panel__tools {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .log-list-panel__tool-label {
    font-size: 12px;
    color: #606266;
  }

  .log-list-panel__pager {
    display: flex;
    justify-content: flex-end;
    padding: 8px 12px;
    border-top: 1px solid #ebeef5;

    &--top {
      border-top: none;
      border-bottom: 1px solid #ebeef5;
    }
  }

  .log-list-panel__content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    min-height: 200px;
  }

  .log-list-panel__empty {
    text-align: center;
    color: #c0c4cc;
    padding: 48px 0;
    font-size: 13px;
  }

  .log-list-panel__entry {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f2f5;
    font-size: 12px;
    line-height: 1.5;

    &:last-child {
      border-bottom: none;
    }
  }

  .log-list-panel__entry-time {
    flex-shrink: 0;
    width: 188px;
    color: #909399;
    font-family: Consolas, monospace;
    padding-top: 2px;
  }

  .log-list-panel__entry-json {
    flex: 1;
    min-width: 0;
    margin: 0;
    padding: 8px 10px;
    background: #fafafa;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    color: #303133;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
    overflow-x: auto;

    &:not(.is-wrap) {
      white-space: pre;
    }

    &.is-wrap {
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  .log-list-panel__table-message {
    font-size: 12px;
    color: #303133;
  }
}
</style>
