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
  IUpsertReleasePolicyReq, IUpsertReleasePolicyRes,
  IGetReleasePoliciesReq, IGetReleasePoliciesRes
} from '@/types/api/update'

export function addAppApi(data: IAddAppReq) {
  return ajax<IAddAppRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/v1/add_app`,
    data
  })
}

export function getAppsApi(params: IGetAppsReq) {
  return ajax<IGetAppsRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/update/v1/list_apps`,
    params
  })
}

export function addArchitectureApi(data: IAddArchitectureReq) {
  return ajax<IAddArchitectureRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/v1/add_architecture`,
    data
  })
}

export function updateArchitectureApi(data: IUpdateArchitectureReq) {
  return ajax<void>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/v1/update_architecture`,
    data
  })
}

export function getArchitecturesApi(params: IGetArchitecturesReq) {
  return ajax<IGetArchitecturesRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/update/v1/list_architectures`,
    params
  })
}

export const addVersionApi = (data: IAddVersionReq) => {
  return ajax<IAddVersionRes>({
    url: `${config.baseAPI}/admin/update/v1/add_version`,
    method: 'post',
    data
  })
}

export const getVersionListApi = (params: IGetVersionListReq) => {
  return ajax<IGetVersionListRes>({
    url: `${config.baseAPI}/admin/update/v1/list_versions`,
    method: 'get',
    params
  })
}

export function deleteVersionApi(id: number) {
  return ajax<void>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/v1/delete_version`,
    data: { id }
  })
}

export function upsertReleasePolicyApi(data: IUpsertReleasePolicyReq) {
  return ajax<IUpsertReleasePolicyRes>({
    method: 'POST',
    url: `${config.baseAPI}/admin/update/v1/upsert_release_policy`,
    data
  })
}

export function getReleasePoliciesApi(params: IGetReleasePoliciesReq) {
  return ajax<IGetReleasePoliciesRes>({
    method: 'GET',
    url: `${config.baseAPI}/admin/update/v1/list_release_policies`,
    params
  })
}
