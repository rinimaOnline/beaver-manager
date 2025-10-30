import type {
  IAddEmojiToPackageReq,
  IAddEmojiToPackageRes,
  IBatchDeleteEmojiCollectsReq,
  IBatchDeleteEmojiCollectsRes,
  ICreateEmojiPackageReq,
  ICreateEmojiPackageRes,
  ICreateEmojiReq,
  ICreateEmojiRes,
  IDeleteEmojiCollectRes,
  IDeleteEmojiPackageRes,
  IDeleteEmojiRes,
  IGetEmojiCollectListReq,
  IGetEmojiCollectListRes,
  IGetEmojiListReq,
  IGetEmojiListRes,
  IGetEmojiPackageEmojisReq,
  IGetEmojiPackageEmojisRes,
  IGetEmojiPackageListReq,
  IGetEmojiPackageListRes,
  IRemoveEmojiFromPackageReq,
  IRemoveEmojiFromPackageRes,
  IUpdateEmojiPackageReq,
  IUpdateEmojiPackageRes,
  IUpdateEmojiReq,
  IUpdateEmojiRes
} from "@/types/api/emoji"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// =================== 表情管理 ===================

// 获取表情列表
export function getEmojiListApi(params: IGetEmojiListReq) {
  return ajax<IGetEmojiListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/emoji/list`,
    params
  })
}



// 创建表情
export function createEmojiApi(data: ICreateEmojiReq) {
  return ajax<ICreateEmojiRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/emoji/create`,
    data
  })
}

// 更新表情
export function updateEmojiApi(id: string, data: Omit<IUpdateEmojiReq, "id">) {
  return ajax<IUpdateEmojiRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/emoji/${id}`,
    data
  })
}

// 删除表情
export function deleteEmojiApi(id: string) {
  return ajax<IDeleteEmojiRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/emoji/${id}`
  })
}



// =================== 表情包管理 ===================

// 获取表情包列表
export function getEmojiPackageListApi(params: IGetEmojiPackageListReq) {
  return ajax<IGetEmojiPackageListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/emoji/packages`,
    params
  })
}



// 创建表情包
export function createEmojiPackageApi(data: ICreateEmojiPackageReq) {
  return ajax<ICreateEmojiPackageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/emoji/packagecreate`,
    data
  })
}

// 更新表情包集合
export function updateEmojiPackageApi(data: IUpdateEmojiPackageReq) {
  return ajax<IUpdateEmojiPackageRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/emoji/packageupdate`,
    data
  })
}

// 删除表情包
export function deleteEmojiPackageApi(packageId: string) {
  return ajax<IDeleteEmojiPackageRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/emoji/packagedelete`,
    data: { packageId }
  })
}

// 获取表情包内表情列表
export function getEmojiPackageEmojisApi(params: IGetEmojiPackageEmojisReq) {
  return ajax<IGetEmojiPackageEmojisRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/emoji/packageemojis`,
    params
  })
}

// 向表情包集合中添加表情图片
export function addEmojiToPackageApi(data: IAddEmojiToPackageReq) {
  return ajax<IAddEmojiToPackageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/emoji/packageaddemoji`,
    data
  })
}

// 从表情包集合中移除表情图片
export function removeEmojiFromPackageApi(data: IRemoveEmojiFromPackageReq) {
  return ajax<IRemoveEmojiFromPackageRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/emoji/packageremoveemoji`,
    data
  })
}



// =================== 收藏管理 ===================

// 获取用户收藏表情列表
export function getEmojiCollectListApi(params: IGetEmojiCollectListReq) {
  return ajax<IGetEmojiCollectListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/emoji/collects`,
    params
  })
}

// 删除用户收藏记录
export function deleteEmojiCollectApi(collectId: string) {
  return ajax<IDeleteEmojiCollectRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/emoji/collectdelete`,
    data: { collectId }
  })
}

// 批量删除收藏记录
export function batchDeleteEmojiCollectsApi(data: IBatchDeleteEmojiCollectsReq) {
  return ajax<IBatchDeleteEmojiCollectsRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/emoji/collectbatch`,
    data
  })
}


