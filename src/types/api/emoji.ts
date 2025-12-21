// 表情信息
export interface IEmojiInfo {
  id: string
  fileName: string
  title: string
  authorId: string
  createTime: string
  updateTime: string
}

// 表情包信息
export interface IEmojiPackageInfo {
  id: string
  title: string
  coverFile: string
  userId: string
  description: string
  type: string
  status: number
  createTime: string
  updateTime: string
}

// 表情收藏信息
export interface IEmojiCollectInfo {
  id: string
  userId: string
  emojiId: string
  emojiTitle: string
  emojiFileName: string
  createTime: string
  updateTime: string
}

// 获取表情列表
export interface IGetEmojiListReq {
  page?: number
  pageSize?: number
  authorId?: string // 管理员可以按创建者筛选
  title?: string
  startTime?: string
  endTime?: string
}

export interface IGetEmojiListRes {
  list: IEmojiInfo[]
  total: number
}



// 创建表情
export interface ICreateEmojiReq {
  fileKey: string
  title: string
  emojiInfo: {
    width: number
    height: number
  }
}

export interface ICreateEmojiRes {
  id: string
}

// 更新表情
export interface IUpdateEmojiReq {
  id: string
  fileName?: string
  title?: string
}

export interface IUpdateEmojiRes {}

// 删除表情
export interface IDeleteEmojiReq {
  id: string
}

export interface IDeleteEmojiRes {}

// 批量删除表情
export interface IBatchDeleteEmojisReq {
  ids: string[]
}

export interface IBatchDeleteEmojisRes {}

// 获取表情包列表
export interface IGetEmojiPackageListReq {
  page?: number
  pageSize?: number
  userId?: string // 管理员可以按用户筛选
  type?: string
  status?: number
  title?: string
  startTime?: string
  endTime?: string
}

export interface IGetEmojiPackageListRes {
  list: IEmojiPackageInfo[]
  total: number
}

// 获取表情包内表情列表
export interface IGetEmojiPackageEmojisReq {
  packageId: string
  page?: number
  pageSize?: number
}

export interface IGetEmojiPackageEmojisRes {
  list: IEmojiInfo[]
  total: number
}

// 向表情包集合中添加表情图片
export interface IAddEmojiToPackageReq {
  packageId: string
  fileId: string
  title: string
  authorId: string
}

export interface IAddEmojiToPackageRes {
  id: string
}

// 从表情包集合中移除表情图片
export interface IRemoveEmojiFromPackageReq {
  packageId: string
  emojiId: string
}

export interface IRemoveEmojiFromPackageRes {}



// 创建表情包
export interface ICreateEmojiPackageReq {
  title: string
  coverFile: string
  description: string
  type: string
  status?: number
}

export interface ICreateEmojiPackageRes {
  id: string
}

// 更新表情包
export interface IUpdateEmojiPackageReq {
  packageId: string
  title?: string
  coverFile?: string
  description?: string
  type?: string
  status?: number
}

export interface IUpdateEmojiPackageRes {}

// 删除表情包
export interface IDeleteEmojiPackageReq {
  packageId: string
}

export interface IDeleteEmojiPackageRes {}

// 批量删除表情包
export interface IBatchDeleteEmojiPackagesReq {
  ids: string[]
}

export interface IBatchDeleteEmojiPackagesRes {}

// 获取用户收藏表情列表
export interface IGetEmojiCollectListReq {
  page?: number
  pageSize?: number
  userId?: string // 管理员可以按用户筛选
  emojiId?: string
  startTime?: string
  endTime?: string
}

export interface IGetEmojiCollectListRes {
  list: IEmojiCollectInfo[]
  total: number
}

// 删除用户收藏记录
export interface IDeleteEmojiCollectReq {
  collectId: string
}

export interface IDeleteEmojiCollectRes {}

// 批量删除收藏记录
export interface IBatchDeleteEmojiCollectsReq {
  ids: string[]
}

export interface IBatchDeleteEmojiCollectsRes {}

// 表情包类型枚举
export enum EmojiPackageType {
  OFFICIAL = "official", // 官方
  USER = "user" // 用户自定义
}

// 表情包状态枚举
export enum EmojiPackageStatus {
  DISABLED = 0, // 禁用
  ENABLED = 1, // 启用
  REVIEWING = 2, // 审核中
  REJECTED = 3 // 已拒绝
}


