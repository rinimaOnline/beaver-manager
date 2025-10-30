// 用户状态
export type UserStatus = "active" | "inactive"

// 用户信息
export interface IUser {
  id: number
  username: string
  email: string
  fileName: string
  status: UserStatus
  createTime: string
  updateTime: string
}

// 用户列表查询请求参数
export interface IUserListReq {
  page?: number
  size?: number
  keyword?: string
  status?: UserStatus
}

// 分页响应基础结构
export interface IPageRes<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// 用户列表响应
export interface IUserListRes extends IPageRes<IUser> {}

// 获取用户详情响应
export interface IGetUserDetailRes {
  id: number
  username: string
  email: string
  fileName: string
  status: UserStatus
  createTime: string
  updateTime: string
}

// 创建用户请求参数
export interface ICreateUserReq {
  username: string
  email: string
  password: string
  fileName?: string
}

// 创建用户响应
export interface ICreateUserRes {
  id: number
  username: string
  email: string
  fileName: string
  status: UserStatus
  createTime: string
}

// 更新用户请求参数
export interface IUpdateUserReq {
  username?: string
  email?: string
  fileName?: string
  status?: UserStatus
}

// 更新用户响应
export interface IUpdateUserRes {
  id: number
  username: string
  email: string
  fileName: string
  status: UserStatus
  updateTime: string
}

// 批量删除用户请求参数
export interface IBatchDeleteUserReq {
  ids: number[]
}
