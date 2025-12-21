import type { PageParams, PageResult } from '../common'
import type { PlatformTypes, ArchTypes } from '@/utils/constants/platform'

// App Management
export interface IAddAppReq {
  name: string
  description?: string
}

export interface IAddAppRes {
  id: number
  appId: string
}

export interface IGetAppsReq {
  page?: number
  pageSize?: number
  isActive?: boolean
}

export interface IAppInfo {
  id: number
  appId: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IGetAppsRes {
  total: number
  apps: IAppInfo[]
}

// Architecture Management
export interface IAddArchitectureReq {
  appId: string
  platformId: number
  archId: number
  description?: string
}

export interface IAddArchitectureRes {
  id: number
}

export interface IUpdateArchitectureReq {
  id: number
  description?: string
  isActive?: boolean
}

export interface IArchitectureInfo {
  id: number
  appId: string
  appName: string
  platformId: number
  archId: number
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IGetArchitecturesReq {
  appId?: string
  page?: number
  pageSize?: number
  isActive?: boolean
}

export interface IGetArchitecturesRes {
  total: number
  architectures: IArchitectureInfo[]
}

// Version Management
export interface IAddVersionReq {
  architectureId: number
  version: string
  fileName: string
  description?: string
  releaseNotes?: string
}

export interface IAddVersionRes {
  versionId: number
}

export interface IVersionInfo {
  versionId: number
  architectureId: number
  version: string
  fileName: string
  description: string
  releaseNotes: string
  releaseDate: string
  createdAt: string
  updatedAt: string
}

export interface IGetVersionListReq {
  architectureId: number
  appId?: string
  page?: number
  pageSize?: number
}

export interface IGetVersionListRes {
  total: number
  versions: IVersionInfo[]
}

// 简化版本信息（用于城市策略管理）
export interface ISimpleVersionInfo {
  versionId: number
  version: string
}

// 架构版本信息
export interface IArchitectureVersionInfo {
  architectureId: number
  archId: number
  description: string
  versions: ISimpleVersionInfo[]
}

// 获取应用下所有版本请求
export interface IGetAppVersionsReq {
  appId: string
  page?: number
  pageSize?: number
}

// 获取应用下所有版本响应
export interface IGetAppVersionsRes {
  total: number
  architectures: IArchitectureVersionInfo[]
}

// City Strategy Management
export interface IStrategyInfo {
  architectureId: number
  versionId: number
  forceUpdate: boolean
  isActive: boolean
}

// 策略信息（API响应，包含版本号）
export interface IStrategyInfoWithVersion {
  architectureId: number
  versionId: number
  version: string
  forceUpdate: boolean
  isActive: boolean
}

// 更新城市策略请求 - 根据后端新接口定义
export interface IUpdateCityStrategyReq {
  appId: string
  cityIds: string[]
  strategy: IStrategyInfo[]
  updateType?: 'single' | 'global'
}

export interface IUpdateCityStrategyRes {}

// 城市策略信息（API响应，包含版本号）
export interface ICityStrategyInfo {
  id: number
  appId: string
  cityId: string
  strategy: IStrategyInfoWithVersion[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IGetCityStrategiesReq {
  appId?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface IGetCityStrategiesRes {
  total: number
  strategies: ICityStrategyInfo[]
}

// Upload File
export interface IUploadFileRes {
  fileName: string
} 