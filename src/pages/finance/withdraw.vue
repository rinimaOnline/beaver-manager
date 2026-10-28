<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  beaver-manager-header-v1
-->

<template>
  <div class="finance-withdraw">
    <div class="finance-withdraw__header">
      <h2 class="finance-withdraw__title">提现审核</h2>
      <el-button type="primary" :loading="exporting" @click="exportExcel">导出 Excel</el-button>
    </div>

    <el-form :inline="true">
      <el-form-item label="状态">
        <el-radio-group v-model="statusFilter" @change="reload">
          <el-radio-button :value="1">待审核</el-radio-button>
          <el-radio-button :value="5">打款中</el-radio-button>
          <el-radio-button :value="2">已通过</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe height="100%">
      <el-table-column prop="createdAt" label="申请时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column prop="orderId" label="单号" min-width="180" show-overflow-tooltip />
      <el-table-column prop="userId" label="用户" width="140" show-overflow-tooltip />
      <el-table-column label="金额（元）" width="110" align="right">
        <template #default="{ row }">{{ fenToYuan(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="手续费（元）" width="110" align="right">
        <template #default="{ row }">{{ fenToYuan(row.fee) }}</template>
      </el-table-column>
      <el-table-column label="实际打款（元）" width="120" align="right">
        <template #default="{ row }">{{ fenToYuan(row.realAmount) }}</template>
      </el-table-column>
      <el-table-column label="收款账户" min-width="220">
        <template #default="{ row }">
          <div v-if="row.holderName || row.cardLast4">
            <div>{{ row.holderName || "—" }}</div>
            <div class="finance-withdraw__card-sub">
              {{ row.bankName || "未知银行" }} 尾号 {{ row.cardLast4 || "----" }}
            </div>
          </div>
          <el-text v-else type="warning" size="small">卡信息缺失</el-text>
        </template>
      </el-table-column>
      <el-table-column v-if="statusFilter === 5" label="审核通过时间" width="170">
        <template #default="{ row }">{{ formatTime(row.reviewedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 1">
            <el-button link type="primary" @click="review(row, true)">通过</el-button>
            <el-button link type="danger" @click="review(row, false)">驳回</el-button>
          </template>
          <template v-else-if="row.status === 5">
            <el-button link type="primary" @click="review(row, true)">确认已到账</el-button>
            <el-button link type="danger" @click="review(row, false)">打款失败退回</el-button>
          </template>
          <span v-else>—</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="page"
      v-model:page-size="limit"
      background
      class="finance-withdraw__pager"
      layout="total, sizes, prev, pager, next"
      :total="total"
      :page-sizes="[20, 50, 100]"
      @current-change="load"
      @size-change="reload"
    />
  </div>
</template>

<script lang="ts">
import type { IWithdrawOrderItem } from "@/types/api/finance"
import { ElMessage, ElMessageBox } from "element-plus"
import { exportWithdrawOrdersApi, getWithdrawOrdersApi } from "@/api/finance"
import { reviewAdminWithdrawApi } from "@/api/wallet"
import { downloadExcel } from "@/utils/excel"
import { fenToYuan, fenToYuanNumber, formatTime } from "@/utils/money"
import { defineComponent, onMounted, ref } from "vue"

const STATUS_LABEL: Record<number, string> = { 1: "待审核", 2: "已通过", 3: "已驳回", 5: "打款中" }
const CARD_TYPE_LABEL: Record<number, string> = { 1: "借记卡", 2: "信用卡" }

