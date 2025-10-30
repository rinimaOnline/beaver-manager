import { getQiniuUploadTokenApi, saveFileApi } from '../../api/file'
import { uploadFileToQiniuOss } from '@/utils/qiniu/qiniu'
import type { UploadInfo } from '@/types/utils/upload'

// 七牛云文件上传
export async function uploadFileToQiniu(file: File, path: string, baseUrl: string, argument?: any): Promise<UploadInfo> {
  try {
    // 获取token（带缓存）
    const response = await getQiniuUploadTokenApi()
    const token = response.result.token
    
    return await uploadFileToQiniuOss({
      file,
      path,
      token,
      argument
    })
  } catch (error) {
    console.error('七牛云上传失败:', error)
    throw error
  }
}

// 上传文件并保存到数据库
export async function uploadAndSaveFile(file: File, path: string, baseUrl: string): Promise<{ fileId: string } & UploadInfo> {
  try {
    // 1. 上传到七牛云
    const uploadInfo = await uploadFileToQiniu(file, path, baseUrl)
    
    // 2. 保存文件信息到数据库
    const saveResponse = await saveFileApi({
      fileName: file.name,
      size: file.size,
      path: uploadInfo.filePath,
      md5: uploadInfo.md5,
      type: file.type
    })
    
    return {
      fileId: saveResponse.result.fileId,
      ...uploadInfo
    }
  } catch (error) {
    console.error('上传并保存文件失败:', error)
    throw error
  }
} 