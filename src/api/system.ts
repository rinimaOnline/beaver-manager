import type {
  ICreateAdminUserReq,
  ICreateAdminUserRes,
  ICreateAuthorityReq,
  ICreateAuthorityRes,
  IDeleteAuthorityReq,
  IDeleteAuthorityRes,
  ICreateMenuReq,
  ICreateMenuRes,
  IDeleteMenuReq,
  IDeleteMenuRes,
  IGetAdminUserListReq,
  IGetAdminUserListRes,
  IGetAuthorityListRes,
  IGetAuthorityMenusRes,
  IGetMenuListReq,
  IGetMenuListRes,
  IUpdateAdminUserReq,
  IUpdateAdminUserRes,
  IUpdateAuthorityMenuReq,
  IUpdateAuthorityMenuRes,
  IUpdateAuthorityReq,
  IUpdateAuthorityRes,
  IUpdateMenuReq,
  IUpdateMenuRes
} from "@/types/api/system"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getMenuListApi(params: IGetMenuListReq) {
  return ajax<IGetMenuListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/list_menus`,
    params
  })
}

export function createMenuApi(data: ICreateMenuReq) {
  return ajax<ICreateMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/create_menu`,
    data
  })
}

export function updateMenuApi(data: IUpdateMenuReq) {
  return ajax<IUpdateMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_menu`,
    data
  })
}

export function deleteMenuApi(data: IDeleteMenuReq) {
  return ajax<IDeleteMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/delete_menu`,
    data
  })
}

export function createAuthorityApi(data: ICreateAuthorityReq) {
  return ajax<ICreateAuthorityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/create_authority`,
    data
  })
}

export function updateAuthorityMenuApi(data: IUpdateAuthorityMenuReq) {
  return ajax<IUpdateAuthorityMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_authority_menu`,
    data
  })
}

export function getAuthorityListApi() {
  return ajax<IGetAuthorityListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/list_authorities`
  })
}

export function updateAuthorityApi(data: IUpdateAuthorityReq) {
  return ajax<IUpdateAuthorityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_authority`,
    data
  })
}

export function deleteAuthorityApi(data: IDeleteAuthorityReq) {
  return ajax<IDeleteAuthorityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/delete_authority`,
    data
  })
}

export function getAuthorityMenusApi(authorityId: number) {
  return ajax<IGetAuthorityMenusRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/authority_menus`,
    params: { id: authorityId }
  })
}

export function getAdminUserListApi(params: IGetAdminUserListReq) {
  return ajax<IGetAdminUserListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/v1/list_admins`,
    params
  })
}

export function createAdminUserApi(data: ICreateAdminUserReq) {
  return ajax<ICreateAdminUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/create_admin`,
    data
  })
}

export function updateAdminUserApi(userId: string, data: IUpdateAdminUserReq) {
  return ajax<IUpdateAdminUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/v1/update_admin`,
    data: { ...data, userId }
  })
}
