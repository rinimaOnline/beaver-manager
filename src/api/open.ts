import config from "@/config/env"
import { ajax } from "@/utils/request"

// ==================== 应用管理 ====================

export interface ICreateAppReq {
  name: string
  description?: string
  webhookUrl?: string
  scopes?: string
}

export interface ICreateAppRes {
  appId: string
  appSecret: string
  botUserId: string
}

export interface IUpdateAppReq {
  appId: string
  name?: string
  description?: string
  webhookUrl?: string
  status?: number
}

export interface IUpdateAppRes {}

export interface IDeleteAppReq {
  appId: string
}

export interface IDeleteAppRes {}

export interface IAppInfo {
  appId: string
  name: string
  description: string
  status: number
  webhookUrl: string
  createdAt: number
}

export interface IGetAppDetailReq {
  appId: string
}

export interface IGetAppDetailRes {
  app: IAppInfo
}

export interface IGetAppListReq {
  page?: number
  pageSize?: number
  status?: number
}

export interface IGetAppListRes {
  total: number
  list: IAppInfo[]
}

// 创建应用
export function createAppApi(data: ICreateAppReq) {
  return ajax<ICreateAppRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/app/create`,
    data
  })
}

// 更新应用
export function updateAppApi(data: IUpdateAppReq) {
  return ajax<IUpdateAppRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/app/update`,
    data
  })
}

// 删除应用
export function deleteAppApi(data: IDeleteAppReq) {
  return ajax<IDeleteAppRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/app/delete`,
    data
  })
}

// 获取应用详情
export function getAppDetailApi(params: IGetAppDetailReq) {
  return ajax<IGetAppDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/app/detail`,
    params
  })
}

// 获取应用列表
export function getAppListApi(params: IGetAppListReq) {
  return ajax<IGetAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/app/list`,
    params
  })
}

// ==================== Webhook 配置 ====================

export interface IConfigWebhookReq {
  appId: string
  eventType: string
  targetUrl: string
  secret?: string
  retryCount?: number
  timeout?: number
}

export interface IConfigWebhookRes {
  configId: string
}

export interface IGetWebhookLogsReq {
  appId: string
  eventType?: string
  page?: number
  pageSize?: number
}

export interface IWebhookLogItem {
  id: string
  eventType: string
  payload: string
  responseCode: number
  retryCount: number
  status: number
  createdAt: number
}

export interface IGetWebhookLogsRes {
  total: number
  list: IWebhookLogItem[]
}

// 配置 Webhook
export function configWebhookApi(data: IConfigWebhookReq) {
  return ajax<IConfigWebhookRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/webhook/config`,
    data
  })
}

// 获取 Webhook 日志
export function getWebhookLogsApi(params: IGetWebhookLogsReq) {
  return ajax<IGetWebhookLogsRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/webhook/logs`,
    params
  })
}

// ==================== 统计数据 ====================

export interface IGetApiCallsStatsReq {
  appId?: string
  startTime?: number
  endTime?: number
}

export interface IApiCallsStatsRes {
  totalCalls: number
  successCalls: number
  failedCalls: number
  avgResponseTime: number
  trend: Array<{
    time: string
    calls: number
  }>
}

export interface IGetWebhookStatsReq {
  appId?: string
  startTime?: number
  endTime?: number
}

export interface IWebhookStatsRes {
  totalEvents: number
  successEvents: number
  failedEvents: number
  avgDeliveryTime: number
  trend: Array<{
    time: string
    events: number
  }>
}

// 获取 API 调用统计
export function getApiCallsStatsApi(params?: IGetApiCallsStatsReq) {
  return ajax<IApiCallsStatsRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/stats/api-calls`,
    params
  })
}

// 获取 Webhook 统计
export function getWebhookStatsApi(params?: IGetWebhookStatsReq) {
  return ajax<IWebhookStatsRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/stats/webhook`,
    params
  })
}
