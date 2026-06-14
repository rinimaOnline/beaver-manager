export interface IContentReportInfo {
  id: number
  reporterUserId: string
  reporterName: string
  targetType: number
  targetId: string
  reasonType: number
  content: string
  status: number
  caseId: number
  createdAt: string
}

export interface IGetContentReportListReq {
  page?: number
  pageSize?: number
  status?: number
  targetType?: number
  targetId?: string
}

export interface IGetContentReportListRes {
  list: IContentReportInfo[]
  total: number
}

export interface IEscalateContentReportReq {
  reportId: number
  priority?: number
}

export interface IEscalateContentReportRes {
  caseId: number
  caseNo: string
}

export interface IRejectContentReportReq {
  reportId: number
  handleRemark?: string
}

export interface IRejectContentReportRes {}

export interface ICreateModerationCaseReq {
  targetType: number
  targetId: string
  title: string
  description?: string
  priority?: number
}

export interface ICreateModerationCaseRes {
  caseId: number
  caseNo: string
}

export interface IModerationCaseInfo {
  id: number
  caseNo: string
  source: number
  sourceId: number
  targetType: number
  targetId: string
  title: string
  description: string
  priority: number
  status: number
  handlerId: string
  handleRemark: string
  handleTime: string
  createdAt: string
}

export interface IGetModerationCaseListReq {
  page?: number
  pageSize?: number
  status?: number
  targetType?: number
  keyword?: string
}

export interface IGetModerationCaseListRes {
  list: IModerationCaseInfo[]
  total: number
}

export interface IGetModerationCaseDetailRes {
  case: IModerationCaseInfo
}

/** 后端 HandleModerationCase 支持的联动管控动作 */
export const MODERATION_CONTROL_ACTIONS = [
  { action: "ban_user", label: "封禁用户账号", targetType: "用户", scene: "辱骂、欺诈、多次违规" },
  { action: "unban_user", label: "解封用户账号", targetType: "用户", scene: "申诉通过、误封恢复" },
  { action: "delete_message", label: "删除违规消息", targetType: "消息", scene: "色情、广告、违禁内容" },
  { action: "clear_conversation", label: "清空会话消息", targetType: "会话", scene: "群聊/私聊批量清理" },
  { action: "delete_moment", label: "删除违规动态", targetType: "动态", scene: "社区违规内容" },
  { action: "dissolve_group", label: "解散违规群组", targetType: "群组", scene: "赌博、色情群" },
  { action: "kick_member", label: "踢出群成员", targetType: "群组", scene: "群内捣乱用户" },
  { action: "reject_report", label: "驳回无效举报", targetType: "举报", scene: "恶意举报、证据不足" },
  { action: "escalate_report", label: "举报立案", targetType: "举报", scene: "证据充分需处置" }
] as const

export const MODERATION_ACTION_LABELS: Record<string, string> = {
  delete_message: "删除消息",
  clear_conversation: "清空会话",
  handle_case: "处置工单",
  ban_user: "封禁用户",
  unban_user: "解封用户",
  escalate_report: "举报立案",
  reject_report: "驳回举报",
  delete_moment: "删除动态",
  dissolve_group: "解散群组",
  kick_member: "踢出成员",
  create_user: "创建用户",
  update_user: "更新用户",
  delete_user: "删除用户",
  create_sensitive_word: "新增敏感词",
  update_sensitive_word: "更新敏感词",
  delete_sensitive_word: "删除敏感词"
}

export interface ICaseContextUser {
  userId: string
  nickName: string
  email: string
  status: number
}

export interface ICaseContextMessage {
  messageId: string
  conversationId: string
  sendUserId: string
  sendUserName: string
  msgPreview: string
  isDeleted: boolean
  createTime: string
}

export interface ICaseContextMoment {
  momentId: string
  userId: string
  content: string
}

export interface ICaseContextGroup {
  groupId: string
  title: string
  status: number
}

export interface IGetModerationCaseContextRes {
  case: IModerationCaseInfo
  targetUser?: ICaseContextUser
  targetMessage?: ICaseContextMessage
  targetMoment?: ICaseContextMoment
  targetGroup?: ICaseContextGroup
  relatedReports: IContentReportInfo[]
  recentMessages: ICaseContextMessage[]
}

export interface IModerationControlAction {
  action: string
  target?: string
  reason?: string
  extra?: string
}

export interface IHandleModerationCaseReq {
  status: number
  handleRemark?: string
  actions?: IModerationControlAction[]
}

export interface IHandleModerationCaseRes {}

export interface IExecuteUserControlRes {}

export interface IExecuteUserControlReq {
  userId: string
  action: string
  reason?: string
  caseId?: number
}

export interface IOperationLogInfo {
  id: number
  operatorId: string
  action: string
  targetType: string
  targetId: string
  caseId: number
  detail: string
  result: string
  errorMessage: string
  createdAt: string
}

export interface IGetOperationLogListReq {
  page?: number
  pageSize?: number
  operatorId?: string
  action?: string
  actions?: string
  targetType?: string
  targetId?: string
  caseId?: number
}

export interface IGetOperationLogListRes {
  list: IOperationLogInfo[]
  total: number
}

export interface ISensitiveWordInfo {
  id: number
  word: string
  category: string
  level: number
  isActive: boolean
  remark: string
  createdAt: string
}

export interface IGetSensitiveWordListReq {
  page?: number
  pageSize?: number
  keyword?: string
  isActive?: boolean
}

export interface IGetSensitiveWordListRes {
  list: ISensitiveWordInfo[]
  total: number
}

export interface ICreateSensitiveWordReq {
  word: string
  category?: string
  level?: number
  remark?: string
}

export interface ICreateSensitiveWordRes {
  id: number
}

export interface IUpdateSensitiveWordReq {
  word?: string
  category?: string
  level?: number
  isActive?: boolean
  remark?: string
}

export interface IUpdateSensitiveWordRes {}

export interface IDeleteSensitiveWordRes {}

/** 敏感词等级 */
export const SENSITIVE_WORD_LEVEL: Record<number, { text: string; type: string }> = {
  1: { text: "低", type: "info" },
  2: { text: "中", type: "warning" },
  3: { text: "高", type: "danger" }
}
