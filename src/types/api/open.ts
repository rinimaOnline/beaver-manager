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
