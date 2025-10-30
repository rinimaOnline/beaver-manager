// 群组信息
export interface GroupInfo {
  id: number
  uuid: string
  type: number
  title: string
  abstract: string
  fileName: string
  creatorId: string
  notice: string
  tags: string
  maxMembers: number
  currentMembers: number
  status: number
  muteAll: boolean
  dissolveTime: string
  category: string
  createdAt: string
  updatedAt: string
}

// 群组列表请求
export interface GetGroupListReq {
  page?: number
  limit?: number
  status?: number
  type?: number
  keywords?: string
}
export interface GetGroupListRes {
  list: GroupInfo[]
  total: number
}

// 群组详情
export interface GetGroupDetailReq { id: number }
export interface GetGroupDetailRes extends GroupInfo {}

// 更新群组
export interface UpdateGroupReq {
  id: number
  title?: string
  abstract?: string
  fileName?: string
  notice?: string
  tags?: string
  maxMembers?: number
  status?: number
  muteAll?: boolean
  category?: string
}
export interface UpdateGroupRes {}

// 删除群组
export interface DeleteGroupReq { id: number }
export interface DeleteGroupRes {}

// 群成员信息
export interface GroupMemberInfo {
  id: number
  groupId: string
  userId: string
  memberNickname: string
  role: number
  prohibitionTime: number
  inviterId: string
  status: number
  notifyLevel: number
  displayName: string
  createdAt: string
  updatedAt: string
}

// 群成员列表
export interface GetGroupMemberListReq {
  page?: number
  limit?: number
  groupId: string
  role?: number
  status?: number
}
export interface GetGroupMemberListRes {
  list: GroupMemberInfo[]
  total: number
}

// 移除群成员
export interface RemoveGroupMemberReq {
  groupId: string
  memberIds: string[]
}
export interface RemoveGroupMemberRes {}

// 更新成员角色
export interface UpdateMemberRoleReq {
  id: number
  role: number
}
export interface UpdateMemberRoleRes {}

// 禁言成员
export interface MuteGroupMemberReq {
  id: number
  prohibitionTime: number
}
export interface MuteGroupMemberRes {}
