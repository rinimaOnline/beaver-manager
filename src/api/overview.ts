import type {
  IDashboardOverview,
  IDashboardTrends,
  IGetDashboardInboxRes
} from "@/types/api/overview"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getDashboardOverviewApi() {
  return ajax<IDashboardOverview>({
    method: "GET",
    url: `${config.baseAPI}/admin/overview/v1/dashboard`
  })
}

export function getDashboardInboxApi(limit?: number) {
  return ajax<IGetDashboardInboxRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/overview/v1/inbox`,
    params: { limit }
  })
}

export function getDashboardTrendsApi(days?: number) {
  return ajax<IDashboardTrends>({
    method: "GET",
    url: `${config.baseAPI}/admin/overview/v1/trends`,
    params: { days }
  })
}
