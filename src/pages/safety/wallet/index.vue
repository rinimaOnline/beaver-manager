<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager
  beaver-manager-header-v1
-->

<template>
  <div class="safety-wallet">
    <h2>钱包</h2>
    <el-form :inline="true">
      <el-form-item label="用户ID">
        <el-input v-model="userId" placeholder="userId" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="loadAccount">查询</el-button>
      </el-form-item>
    </el-form>

    <el-descriptions v-if="account" :column="3" border>
      <el-descriptions-item label="账户">{{ account.accountId }}</el-descriptions-item>
      <el-descriptions-item label="余额（元）">{{ fenToYuan(account.balance) }}</el-descriptions-item>
      <el-descriptions-item label="冻结（元）">{{ fenToYuan(account.frozen) }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ account.status === 2 ? "冻结" : "正常" }}</el-descriptions-item>
      <el-descriptions-item label="支付密码">{{ account.pwdSet ? "已设置" : "未设置" }}</el-descriptions-item>
    </el-descriptions>

    <div class="safety-wallet__actions">
      <el-input v-model="creditYuan" placeholder="加款金额（元）" style="width: 160px" />
      <el-input v-model="creditRemark" placeholder="加款备注" style="width: 200px" />
      <el-button type="primary" @click="credit">加款</el-button>
      <el-button type="warning" @click="freeze(true)">冻户</el-button>
      <el-button @click="freeze(false)">解冻</el-button>
    </div>

    <h3>流水</h3>
    <el-table :data="ledgers" border stripe>
      <el-table-column prop="createdAt" label="时间" width="170" />
      <!-- 金额一律按「元」展示：本页下方的待审列表用的就是 fenToYuan，
           这里再留一列「分」，运营在两张表之间扫一眼就会看错 100 倍。 -->
      <el-table-column prop="amount" label="金额（元）" width="120">
        <template #default="{ row }">{{ fenToYuan(row.amount) }}</template>
      </el-table-column>
      <el-table-column prop="direction" label="方向" width="80">
        <template #default="{ row }">{{ row.direction === 1 ? "入" : "出" }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
      <el-table-column prop="balanceAfter" label="余额后（元）" width="120">
        <template #default="{ row }">{{ fenToYuan(row.balanceAfter) }}</template>
      </el-table-column>
    </el-table>

    <h3>待审订单</h3>
    <div class="safety-wallet__filter">
      <el-radio-group v-model="orderTypeFilter" @change="reloadOrders">
        <el-radio-button :value="3">提现</el-radio-button>
        <el-radio-button :value="2">充值</el-radio-button>
      </el-radio-group>
      <el-button :loading="ordersLoading" @click="reloadOrders">刷新</el-button>
    </div>
    <el-table v-loading="ordersLoading" :data="orders" border stripe>
      <el-table-column prop="createdAt" label="申请时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column prop="orderId" label="单号" min-width="180" />
      <el-table-column prop="amount" label="金额" width="130">
        <template #default="{ row }">{{ fenToYuan(row.amount) }} 元</template>
      </el-table-column>
      <el-table-column prop="fromUser" label="用户" width="140" />
      <!-- 提现必须核对收款账户，否则审核人只能看到一个 userId 和金额 -->
      <el-table-column v-if="orderTypeFilter === 3" label="收款账户" min-width="220">
        <template #default="{ row }">
          <div v-if="row.cardLast4 || row.cardHolderName">
            <div>{{ row.cardHolderName || "—" }}</div>
            <div class="safety-wallet__card-sub">
              {{ row.cardBankName || "未知银行" }} 尾号 {{ row.cardLast4 || "----" }}
            </div>
          </div>
          <el-text v-else type="warning" size="small">卡信息缺失</el-text>
        </template>
      </el-table-column>
      <el-table-column prop="channel" label="渠道" width="120" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button v-if="canReview(row)" link type="primary" @click="review(row, true)">通过</el-button>
          <el-button v-if="canReview(row)" link type="danger" @click="review(row, false)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="ordersPage"
      v-model:page-size="ordersLimit"
      class="safety-wallet__pager"
      layout="total, sizes, prev, pager, next"
      :total="ordersTotal"
      :page-sizes="[20, 50, 100]"
      @current-change="loadOrders"
      @size-change="reloadOrders"
    />
  </div>
</template>

<script lang="ts">
import type { IAdminWalletAccount, IAdminWalletLedgerItem, IAdminWalletOrderItem } from "@/types/api/wallet"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  creditAdminWalletApi,
  freezeAdminWalletApi,
  getAdminWalletAccountApi,
  getAdminWalletLedgersApi,
  getAdminWalletOrdersApi,
  reviewAdminRechargeApi,
  reviewAdminWithdrawApi
} from "@/api/wallet"
import { defineComponent, onMounted, ref } from "vue"

function yuanToFen(raw: string): number {
  const s = raw.trim()
  const parts = s.split(".")
  if (!s || parts.length > 2)
    throw new Error("金额须大于0")
  const yuan = Number.parseInt(parts[0] || "0", 10)
  let cents = 0
  if (parts[1]) {
    const frac = parts[1].length === 1 ? `${parts[1]}0` : parts[1].slice(0, 2)
    cents = Number.parseInt(frac, 10)
  }
  const fen = yuan * 100 + cents
  if (fen <= 0)
    throw new Error("金额须大于0")
  return fen
}

