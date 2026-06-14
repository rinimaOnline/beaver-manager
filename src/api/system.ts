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

// =================== 菜单管理 ===================

// 获取菜单列表
export function getMenuListApi(params: IGetMenuListReq) {
  return ajax<IGetMenuListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/getMenuList`,
    params
  })
}

// 创建菜单
export function createMenuApi(data: ICreateMenuReq) {
  return ajax<ICreateMenuRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/createMenu`,
    data
  })
}

// 更新菜单
export function updateMenuApi(data: IUpdateMenuReq) {
  return ajax<IUpdateMenuRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/system/updateMenu`,
    data
  })
}

// 删除菜单
export function deleteMenuApi(data: IDeleteMenuReq) {
  return ajax<IDeleteMenuRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/system/delete`,
    data
  })
}

// =================== 权限管理 ===================

// 创建权限
export function createAuthorityApi(data: ICreateAuthorityReq) {
  return ajax<ICreateAuthorityRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/createAuthority`,
    data
  })
}

// 更新权限菜单
export function updateAuthorityMenuApi(data: IUpdateAuthorityMenuReq) {
  return ajax<IUpdateAuthorityMenuRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/system/updateAuthorityMenu`,
    data
  })
}

export function getAuthorityListApi() {
  return ajax<IGetAuthorityListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/authorities`
  })
}

export function updateAuthorityApi(data: IUpdateAuthorityReq) {
  return ajax<IUpdateAuthorityRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/system/authority`,
    data
  })
}

export function deleteAuthorityApi(data: IDeleteAuthorityReq) {
  return ajax<IDeleteAuthorityRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/system/authority`,
    data
  })
}

export function getAuthorityMenusApi(authorityId: number) {
  return ajax<IGetAuthorityMenusRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/authority/${authorityId}/menus`
  })
}

export function getAdminUserListApi(params: IGetAdminUserListReq) {
  return ajax<IGetAdminUserListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/system/admins`,
    params
  })
}

export function createAdminUserApi(data: ICreateAdminUserReq) {
  return ajax<ICreateAdminUserRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/system/admins`,
    data
  })
}

export function updateAdminUserApi(userId: string, data: IUpdateAdminUserReq) {
  return ajax<IUpdateAdminUserRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/system/admins/${userId}`,
    data
  })
}

