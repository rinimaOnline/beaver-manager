import type {
  IBucketInfo,
  ICreateBucketReq,
  ICreateBucketRes,
  IDeleteBucketReq,
  IDeleteBucketRes,
  IEventInfo,
  IGetBucketListReq,
  IGetBucketListRes,
  IGetEventListReq,
  IGetEventListRes,
  IQueryLogsReq,
  IQueryLogsRes,
  IUpdateBucketReq,
  IUpdateBucketRes
} from "@/types/api/track"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// ========================= Bucket 管理接口 =========================
// 获取 Bucket 列表
export function getBucketListApi(params: IGetBucketListReq) {
  return ajax<IGetBucketListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/track/buckets`,
    params
  })
}

// 创建 Bucket
export function createBucketApi(data: ICreateBucketReq) {
  return ajax<ICreateBucketRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/track/bucket`,
    data
  })
}

// 更新 Bucket
export function updateBucketApi(data: IUpdateBucketReq) {
  return ajax<IUpdateBucketRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/track/bucket`,
    data
  })
}

// 删除 Bucket
export function deleteBucketApi(data: IDeleteBucketReq) {
  return ajax<IDeleteBucketRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/track/bucket`,
    data
  })
}



// ========================= 事件管理接口 =========================
// 获取事件列表
export function getEventListApi(params: IGetEventListReq) {
  return ajax<IGetEventListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/track/events`,
    params
  })
}



// ========================= 日志管理接口 =========================
// 查询日志
export function queryLogsApi(params: IQueryLogsReq) {
  return ajax<IQueryLogsRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/track/logs`,
    params
  })
} 