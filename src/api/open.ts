import config from "@/config/env"
import { ajax } from "@/utils/request"

// ==================== 开发者管理 ====================

export interface IDeveloperInfo {
  id: string
  userId: string
  realName: string
  companyName: string
  phone: string
  email: string
  description: string
  status: number // 0待审核 1已通过 2已拒绝
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
  status: number // 1通过 2拒绝
  auditRemark?: string
}

export interface IAuditDeveloperRes {}

// 获取开发者列表
export function getDeveloperListApi(params: IGetDeveloperListReq) {
  return ajax<IGetDeveloperListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/developer/list`,
    params
  })
}

// 审核开发者申请
export function auditDeveloperApi(data: IAuditDeveloperReq) {
  return ajax<IAuditDeveloperRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/developer/audit`,
    data
  })
}
