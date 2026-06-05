// 菜单项
export interface IGetMenuListItem {
  id: number
  parentId: number
  path: string
  name: string
  hidden: boolean
  sort: number
  title: string
  icon: string
}

// 获取菜单列表
export interface IGetMenuListReq {
  userID?: string
}

export interface IGetMenuListRes {
  list: IGetMenuListItem[]
}

// 创建菜单
export interface ICreateMenuReq {
  parentId: number
  path: string
  name: string
  hidden: boolean
  sort: number
  title: string
  icon: string
}

export interface ICreateMenuRes {}

// 更新菜单
export interface IUpdateMenuReq {
  id: number
  parentId: number
  path: string
  name: string
  hidden: boolean
  sort: number
  title: string
  icon: string
}

export interface IUpdateMenuRes {}

// 删除菜单
export interface IDeleteMenuReq {
  id: number
}

export interface IDeleteMenuRes {}

// 创建权限
export interface ICreateAuthorityReq {
  name: string
  description: string
}

export interface ICreateAuthorityRes {}

// 更新权限菜单
export interface IUpdateAuthorityMenuMenuItem {
  id: number
}

export interface IUpdateAuthorityMenuReq {
  id: number
  menus: IUpdateAuthorityMenuMenuItem[]
}

export interface IUpdateAuthorityMenuRes {}

export interface IAuthorityInfo {
  id: number
  name: string
  description: string
  status: number
  sort: number
  menuCount: number
}

export interface IGetAuthorityListRes {
  list: IAuthorityInfo[]
}

export interface IUpdateAuthorityReq {
  id: number
  name: string
  description: string
  status: number
  sort: number
}

export interface IUpdateAuthorityRes {}

export interface IDeleteAuthorityReq {
  id: number
}

export interface IDeleteAuthorityRes {}

export interface IGetAuthorityMenusRes {
  menuIds: number[]
}

export interface IAdminUserInfo {
  id: number
  userId: string
  nickName: string
  phone: string
  status: number
  lastLoginAt: number
  createdAt: string
  authorityIds: number[]
  authorityNames: string[]
}

export interface IGetAdminUserListReq {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

export interface IGetAdminUserListRes {
  list: IAdminUserInfo[]
  total: number
}

export interface ICreateAdminUserReq {
  nickName: string
  phone: string
  password: string
  authorityIds: number[]
}

export interface ICreateAdminUserRes {
  userId: string
}

export interface IUpdateAdminUserReq {
  nickName?: string
  status?: number
  password?: string
  authorityIds?: number[]
}

export interface IUpdateAdminUserRes {}

