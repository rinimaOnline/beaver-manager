export interface IDashboardOverview {
  userTotal: number
  groupTotal: number
  friendTotal: number
  messageTotal: number
  momentTotal: number
  blockTotal: number
  pendingDeveloperCount: number
  pendingAppCount: number
  pendingFeedbackCount: number
  pendingReportCount: number
  pendingCaseCount: number
  onlineUserCount: number
}

export interface IDashboardInboxItem {
  category: string
  title: string
  summary: string
  entityId: string
  createdAt: string
  action: string
}

export interface IGetDashboardInboxReq {
  limit?: number
}

export interface IGetDashboardInboxRes {
  list: IDashboardInboxItem[]
  total: number
}

export interface IDashboardTrendSeries {
  key: string
  label: string
  values: number[]
}

export interface IDashboardTrends {
  days: string[]
  series: IDashboardTrendSeries[]
}

export interface IGetDashboardTrendsReq {
  days?: number
}
