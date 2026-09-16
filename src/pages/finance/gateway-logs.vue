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
  <div class="gateway-logs">
    <div class="gateway-logs__header">
      <div>
        <h2 class="gateway-logs__title">通道报文</h2>
        <p class="gateway-logs__subtitle">
          下单 / 打款的出向请求与三方回调的原始报文。跟通道对账、查「钱没到账」先看这里。
          卡号与密钥已在落库时脱敏；保留天数见系统配置 <code>gateway_log_keep_days</code>。
        </p>
      </div>
      <el-button :loading="loading" @click="load">刷新</el-button>
    </div>

    <el-form class="gateway-logs__filters" inline @submit.prevent="search">
      <el-form-item label="类型">
        <el-select v-model="query.action" clearable placeholder="全部" style="width: 140px" @change="search">
          <el-option label="充值下单" value="recharge_submit" />
          <el-option label="充值回调" value="recharge_notify" />
          <el-option label="代付打款" value="payout_submit" />
          <el-option label="代付回调" value="payout_notify" />
        </el-select>
      </el-form-item>
      <el-form-item label="结果">
        <el-select v-model="query.outcome" style="width: 130px" @change="search">
          <el-option label="全部" :value="0" />
          <el-option label="受理/成功" :value="1" />
          <el-option label="拒绝/失败" :value="2" />
          <el-option label="结果未知" :value="3" />
          <el-option label="中间态" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="通道">
        <el-input v-model="query.channelCode" clearable placeholder="通道编码" style="width: 160px" @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="单号">
        <el-input v-model="query.keyword" clearable placeholder="订单号 / 通道单号 / 日志ID" style="width: 220px" @keyup.enter="search" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">{{ row.actionText || row.action }}</template>
      </el-table-column>
      <el-table-column label="结果" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="outcomeTag(row.outcome)" size="small">{{ outcomeText(row.outcome) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="channelCode" label="通道" width="130" show-overflow-tooltip />
      <el-table-column label="单号" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ row.orderNo || row.orderId || "—" }}</template>
      </el-table-column>
      <el-table-column label="耗时" width="90" align="right">
        <template #default="{ row }">{{ row.costMs > 0 ? `${row.costMs} ms` : "—" }}</template>
      </el-table-column>
      <el-table-column prop="clientIp" label="来源IP" width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.clientIp || "—" }}</template>
      </el-table-column>
      <el-table-column label="错误" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ row.errMsg || "—" }}</template>
      </el-table-column>
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">报文</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="gateway-logs__pager">
      <el-pagination
        layout="total, prev, pager, next"
        :total="total"
        :current-page="query.page"
        :page-size="query.limit"
        @current-change="onPage"
      />
    </div>

    <el-dialog v-model="detailVisible" title="报文详情" width="760px" destroy-on-close>
      <el-descriptions v-if="detail" :column="2" border size="small">
        <el-descriptions-item label="类型">{{ detail.actionText || detail.action }}</el-descriptions-item>
        <el-descriptions-item label="结果">{{ outcomeText(detail.outcome) }}</el-descriptions-item>
        <el-descriptions-item label="通道">{{ detail.channelCode || "—" }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ detail.costMs }} ms</el-descriptions-item>
        <el-descriptions-item label="内部单号">{{ detail.orderId || "—" }}</el-descriptions-item>
        <el-descriptions-item label="通道单号">{{ detail.orderNo || "—" }}</el-descriptions-item>
        <el-descriptions-item label="来源IP">{{ detail.clientIp || "—" }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ formatTime(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="错误" :span="2">{{ detail.errMsg || "—" }}</el-descriptions-item>
      </el-descriptions>
      <template v-if="detail">
        <div class="gateway-logs__section">
          <span>请求</span>
          <el-button link type="primary" @click="copy(detail.request)">复制</el-button>
        </div>
        <pre class="gateway-logs__body">{{ pretty(detail.request) }}</pre>
        <div class="gateway-logs__section">
          <span>响应</span>
          <el-button link type="primary" @click="copy(detail.response)">复制</el-button>
        </div>
        <pre class="gateway-logs__body">{{ pretty(detail.response) }}</pre>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IGatewayLogDetail, IGatewayLogItem } from "@/types/api/finance"
import { ElMessage } from "element-plus"
import { getGatewayLogApi, getGatewayLogsApi } from "@/api/finance"
import { formatTime } from "@/utils/money"
import { defineComponent, onMounted, reactive, ref } from "vue"

const outcomeMeta: Record<number, { text: string, tag: "success" | "danger" | "warning" | "info" }> = {
  1: { text: "受理/成功", tag: "success" },
  2: { text: "拒绝/失败", tag: "danger" },
  // 「未知」单独一档，不能和「失败」混在一起：前者钱可能已经出去了，得去三方查
  3: { text: "结果未知", tag: "warning" },
  4: { text: "中间态", tag: "info" }
}

export default defineComponent({
  name: "FinanceGatewayLogs",
  setup() {
    const loading = ref(false)
    const list = ref<IGatewayLogItem[]>([])
    const total = ref(0)
    const detailVisible = ref(false)
    const detail = ref<IGatewayLogDetail | null>(null)
    const query = reactive({ action: "", channelCode: "", outcome: 0, keyword: "", page: 1, limit: 20 })

    const outcomeText = (v: number) => outcomeMeta[v]?.text || "—"
    const outcomeTag = (v: number) => outcomeMeta[v]?.tag || "info"

    /** 报文多数是 JSON，能解就缩进展示；解不开（三方甩回 HTML）就原样显示 */
    const pretty = (raw: string) => {
      if (!raw) return "—"
      try {
        return JSON.stringify(JSON.parse(raw), null, 2)
      } catch {
        return raw
      }
    }

    const load = async () => {
      loading.value = true
      try {
        const res = await getGatewayLogsApi({ ...query })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取报文日志失败")
          return
        }
        list.value = res.result?.list || []
        total.value = res.result?.total || 0
      } finally {
        loading.value = false
      }
    }

    const search = () => {
      query.page = 1
      load()
    }

    const reset = () => {
      Object.assign(query, { action: "", channelCode: "", outcome: 0, keyword: "", page: 1 })
      load()
    }

    const onPage = (page: number) => {
      query.page = page
      load()
    }

    const openDetail = async (row: IGatewayLogItem) => {
      const res = await getGatewayLogApi(row.logId)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "获取报文详情失败")
        return
      }
      detail.value = res.result || null
      detailVisible.value = true
    }

    const copy = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text || "")
        ElMessage.success("已复制")
      } catch {
        ElMessage.warning("复制失败，请手动选中")
      }
    }

    onMounted(load)

    return {
      loading,
      list,
      total,
      query,
      detail,
      detailVisible,
      formatTime,
      outcomeText,
      outcomeTag,
      pretty,
      load,
      search,
      reset,
      onPage,
      openDetail,
      copy
    }
  }
})
</script>

<style lang="less" scoped>
.gateway-logs {
  padding: 20px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 600;
  }

  &__subtitle {
    margin: 0;
    max-width: 780px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  &__filters {
    margin-bottom: 12px;
  }

  &__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  &__section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 0 6px;
    font-size: 13px;
    font-weight: 600;
  }

  &__body {
    max-height: 260px;
    margin: 0;
    padding: 12px;
    overflow: auto;
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
}
</style>
