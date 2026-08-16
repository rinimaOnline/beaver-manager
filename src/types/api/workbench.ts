export interface IWorkbenchEntryConfig {
  /** 0 路由 key，1 H5 地址 */
  type: number
  pc?: string
  mobile?: string
}

export interface IWorkbenchAppItem {
  workbenchAppId: string
  name: string
  description: string
  icon: string
  appType: number
  clientScope: number
  entryConfig: IWorkbenchEntryConfig
  openMode: number
  category: number
  sort: number
  status: number
  remark: string
  createdBy: string
  lastModifiedBy: string
  createdAt: string
  updatedAt: string
}

export interface IGetWorkbenchAppListReq {
  page?: number
  pageSize?: number
  status?: number
  category?: number
  keywords?: string
}

export interface IGetWorkbenchAppListRes {
  total: number
  list: IWorkbenchAppItem[]
}

export interface ICreateWorkbenchAppReq {
  name: string
  description?: string
  icon?: string
  appType?: number
  clientScope?: number
  entryConfig: IWorkbenchEntryConfig
  openMode?: number
  category?: number
  sort?: number
  status?: number
  remark?: string
}

export interface ICreateWorkbenchAppRes {
  workbenchAppId: string
}

export interface IUpdateWorkbenchAppReq {
  workbenchAppId: string
  name?: string
  description?: string
  icon?: string
  appType?: number
  clientScope?: number
  entryConfig?: IWorkbenchEntryConfig
  openMode?: number
  category?: number
  sort?: number
  status?: number
  remark?: string
}

export interface IDeleteWorkbenchAppReq {
  workbenchAppId: string
}
