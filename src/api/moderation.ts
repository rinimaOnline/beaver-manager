import type {
  IEscalateContentReportReq,
  IEscalateContentReportRes,
  ICreateModerationCaseReq,
  ICreateModerationCaseRes,
  IRejectContentReportReq,
  IRejectContentReportRes,
  IExecuteUserControlReq,
  IExecuteUserControlRes,
  IGetContentReportListReq,
  IGetContentReportListRes,
  IGetModerationCaseContextRes,
  IGetModerationCaseDetailRes,
  IGetModerationCaseListReq,
  IGetModerationCaseListRes,
  IGetOperationLogListReq,
  IGetOperationLogListRes,
  IGetSensitiveWordListReq,
  IGetSensitiveWordListRes,
  ICreateSensitiveWordReq,
  ICreateSensitiveWordRes,
  IUpdateSensitiveWordReq,
  IUpdateSensitiveWordRes,
  IDeleteSensitiveWordRes,
  IHandleModerationCaseReq,
  IHandleModerationCaseRes
} from "@/types/api/moderation"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getContentReportListApi(params: IGetContentReportListReq) {
  return ajax<IGetContentReportListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/reports`,
    params
  })
}

export function escalateContentReportApi(data: IEscalateContentReportReq) {
  return ajax<IEscalateContentReportRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/reports/escalate`,
    data
  })
}

export function rejectContentReportApi(data: IRejectContentReportReq) {
  return ajax<IRejectContentReportRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/reports/reject`,
    data
  })
}

export function createModerationCaseApi(data: ICreateModerationCaseReq) {
  return ajax<ICreateModerationCaseRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/cases`,
    data
  })
}

export function getModerationCaseListApi(params: IGetModerationCaseListReq) {
  return ajax<IGetModerationCaseListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/cases`,
    params
  })
}

export function getModerationCaseDetailApi(caseId: number) {
  return ajax<IGetModerationCaseDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/cases/${caseId}`
  })
}

export function getModerationCaseContextApi(caseId: number) {
  return ajax<IGetModerationCaseContextRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/cases/${caseId}/context`
  })
}

export function handleModerationCaseApi(caseId: number, data: IHandleModerationCaseReq) {
  return ajax<IHandleModerationCaseRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/moderation/cases/${caseId}/handle`,
    data
  })
}

export function executeUserControlApi(data: IExecuteUserControlReq) {
  return ajax<IExecuteUserControlRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/control/user`,
    data
  })
}

export function getOperationLogListApi(params: IGetOperationLogListReq) {
  return ajax<IGetOperationLogListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/logs`,
    params
  })
}

export function getSensitiveWordListApi(params: IGetSensitiveWordListReq) {
  return ajax<IGetSensitiveWordListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/moderation/sensitive-words`,
    params
  })
}

export function createSensitiveWordApi(data: ICreateSensitiveWordReq) {
  return ajax<ICreateSensitiveWordRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/sensitive-words`,
    data
  })
}

export function updateSensitiveWordApi(id: number, data: IUpdateSensitiveWordReq) {
  return ajax<IUpdateSensitiveWordRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/moderation/sensitive-words/${id}`,
    data
  })
}

export function deleteSensitiveWordApi(id: number) {
  return ajax<IDeleteSensitiveWordRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/moderation/sensitive-words/${id}`
  })
}
