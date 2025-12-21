import { PlatformTypes, ArchTypes } from '@/utils/constants/platform'

// 应用信息
export interface IAppInfo {
  id: number
  name: string
  appId: string
  description: string
  developer: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// 架构信息
export interface IArchitectureInfo {
  id: number
  appId: string
  platform: keyof typeof PlatformTypes
  architecture: keyof typeof ArchTypes
  description: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// 版本信息
export interface IVersionInfo {
  versionId: number
  architectureId: number
  version: string
  buildNumber: number
  downloadUrl: string
  description: string
  releaseNotes: string
  releaseDate: string
  size: number
  md5: string
  createdAt: string
  updatedAt: string
}

// 发布策略信息
export interface IReleaseStrategyInfo {
  strategyId: number
  name: string
  versionId: number
  priority: number
  startTime: string
  endTime: string | null
  regions: string
  forceUpdate: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IVersionForm {
  architectureId: number
  version: string
  fileName: string
  description: string
  releaseNotes: string
  releaseDate: string
}

export interface IVersionTableData extends IVersionInfo {
  appName?: string
  architectureName?: string
} 