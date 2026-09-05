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
  <div class="finance-flow">
    <div class="finance-flow__header">
      <div>
        <h2 class="finance-flow__title">钱包流水</h2>
        <p class="finance-flow__subtitle">按用户查询资金流水，金额单位为元</p>
      </div>
    </div>

    <el-form :inline="true">
      <el-form-item label="用户ID">
        <el-input v-model="userId" placeholder="userId，留空查全部" clearable style="width: 240px" @keyup.enter="search" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column prop="userId" label="用户" width="150" show-overflow-tooltip />
      <el-table-column label="类型" width="120">
        <template #default="{ row }">{{ bizTypeLabel(row.bizType) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.direction === 1 ? 'success' : 'danger'" size="small">
            {{ row.direction === 1 ? "入" : "出" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="金额（元）" width="120" align="right">
        <template #default="{ row }">
          <span :class="row.direction === 1 ? 'finance-flow__in' : 'finance-flow__out'">
            {{ row.direction === 1 ? "+" : "-" }}{{ fenToYuan(row.amount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="余额后（元）" width="120" align="right">
        <template #default="{ row }">{{ fenToYuan(row.balanceAfter) }}</template>
      </el-table-column>
      <el-table-column label="冻结后（元）" width="120" align="right">
        <template #default="{ row }">{{ fenToYuan(row.frozenAfter) }}</template>
      </el-table-column>
      <el-table-column prop="orderId" label="关联单号" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ row.orderId || "—" }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.remark || "—" }}</template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="page"
      v-model:page-size="limit"
      background
      class="finance-flow__pager"
      layout="total, sizes, prev, pager, next"
      :total="total"
      :page-sizes="[20, 50, 100]"
      @current-change="load"
      @size-change="search"
    />
  </div>
</template>

<script lang="ts">
import type { IAdminWalletLedgerItem } from "@/types/api/wallet"
import { ElMessage } from "element-plus"
import { getAdminWalletLedgersApi } from "@/api/wallet"
import { fenToYuan, formatTime } from "@/utils/money"
import { defineComponent, onMounted, ref } from "vue"

// 与服务端 wallet_models.LedgerTitle 保持一致
const BIZ_TYPE_LABEL: Record<number, string> = {
  1: "转账",
  2: "收款",
  3: "转账退还",
  4: "充值",
  5: "提现",
  6: "提现成功",
  7: "提现驳回",
  8: "运营加款",
  9: "运营减款",
  10: "提现打款",
  11: "提现失败退回"
}

export default defineComponent({
  name: "FinanceFlow",
  setup() {
    const loading = ref(false)
    const userId = ref("")
    const list = ref<IAdminWalletLedgerItem[]>([])
    const total = ref(0)
    const page = ref(1)
    const limit = ref(20)

    const bizTypeLabel = (t: number) => BIZ_TYPE_LABEL[t] || `钱包变动(${t})`

    const load = async () => {
      loading.value = true
      try {
        const res = await getAdminWalletLedgersApi({
          userId: userId.value.trim() || undefined,
          page: page.value,
          limit: limit.value
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取流水失败")
          return
        }
        list.value = res.result?.list || []
        total.value = res.result?.total || 0
      } finally {
        loading.value = false
      }
    }

    const search = () => {
      page.value = 1
      return load()
    }

    onMounted(load)

    return {
      loading,
      userId,
      list,
      total,
      page,
      limit,
      fenToYuan,
      formatTime,
      bizTypeLabel,
      load,
      search
    }
  }
})
</script>

<style lang="less" scoped>
.finance-flow {
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

  &__in {
    color: var(--el-color-success);
  }

  &__out {
    color: var(--el-color-danger);
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
