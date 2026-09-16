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
        <h2 class="finance-orders__title">代付订单</h2>
        <p class="finance-orders__subtitle">
          提现审核通过后发往代付通道的打款单，金额单位为元。
          「待处理」= 提交时没拿到通道回复，资金仍冻结、结果未知，可重试或到提现审核页人工收口。
        </p>
      </div>
    </div>

    <el-form :inline="true">
      <el-form-item label="通道">
        <el-select v-model="query.channelCode" placeholder="全部通道" clearable style="width: 180px" @change="search">
          <el-option v-for="c in channels" :key="c.code" :label="`${c.name}（${c.code}）`" :value="c.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" style="width: 130px" @change="search">
          <el-option label="全部" :value="-1" />
          <el-option label="待处理" :value="0" />
          <el-option label="打款中" :value="3" />
          <el-option label="成功" :value="1" />
          <el-option label="失败" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="query.isTest" style="width: 130px" @change="search">
          <el-option label="全部" :value="-1" />
          <el-option label="真实打款" :value="0" />
          <el-option label="测试打款" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input
          v-model="query.keyword"
          placeholder="付款单号 / 提现单号 / 用户ID"
          clearable
          style="width: 240px"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="付款单号" min-width="210" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tag v-if="row.isTest" type="warning" size="small" effect="plain">测试</el-tag>
          {{ row.orderNo }}
        </template>
      </el-table-column>
      <el-table-column prop="withdrawOrderId" label="提现单号" min-width="190" show-overflow-tooltip />
      <el-table-column prop="userId" label="用户" width="150" show-overflow-tooltip />
      <el-table-column prop="channelCode" label="通道" width="130" show-overflow-tooltip />
      <el-table-column label="金额（元）" width="110" align="right">
        <template #default="{ row }">{{ fenToYuan(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="手续费（元）" width="110" align="right">
        <template #default="{ row }">{{ fenToYuan(row.fee) }}</template>
      </el-table-column>
      <el-table-column label="实际到账（元）" width="120" align="right">
        <template #default="{ row }">{{ fenToYuan(row.realAmount) }}</template>
      </el-table-column>
      <el-table-column label="收款人" width="110" show-overflow-tooltip>
        <template #default="{ row }">{{ row.accountName || "—" }}</template>
      </el-table-column>
      <el-table-column label="银行" width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.bankName || "—" }}</template>
      </el-table-column>
      <el-table-column label="尾号" width="80" align="center">
        <template #default="{ row }">{{ row.bankCardLast4 || "—" }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="三方流水号" min-width="170" show-overflow-tooltip>
        <template #default="{ row }">{{ row.tradeNo || "—" }}</template>
      </el-table-column>
      <el-table-column label="失败原因" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <el-text v-if="row.errorMsg" type="danger" size="small">{{ row.errorMsg }}</el-text>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="打款时间" width="170">
        <template #default="{ row }">{{ formatTime(row.payTime) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="canRetry(row)"
            link
            type="primary"
            :loading="retryingNo === row.orderNo"
            @click="retry(row)"
          >
            重试
          </el-button>
          <span v-else>—</span>
        </template>
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
import type { IPayoutChannel, IPayoutOrder } from "@/types/api/finance"
import type { TagType } from "@/types/common"
import { ElMessage, ElMessageBox } from "element-plus"
import { getPayoutChannelsApi, getPayoutOrdersApi, retryPayoutApi } from "@/api/finance"
import { fenToYuan, formatTime } from "@/utils/money"
import { defineComponent, onMounted, reactive, ref } from "vue"

/** 代付单状态：0 待处理 / 1 成功 / 2 失败 / 3 打款中 */
const STATUS_LABEL: Record<number, string> = { 0: "待处理", 1: "成功", 2: "失败", 3: "打款中" }
const STATUS_TAG: Record<number, TagType> = { 0: "info", 1: "success", 2: "danger", 3: "warning" }

export default defineComponent({
  name: "FinancePayoutOrders",
  setup() {
    const loading = ref(false)
    const list = ref<IPayoutOrder[]>([])
    const channels = ref<IPayoutChannel[]>([])
    const total = ref(0)
    const retryingNo = ref("")
    const query = reactive({
      channelCode: "",
      status: -1,
      keyword: "",
      isTest: -1,
      page: 1,
      limit: 20
    })

    const statusLabel = (s: number) => STATUS_LABEL[s] || `未知(${s})`
    const statusTagType = (s: number): TagType => STATUS_TAG[s] || "info"

    const load = async () => {
      loading.value = true
      try {
        const res = await getPayoutOrdersApi({
          channelCode: query.channelCode || undefined,
          status: query.status,
          keyword: query.keyword.trim() || undefined,
          isTest: query.isTest,
          page: query.page,
          limit: query.limit
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取代付订单失败")
          return
        }
        list.value = res.result?.list || []
        total.value = res.result?.total || 0
      } finally {
        loading.value = false
      }
    }

    // 只有资金还冻着、单子没终结的才可重试；测试单卡号没落库，重试不了，得重新发一笔
    const canRetry = (row: IPayoutOrder) => !row.isTest && (row.status === 0 || row.status === 3)

    const retry = async (row: IPayoutOrder) => {
      await ElMessageBox.confirm(
        `确认重新向通道提交付款单「${row.orderNo}」？\n\n沿用原单号重发，通道按商户单号去重，不会变成两笔打款。`,
        "重试代付",
        { type: "warning" }
      )
      retryingNo.value = row.orderNo
      try {
        const res = await retryPayoutApi({ orderNo: row.orderNo })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "重试失败")
          return
        }
        // ok=false 表示单子还在、但通道这次仍没受理，属于"提交过了但没成"，不是接口错
        const r = res.result
        if (r?.ok)
          ElMessage.success(r.message || "已重新提交通道")
        else
          ElMessage.warning(r?.message || "通道未受理，详见通道报文")
        load()
      } finally {
        retryingNo.value = ""
      }
    }

    // 通道下拉只是筛选辅助，拉不到也不影响列表
    const loadChannels = async () => {
      const res = await getPayoutChannelsApi()
      if (res.code === 0)
        channels.value = res.result?.list || []
    }

    const search = () => {
      query.page = 1
      return load()
    }

    onMounted(() => {
      load()
      loadChannels()
    })

    return {
      loading,
      list,
      channels,
      total,
      query,
      fenToYuan,
      formatTime,
      statusLabel,
      statusTagType,
      retryingNo,
      canRetry,
      retry,
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
