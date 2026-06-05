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
    url: `${config.baseAPI}/admin/overview/dashboard`
  })
}

export function getDashboardInboxApi(limit?: number) {
  return ajax<IGetDashboardInboxRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/overview/inbox`,
    params: { limit }
  })
}

export function getDashboardTrendsApi(days?: number) {
  return ajax<IDashboardTrends>({
    method: "GET",
    url: `${config.baseAPI}/admin/overview/trends`,
    params: { days }
  })
}
