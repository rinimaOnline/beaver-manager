import type {
  IGetOnlineUserListReq,
  IGetOnlineUserListRes,
  IGetUserOnlineDevicesRes,
  IOnlineStats
} from "@/types/api/monitor"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getOnlineStatsApi() {
  return ajax<IOnlineStats>({
    method: "GET",
    url: `${config.baseAPI}/admin/monitor/v1/stats`
  })
}

export function getOnlineUserListApi(params: IGetOnlineUserListReq) {
  return ajax<IGetOnlineUserListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/monitor/v1/list`,
    params
  })
}

export function getUserOnlineDevicesApi(userId: string) {
  return ajax<IGetUserOnlineDevicesRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/monitor/v1/devices`,
    params: { userId }
  })
}
