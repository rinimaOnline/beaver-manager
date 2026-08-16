import type {
  IGetGroupOperationsProfileRes,
  IGetUserOperationsProfileRes
} from "@/types/api/operations"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getUserOperationsProfileApi(userId: string) {
  return ajax<IGetUserOperationsProfileRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/operations/v1/user_profile`,
    params: { userId }
  })
}

export function getGroupOperationsProfileApi(groupId: string) {
  return ajax<IGetGroupOperationsProfileRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/operations/v1/group_profile`,
    params: { groupId }
  })
}
