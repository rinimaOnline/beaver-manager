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
  fileUrl: string
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
  fileUrl: string
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

// Release Policy
export interface IUpsertReleasePolicyReq {
  appId: string
  architectureId: number
  stableVersionId: number
  grayVersionId?: number
  rolloutPercent: number
  minVersion?: string
  forceUpdate?: boolean
  isActive?: boolean
}

export interface IUpsertReleasePolicyRes {
  id: number
}

export interface IReleasePolicyItem {
  id: number
  appId: string
  architectureId: number
  stableVersionId: number
  grayVersionId: number
  rolloutPercent: number
  minVersion: string
  forceUpdate: boolean
  isActive: boolean
  stableVersion: string
  grayVersion: string
  createdAt: string
  updatedAt: string
}

export interface IGetReleasePoliciesReq {
  appId: string
}

export interface IGetReleasePoliciesRes {
  policies: IReleasePolicyItem[]
}

// Upload File
export interface IUploadFileRes {
  fileName: string
} 