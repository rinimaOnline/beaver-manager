// ========================= 日志管理接口类型 =========================
export interface ILogEntry {
  id: number
  timestamp: number
  data: Record<string, unknown> | string
}

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

export interface IQueryLogsRes {
  total: number
  logs: ILogEntry[]
}

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}
