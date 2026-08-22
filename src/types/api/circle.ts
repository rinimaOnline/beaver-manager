export interface CircleInfo {
  circleId: string
  name: string
  description: string
  avatar: string
  creatorId: string
  joinType: number
  memberCount: number
  postCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface GetCircleListReq {
  page?: number
  limit?: number
  userId?: string
  keywords?: string
  circleId?: string
}

export interface GetCircleListRes {
  list: CircleInfo[]
  total: number
}

export interface GetCircleDetailRes extends CircleInfo {}

export interface DeleteCircleRes {}

export interface CircleMemberInfo {
  circleId: string
  userId: string
  nickName: string
  role: number
}

export interface GetCircleMemberListReq {
  page?: number
  limit?: number
  circleId: string
}

export interface GetCircleMemberListRes {
  list: CircleMemberInfo[]
  total: number
}

export interface RemoveCircleMemberReq {
  circleId: string
  memberIds: string[]
}

export interface RemoveCircleMemberRes {}

export interface CirclePostInfo {
  postId: string
  circleId: string
  userId: string
  content: string
  isDeleted: boolean
  commentCount: number
  likeCount: number
  createdAt: string
}

export interface GetCirclePostListReq {
  page?: number
  limit?: number
  circleId: string
}

export interface GetCirclePostListRes {
  list: CirclePostInfo[]
  total: number
}

export interface DeleteCirclePostRes {}

export interface CircleCommentInfo {
  commentId: string
  postId: string
  userId: string
  content: string
  isDeleted: boolean
  createdAt: string
}

export interface GetCircleCommentListReq {
  page?: number
  limit?: number
  postId: string
}

export interface GetCircleCommentListRes {
  list: CircleCommentInfo[]
  total: number
}

export interface DeleteCircleCommentRes {}
