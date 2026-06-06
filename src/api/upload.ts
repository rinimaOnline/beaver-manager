import { uploadFile, selectAndUploadFile } from '@/utils/upload'
import { getFileInfo } from '@/utils/tools'
import { ajax } from '@/utils/request'
import config from '@/config/env'
import { ElMessage } from 'element-plus'

/**
 * @description: 通用文件上传函数
 */
const uploadFileApiWithTarget = async (file: File, fileKey?: string, target: 'local' | 'qiniu' = 'local'): Promise<any> => {
  // 根据目标选择URL
  const baseEndpoint = target === 'qiniu' ? 'uploadQiniu' : 'uploadLocal'
  const uploadUrl = `${config.baseAPI}/api/file/${baseEndpoint}`

  // 获取文件信息
  const fileInfo = await getFileInfo(file)

  // 创建FormData - 将fileInfo作为FormData字段
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileInfo', JSON.stringify(fileInfo))
  formData.append('source', target) // 添加source字段

  const result = await ajax({
    method: 'POST',
    data: formData,
    url: uploadUrl,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  if (result.code !== 0) {
    ElMessage.error(result.msg)
    return Promise.reject(new Error(result.message))
  }

  return {
    fileKey: result.result.fileKey,
    originalName: result.result.originalName,
    fileInfo,
  }
}

/**
 * @description: 上传文件到本地
 */
const uploadToLocalApi = (file: File, fileKey?: string) => uploadFileApiWithTarget(file, fileKey, 'local')

/**
 * @description: 上传文件到七牛云
 */
const uploadQiniuApi = (file: File, fileKey?: string) => uploadFileApiWithTarget(file, fileKey, 'qiniu')

/**
 * @description: 文件上传总入口 - 使用统一的上传工具
 */
export const uploadFileApi = async (file: File, fileKey?: string): Promise<any> => {
  return await uploadToLocalApi(file, fileKey)
}

// 导出统一的上传接口
export { uploadFile, selectAndUploadFile } from '@/utils/upload'
