import type {
  ICreateWorkbenchAppReq,
  ICreateWorkbenchAppRes,
  IDeleteWorkbenchAppReq,
  IGetWorkbenchAppListReq,
  IGetWorkbenchAppListRes,
  IUpdateWorkbenchAppReq,
  IWorkbenchAppItem
} from "@/types/api/workbench"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getWorkbenchAppListApi(params: IGetWorkbenchAppListReq) {
  return ajax<IGetWorkbenchAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/workbench/v1/list`,
    params
  })
}

export function getWorkbenchAppApi(workbenchAppId: string) {
  return ajax<IWorkbenchAppItem>({
    method: "GET",
    url: `${config.baseAPI}/admin/workbench/v1/detail`,
    params: { workbenchAppId }
  })
}

export function createWorkbenchAppApi(data: ICreateWorkbenchAppReq) {
  return ajax<ICreateWorkbenchAppRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/workbench/v1/create`,
    data
  })
}

export function updateWorkbenchAppApi(data: IUpdateWorkbenchAppReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/workbench/v1/update`,
    data
  })
}

export function deleteWorkbenchAppApi(data: IDeleteWorkbenchAppReq) {
  return ajax<void>({
    method: "POST",
    url: `${config.baseAPI}/admin/workbench/v1/delete`,
    data
  })
}
