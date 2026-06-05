import type { IGetUserInfoRes, ILoginReq, ILoginRes } from "@/types/auth"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 用户登录
export const loginApi = (data: ILoginReq) =>{
  return ajax<ILoginRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/auth_public/v1/login`,
    data
  })
}

// 用户认证/获取用户信息
export function getUserInfoApi() {
  return ajax<IGetUserInfoRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/auth_public/v1/authentication`
  })
}
