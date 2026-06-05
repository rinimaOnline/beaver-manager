// 开放平台相关类型定义

export interface OpenApp {
  appId: string
  name: string
  description: string
  status: number // 0-禁用 1-启用
  webhookUrl: string
  createdAt: number
  appSecret?: string // 仅创建时返回
  botUserId?: string // 仅创建时返回
}

export interface OpenAppListQuery {
  page: number
  pageSize: number
  status?: number
  keyword?: string
}

export interface WebhookConfig {
  configId: string
  appId: string
  eventType: string
  targetUrl: string
  secret: string
  retryCount: number
  timeout: number
  status: number
  createdAt: number
}

export interface WebhookLog {
  id: string
  appId: string
  eventType: string
  payload: string
  responseCode: number
  responseBody: string
  retryCount: number
  status: number // 0-失败 1-成功
  createdAt: number
}

export interface ApiCallStats {
  totalCalls: number
  successCalls: number
  failedCalls: number
  avgResponseTime: number
  trend: Array<{
    time: string
    calls: number
    success: number
    failed: number
  }>
}

export interface WebhookStats {
  totalEvents: number
  successEvents: number
  failedEvents: number
  avgDeliveryTime: number
  trend: Array<{
    time: string
    events: number
    success: number
    failed: number
  }>
}

// ==================== 管理后台 - 开放平台 ====================

export interface IDeveloperInfo {
  id: string
  userId: string
  realName: string
  companyName: string
  phone: string
  email: string
  description: string
  status: number
  auditBy: string
  auditTime: number
  auditRemark: string
  createdAt: number
}

export interface IGetDeveloperListReq {
  page?: number
  pageSize?: number
  status?: number
}

export interface IGetDeveloperListRes {
  total: number
  list: IDeveloperInfo[]
}

export interface IAuditDeveloperReq {
  id: string
  status: number
  auditRemark?: string
}

export interface IAuditDeveloperRes {}

export interface IApplyDeveloperReq {
  applicantUserId?: string
  realName: string
  companyName?: string
  phone: string
  email: string
  description?: string
}

export interface IApplyDeveloperRes {
  id: string
}

export interface IOpenAppInfo {
  appId: string
  name: string
  description: string
  icon: string
  ownerUserId: string
  ownerUserName: string
  appType: number
  category: string
  status: number
  auditStatus: number
  auditedBy: string
  auditedAt: number
  enableRobot: number
  enableOAuth: number
  enableWebhook: number
  createdAt: number
}

export interface IGetOpenAppListReq {
  page?: number
  pageSize?: number
  keyword?: string
  ownerUserId?: string
  appId?: string
  status?: number
  auditStatus?: number
  /** 0全部 1Robot 2Webhook 3Robot或Webhook */
  capabilityType?: number
}

export interface IGetOpenAppListRes {
  total: number
  list: IOpenAppInfo[]
}

export interface IAuditOpenAppReq {
  appId: string
  status: number
  auditRemark?: string
}

export interface IAuditOpenAppRes {}

export interface IUpdateOpenAppStatusReq {
  appIds: string[]
  action: number
}

export interface IUpdateOpenAppStatusRes {}

export interface IOpenWebhookLogInfo {
  id: number
  appId: string
  eventId: string
  eventType: string
  targetUrl: string
  httpStatus: number
  latencyMs: number
  retryCount: number
  status: number
  errorMessage: string
  createdAt: number
}

export interface IGetOpenWebhookLogListReq {
  page?: number
  pageSize?: number
  appId?: string
  eventType?: string
  /** 0全部 1成功 2失败 */
  status?: number
}

export interface IGetOpenWebhookLogListRes {
  total: number
  list: IOpenWebhookLogInfo[]
}

/** Webhook 投递状态 */
export const OPEN_WEBHOOK_LOG_STATUS: Record<number, { text: string; type: string }> = {
  0: { text: "失败", type: "danger" },
  1: { text: "成功", type: "success" }
}

/** 能力筛选（admin API） */
export const OPEN_CAPABILITY_TYPE = {
  ALL: 0,
  ROBOT: 1,
  WEBHOOK: 2,
  ROBOT_OR_WEBHOOK: 3
} as const

/** 应用状态（与 open_rpc 返回值一致：0草稿 1已发布 2禁用） */
export const OPEN_APP_STATUS: Record<number, { text: string; type: string }> = {
  0: { text: "草稿", type: "info" },
  1: { text: "已发布", type: "success" },
  2: { text: "已禁用", type: "danger" }
}

/** 审核状态（0待审核 1已通过 2已拒绝） */
export const OPEN_AUDIT_STATUS: Record<number, { text: string; type: string }> = {
  0: { text: "待审核", type: "warning" },
  1: { text: "已通过", type: "success" },
  2: { text: "已拒绝", type: "danger" }
}

/** 列表筛选入参（admin API：1草稿 2已发布 3禁用） */
export const OPEN_APP_STATUS_FILTER = {
  DRAFT: 1,
  PUBLISHED: 2,
  DISABLED: 3
} as const
