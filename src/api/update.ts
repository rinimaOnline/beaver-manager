import { ajax } from '@/utils/request'
import config from '@/config/env'
import type { 
  IAddAppReq, IAddAppRes,
  IGetAppsReq, IGetAppsRes,
  IAddArchitectureReq, IAddArchitectureRes,
  IUpdateArchitectureReq,
  IGetArchitecturesReq, IGetArchitecturesRes,
  IAddVersionReq, IAddVersionRes,
  IGetVersionListReq, IGetVersionListRes,
  IGetAppVersionsReq, IGetAppVersionsRes,
  IUpdateCityStrategyReq, IUpdateCityStrategyRes,
  IGetCityStrategiesReq, IGetCityStrategiesRes,
  IUploadFileRes
} from '@/types/api/update'

// App Management
export function addAppApi(data: IAddAppReq) {
  return ajax<IAddAppRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/appAdd`,
    data
  })
}

export function getAppsApi(params: IGetAppsReq) {
  return ajax<IGetAppsRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/update/appsUpdate`,
    params
  })
}

// Architecture Management
export function addArchitectureApi(data: IAddArchitectureReq) {
  return ajax<IAddArchitectureRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/architectureAdd`,
    data
  })
}

export function updateArchitectureApi(data: IUpdateArchitectureReq) {
  return ajax<void>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/architectureUpdate`,
    data
  })
}

export function getArchitecturesApi(params: IGetArchitecturesReq) {
  return ajax<IGetArchitecturesRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/update/architectures`,
    params
  })
}

// Version APIs
export const addVersionApi = (data: IAddVersionReq) => {
  return ajax<IAddVersionRes>({
    url: `${config.baseAPI}/admin/update/versionAdd`,
    method: 'post',
    data
  })
}

export const getVersionListApi = (params: IGetVersionListReq) => {
  return ajax<IGetVersionListRes>({
    url: `${config.baseAPI}/admin/update/versionList`,
    method: 'get',
    params
  })
}

// 获取应用下所有版本
export const getAppVersionsApi = (params: IGetAppVersionsReq) => {
  return ajax<IGetAppVersionsRes>({
    url: `${config.baseAPI}/admin/update/versions`,
    method: 'get',
    params
  })
}

// 删除版本
export function deleteVersionApi(id: number) {
  return ajax<void>({
    method: 'DELETE',
    url: `${config.baseAPI}/admin/update/version/${id}`
  })
}

// City Strategy Management
export function updateCityStrategyApi(data: IUpdateCityStrategyReq) {
  return ajax<IUpdateCityStrategyRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/cityStrategyUpdate`,
    data
  })
}

export function getCityStrategiesApi(params: IGetCityStrategiesReq) {
  return ajax<IGetCityStrategiesRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/update/cityStrategies`,
    params
  })
}