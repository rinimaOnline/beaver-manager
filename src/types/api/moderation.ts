export interface IExecuteUserControlRes {}

export interface IExecuteUserControlReq {
  userId: string
  action: string
  reason?: string
  caseId?: number
}
