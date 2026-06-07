export interface IOnlineStats {
  userCount: number
  desktopCount: number
  mobileCount: number
}

export interface IOnlineUserSlotItem {
  instanceId: string
  slot: string
}

export interface IOnlineUserItem {
  userId: string
  nickName: string
  email: string
  avatar: string
  slots: IOnlineUserSlotItem[]
}

export interface IGetOnlineUserListReq {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface IGetOnlineUserListRes {
  list: IOnlineUserItem[]
  total: number
}
