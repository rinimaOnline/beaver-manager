import type { Component } from "vue"
import {
  Bell,
  Camera,
  ChatLineRound,
  Connection,
  DataAnalysis,
  Document,
  FolderOpened,
  Grid,
  House,
  Lock,
  Message,
  Platform,
  Rank,
  Search,
  Service,
  Share,
  TrendCharts,
  Upload,
  User,
  UserFilled,
  Collection,
  Warning
} from "@element-plus/icons-vue"

export interface MenuItem {
  path: string
  title: string
  icon: Component
  children?: MenuItem[]
}

/** 大厂 IM 运营后台 - 最终菜单 */
export const menuConfig: MenuItem[] = [
  {
    path: "/dashboard",
    title: "工作台",
    icon: House,
    children: [
      { path: "/dashboard", title: "运营工作台", icon: House },
      { path: "/analytics/overview", title: "数据大盘", icon: DataAnalysis }
    ]
  },
  {
    path: "/search",
    title: "检索中心",
    icon: Search,
    children: [
      { path: "/search", title: "统一检索", icon: Search }
    ]
  },
  {
    path: "/user",
    title: "用户中心",
    icon: User,
    children: [
      { path: "/user/search", title: "用户检索", icon: Search },
      { path: "/user/list", title: "用户列表", icon: User },
      { path: "/user/sanctions", title: "账号处置记录", icon: Warning }
    ]
  },
  {
    path: "/compliance",
    title: "消息合规",
    icon: ChatLineRound,
    children: [
      { path: "/compliance/messages", title: "消息检索", icon: Message },
      { path: "/compliance/sessions", title: "会话审计", icon: ChatLineRound },
      { path: "/compliance/exports", title: "合规导出记录", icon: Document }
    ]
  },
  {
    path: "/group",
    title: "群组中心",
    icon: UserFilled,
    children: [
      { path: "/group/search", title: "群组检索", icon: Search },
      { path: "/group/list", title: "群组列表", icon: UserFilled },
      { path: "/group/messages", title: "群消息审计", icon: Message }
    ]
  },
  {
    path: "/friend",
    title: "社交关系",
    icon: Share,
    children: [
      { path: "/friend/relations", title: "好友关系", icon: User },
      { path: "/friend/requests", title: "好友申请", icon: Message },
      { path: "/friend/blocks", title: "拉黑记录", icon: Lock }
    ]
  },
  {
    path: "/safety",
    title: "内容安全",
    icon: Lock,
    children: [
      { path: "/safety/reports", title: "举报中心", icon: Warning },
      { path: "/safety/cases", title: "工单中心", icon: Document },
      { path: "/safety/machine-review", title: "机审命中队列", icon: Bell },
      { path: "/safety/appeals", title: "申诉管理", icon: Service },
      { path: "/safety/policy", title: "处置策略", icon: Lock },
      { path: "/safety/audit-logs", title: "安全操作审计", icon: DataAnalysis }
    ]
  },
  {
    path: "/community",
    title: "社区运营",
    icon: Camera,
    children: [
      { path: "/community/moments", title: "动态流", icon: Camera },
      { path: "/community/comments", title: "评论治理", icon: ChatLineRound }
    ]
  },
  {
    path: "/service",
    title: "客服中心",
    icon: Service,
    children: [
      { path: "/service/feedback", title: "用户反馈", icon: Message },
      { path: "/service/tickets", title: "客诉工单", icon: Document }
    ]
  },
  {
    path: "/risk",
    title: "风控中心",
    icon: Warning,
    children: [
      { path: "/risk/users", title: "风险用户", icon: User },
      { path: "/risk/blocklist", title: "社交黑名单", icon: Lock },
      { path: "/risk/rules", title: "行为规则", icon: Grid },
      { path: "/risk/alerts", title: "实时告警", icon: Bell }
    ]
  },
  {
    path: "/open",
    title: "开放平台",
    icon: Collection,
    children: [
      { path: "/open/developers", title: "开发者审核", icon: UserFilled },
      { path: "/open/apps", title: "应用管理", icon: Platform },
      { path: "/open/integrations", title: "机器人与Webhook", icon: Connection }
    ]
  },
  {
    path: "/release",
    title: "版本发布",
    icon: Upload,
    children: [
      { path: "/release/apps", title: "应用管理", icon: Platform },
      { path: "/release/architectures", title: "架构管理", icon: Grid },
      { path: "/release/versions", title: "版本列表", icon: Rank },
      { path: "/release/strategies", title: "发布策略", icon: Share }
    ]
  },
  {
    path: "/data",
    title: "数据中心",
    icon: TrendCharts,
    children: [
      { path: "/data/buckets", title: "埋点Bucket", icon: DataAnalysis },
      { path: "/data/events", title: "事件统计", icon: TrendCharts },
      { path: "/data/logs", title: "原始日志查询", icon: Document }
    ]
  },
  {
    path: "/assets",
    title: "资源管理",
    icon: FolderOpened,
    children: [
      { path: "/assets/files", title: "文件存储", icon: FolderOpened },
      { path: "/assets/emojis", title: "表情管理", icon: Share },
      { path: "/assets/emoji-packages", title: "表情包", icon: Grid },
      { path: "/assets/emoji-collects", title: "表情收藏", icon: Bell }
    ]
  },
  {
    path: "/system",
    title: "系统设置",
    icon: Grid,
    children: [
      { path: "/system/roles", title: "角色与权限", icon: Lock },
      { path: "/system/admins", title: "管理员账号", icon: User },
      { path: "/system/menus", title: "菜单管理", icon: Grid },
      { path: "/system/audit-logs", title: "全量操作审计", icon: Document },
      { path: "/system/config", title: "字典与参数", icon: Platform }
    ]
  }
]
