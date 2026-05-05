import type { Component } from "vue"
import {
  Bell,
  Camera,
  ChatLineRound,
  Connection,
  Cpu,
  DataAnalysis,
  Document,
  Download,
  FolderOpened,
  Grid,
  House,
  Key,
  Link,
  Lock,
  Management,
  Message,
  Monitor,
  Operation,
  Phone,
  Platform,
  Promotion,
  Rank,
  Service,
  Setting,
  Share,
  SwitchButton,
  Tools,
  TrendCharts,
  Upload,
  User,
  UserFilled,
  VideoCamera,
  Collection
} from "@element-plus/icons-vue"

export interface MenuItem {
  path: string
  title: string
  icon: Component
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  // 🏠 工作台
  {
    path: "/dashboard",
    title: "工作台",
    icon: House
  },

  // 👥 核心业务功能
  // {
  //   path: "/user",
  //   title: "用户管理",
  //   icon: User,
  //   children: [
  //     { path: "/user/list", title: "用户列表", icon: User }
  //   ]
  // },
  // {
  //   path: "/chat",
  //   title: "聊天管理",
  //   icon: ChatLineRound,
  //   children: [
  //     { path: "/chat/messages", title: "消息管理", icon: Message }
  //   ]
  // },
  // {
  //   path: "/group",
  //   title: "群组管理",
  //   icon: UserFilled,
  //   children: [
  //     { path: "/group/list", title: "群组列表", icon: UserFilled }
  //   ]
  // },
  // {
  //   path: "/friend",
  //   title: "好友管理",
  //   icon: Connection,
  //   children: [
  //     { path: "/friend/relations", title: "好友关系", icon: Connection },
  //     { path: "/friend/requests", title: "好友申请", icon: Bell },
  //     // { path: "/friend/blacklist", title: "黑名单", icon: Lock }
  //   ]
  // },
  // {
  //   path: "/moment",
  //   title: "动态管理",
  //   icon: Camera,
  //   children: [
  //     { path: "/moment/list", title: "动态列表", icon: Camera },
  //     { path: "/moment/reports", title: "举报管理", icon: Bell },
  //     { path: "/moment/comments", title: "评论管理", icon: ChatLineRound }
  //   ]
  // },

  // // 📞 通讯功能 - 暂未实现
  // /*
  // {
  //   path: "/call",
  //   title: "通话管理",
  //   icon: Phone,
  //   children: [
  //     { path: "/call/voice", title: "语音通话", icon: Phone },
  //     { path: "/call/video", title: "视频通话", icon: VideoCamera },
  //     { path: "/call/records", title: "通话记录", icon: Document }
  //   ]
  // },
  // */

  // // 📁 文件与内容
  // {
  //   path: "/file",
  //   title: "文件管理",
  //   icon: FolderOpened,
  //   children: [
  //     { path: "/file/storage", title: "文件存储", icon: FolderOpened }
  //   ]
  // },
  {
    path: "/emoji",
    title: "表情管理",
    icon: Share,
    children: [
      { path: "/emoji/list", title: "表情列表", icon: Share },
      { path: "/emoji/packages", title: "表情包管理", icon: Grid },
      { path: "/emoji/collects", title: "收藏管理", icon: Bell }
    ]
  },

  // 🤖 AI与智能 - 暂未实现
  /*
  {
    path: "/ai",
    title: "AI功能",
    icon: Cpu,
    children: [
      { path: "/ai/config", title: "AI配置", icon: Tools },
      { path: "/ai/models", title: "模型管理", icon: Cpu },
      { path: "/ai/logs", title: "使用记录", icon: Document }
    ]
  },
  */

  // 📊 数据与分析
  // {
  //   path: "/track",
  //   title: "数据统计",
  //   icon: TrendCharts,
  //   children: [
  //     { path: "/track/buckets", title: "Bucket管理", icon: DataAnalysis },
  //     { path: "/track/stats", title: "统计数据", icon: TrendCharts },
  //     { path: "/track/logs", title: "日志查询", icon: Document }
  //   ]
  // },

  // 💬 用户反馈
  {
    path: "/feedback",
    title: "反馈管理",
    icon: Service,
    children: [
      { path: "/feedback/list", title: "反馈列表", icon: Message }
    ]
  },

  // 🔗 系统集成 - 暂未实现
  /*
  {
    path: "/integration",
    title: "系统集成",
    icon: Link,
    children: [
      { path: "/integration/apis", title: "API管理", icon: Link },
      { path: "/integration/webhooks", title: "Webhook配置", icon: Operation },
      { path: "/integration/gateway", title: "网关管理", icon: Monitor },
      { path: "/integration/third-party", title: "第三方集成", icon: Grid }
    ]
  },
  */

  // 🔐 安全与认证 - 暂未实现
  /*
  {
    path: "/auth",
    title: "安全管理",
    icon: Lock,
    children: [
      { path: "/auth/tokens", title: "令牌管理", icon: Key },
      { path: "/auth/sessions", title: "会话管理", icon: Connection },
      { path: "/auth/permissions", title: "权限配置", icon: UserFilled }
    ]
  },
  */

  // ⚙️ 系统配置 - 暂未实现
  /*
  {
    path: "/system",
    title: "系统管理",
    icon: Setting,
    children: [
      { path: "/system/config", title: "系统配置", icon: Setting },
      { path: "/system/monitor", title: "系统监控", icon: Monitor },
      { path: "/system/logs", title: "系统日志", icon: Document },
      { path: "/system/cache", title: "缓存管理", icon: DataAnalysis }
    ]
  },
  */

  // 🏢 平台管理 - 暂未实现
  /*
  {
    path: "/platform",
    title: "平台管理",
    icon: Platform,
    children: [
      { path: "/platform/settings", title: "平台设置", icon: Management },
      { path: "/platform/statistics", title: "平台统计", icon: TrendCharts },
      { path: "/platform/announcements", title: "公告管理", icon: Promotion }
    ]
  },
  */

  // 🔧 配置中心 - 暂未实现
  /*
  {
    path: "/settings",
    title: "配置中心",
    icon: Tools,
    children: [
      { path: "/settings/global", title: "全局配置", icon: Setting },
      { path: "/settings/features", title: "功能开关", icon: SwitchButton },
      { path: "/settings/templates", title: "模板管理", icon: Document }
    ]
  },
  */

  // 🚀 版本管理
  {
    path: "/update",
    title: "版本管理",
    icon: Upload,
    children: [
      { path: "/update/apps", title: "应用管理", icon: Platform },
      { path: "/update/architectures", title: "架构管理", icon: Tools },
      { path: "/update/versions", title: "版本列表", icon: Rank },
      { path: "/update/strategies", title: "发布策略", icon: Share }
    ]
  },

  // 🔌 开放平台管理
  {
    path: "/open",
    title: "开放平台",
    icon: Collection,
    children: [
      { path: "/open/developers", title: "开发者审核", icon: UserFilled }
    ]
  }
]