export default defineComponent({
  name: "FinanceWithdraw",
  setup() {
    const loading = ref(false)
    const exporting = ref(false)
    const list = ref<IWithdrawOrderItem[]>([])
    const total = ref(0)
    const page = ref(1)
    const limit = ref(20)
    const statusFilter = ref(1)

    const load = async () => {
      loading.value = true
      try {
        const res = await getWithdrawOrdersApi({
          status: statusFilter.value,
          page: page.value,
          limit: limit.value
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取提现单失败")
          return
        }
        list.value = res.result?.list || []
        total.value = res.result?.total || 0
      } finally {
        loading.value = false
      }
    }

    const reload = () => {
      page.value = 1
      return load()
    }

    const review = async (row: IWithdrawOrderItem, pass: boolean) => {
      let remark = ""
      const payee = `${row.bankName || "未知银行"} 尾号 ${row.cardLast4 || "----"}`

      if (row.status === 5) {
        if (pass) {
          await ElMessageBox.confirm(
            `确认这笔代付已实际到账？\n金额：${fenToYuan(row.amount)} 元\n用户：${row.userId}\n`
            + `收款卡：${payee}\n\n确认后将从冻结中扣减并把提现标为成功，请先在代付通道后台核对。`,
            "人工确认到账",
            { type: "warning", confirmButtonText: "已核实，确认到账", showClose: false }
          )
          const { value } = await ElMessageBox.prompt("备注（可选，建议填通道流水号）", "备注", {
            inputValue: "",
            confirmButtonText: "提交"
          })
          remark = value || ""
        } else {
          const { value } = await ElMessageBox.prompt(
            "失败原因（必填，会展示给用户）。确认后冻结资金退回用户余额。",
            "打款失败退回",
            {
              inputValidator: (input: string) => (input && input.trim() ? true : "请填写失败原因"),
              inputErrorMessage: "请填写失败原因"
            }
          )
          remark = value.trim()
        }
      } else if (pass) {
        await ElMessageBox.confirm(
          `确认通过这笔提现？\n金额：${fenToYuan(row.amount)} 元\n实际打款：${fenToYuan(row.realAmount)} 元\n`
          + `用户：${row.userId}\n收款人：${row.holderName || "未知"}\n收款卡：${payee}`,
          "通过提现",
          { type: "warning", confirmButtonText: "确认通过", showClose: false }
        )
        const { value } = await ElMessageBox.prompt("通过备注（可选）", "备注", {
          inputValue: "",
          confirmButtonText: "提交"
        })
        remark = value || ""
      } else {
        const { value } = await ElMessageBox.prompt("驳回原因（必填，会展示给用户）", "驳回", {
          inputValidator: (input: string) => (input && input.trim() ? true : "请填写驳回原因"),
          inputErrorMessage: "请填写驳回原因"
        })
        remark = value.trim()
      }

      const res = await reviewAdminWithdrawApi({ orderId: row.orderId, pass, remark })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      ElMessage.success(row.status === 5 ? (pass ? "已确认到账" : "已退回用户") : (pass ? "已通过" : "已驳回"))
      load()
    }

    const exportExcel = async () => {
      exporting.value = true
      try {
        const res = await exportWithdrawOrdersApi({ status: statusFilter.value })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "导出失败")
          return
        }
        const rows = res.result?.list || []
        if (rows.length === 0) {
          ElMessage.warning("当前筛选没有可导出的提现单")
          return
        }
        const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
        const statusName = STATUS_LABEL[statusFilter.value] || "提现"
        downloadExcel(
          `提现打款_${statusName}_${stamp}.xlsx`,
          "提现打款",
          [
            "提现单号",
            "用户ID",
            "收款人姓名",
            "开户银行",
            "银行编码",
            "银行卡号",
            "卡类型",
            "提现金额（元）",
            "手续费（元）",
            "实际打款（元）",
            "申请时间",
            "状态",
            "审核人",
            "审核时间",
            "备注"
          ],
          rows.map(row => [
            row.orderId,
            row.userId,
            row.holderName || "",
            row.bankName || "",
            row.bankCode || "",
            row.cardNo || "",
            CARD_TYPE_LABEL[row.cardType] || "",
            fenToYuanNumber(row.amount),
            fenToYuanNumber(row.fee),
            fenToYuanNumber(row.realAmount),
            formatTime(row.createdAt),
            STATUS_LABEL[row.status] || String(row.status),
            row.reviewedBy || "",
            formatTime(row.reviewedAt),
            row.failReason || ""
          ])
        )
        if (res.result?.truncated)
          ElMessage.warning(`已导出前 ${rows.length} 笔，超出上限的请分批筛选后再导`)
        else
          ElMessage.success(`已导出 ${rows.length} 笔`)
      } finally {
        exporting.value = false
      }
    }

    onMounted(load)

    return {
      loading,
      exporting,
      list,
      total,
      page,
      limit,
      statusFilter,
      fenToYuan,
      formatTime,
      load,
      reload,
      review,
      exportExcel
    }
  }
})
</script>

<style lang="less" scoped>
.finance-withdraw {
  padding: 8px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0;
  }

  &__card-sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
