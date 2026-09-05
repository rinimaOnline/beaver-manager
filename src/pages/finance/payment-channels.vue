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
  <div class="finance-channels">
    <div class="finance-channels__header">
      <div>
        <h2 class="finance-channels__title">充值通道</h2>
        <p class="finance-channels__subtitle">配置第三方支付通道，用户充值时按启用通道下单</p>
      </div>
      <div class="finance-channels__actions">
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button type="primary" @click="openCreate">新增通道</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="code" label="编码" width="140" show-overflow-tooltip />
      <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip />
      <el-table-column label="平台" width="120">
        <template #default="{ row }">{{ row.platform || "—" }}</template>
      </el-table-column>
      <el-table-column label="费率" width="90">
        <template #default="{ row }">{{ bpsToPercent(row.feeRateBps) }}%</template>
      </el-table-column>
      <el-table-column label="限额（元）" width="180">
        <template #default="{ row }">{{ limitText(row) }}</template>
      </el-table-column>
      <el-table-column label="今日充值（元）" width="130" align="right">
        <template #default="{ row }">{{ fenToYuan(row.todayAmount) }}</template>
      </el-table-column>
      <el-table-column label="累计充值（元）" width="130" align="right">
        <template #default="{ row }">{{ fenToYuan(row.totalAmount) }}</template>
      </el-table-column>
      <el-table-column label="成功/总单数" width="110" align="center">
        <template #default="{ row }">{{ row.successCount }} / {{ row.orderCount }}</template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="70" align="center" />
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status"
            :active-value="1"
            :inactive-value="2"
            :loading="togglingId === row.id"
            @change="(v: any) => toggleStatus(row, v)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="formVisible" :title="isEdit ? '编辑充值通道' : '新增充值通道'" width="640px" destroy-on-close>
      <el-form label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="通道编码" required>
              <el-input v-model="form.code" placeholder="如 alipay_h5，保存后不建议修改" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通道名称" required>
              <el-input v-model="form.name" placeholder="展示给用户的名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="平台">
              <el-input v-model="form.platform" placeholder="三方平台标识，如 alipay / wxpay" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商户号">
              <el-input v-model="form.merchantId" placeholder="三方分配的商户号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="密钥">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            autocomplete="new-password"
            :placeholder="isEdit ? '留空保留原密钥' : '三方分配的 API 密钥'"
          />
          <div v-if="isEdit" class="finance-channels__tip">
            当前{{ editingHasApiKey ? "已配置密钥" : "未配置密钥" }}，出于安全不回显；留空保留原密钥。
          </div>
        </el-form-item>
        <el-form-item label="下单地址">
          <el-input v-model="form.apiUrl" placeholder="三方下单接口地址" />
        </el-form-item>
        <el-form-item label="回调地址">
          <el-input v-model="form.notifyUrl" placeholder="留空则使用默认回调地址" />
          <div class="finance-channels__tip">
            三方后台填 <code>https://域名/api/wallet/notify/v1/payment/{{ form.code || "{通道编码}" }}</code>
          </div>
        </el-form-item>
        <el-form-item label="同步跳转地址">
          <el-input v-model="form.returnUrl" placeholder="支付完成后跳回的页面地址（可选）" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="产品ID">
              <el-input v-model="form.productId" placeholder="三方产品 / 支付方式编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单号前缀">
              <el-input v-model="form.orderPrefix" placeholder="如 RC" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="签名方式">
              <el-select v-model="form.signType" style="width: 100%">
                <el-option label="MD5" value="md5" />
                <el-option label="RSA" value="rsa" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="费率（%）">
              <el-input-number v-model="form.feeRatePercent" :min="0" :max="100" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="form.signType === 'rsa'" label="平台公钥">
          <el-input
            v-model="form.publicKey"
            type="textarea"
            :rows="4"
            placeholder="三方平台的 RSA 公钥（PEM 或 base64），用于校验回调签名"
          />
          <div class="finance-channels__tip">RSA 通道不填公钥则所有回调验签失败、无法入账。</div>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="最小金额（元）">
              <el-input-number v-model="form.minYuan" :min="0" :precision="2" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大金额（元）">
              <el-input-number v-model="form.maxYuan" :min="0" :precision="2" :step="100" style="width: 100%" />
              <div class="finance-channels__tip">0 表示不限</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="图标">
              <el-input v-model="form.icon" placeholder="图标地址（可选）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.sort" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="2" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { ChannelStatus, IPaymentChannel, SignType } from "@/types/api/finance"
import { ElMessage, ElMessageBox } from "element-plus"
import { deletePaymentChannelApi, getPaymentChannelsApi, savePaymentChannelApi } from "@/api/finance"
import { bpsToPercent, fenToYuan, fenToYuanNumber, percentToBps, yuanToFen } from "@/utils/money"
import { defineComponent, onMounted, reactive, ref } from "vue"

interface ChannelForm {
  id: number
  code: string
  name: string
  platform: string
  merchantId: string
  apiKey: string
  apiUrl: string
  notifyUrl: string
  returnUrl: string
  productId: string
  orderPrefix: string
  signType: SignType
  publicKey: string
  /** 表单内以百分比编辑，提交时换成 bps */
  feeRatePercent: number
  /** 表单内以元编辑，提交时换成分 */
  minYuan: number
  maxYuan: number
  icon: string
  sort: number
  status: ChannelStatus
  remark: string
}

const emptyForm = (): ChannelForm => ({
  id: 0,
  code: "",
  name: "",
  platform: "",
  merchantId: "",
  apiKey: "",
  apiUrl: "",
  notifyUrl: "",
  returnUrl: "",
  productId: "",
  orderPrefix: "",
  signType: "md5",
  publicKey: "",
  feeRatePercent: 0,
  minYuan: 0,
  maxYuan: 0,
  icon: "",
  sort: 0,
  status: 1,
  remark: ""
})

