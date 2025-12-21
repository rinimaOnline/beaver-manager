// 应用管理页面类型
export interface IAppInfo {
  id: number
  appId: string
  name: string
  description: string
  developer: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 架构管理页面类型
export interface IArchitectureInfo {
  id: number
  appId: string
  architectureId: number
  platform: string
  description: string
  minimumSupportVersion: string
  packageType: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 版本管理页面类型
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

// 发布策略页面类型
export interface IReleaseStrategyInfo {
  strategyId: number
  name: string
  versionId: number
  version: string
  appId: string
  priority: number
  startTime: string
  endTime: string
  regions: string
  forceUpdate: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
} 