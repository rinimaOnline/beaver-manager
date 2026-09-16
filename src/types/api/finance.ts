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

/** 出向请求体格式 */
export type GatewayContentType = "form" | "json"

/**
 * 通道出向请求配置（下单 / 打款）。
 * reqTemplate 留空 = 不向三方发请求：充值回落到 apiUrl 拼单号的静态收银台地址，
 * 代付则直接进「打款中」等回调，即运营在通道后台手工打款。
 */
export interface IGatewayConfig {
  /** 请求参数模板 JSON，值里用 ${var} 引用本单数据 */
  reqTemplate: string
  /** 响应映射 JSON：okField / okValue / payUrl / tradeNo / errMsg，值是点号路径 */
  respMap: string
  contentType: GatewayContentType
  /** 出向超时（秒），1~60 */
  timeoutSec: number
  /** MD5 签名是否输出大写 */
  signUpper: boolean
}

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
  /** 是否已配置 rsa 下单签名用的商户私钥 */
  hasPrivateKey: boolean
  reqTemplate: string
  respMap: string
  contentType: GatewayContentType
  timeoutSec: number
  signUpper: boolean
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
  /** 留空 = 保留原私钥 */
  privateKey?: string
  reqTemplate?: string
  respMap?: string
  contentType?: GatewayContentType
  timeoutSec?: number
  signUpper?: boolean
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
  reqTemplate: string
  respMap: string
  contentType: GatewayContentType
  timeoutSec: number
  signUpper: boolean
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
  reqTemplate?: string
  respMap?: string
  contentType?: GatewayContentType
  timeoutSec?: number
  signUpper?: boolean
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
  /** 后台「测试打款」产生的单：不关联提现、不动账户，统计里也不算 */
  isTest: boolean
}

export interface IPayoutOrderQuery {
  channelCode?: string
  /** -1 = 全部 */
  status?: number
  keyword?: string
  /** -1 全部 / 0 真实打款 / 1 测试打款 */
  isTest?: number
  page?: number
  limit?: number
}

/** 重试 / 测试打款的结果。ok=false 表示单已建但通道没受理，看 message 与通道报文 */
export interface IPayoutActionRes {
  orderNo: string
  status: number
  tradeNo: string
  ok: boolean
  message: string
}

export interface ITestPayoutReq {
  channelCode: string
  /** 分 */
  amount: number
  accountName: string
  bankName?: string
  /** 明文卡号，服务端不落库 */
  cardNo: string
  remark?: string
}

/** 报文日志动作 */
export type GatewayLogAction = "recharge_submit" | "payout_submit" | "recharge_notify" | "payout_notify"

/** 判定结果：1 受理/成功 2 拒绝/失败 3 结果未知 4 中间态 */
export type GatewayLogOutcome = 1 | 2 | 3 | 4

export interface IGatewayLogItem {
  logId: string
  action: GatewayLogAction | string
  actionText: string
  channelCode: string
  /** wallet_orders.order_id；回调没匹配到内部单时为空 */
  orderId: string
  /** 通道侧单号 / 代付单号 */
  orderNo: string
  outcome: GatewayLogOutcome
  errMsg: string
  operator: string
  clientIp: string
  costMs: number
  createdAt: string
}

/** 列表不下发 request/response 正文，走详情接口按需取 */
export interface IGatewayLogDetail extends IGatewayLogItem {
  request: string
  response: string
}

export interface IGatewayLogQuery {
  action?: string
  channelCode?: string
  /** 0 = 全部 */
  outcome?: number
  /** 匹配 orderId / orderNo / logId */
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
