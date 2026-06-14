import type {
  IAuditDeveloperReq,
  IAuditDeveloperRes,
  IApplyDeveloperReq,
  IApplyDeveloperRes,
  IAuditOpenAppReq,
  IAuditOpenAppRes,
  IGetDeveloperListReq,
  IGetDeveloperListRes,
  IGetOpenAppListReq,
  IGetOpenAppListRes,
  IGetOpenWebhookLogListReq,
  IGetOpenWebhookLogListRes,
  IUpdateOpenAppStatusReq,
  IUpdateOpenAppStatusRes
} from "@/types/api/open"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getDeveloperListApi(params: IGetDeveloperListReq) {
  return ajax<IGetDeveloperListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/developer/list`,
    params
  })
}

export function auditDeveloperApi(data: IAuditDeveloperReq) {
  return ajax<IAuditDeveloperRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/developer/audit`,
    data
  })
}

export function applyDeveloperApi(data: IApplyDeveloperReq) {
  return ajax<IApplyDeveloperRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/developer/apply`,
    data
  })
}

export function getOpenAppListApi(params: IGetOpenAppListReq) {
  return ajax<IGetOpenAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/app/list`,
    params
  })
}

export function auditOpenAppApi(data: IAuditOpenAppReq) {
  return ajax<IAuditOpenAppRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/open/app/audit`,
    data
  })
}

export function updateOpenAppStatusApi(data: IUpdateOpenAppStatusReq) {
  return ajax<IUpdateOpenAppStatusRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/open/app/status`,
    data
  })
}

export function getOpenWebhookLogListApi(params: IGetOpenWebhookLogListReq) {
  return ajax<IGetOpenWebhookLogListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/open/webhook/logs`,
    params
  })
}
