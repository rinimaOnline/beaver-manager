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
  /**
   * 这一项对应的后台鉴权模块（取值见 server 的 middleware/modules.go）。
   *
   * 只标在叶子节点上：分组的可见性由「过滤后还剩没剩子节点」决定，
   * 而不是自己配一个模块——「群管理」组里群列表和自动发言就分属两个模块，
   * 给分组标一个模块必然会错杀其中一个。
   *
   * 不填表示不需要授权，谁都能看。管理端没有测试框架，没人卡这一条——
   * 新增菜单忘了填，它就会对所有角色可见，加菜单时自己记得带上。
   */
  module?: string
}

export const menuConfig: MenuItem[] = [
  {
    path: "/workspace/operations",
    title: "工作台",
    icon: House,
    module: "overview"
  },
  {
    path: "/user",
    title: "用户管理",
    icon: User,
    children: [
      { path: "/user/list", title: "用户列表", icon: User, module: "user" },
      { path: "/user/identity", title: "实名审核", icon: Postcard, module: "user" }
    ]
  },
  {
    path: "/group",
    title: "群管理",
    icon: UserFilled,
    children: [
      { path: "/group/list", title: "群列表", icon: List, module: "group" },
      { path: "/group/autochat", title: "自动发言", icon: Message, module: "autochat" }
    ]
  },
  {
    path: "/onboarding",
    title: "邀请管理",
    icon: Guide,
    children: [
      { path: "/onboarding/friends", title: "默认好友", icon: User, module: "onboarding" },
      { path: "/onboarding/groups", title: "默认群组", icon: ChatLineRound, module: "onboarding" },
      { path: "/onboarding/invite-tree", title: "邀请树", icon: Share, module: "onboarding" },
      { path: "/onboarding/invite-setting", title: "注册设置", icon: Setting, module: "onboarding" }
    ]
  },
  {
    path: "/compliance",
    title: "消息审计",
    icon: ChatLineRound,
    children: [
      { path: "/compliance/messages", title: "消息检索", icon: Message, module: "chat" },
      { path: "/compliance/sessions", title: "会话审计", icon: ChatLineRound, module: "chat" }
    ]
  },
  {
    path: "/safety",
    title: "安全合规",
    icon: Warning,
    children: [
      { path: "/safety/reports", title: "举报队列", icon: Warning, module: "moderation" },
      { path: "/safety/cases", title: "处置工单", icon: Tickets, module: "moderation" },
      { path: "/safety/sensitive-words", title: "敏感词库", icon: Filter, module: "moderation" },
      { path: "/safety/audit-logs", title: "操作审计", icon: Document, module: "moderation" },
      { path: "/safety/appeals", title: "申诉", icon: Message, module: "moderation" },
      { path: "/safety/wallet", title: "钱包", icon: Lock, module: "wallet" }
    ]
  },
  {
    path: "/finance",
    title: "财务中心",
    icon: Money,
    children: [
      { path: "/finance/overview", title: "资金概览", icon: DataAnalysis, module: "wallet" },
      { path: "/finance/payment-channels", title: "充值通道", icon: CreditCard, module: "wallet" },
      { path: "/finance/payout-channels", title: "代付通道", icon: Wallet, module: "wallet" },
      { path: "/finance/payment-orders", title: "支付订单", icon: Tickets, module: "wallet" },
      { path: "/finance/payout-orders", title: "代付订单", icon: List, module: "wallet" },
      { path: "/finance/gateway-logs", title: "通道报文", icon: Document, module: "wallet" },
      { path: "/finance/flow", title: "钱包流水", icon: Coin, module: "wallet" },
      { path: "/finance/config", title: "系统配置", icon: Setting, module: "wallet" },
      { path: "/finance/reward", title: "签到邀请奖励", icon: Present, module: "reward" }
    ]
  },
  {
    path: "/service",
    title: "客服",
    icon: Service,
    children: [
      { path: "/service/feedback", title: "用户反馈", icon: Message, module: "feedback" },
      { path: "/service/announcement", title: "运营公告", icon: Bell, module: "announcement" },
      { path: "/service/news", title: "微聊新闻", icon: Reading, module: "news" },
      { path: "/service/notification", title: "站内通知", icon: BellFilled, module: "notification" },
      { path: "/service/notification-template", title: "通知模板", icon: Document, module: "notification" }
    ]
  },
  {
    path: "/platform",
    title: "产品与开放",
    icon: Platform,
    children: [
      { path: "/open/developers", title: "开发者", icon: UserFilled, module: "open" },
      { path: "/open/apps", title: "开放应用", icon: Platform, module: "open" },
      { path: "/open/workbench", title: "工作台应用", icon: Grid, module: "workbench" },
      { path: "/open/integrations", title: "机器人集成", icon: Connection, module: "open" }
    ]
  },
  {
    path: "/release/apps",
    title: "版本发布",
    icon: Upload,
    module: "update"
  },
  {
    path: "/data",
    title: "数据",
    icon: TrendCharts,
    children: [
      { path: "/data/client-log", title: "日志", icon: Document, module: "track" }
    ]
  },
  {
    path: "/assets",
    title: "资源",
    icon: FolderOpened,
    children: [
      { path: "/assets/files", title: "文件存储", icon: FolderOpened, module: "file" },
      {
        path: "/assets/emoji",
        title: "表情包",
        icon: Grid,
        children: [
          { path: "/assets/emoji/list", title: "表情包列表", icon: Share, module: "emoji" },
          { path: "/assets/emoji/packages", title: "表情包合集", icon: Grid, module: "emoji" }
        ]
      }
    ]
  },
  {
    path: "/system",
    title: "系统",
    icon: Grid,
    children: [
      { path: "/system/roles", title: "角色权限", icon: Lock, module: "system" },
      { path: "/system/admins", title: "管理员", icon: User, module: "system" },
      { path: "/system/online", title: "连接监控", icon: Connection, module: "monitor" }
    ]
  }
]

