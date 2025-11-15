import type {
  ICreateAuthorityReq,
  ICreateAuthorityRes,
  ICreateMenuReq,
  ICreateMenuRes,
  IDeleteMenuReq,
  IDeleteMenuRes,
  IGetMenuListReq,
  IGetMenuListRes,
  IUpdateAuthorityMenuReq,
  IUpdateAuthorityMenuRes,
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

