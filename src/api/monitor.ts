import type { IGetOnlineUserListReq, IGetOnlineUserListRes, IOnlineStats } from "@/types/api/monitor"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getOnlineStatsApi() {
  return ajax<IOnlineStats>({
    method: "GET",
    url: `${config.baseAPI}/admin/monitor/online/stats`
  })
}

export function getOnlineUserListApi(params: IGetOnlineUserListReq) {
  return ajax<IGetOnlineUserListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/monitor/online/list`,
    params
  })
}
