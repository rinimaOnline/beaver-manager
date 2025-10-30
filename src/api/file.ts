import type {
  IBatchDeleteFileReq,
  IBatchDeleteFileRes,
  IDeleteFileRes,
  IGetFileDetailRes,
  IGetFileListReq,
  IGetFileListRes
} from "@/types/api/file"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取文件列表
export function getFileListApi(params: IGetFileListReq) {
  return ajax<IGetFileListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/file/list`,
    params
  })
}

// 获取文件详情
export function getFileDetailApi(id: number) {
  return ajax<IGetFileDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/file/${id}`
  })
}

// 删除文件
export function deleteFileApi(id: number) {
  return ajax<IDeleteFileRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/file/${id}`
  })
}

// 批量删除文件
export function batchDeleteFileApi(data: IBatchDeleteFileReq) {
  return ajax<IBatchDeleteFileRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/file/batch-delete`,
    data
  })
}

// 预览文件
export function previewOnlineFileApi(fileId: string) {
  return `${config.apiApi}/api/file/preview/${fileId}`
}

// Token缓存
let tokenCache: { token: string; expires: number } | null = null

// 检查token是否有效（30分钟内）
function isTokenValid(): boolean {
  if (!tokenCache) return false
  
  const now = Date.now()
  const thirtyMinutes = 30 * 60 * 1000 // 30分钟
  return (tokenCache.expires - now) > thirtyMinutes
}

// 获取七牛云上传token（带缓存）
export async function getQiniuUploadTokenApi() {
  if (isTokenValid()) {
    return Promise.resolve({ result: tokenCache! })
  }

  try {
    const response = await ajax<{ uploadToken: string; expiresIn: number }>({
      method: "POST",
      url: `${config.baseAPI}/admin/file/qiniuToken`
    })
    
    tokenCache = {
      token: response.result.uploadToken,
      expires: Date.now() + response.result.expiresIn * 1000
    }
    
    return { result: tokenCache }
  } catch (error) {
    console.error('获取七牛云token失败:', error)
    throw new Error('获取上传凭证失败')
  }
}

// 保存文件信息到数据库
export function saveFileApi(data: {
  fileName: string
  size: number
  path: string
  md5: string
  type: string
}) {
  return ajax<{ fileId: string }>({
    method: "POST",
    url: `${config.baseAPI}/admin/file/save`,
    data
  })
}
