import type { Component } from "vue"
import {
  ChatLineRound,
  Connection,
  Document,
  FolderOpened,
  Grid,
  House,
  Lock,
  Message,
  Platform,
  Rank,
  Service,
  Share,
  TrendCharts,
  Upload,
  User,
  UserFilled
} from "@element-plus/icons-vue"

export interface MenuItem {
  path: string
  title: string
  icon: Component
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  {
    path: "/dashboard",
    title: "工作台",
    icon: House,
    children: [
      { path: "/dashboard", title: "运营工作台", icon: House },
      { path: "/safety/cases", title: "待办处置", icon: Document }
    ]
  },
  {
    path: "/user/list",
    title: "用户管理",
    icon: User
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
    path: "/service",
    title: "客服",
    icon: Service,
    children: [
      { path: "/service/feedback", title: "用户反馈", icon: Message }
    ]
  },
  {
    path: "/platform",
    title: "产品与开放",
    icon: Platform,
    children: [
      { path: "/open/developers", title: "开发者", icon: UserFilled },
      { path: "/open/apps", title: "开放应用", icon: Platform },
      { path: "/open/integrations", title: "机器人集成", icon: Connection },
      { path: "/release/versions", title: "客户端版本", icon: Rank },
      { path: "/release/strategies", title: "发布策略", icon: Upload }
    ]
  },
  {
    path: "/data",
    title: "数据",
    icon: TrendCharts,
    children: [
      { path: "/data/events", title: "事件统计", icon: TrendCharts },
      { path: "/data/logs", title: "原始日志", icon: Document }
    ]
  },
  {
    path: "/assets",
    title: "资源",
    icon: FolderOpened,
    children: [
      { path: "/assets/files", title: "文件存储", icon: FolderOpened },
      { path: "/assets/emoji-packages", title: "表情包", icon: Grid },
      { path: "/assets/emojis", title: "表情素材", icon: Share }
    ]
  },
  {
    path: "/system",
    title: "系统",
    icon: Grid,
    children: [
      { path: "/system/roles", title: "角色权限", icon: Lock },
      { path: "/system/admins", title: "管理员", icon: User },
      { path: "/system/config", title: "系统配置", icon: Platform },
      { path: "/safety/policy", title: "内容策略", icon: Grid },
      { path: "/system/audit-logs", title: "操作审计", icon: Document }
    ]
  }
]
