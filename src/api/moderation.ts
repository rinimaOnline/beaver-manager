import type { IExecuteUserControlReq, IExecuteUserControlRes } from "@/types/api/moderation"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function executeUserControlApi(data: IExecuteUserControlReq) {
  return ajax<IExecuteUserControlRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/moderation/v1/execute_user_control`,
    data
  })
}
