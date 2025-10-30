// 好友关系信息
export interface IFriendInfo {
  id: string
  sendUserId: string
  sendUserName: string
  revUserId: string
  revUserName: string
  sendUserNotice: string
  revUserNotice: string
  isDeleted: boolean
  createTime: string
  updateTime: string
}

// 好友关系详情信息
export interface IFriendDetailInfo {
  id: string
  sendUserId: string
  sendUserName: string
  sendUserAvatar: string
  revUserId: string
  revUserName: string
  revUserAvatar: string
  sendUserNotice: string
  revUserNotice: string
  isDeleted: boolean
  createTime: string
  updateTime: string
}

// 好友验证信息
export interface IFriendVerifyInfo {
  id: string
  sendUserId: string
  sendUserName: string
  revUserId: string
  revUserName: string
  sendStatus: number
  revStatus: number
  message: string
  createTime: string
  updateTime: string
}

// 好友验证详情信息
export interface IFriendVerifyDetailInfo {
  id: string
  sendUserId: string
  sendUserName: string
  sendUserAvatar: string
  revUserId: string
  revUserName: string
  revUserAvatar: string
  sendStatus: number
  revStatus: number
  message: string
  createTime: string
  updateTime: string
}

// 获取好友关系列表请求参数
export interface IGetFriendListReq {
  page?: number
  pageSize?: number
  userId?: string
  friendId?: string
  isDeleted?: boolean
  startTime?: string
  endTime?: string
}

// 获取好友关系列表响应
export interface IGetFriendListRes {
  list: IFriendInfo[]
  total: number
}

// 获取好友关系详情请求参数
export interface IGetFriendDetailReq {
  id: string
}

// 获取好友关系详情响应
export interface IGetFriendDetailRes extends IFriendDetailInfo {}

// 删除好友关系请求参数
export interface IDeleteFriendReq {
  id: string
}

// 删除好友关系响应
export interface IDeleteFriendRes {}

// 批量删除好友关系请求参数
export interface IBatchDeleteFriendsReq {
  ids: string[]
}

// 批量删除好友关系响应
export interface IBatchDeleteFriendsRes {}

// 恢复好友关系请求参数
export interface IRestoreFriendReq {
  friendId: string
}

// 恢复好友关系响应
export interface IRestoreFriendRes {}

// 获取好友验证列表请求参数
export interface IGetFriendVerifyListReq {
  page?: number
  pageSize?: number
  sendUserId?: string
  revUserId?: string
  sendStatus?: number // 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  revStatus?: number
  startTime?: string
  endTime?: string
}

// 获取好友验证列表响应
export interface IGetFriendVerifyListRes {
  list: IFriendVerifyInfo[]
  total: number
}

// 获取好友验证详情请求参数
export interface IGetFriendVerifyDetailReq {
  verifyId: string
}

// 获取好友验证详情响应
export interface IGetFriendVerifyDetailRes extends IFriendVerifyDetailInfo {}

// 删除好友验证记录请求参数
export interface IDeleteFriendVerifyReq {
  verifyId: string
}

// 删除好友验证记录响应
export interface IDeleteFriendVerifyRes {}

// 批量删除好友验证记录请求参数
export interface IBatchDeleteFriendVerifyReq {
  ids: string[]
}

// 批量删除好友验证记录响应
export interface IBatchDeleteFriendVerifyRes {}

// 好友验证状态枚举
export enum FriendVerifyStatus {
  PENDING = 0, // 未处理
  ACCEPTED = 1, // 已通过
  REJECTED = 2, // 已拒绝
  IGNORED = 3, // 忽略
  DELETED = 4 // 删除
}
