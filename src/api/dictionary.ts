import type {
  IGetCitiesReq,
  IGetCitiesRes
} from "@/types/api/dictionary"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取城市列表
export function getCitiesApi(params: IGetCitiesReq) {
  return ajax<IGetCitiesRes>({
    method: "GET",
    url: `${config.apiApi}/api/dictionary/cities`,
    params
  })
} 