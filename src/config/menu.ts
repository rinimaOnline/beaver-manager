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

import type { Component } from "vue"
import {
  Bell,
  BellFilled,
  ChatLineRound,
  Coin,
  Connection,
  CreditCard,
  DataAnalysis,
  Document,
  Filter,
  FolderOpened,
  Grid,
  Guide,
  House,
  List,
  Lock,
  Message,
  Money,
  Platform,
  Postcard,
  Present,
  Reading,
  Service,
  Setting,
  Share,
  Tickets,
  TrendCharts,
  Upload,
  User,
  UserFilled,
  Wallet,
  Warning
} from "@element-plus/icons-vue"

export interface MenuItem {
  path: string
  title: string
  icon: Component
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  {
    path: "/workspace/operations",
    title: "工作台",
    icon: House
  },
  {
    path: "/user",
    title: "用户管理",
    icon: User,
    children: [
      { path: "/user/list", title: "用户列表", icon: User },
      { path: "/user/identity", title: "实名审核", icon: Postcard }
    ]
  },
  {
    path: "/group",
    title: "群管理",
    icon: UserFilled,
    children: [
      { path: "/group/list", title: "群列表", icon: List },
      { path: "/group/autochat", title: "自动发言", icon: Message }
    ]
  },
  {
    path: "/onboarding",
    title: "邀请管理",
    icon: Guide,
    children: [
      { path: "/onboarding/friends", title: "默认好友", icon: User },
      { path: "/onboarding/groups", title: "默认群组", icon: ChatLineRound },
      { path: "/onboarding/invite-tree", title: "邀请树", icon: Share },
      { path: "/onboarding/invite-setting", title: "注册设置", icon: Setting }
    ]
  },
  {
    path: "/compliance",
    title: "消息审计",
    icon: ChatLineRound,
    children: [
      { path: "/compliance/messages", title: "消息检索", icon: Message },
      { path: "/compliance/sessions", title: "会话审计", icon: ChatLineRound }
    ]
  },
  {
    path: "/safety",
    title: "安全合规",
    icon: Warning,
    children: [
      { path: "/safety/reports", title: "举报队列", icon: Warning },
      { path: "/safety/cases", title: "处置工单", icon: Tickets },
      { path: "/safety/sensitive-words", title: "敏感词库", icon: Filter },
      { path: "/safety/audit-logs", title: "操作审计", icon: Document },
      { path: "/safety/appeals", title: "申诉", icon: Message },
      { path: "/safety/wallet", title: "钱包", icon: Lock }
    ]
  },
  {
    path: "/finance",
    title: "财务中心",
    icon: Money,
    children: [
      { path: "/finance/overview", title: "资金概览", icon: DataAnalysis },
      { path: "/finance/payment-channels", title: "充值通道", icon: CreditCard },
      { path: "/finance/payout-channels", title: "代付通道", icon: Wallet },
      { path: "/finance/payment-orders", title: "支付订单", icon: Tickets },
      { path: "/finance/payout-orders", title: "代付订单", icon: List },
      { path: "/finance/gateway-logs", title: "通道报文", icon: Document },
      { path: "/finance/flow", title: "钱包流水", icon: Coin },
      { path: "/finance/config", title: "系统配置", icon: Setting },
      { path: "/finance/reward", title: "签到邀请奖励", icon: Present }
    ]
  },
  {
    path: "/service",
    title: "客服",
    icon: Service,
    children: [
      { path: "/service/feedback", title: "用户反馈", icon: Message },
      { path: "/service/announcement", title: "运营公告", icon: Bell },
      { path: "/service/news", title: "微聊新闻", icon: Reading },
      { path: "/service/notification", title: "站内通知", icon: BellFilled },
      { path: "/service/notification-template", title: "通知模板", icon: Document }
    ]
  },
  {
    path: "/platform",
    title: "产品与开放",
    icon: Platform,
    children: [
      { path: "/open/developers", title: "开发者", icon: UserFilled },
      { path: "/open/apps", title: "开放应用", icon: Platform },
      { path: "/open/workbench", title: "工作台应用", icon: Grid },
      { path: "/open/integrations", title: "机器人集成", icon: Connection }
    ]
  },
  {
    path: "/release/apps",
    title: "版本发布",
    icon: Upload
  },
  {
    path: "/data",
    title: "数据",
    icon: TrendCharts,
    children: [
      { path: "/data/client-log", title: "日志", icon: Document }
    ]
  },
  {
    path: "/assets",
    title: "资源",
    icon: FolderOpened,
    children: [
      { path: "/assets/files", title: "文件存储", icon: FolderOpened },
      {
        path: "/assets/emoji",
        title: "表情包",
        icon: Grid,
        children: [
          { path: "/assets/emoji/list", title: "表情包列表", icon: Share },
          { path: "/assets/emoji/packages", title: "表情包合集", icon: Grid }
        ]
      }
    ]
  },
  {
    path: "/system",
    title: "系统",
    icon: Grid,
    children: [
      { path: "/system/roles", title: "角色权限", icon: Lock },
      { path: "/system/admins", title: "管理员", icon: User },
      { path: "/system/online", title: "连接监控", icon: Connection }
    ]
  }
]
