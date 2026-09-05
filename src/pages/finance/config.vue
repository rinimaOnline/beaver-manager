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
  <div class="finance-config">
    <div class="finance-config__header">
      <div>
        <h2 class="finance-config__title">系统配置</h2>
        <p class="finance-config__subtitle">钱包充值、提现、转账的全局参数。金额类字段以元填写，服务端按分存储</p>
      </div>
      <div class="finance-config__actions">
        <el-button :loading="loading" @click="load">重新拉取</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存全部</el-button>
      </div>
    </div>

    <el-form v-loading="loading" label-width="200px" class="finance-config__form">
      <template v-for="group in groups" :key="group.title">
        <h3 class="finance-config__group">{{ group.title }}</h3>
        <el-form-item v-for="item in group.items" :key="item.key" :label="item.label">
          <template v-if="item.kind === 'switch'">
            <el-switch v-model="form[item.key]" active-value="1" inactive-value="0" active-text="开" inactive-text="关" />
          </template>
          <template v-else-if="item.kind === 'yuan'">
            <el-input-number v-model="yuanForm[item.key]" :min="0" :precision="2" :step="1" style="width: 240px" />
            <span class="finance-config__unit">元</span>
          </template>
          <template v-else-if="item.kind === 'percent'">
            <el-input-number v-model="percentForm[item.key]" :min="0" :max="100" :precision="2" :step="0.1" style="width: 240px" />
            <span class="finance-config__unit">%</span>
          </template>
          <template v-else-if="item.kind === 'int'">
            <el-input-number v-model="intForm[item.key]" :min="0" :step="1" style="width: 240px" />
            <span v-if="item.unit" class="finance-config__unit">{{ item.unit }}</span>
          </template>
          <template v-else-if="item.kind === 'time'">
            <el-time-picker
              v-model="form[item.key]"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="HH:mm"
              style="width: 240px"
            />
          </template>
          <template v-else-if="item.kind === 'payoutChannel'">
            <el-select
              v-model="form[item.key]"
              placeholder="留空 = 人工打款"
              clearable
              filterable
              allow-create
              default-first-option
              style="width: 320px"
            >
              <el-option
                v-for="c in payoutChannels"
                :key="c.code"
                :label="`${c.name}（${c.code}）${c.status === 1 ? '' : ' - 已停用'}`"
                :value="c.code"
              />
            </el-select>
          </template>
          <template v-else>
            <el-input v-model="form[item.key]" style="width: 320px" />
          </template>
          <div v-if="item.tip || remarkOf(item.key)" class="finance-config__tip">
            {{ item.tip || remarkOf(item.key) }}
          </div>
        </el-form-item>
      </template>
    </el-form>

    <el-alert
      v-if="unknownItems.length"
      type="info"
      :closable="false"
      show-icon
      class="finance-config__alert"
      :title="`另有 ${unknownItems.length} 项未在此页面展示的配置（${unknownItems.map(i => i.keyName).join('、')}），保存时会原样保留。`"
    />
  </div>
</template>

<script lang="ts">
import type { IPayoutChannel, IWalletConfigItem } from "@/types/api/finance"
import { ElMessage } from "element-plus"
import { getPayoutChannelsApi, getWalletConfigApi, saveWalletConfigApi } from "@/api/finance"
import { bpsToPercent, fenToYuanNumber, percentToBps, yuanToFen } from "@/utils/money"
import { computed, defineComponent, onMounted, reactive, ref } from "vue"

type ItemKind = "yuan" | "percent" | "int" | "switch" | "time" | "text" | "payoutChannel"

interface ConfigField {
  key: string
  label: string
  kind: ItemKind
  unit?: string
  tip?: string
}

interface ConfigGroup {
  title: string
  items: ConfigField[]
}

// key 与服务端 wallet_models.Cfg* 常量一一对应
const GROUPS: ConfigGroup[] = [
  {
    title: "转账",
    items: [
      { key: "max_transfer_fen", label: "单笔转账上限", kind: "yuan" },
      { key: "max_daily_out_fen", label: "每日转出上限", kind: "yuan", tip: "转账 + 提现合计的每日出账上限" },
      { key: "transfer_expire_sec", label: "转账过期时间", kind: "int", unit: "秒", tip: "对方超时未领取自动退回" }
    ]
  },
  {
    title: "充值",
    items: [
      { key: "recharge_enabled", label: "充值总开关", kind: "switch", tip: "关闭后所有充值通道对用户不可用" },
      { key: "recharge_min_fen", label: "充值最小金额", kind: "yuan", tip: "通道未单独设置限额时的兜底" },
      { key: "recharge_max_fen", label: "充值最大金额", kind: "yuan", tip: "0 表示不限" }
    ]
  },
  {
    title: "提现",
    items: [
      { key: "withdraw_enabled", label: "提现总开关", kind: "switch" },
      { key: "withdraw_min_fen", label: "提现最小金额", kind: "yuan" },
      { key: "withdraw_max_fen", label: "提现最大金额", kind: "yuan", tip: "0 表示不限" },
      { key: "withdraw_fee_rate_bps", label: "提现费率", kind: "percent", tip: "按提现金额收取，实际到账 = 金额 - 手续费" },
      { key: "withdraw_manual_review", label: "提现需人工审核", kind: "switch", tip: "开启后提现单进入「安全合规 → 钱包」待审列表" },
      { key: "withdraw_time_start", label: "提现开放开始时间", kind: "time" },
      { key: "withdraw_time_end", label: "提现开放结束时间", kind: "time", tip: "开始与结束均留空表示全天开放" },
      { key: "withdraw_payout_channel_code", label: "提现出款代付通道", kind: "payoutChannel", tip: "留空表示人工线下打款；也可手动输入通道编码" },
      { key: "withdraw_auto_payout", label: "审核通过自动代付", kind: "switch", tip: "开启后审核通过立即向上方通道发起打款；关闭则审核通过按人工线下打款处理（直接扣减冻结）" }
    ]
  }
]

