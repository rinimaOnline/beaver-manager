/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-manager-header-v1
 */

/** 金额字段单位均为「分」，feeRateBps 为「万分比」 */

export interface IFinanceOverview {
  totalBalance: number
  totalFrozen: number
  accountCount: number
  rechargeTodayAmount: number
  rechargeTotalAmount: number
  rechargeSuccessCount: number
  withdrawTodayAmount: number
  withdrawTotalAmount: number
  withdrawSuccessCount: number
  transferTodayAmount: number
  pendingRechargeCount: number
  pendingWithdrawCount: number
  payoutPayingCount: number
}

export type SignType = "md5" | "rsa"

/** 通道状态：1 启用 / 2 停用 */
export type ChannelStatus = 1 | 2

export interface IPaymentChannel {
  id: number
  code: string
  name: string
  platform: string
  merchantId: string
  hasApiKey: boolean
  apiUrl: string
  notifyUrl: string
  returnUrl: string
  productId: string
  orderPrefix: string
  signType: SignType
  /** rsa 验签用平台公钥 */
  publicKey: string
  feeRateBps: number
  minAmount: number
  maxAmount: number
  icon: string
  sort: number
  status: ChannelStatus
  remark: string
  createdAt: string
  todayAmount: number
  totalAmount: number
  orderCount: number
  successCount: number
}

export interface IPaymentChannelSaveReq {
  /** 0 或不传 = 新增 */
  id?: number
  code: string
  name: string
  platform?: string
  merchantId?: string
  /** 留空 = 保留原密钥 */
  apiKey?: string
  apiUrl?: string
  notifyUrl?: string
  returnUrl?: string
  productId?: string
  orderPrefix?: string
  signType?: SignType
  publicKey?: string
  feeRateBps?: number
  minAmount?: number
  maxAmount?: number
  icon?: string
  sort?: number
  status?: ChannelStatus
  remark?: string
}

export interface IPayoutChannel {
  id: number
  code: string
  name: string
  platform: string
  merchantId: string
  hasApiKey: boolean
  hasPrivateKey: boolean
  hasPublicKey: boolean
  apiUrl: string
  notifyUrl: string
  orderPrefix: string
  signType: SignType
  feeRateBps: number
  minAmount: number
  maxAmount: number
  sort: number
  status: ChannelStatus
  remark: string
  createdAt: string
}

export interface IPayoutChannelSaveReq {
  id?: number
  code: string
  name: string
  platform?: string
  merchantId?: string
  /** 留空 = 保留原密钥 */
  apiKey?: string
  /** 留空 = 保留原私钥 */
  privateKey?: string
  publicKey?: string
  apiUrl?: string
  notifyUrl?: string
  orderPrefix?: string
  signType?: SignType
  feeRateBps?: number
  minAmount?: number
  maxAmount?: number
  sort?: number
  status?: ChannelStatus
  remark?: string
}

/** 代付单状态：0 待处理 / 1 成功 / 2 失败 / 3 打款中 */
export interface IPayoutOrder {
  orderNo: string
  withdrawOrderId: string
  userId: string
  channelCode: string
  amount: number
  fee: number
  realAmount: number
  accountName: string
  bankName: string
  bankCardLast4: string
  status: number
  tradeNo: string
  errorMsg: string
  payTime: string
  createdAt: string
}

export interface IPayoutOrderQuery {
  channelCode?: string
  /** -1 = 全部 */
  status?: number
  keyword?: string
  page?: number
  limit?: number
}

export interface IWalletConfigItem {
  keyName: string
  value: string
  remark: string
  /** 仅列表返回：true 表示未落库，value 是服务端缺省值 */
  isDefault?: boolean
}
