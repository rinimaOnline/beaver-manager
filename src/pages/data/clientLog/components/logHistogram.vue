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
  <div class="log-histogram">
    <div class="log-histogram__head">
      <span>日志条数：{{ total.toLocaleString() }}</span>
    </div>
    <div v-if="bars.length" class="log-histogram__bars">
      <div
        v-for="bar in bars"
        :key="bar.label"
        class="log-histogram__bar-wrap"
        :title="`${bar.label}：${bar.count}`"
      >
        <div class="log-histogram__bar" :style="{ height: `${bar.height}%` }" />
        <span class="log-histogram__bar-label">{{ bar.label }}</span>
      </div>
    </div>
    <div v-else class="log-histogram__empty">暂无分布数据</div>
  </div>
</template>

<script lang="ts">
import type { LogHistogramBar } from "../utils/logUtils"

export default defineComponent({
  name: "LogHistogram",
  props: {
    total: {
      type: Number,
      default: 0
    },
    bars: {
      type: Array as PropType<LogHistogramBar[]>,
      default: () => []
    }
  }
})
</script>

<style lang="less">
.log-histogram {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px 12px 6px;
  margin-bottom: 10px;

  .log-histogram__head {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }

  .log-histogram__bars {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 72px;
    padding: 0 4px 18px;
    border-bottom: 1px solid #ebeef5;
  }

  .log-histogram__bar-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    min-width: 0;
  }

  .log-histogram__bar {
    width: 100%;
    max-width: 24px;
    background: #67c23a;
    border-radius: 2px 2px 0 0;
    min-height: 4px;
  }

  .log-histogram__bar-label {
    margin-top: 4px;
    font-size: 10px;
    color: #909399;
    transform: scale(0.9);
    white-space: nowrap;
  }

  .log-histogram__empty {
    font-size: 12px;
    color: #c0c4cc;
    padding: 12px 0;
  }
}
</style>
