import type {
  ILogEntry,
  IQueryLogsReq,
  IQueryLogsRes
} from "@/types/api/track"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function queryLogsApi(params: IQueryLogsReq) {
  return ajax<IQueryLogsRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/track/logs`,
    params
  })
}