/**
 * 按模块授权裁掉看不到的菜单。
 *
 * 分组自己不带 module：它的去留取决于「过滤完还剩没剩子节点」。
 * 「群管理」组里群列表(group)和自动发言(autochat)分属两个模块，
 * 给分组标一个模块必然错杀其中一个。
 */
export const filterByPermission = (
  items: MenuItem[],
  can: (module?: string) => boolean
): MenuItem[] => {
  const result: MenuItem[] = []
  for (const item of items) {
    if (item.children?.length) {
      const children = filterByPermission(item.children, can)
      if (children.length) {
        result.push({ ...item, children })
      }
      continue
    }
    if (can(item.module)) {
      result.push(item)
    }
  }
  return result
}

/**
 * 菜单路径 → 所属模块。用于路由守卫：光过滤侧边栏挡不住手输 URL。
 *
 * 详情页（用户 360、群详情）本身不在菜单里，但它们的 meta.activeMenu
 * 指向对应的列表页，守卫按 activeMenu 查就能覆盖到，不用再标一遍。
 */
export const menuModuleMap: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  const walk = (items: MenuItem[]) => {
    for (const item of items) {
      if (item.children?.length) {
        walk(item.children)
      } else if (item.module) {
        map[item.path] = item.module
      }
    }
  }
  walk(menuConfig)
  return map
})()

/**
 * 第一个有权访问的菜单路径，用作落地页兜底。
 *
 * 登录后默认跳 /workspace/operations，可它归 overview 模块——
 * 没给这个模块的角色一登录就撞 404，看着像系统坏了。
 */
export const firstAccessiblePath = (
  can: (module?: string) => boolean
): string | undefined => {
  const walk = (items: MenuItem[]): string | undefined => {
    for (const item of items) {
      if (item.children?.length) {
        const hit = walk(item.children)
        if (hit) {
          return hit
        }
      } else if (can(item.module)) {
        return item.path
      }
    }
    return undefined
  }
  return walk(menuConfig)
}
