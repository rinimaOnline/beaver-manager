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
  IPaymentChannel,
  IPaymentChannelSaveReq,
  IPayoutChannel,
  IPayoutChannelSaveReq,
  IPayoutOrder,
  IPayoutOrderQuery,
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
