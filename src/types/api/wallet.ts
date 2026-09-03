/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * beaver-manager-header-v1
 */

export interface IAdminWalletAccount {
  accountId: string
  userId: string
  balance: number
  frozen: number
  currency: string
  pwdSet: boolean
  status: number
}

export interface IAdminWalletLedgerItem {
  ledgerId: string
  userId: string
  orderId: string
  bizType: number
  direction: number
  amount: number
  balanceAfter: number
  frozenAfter: number
  createdAt: string
  remark: string
}

export interface IAdminWalletOrderItem {
  orderId: string
  orderType: number
  status: number
  amount: number
  fromUser: string
  toUser: string
  channel: string
  relatedMsgId: string
  conversationId: string
  failReason: string
  /** 以下为提现人工审核所需：审核人要核对收款卡与申请时间 */
  cardId: string
  cardLast4: string
  cardHolderName: string
  cardBankName: string
  createdAt: string
  reviewedBy: string
  reviewedAt: string
}
