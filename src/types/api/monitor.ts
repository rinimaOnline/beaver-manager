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

export interface IUserOnlineDeviceItem {
  deviceId: string
  deviceType: string
  deviceName: string
  deviceOs: string
  deviceModel: string
  deviceOsVersion: string
  lastLoginTime: string
  lastLoginIp: string
  isOnline: boolean
}

export interface IGetUserOnlineDevicesRes {
  list: IUserOnlineDeviceItem[]
}
