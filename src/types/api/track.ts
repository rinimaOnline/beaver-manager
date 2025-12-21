// ========================= Bucket 管理接口类型 =========================
// Bucket 信息
export interface IBucketInfo {
  uuid: string
  name: string
  description: string
  createUser: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 获取 Bucket 列表请求
export interface IGetBucketListReq {
  page?: number
  pageSize?: number
  keyword?: string
  isActive?: boolean
}

// 获取 Bucket 列表响应
export interface IGetBucketListRes {
  list: IBucketInfo[]
  total: number
}

// 创建 Bucket 请求
export interface ICreateBucketReq {
  name: string
  description: string
}

// 创建 Bucket 响应
export interface ICreateBucketRes {
  uuid: string
}

// 更新 Bucket 请求
export interface IUpdateBucketReq {
  uuid: string
  name?: string
  description?: string
  isActive?: boolean
}

// 更新 Bucket 响应
export interface IUpdateBucketRes {
  success: boolean
}

// 删除 Bucket 请求
export interface IDeleteBucketReq {
  uuid: string
}

// 删除 Bucket 响应
export interface IDeleteBucketRes {
  success: boolean
}



// ========================= 事件管理接口类型 =========================
// 事件信息
export interface IEventInfo {
  id: number
  eventName: string
  action: string
  userId: string
  bucketId: string
  bucketName: string
  timestamp: string
  source: string
  platform: string
  duration: number
  deviceId: string
  value: string
  createdAt: string
}

// 获取事件列表请求
export interface IGetEventListReq {
  page?: number
  pageSize?: number
  bucketId?: string
  eventName?: string
  action?: string
  userFilter?: string
  startTime?: string
  endTime?: string
  platform?: string
}

// 获取事件列表响应
export interface IGetEventListRes {
  list: IEventInfo[]
  total: number
}



// ========================= 日志管理接口类型 =========================
// 日志条目
export interface ILogEntry {
  id: number
  level: string
  data: string
  userId: string
  bucketId: string
  bucketName: string
  timestamp: string // 时间戳字符串
  createdAt: string
}

// 查询日志请求
export interface IQueryLogsReq {
  bucketId: string
  level?: string
  startTime: number
  endTime: number
  keyword?: string
  userFilter?: string
  page?: number
  pageSize?: number
}

// 查询日志响应
export interface IQueryLogsRes {
  total: number
  logs: ILogEntry[]
}

// ========================= 枚举类型 =========================
// 日志级别枚举
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// 时间间隔枚举
export enum TimeInterval {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day'
} 