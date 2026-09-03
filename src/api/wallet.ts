/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * beaver-manager-header-v1
 */

import type { IAdminWalletAccount, IAdminWalletLedgerItem, IAdminWalletOrderItem } from "@/types/api/wallet"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getAdminWalletAccountApi(userId: string) {
  return ajax<IAdminWalletAccount>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/account`,
    params: { userId }
  })
}

export function getAdminWalletLedgersApi(params: { userId?: string, page?: number, limit?: number }) {
  return ajax<{ total: number, list: IAdminWalletLedgerItem[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/ledgers`,
    params
  })
}

export function getAdminWalletOrdersApi(params: { type?: number, channel?: string, status?: number, page?: number, limit?: number }) {
  return ajax<{ total: number, list: IAdminWalletOrderItem[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/wallet/v1/orders`,
    params
  })
}

export function creditAdminWalletApi(data: { userId: string, amount: number, remark?: string }) {
  return ajax<{ orderId: string }>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/credit`,
    data
  })
}

export function reviewAdminRechargeApi(data: { orderId: string, pass: boolean, remark?: string }) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/recharge/review`,
    data
  })
}

export function reviewAdminWithdrawApi(data: { orderId: string, pass: boolean, remark?: string }) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/withdraw/review`,
    data
  })
}

export function freezeAdminWalletApi(data: { userId: string, frozen: boolean, remark?: string }) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/wallet/v1/freeze`,
    data
  })
}
