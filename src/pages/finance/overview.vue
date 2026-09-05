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
  <div class="finance-overview">
    <div class="finance-overview__header">
      <div>
        <h2 class="finance-overview__title">资金概览</h2>
        <p class="finance-overview__subtitle">平台钱包余额、充值提现流水与待处理事项，金额单位为元</p>
      </div>
      <el-button :loading="loading" @click="load">刷新</el-button>
    </div>

    <div v-loading="loading">
      <h3 class="finance-overview__group">账户</h3>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="余额合计（元）" :value="yuan(stats.totalBalance)" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="冻结合计（元）" :value="yuan(stats.totalFrozen)" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="钱包账户数" :value="stats.accountCount" />
          </el-card>
        </el-col>
      </el-row>

      <h3 class="finance-overview__group">充值</h3>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="今日充值（元）" :value="yuan(stats.rechargeTodayAmount)" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="累计充值（元）" :value="yuan(stats.rechargeTotalAmount)" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="充值成功笔数" :value="stats.rechargeSuccessCount" />
          </el-card>
        </el-col>
      </el-row>

      <h3 class="finance-overview__group">提现</h3>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="今日提现（元）" :value="yuan(stats.withdrawTodayAmount)" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="累计提现（元）" :value="yuan(stats.withdrawTotalAmount)" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <el-statistic title="提现成功笔数" :value="stats.withdrawSuccessCount" />
          </el-card>
        </el-col>
      </el-row>

      <h3 class="finance-overview__group">待处理</h3>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="今日转账（元）" :value="yuan(stats.transferTodayAmount)" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="finance-overview__clickable" @click="go('/finance/payment-orders')">
            <el-statistic title="待审充值" :value="stats.pendingRechargeCount" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="finance-overview__clickable" @click="go('/safety/wallet')">
            <el-statistic title="待审提现" :value="stats.pendingWithdrawCount" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="finance-overview__clickable" @click="go('/finance/payout-orders')">
            <el-statistic title="代付打款中" :value="stats.payoutPayingCount" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import type { IFinanceOverview } from "@/types/api/finance"
import { ElMessage } from "element-plus"
import { getFinanceOverviewApi } from "@/api/finance"
import { fenToYuanNumber } from "@/utils/money"
import { defineComponent, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"

const emptyStats = (): IFinanceOverview => ({
  totalBalance: 0,
  totalFrozen: 0,
  accountCount: 0,
  rechargeTodayAmount: 0,
  rechargeTotalAmount: 0,
  rechargeSuccessCount: 0,
  withdrawTodayAmount: 0,
  withdrawTotalAmount: 0,
  withdrawSuccessCount: 0,
  transferTodayAmount: 0,
  pendingRechargeCount: 0,
  pendingWithdrawCount: 0,
  payoutPayingCount: 0
})

export default defineComponent({
  name: "FinanceOverview",
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const stats = reactive<IFinanceOverview>(emptyStats())

    const yuan = (fen: number) => fenToYuanNumber(fen)

    const load = async () => {
      loading.value = true
      try {
        const res = await getFinanceOverviewApi()
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取资金概览失败")
          return
        }
        Object.assign(stats, emptyStats(), res.result || {})
      } finally {
        loading.value = false
      }
    }

    const go = (path: string) => router.push(path)

    onMounted(load)

    return { loading, stats, yuan, load, go }
  }
})
</script>

<style lang="less" scoped>
.finance-overview {
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

  &__group {
    margin: 20px 0 10px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  &__clickable {
    cursor: pointer;
  }
}
</style>
