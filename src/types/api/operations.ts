export interface IUserOpsProfileInfo {
  userId: string
  nickName: string
  email: string
  avatar: string
  abstract: string
  status: number
  source: number
  createTime: string
}

export interface IUserOpsFriendItem {
  peerUserId: string
  peerUserName: string
  createTime: string
}

export interface IUserOpsGroupItem {
  groupId: string
  title: string
  role: number
  status: number
}

export interface IUserOpsSessionItem {
  conversationId: string
  conversationType: number
  title: string
  lastMessage: string
  lastMessageTime: string
  messageCount: number
}

export interface IUserOpsMomentItem {
  momentId: string
  content: string
  isDeleted: boolean
  createdAt: string
}

export interface IUserOpsReportItem {
  id: number
  targetType: number
  targetId: string
  reasonType: number
  status: number
  createdAt: string
}

export interface IUserOpsBlockItem {
  id: string
  blockedUserId: string
  blockedUserName: string
  createTime: string
}

export interface IGetUserOperationsProfileRes {
  profile: IUserOpsProfileInfo
  friendTotal: number
  groupTotal: number
  sessionTotal: number
  momentTotal: number
  reportTotal: number
  blockTotal: number
  friends: IUserOpsFriendItem[]
  groups: IUserOpsGroupItem[]
  sessions: IUserOpsSessionItem[]
  moments: IUserOpsMomentItem[]
  reports: IUserOpsReportItem[]
  blocks: IUserOpsBlockItem[]
}

export interface IGroupOpsProfileInfo {
  groupId: string
  title: string
  avatar: string
  creatorId: string
  notice: string
  status: number
  muteAll: boolean
  createdAt: string
}

export interface IGroupOpsMemberItem {
  userId: string
  nickName: string
  role: number
  status: number
  joinTime: string
}

export interface IGroupOpsMessageItem {
  messageId: string
  sendUserId: string
  sendName: string
  msgPreview: string
  isDeleted: boolean
  createTime: string
}

export interface IGroupOpsReportItem {
  id: number
  reporterUserId: string
  reporterName: string
  reasonType: number
  status: number
  createdAt: string
}

export interface IGetGroupOperationsProfileRes {
  profile: IGroupOpsProfileInfo
  memberTotal: number
  messageTotal: number
  reportTotal: number
  members: IGroupOpsMemberItem[]
  messages: IGroupOpsMessageItem[]
  reports: IGroupOpsReportItem[]
}
