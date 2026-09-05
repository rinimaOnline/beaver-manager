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
  <div class="finance-orders">
    <div class="finance-orders__header">
      <div>
        <h2 class="finance-orders__title">支付订单</h2>
        <p class="finance-orders__subtitle">用户通过充值通道发起的支付订单，金额单位为元</p>
      </div>
    </div>

    <el-form :inline="true">
      <el-form-item label="状态">
        <el-radio-group v-model="query.status" @change="search">
          <el-radio-button :value="-1">全部</el-radio-button>
          <el-radio-button :value="1">待支付</el-radio-button>
          <el-radio-button :value="2">成功</el-radio-button>
          <el-radio-button :value="3">失败</el-radio-button>
          <el-radio-button :value="4">已过期</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="渠道">
        <el-input v-model="query.channel" placeholder="通道编码" clearable style="width: 160px" @keyup.enter="search" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="orderId" label="单号" min-width="200" show-overflow-tooltip />
      <!-- 充值单资金流入用户，服务端记在 toUser；老数据兼容回落 fromUser -->
      <el-table-column label="用户" width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.toUser || row.fromUser || "—" }}</template>
      </el-table-column>
      <el-table-column label="渠道" width="140">
        <template #default="{ row }">{{ row.channel || "—" }}</template>
      </el-table-column>
      <el-table-column label="金额（元）" width="120" align="right">
        <template #default="{ row }">{{ fenToYuan(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="手续费（元）" width="120" align="right">
        <template #default="{ row }">{{ typeof row.fee === "number" ? fenToYuan(row.fee) : "—" }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="失败原因" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.failReason || "—" }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="query.page"
      v-model:page-size="query.limit"
      background
      class="finance-orders__pager"
      layout="total, sizes, prev, pager, next"
      :total="total"
      :page-sizes="[20, 50, 100]"
      @current-change="load"
      @size-change="search"
    />
  </div>
</template>

<script lang="ts">
import type { IAdminWalletOrderItem } from "@/types/api/wallet"
import type { TagType } from "@/types/common"
import { ElMessage } from "element-plus"
import { getAdminWalletOrdersApi } from "@/api/wallet"
import { fenToYuan, formatTime } from "@/utils/money"
import { defineComponent, onMounted, reactive, ref } from "vue"

/** 充值订单状态：1 待支付 / 2 成功 / 3 失败 / 4 已过期 */
const STATUS_LABEL: Record<number, string> = { 1: "待支付", 2: "成功", 3: "失败", 4: "已过期" }
const STATUS_TAG: Record<number, TagType> = { 1: "warning", 2: "success", 3: "danger", 4: "info" }

export default defineComponent({
  name: "FinancePaymentOrders",
  setup() {
    const loading = ref(false)
    const list = ref<IAdminWalletOrderItem[]>([])
    const total = ref(0)
    const query = reactive({
      status: -1,
      channel: "",
      page: 1,
      limit: 20
    })

    const statusLabel = (s: number) => STATUS_LABEL[s] || `未知(${s})`
    const statusTagType = (s: number): TagType => STATUS_TAG[s] || "info"

    const load = async () => {
      loading.value = true
      try {
        const res = await getAdminWalletOrdersApi({
          type: 2,
          channel: query.channel.trim() || undefined,
          // -1 表示全部，服务端按「不筛选」处理，这里不传
          status: query.status >= 0 ? query.status : undefined,
          page: query.page,
          limit: query.limit
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取支付订单失败")
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
      return load()
    }

    onMounted(load)

    return {
      loading,
      list,
      total,
      query,
      fenToYuan,
      formatTime,
      statusLabel,
      statusTagType,
      load,
      search
    }
  }
})
</script>

<style lang="less" scoped>
.finance-orders {
  padding: 8px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 6px;
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