export default defineComponent({
  name: "SafetyWallet",
  setup() {
    const userId = ref("")
    const loading = ref(false)
    const account = ref<IAdminWalletAccount | null>(null)
    const ledgers = ref<IAdminWalletLedgerItem[]>([])
    const orders = ref<IAdminWalletOrderItem[]>([])
    const ordersLoading = ref(false)
    const ordersPage = ref(1)
    const ordersLimit = ref(20)
    const ordersTotal = ref(0)
    // 提现是唯一走人工审核的环节，默认停在提现 tab
    const orderTypeFilter = ref(3)
    const creditYuan = ref("")
    const creditRemark = ref("")

    const fenToYuan = (fen: number) => (fen / 100).toFixed(2)
    const formatTime = (raw: string) => (raw ? raw.replace("T", " ").slice(0, 19) : "—")

    const loadAccount = async () => {
      if (!userId.value) {
        ElMessage.error("请输入用户ID")
        return
      }
      loading.value = true
      const [acc, led] = await Promise.all([
        getAdminWalletAccountApi(userId.value),
        getAdminWalletLedgersApi({ userId: userId.value, page: 1, limit: 50 })
      ])
      loading.value = false
      if (acc.code !== 0) {
        ElMessage.error(acc.msg || "查询失败")
        account.value = null
        return
      }
      account.value = acc.result
      ledgers.value = led.result?.list || []
    }

    // 原来是充值和提现各拉 50 条拼在一起，既不分页也无法按类型筛选，
    // 待审超过 50 笔就会漏单。改成按类型分页查询。
    const loadOrders = async () => {
      ordersLoading.value = true
      try {
        const res = await getAdminWalletOrdersApi({
          type: orderTypeFilter.value,
          status: 1,
          page: ordersPage.value,
          limit: ordersLimit.value
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取待审订单失败")
          return
        }
        orders.value = res.result?.list || []
        ordersTotal.value = res.result?.total || 0
      } finally {
        ordersLoading.value = false
      }
    }

    const reloadOrders = () => {
      ordersPage.value = 1
      return loadOrders()
    }

    const canReview = (row: IAdminWalletOrderItem) =>
      row.status === 1 && (row.orderType === 2 || row.orderType === 3)

    const credit = async () => {
      if (!userId.value) {
        ElMessage.error("请输入用户ID")
        return
      }
      let fen = 0
      try {
        fen = yuanToFen(creditYuan.value)
      } catch (e: any) {
        ElMessage.error(e.message)
        return
      }
      // 直接给用户账户加钱，风险不低于冻结/审核，同样需要二次确认
      await ElMessageBox.confirm(
        `确认给用户 ${userId.value} 加款 ${creditYuan.value} 元？该操作会立即入账。`,
        "人工加款",
        { type: "warning" }
      )
      const res = await creditAdminWalletApi({ userId: userId.value, amount: fen, remark: creditRemark.value })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加款失败")
        return
      }
      ElMessage.success("已加款")
      creditYuan.value = ""
      loadAccount()
    }

    const freeze = async (frozen: boolean) => {
      if (!userId.value) {
        ElMessage.error("请输入用户ID")
        return
      }
      await ElMessageBox.confirm(frozen ? "确认冻结该钱包？" : "确认解冻该钱包？", "账户状态")
      const res = await freezeAdminWalletApi({ userId: userId.value, frozen })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      ElMessage.success(frozen ? "已冻结" : "已解冻")
      loadAccount()
    }

    const review = async (row: IAdminWalletOrderItem, pass: boolean) => {
      const isWithdraw = row.orderType === 3
      let remark = ""

      if (pass) {
        // 提现通过意味着真的要打款出去，先让审核人确认收款账户再放行
        const payee = isWithdraw
          ? `\n收款人：${row.cardHolderName || "未知"}\n收款卡：${row.cardBankName || "未知银行"} 尾号 ${row.cardLast4 || "----"}`
          : ""
        await ElMessageBox.confirm(
          `确认通过这笔${isWithdraw ? "提现" : "充值"}？\n金额：${fenToYuan(row.amount)} 元\n用户：${row.fromUser}${payee}`,
          isWithdraw ? "通过提现" : "通过充值",
          { type: "warning", confirmButtonText: "确认通过", showClose: false }
        )
        const { value } = await ElMessageBox.prompt("通过备注（可选）", "备注", {
          inputValue: "",
          confirmButtonText: "提交"
        })
        remark = value || ""
      } else {
        // 服务端强制要求驳回原因，前端提前拦住空值，省一次失败往返
        const { value } = await ElMessageBox.prompt("驳回原因（必填，会展示给用户）", "驳回", {
          inputValidator: (input: string) => (input && input.trim() ? true : "请填写驳回原因"),
          inputErrorMessage: "请填写驳回原因"
        })
        remark = value.trim()
      }

      const api = row.orderType === 2 ? reviewAdminRechargeApi : reviewAdminWithdrawApi
      const res = await api({ orderId: row.orderId, pass, remark })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "审核失败")
        return
      }
      ElMessage.success(pass ? "已通过" : "已驳回")
      loadOrders()
      if (userId.value)
        loadAccount()
    }

    onMounted(loadOrders)

    return {
      userId,
      loading,
      account,
      ledgers,
      orders,
      ordersLoading,
      ordersPage,
      ordersLimit,
      ordersTotal,
      orderTypeFilter,
      creditYuan,
      creditRemark,
      fenToYuan,
      formatTime,
      canReview,
      loadAccount,
      loadOrders,
      reloadOrders,
      credit,
      freeze,
      review
    }
  }
})
</script>

<style scoped>
.safety-wallet {
  padding: 8px;
}
.safety-wallet__actions {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}
.safety-wallet__filter {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.safety-wallet__card-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.safety-wallet__pager {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
