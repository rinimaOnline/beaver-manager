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

import type {
  IFinanceOverview,
  IGatewayLogDetail,
  IGatewayLogItem,
  IGatewayLogQuery,
  IPaymentChannel,
  IPaymentChannelSaveReq,
  IPayoutActionRes,
  IPayoutChannel,
  IPayoutChannelSaveReq,
  IPayoutOrder,
  IPayoutOrderQuery,
  ITestPayoutReq,
  IWalletConfigItem
} from "@/types/api/finance"
import config from "@/config/env"
import { ajax } from "@/utils/request"

/** 资金概览 */
export function getFinanceOverviewApi() {
  return ajax<IFinanceOverview>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/stats/overview`
  })
}

/** 充值通道列表 */
export function getPaymentChannelsApi() {
  return ajax<{ list: IPaymentChannel[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/payment/channels`
  })
}

/** 新增/编辑充值通道（id 为 0 或不传即新增） */
export function savePaymentChannelApi(data: IPaymentChannelSaveReq) {
  return ajax<{ id: number }>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/payment/channels/save`,
    data
  })
}

export function deletePaymentChannelApi(data: { id: number }) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/payment/channels/delete`,
    data
  })
}

/** 代付通道列表 */
export function getPayoutChannelsApi() {
  return ajax<{ list: IPayoutChannel[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/payout/channels`
  })
}

/** 新增/编辑代付通道（id 为 0 或不传即新增） */
export function savePayoutChannelApi(data: IPayoutChannelSaveReq) {
  return ajax<{ id: number }>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/payout/channels/save`,
    data
  })
}

export function deletePayoutChannelApi(data: { id: number }) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/payout/channels/delete`,
    data
  })
}

/** 代付订单列表（status 传 -1 表示全部） */
export function getPayoutOrdersApi(params: IPayoutOrderQuery) {
  return ajax<{ total: number, list: IPayoutOrder[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/payout/orders`,
    params
  })
}

/**
 * 重试代付。复用原单号重发，通道按商户单号去重，不会变成两笔打款。
 * 只有「待处理 / 打款中」且提现资金仍冻结的单能重试。
 */
export function retryPayoutApi(data: { orderNo: string }) {
  return ajax<IPayoutActionRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/payout/orders/retry`,
    data
  })
}

/** 测试打款：真出账，用来验通道配置。金额受 test_payout_max_fen 限制 */
export function testPayoutApi(data: ITestPayoutReq) {
  return ajax<IPayoutActionRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/payout/test`,
    data
  })
}

/** 通道报文日志：出向下单/打款请求与入向回调的全量报文 */
export function getGatewayLogsApi(params: IGatewayLogQuery) {
  return ajax<{ total: number, list: IGatewayLogItem[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/gateway/logs`,
    params
  })
}

/** 单条报文详情（含 request / response 正文，落库时已脱敏） */
export function getGatewayLogApi(logId: string) {
  return ajax<IGatewayLogDetail>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/gateway/log`,
    params: { logId }
  })
}

/** 钱包系统配置 */
export function getWalletConfigApi() {
  return ajax<{ list: IWalletConfigItem[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/config`
  })
}

export function saveWalletConfigApi(data: { items: IWalletConfigItem[] }) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/config/save`,
    data
  })
}