const KNOWN_KEYS = new Set(GROUPS.flatMap(g => g.items.map(i => i.key)))

export default defineComponent({
  name: "FinanceConfig",
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    /** 服务端原始项，保存时以此为底，保证未展示的 key 与 remark 原样回传 */
    const rawItems = ref<IWalletConfigItem[]>([])
    const payoutChannels = ref<IPayoutChannel[]>([])

    // 字符串类（开关 1/0、时间、文本、通道编码）直接绑 form；
    // 金额 / 费率 / 整数分别绑到数值表单，提交时再换算回字符串。
    const form = reactive<Record<string, string>>({})
    const yuanForm = reactive<Record<string, number>>({})
    const percentForm = reactive<Record<string, number>>({})
    const intForm = reactive<Record<string, number>>({})

    const groups = GROUPS

    const remarkOf = (key: string) => rawItems.value.find(i => i.keyName === key)?.remark || ""

    const unknownItems = computed(() => rawItems.value.filter(i => !KNOWN_KEYS.has(i.keyName)))

    const fieldOf = (key: string): ConfigField | undefined => {
      for (const g of GROUPS) {
        const f = g.items.find(i => i.key === key)
        if (f)
          return f
      }
      return undefined
    }

    const applyItems = (items: IWalletConfigItem[]) => {
      const map = new Map(items.map(i => [i.keyName, i.value]))
      for (const g of GROUPS) {
        for (const f of g.items) {
          const raw = map.get(f.key) ?? ""
          switch (f.kind) {
            case "yuan":
              yuanForm[f.key] = fenToYuanNumber(Number(raw) || 0)
              break
            case "percent":
              percentForm[f.key] = bpsToPercent(Number(raw) || 0)
              break
            case "int":
              intForm[f.key] = Number(raw) || 0
              break
            case "switch":
              form[f.key] = raw === "1" ? "1" : "0"
              break
            default:
              form[f.key] = raw
          }
        }
      }
    }

    const load = async () => {
      loading.value = true
      try {
        const res = await getWalletConfigApi()
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取配置失败")
          return
        }
        rawItems.value = res.result?.list || []
        applyItems(rawItems.value)
      } finally {
        loading.value = false
      }
    }

    const loadPayoutChannels = async () => {
      const res = await getPayoutChannelsApi()
      if (res.code === 0)
        payoutChannels.value = res.result?.list || []
    }

    const serialize = (key: string): string => {
      const f = fieldOf(key)
      if (!f)
        return form[key] ?? ""
      switch (f.kind) {
        case "yuan":
          return String(yuanToFen(yuanForm[key]))
        case "percent":
          return String(percentToBps(percentForm[key]))
        case "int":
          return String(Math.max(0, Math.round(intForm[key] || 0)))
        case "switch":
          return form[key] === "1" ? "1" : "0"
        default:
          return (form[key] ?? "").trim()
      }
    }

    const save = async () => {
      const start = form.withdraw_time_start || ""
      const end = form.withdraw_time_end || ""
      if ((start && !end) || (!start && end)) {
        ElMessage.warning("提现开放时间需同时填写开始与结束，或同时留空")
        return
      }
      if (yuanForm.withdraw_max_fen > 0 && yuanForm.withdraw_max_fen < yuanForm.withdraw_min_fen) {
        ElMessage.warning("提现最大金额不能小于最小金额")
        return
      }
      if (yuanForm.recharge_max_fen > 0 && yuanForm.recharge_max_fen < yuanForm.recharge_min_fen) {
        ElMessage.warning("充值最大金额不能小于最小金额")
        return
      }

      const remarkMap = new Map(rawItems.value.map(i => [i.keyName, i.remark || ""]))
      const items: IWalletConfigItem[] = []
      for (const g of GROUPS) {
        for (const f of g.items) {
          items.push({ keyName: f.key, value: serialize(f.key), remark: remarkMap.get(f.key) || "" })
        }
      }
      // 页面未展示的 key 原样带回，避免整表覆盖时被清掉
      for (const it of unknownItems.value)
        items.push({ keyName: it.keyName, value: it.value, remark: it.remark || "" })

      saving.value = true
      try {
        const res = await saveWalletConfigApi({ items })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "保存失败")
          return
        }
        ElMessage.success("配置已保存")
        load()
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      load()
      loadPayoutChannels()
    })

    return {
      loading,
      saving,
      groups,
      form,
      yuanForm,
      percentForm,
      intForm,
      payoutChannels,
      unknownItems,
      remarkOf,
      load,
      save
    }
  }
})
</script>

<style lang="less" scoped>
.finance-config {
  padding: 8px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__title {
    margin: 0 0 6px;
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__form {
    max-width: 760px;
  }

  &__group {
    margin: 20px 0 10px;
    padding-bottom: 6px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__unit {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
  }

  &__tip {
    width: 100%;
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  &__alert {
    max-width: 760px;
    margin-top: 16px;
  }
}
</style>
