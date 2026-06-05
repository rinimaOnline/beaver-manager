// 用户基础信息
export interface IUserInfo {
  id: string
  nickName: string
  email: string
  abstract: string
  fileName: string
  status: number
  source: number
  lastLoginIp: string
  createTime: string
  updateTime: string
}

// 获取用户列表请求参数
export interface IGetUserListReq {
  page?: number
  pageSize?: number
  email?: string
  keyword?: string
  status?: number
  source?: number
}

// 获取用户列表响应
export interface IGetUserListRes {
  list: IUserInfo[]
  total: number
}

// 获取用户详情请求参数
export interface IGetUserDetailReq {
  id: string
}

// 获取用户详情响应
export interface IGetUserDetailRes extends IUserInfo {}

// 创建用户请求参数
export interface ICreateUserReq {
  nickName: string
  password: string
  email: string
  avatar?: string
  abstract?: string
  status?: number
  source?: number
}

// 创建用户响应
export interface ICreateUserRes {
  id: string
}

// 更新用户请求参数
export interface IUpdateUserReq {
  id: string
  nickName?: string
  email?: string
  avatar?: string
  abstract?: string
  status?: number
}

// 更新用户响应
export interface IUpdateUserRes {}

// 删除用户请求参数
export interface IDeleteUserReq {
  id: string
}

// 删除用户响应
export interface IDeleteUserRes {}

// 批量删除用户请求参数
export interface IBatchDeleteUsersReq {
  ids: string[]
}

// 批量删除用户响应
export interface IBatchDeleteUsersRes {}

// 重置用户密码请求参数
export interface IResetUserPasswordReq {
  userId: string
  newPassword: string
}

// 重置用户密码响应
export interface IResetUserPasswordRes {}

// 批量更新用户状态请求参数
export interface IBatchUpdateUserStatusReq {
  ids: string[]
  status: number
}

// 批量更新用户状态响应
export interface IBatchUpdateUserStatusRes {}

// 用户状态枚举
export enum UserStatus {
  NORMAL = 1, // 正常
  DISABLED = 2, // 禁用
  DELETED = 3 // 删除
}

// 用户来源枚举
export enum UserSource {
  REGISTER = 1, // 注册
  ADMIN = 2, // 管理员创建
  IMPORT = 3 // 导入
}