export default defineComponent({
  name: "FinancePaymentChannels",
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const togglingId = ref(0)
    const list = ref<IPaymentChannel[]>([])
    const formVisible = ref(false)
    const isEdit = ref(false)
    const editingHasApiKey = ref(false)
    const form = reactive<ChannelForm>(emptyForm())

    const limitText = (row: IPaymentChannel) => {
      const min = fenToYuan(row.minAmount)
      const max = row.maxAmount > 0 ? fenToYuan(row.maxAmount) : "不限"
      return `${min} ~ ${max}`
    }

    const load = async () => {
      loading.value = true
      try {
        const res = await getPaymentChannelsApi()
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取通道列表失败")
          return
        }
        list.value = res.result?.list || []
      } finally {
        loading.value = false
      }
    }

    const openCreate = () => {
      isEdit.value = false
      editingHasApiKey.value = false
      Object.assign(form, emptyForm())
      formVisible.value = true
    }

    const openEdit = (row: IPaymentChannel) => {
      isEdit.value = true
      editingHasApiKey.value = row.hasApiKey
      Object.assign(form, emptyForm(), {
        id: row.id,
        code: row.code,
        name: row.name,
        platform: row.platform,
        merchantId: row.merchantId,
        apiKey: "",
        apiUrl: row.apiUrl,
        notifyUrl: row.notifyUrl,
        returnUrl: row.returnUrl,
        productId: row.productId,
        orderPrefix: row.orderPrefix,
        signType: row.signType || "md5",
        publicKey: row.publicKey || "",
        feeRatePercent: bpsToPercent(row.feeRateBps),
        minYuan: fenToYuanNumber(row.minAmount),
        maxYuan: fenToYuanNumber(row.maxAmount),
        icon: row.icon,
        sort: row.sort,
        status: row.status === 2 ? 2 : 1,
        remark: row.remark
      })
      formVisible.value = true
    }

    const submitForm = async () => {
      const code = form.code.trim()
      const name = form.name.trim()
      if (!code) {
        ElMessage.warning("请填写通道编码")
        return
      }
      if (!name) {
        ElMessage.warning("请填写通道名称")
        return
      }
      if (form.maxYuan > 0 && form.maxYuan < form.minYuan) {
        ElMessage.warning("最大金额不能小于最小金额")
        return
      }
      saving.value = true
      try {
        const res = await savePaymentChannelApi({
          id: form.id || undefined,
          code,
          name,
          platform: form.platform.trim(),
          merchantId: form.merchantId.trim(),
          // 留空不传，服务端保留原密钥
          apiKey: form.apiKey.trim() || undefined,
          apiUrl: form.apiUrl.trim(),
          notifyUrl: form.notifyUrl.trim(),
          returnUrl: form.returnUrl.trim(),
          productId: form.productId.trim(),
          orderPrefix: form.orderPrefix.trim(),
          signType: form.signType,
          publicKey: form.signType === "rsa" ? form.publicKey.trim() : "",
          feeRateBps: percentToBps(form.feeRatePercent),
          minAmount: yuanToFen(form.minYuan),
          maxAmount: yuanToFen(form.maxYuan),
          icon: form.icon.trim(),
          sort: form.sort,
          status: form.status,
          remark: form.remark
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "保存失败")
          return
        }
        ElMessage.success("保存成功")
        formVisible.value = false
        load()
      } finally {
        saving.value = false
      }
    }

    // 列表上的开关直接走 save，其余字段原样回传；apiKey 不传即保留
    const toggleStatus = async (row: IPaymentChannel, value: any) => {
      const status: ChannelStatus = value === 2 ? 2 : 1
      togglingId.value = row.id
      try {
        const res = await savePaymentChannelApi({
          id: row.id,
          code: row.code,
          name: row.name,
          platform: row.platform,
          merchantId: row.merchantId,
          apiUrl: row.apiUrl,
          notifyUrl: row.notifyUrl,
          returnUrl: row.returnUrl,
          productId: row.productId,
          orderPrefix: row.orderPrefix,
          signType: row.signType,
          publicKey: row.publicKey,
          feeRateBps: row.feeRateBps,
          minAmount: row.minAmount,
          maxAmount: row.maxAmount,
          icon: row.icon,
          sort: row.sort,
          status,
          remark: row.remark
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "操作失败")
          return
        }
        row.status = status
        ElMessage.success(status === 1 ? "已启用" : "已停用")
      } finally {
        togglingId.value = 0
      }
    }

    const handleDelete = async (row: IPaymentChannel) => {
      await ElMessageBox.confirm(
        `确认删除充值通道「${row.name}」（${row.code}）？删除后用户将无法通过该通道充值。`,
        "删除通道",
        { type: "warning" }
      )
      const res = await deletePaymentChannelApi({ id: row.id })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("删除成功")
      load()
    }

    onMounted(load)

    return {
      loading,
      saving,
      togglingId,
      list,
      formVisible,
      isEdit,
      editingHasApiKey,
      form,
      fenToYuan,
      bpsToPercent,
      limitText,
      load,
      openCreate,
      openEdit,
      submitForm,
      toggleStatus,
      handleDelete
    }
  }
})
</script>

<style lang="less" scoped>
.finance-channels {
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

  &__tip {
    width: 100%;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);

    code {
      padding: 1px 4px;
      background: var(--el-fill-color-light);
      border-radius: 3px;
      word-break: break-all;
    }
  }
}
</style>
