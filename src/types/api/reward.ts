/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * beaver-manager-header-v1
 */

/** 签到规则类型 */
export enum ECheckinRuleType {
  /** 单日：每次签到都发 */
  DAILY = 0,
  /** 连续：连续签到天数命中 day 时额外发 */
  CONSECUTIVE = 1,
  /** 累计：累计签到总天数命中 day 时额外发 */
  CUMULATIVE = 2
}

/** 邀请奖励触发场景 */
export enum EInviteScene {
  /** 本人完成动作，奖励本人 */
  SELF = 0,
  /** 邀请人数达标，一次性奖励邀请人 */
  REACH = 1,
  /** 每邀请 N 人，可重复奖励邀请人 */
  PER_USER = 2
}

export interface ICheckinRule {
  id: number
  type: ECheckinRuleType
  day: number
  rewardFen: number
  /** 服务端格式化好的元，如 "8.8" */
  rewardText: string
  autoGrant: number
  status: number
  sort: number
  remark: string
}

export interface IInviteRule {
  id: number
  scene: EInviteScene
  /** register=被邀请人注册即发 realname=需完成实名 */
  triggerAction: string
  requiredCount: number
  rewardFen: number
  rewardText: string
  /** -1 不限次 */
  maxClaims: number
  autoGrant: number
  status: number
  sort: number
  remark: string
}

export interface IRewardConfigItem {
  keyName: string
  value: string
  remark: string
  /** true 表示未落库，value 是服务端缺省值 */
  isDefault?: boolean
}

export interface IRewardLogItem {
  id: number
  userId: string
  fromUserId: string
  source: string
  ruleId: number
  scene: number
  amountFen: number
  amountText: string
  orderId: string
  /** 0 待补发（可自动补发） 1 已入账 2 入账中（需人工核对） 3 仅记录（规则不自动发） */
  granted: number
  remark: string
  createdAt: string
}
