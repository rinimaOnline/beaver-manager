import * as QiniuOSS from 'qiniu-js'
import { fileType, getImageAttribute, getMd5, getAudioInfo, getVideoInfo } from '../tools'
import type { QiNiuUploadOss, UploadInfo } from '@/types/utils/upload'

export const uploadFileToQiniuOss = async ({ file, path, token, argument }: QiNiuUploadOss): Promise<UploadInfo> => {
  let audioAttribute: { duration?: number } = {}
  let imageAttribute: { width?: number; height?: number } = {}
  let videoAttribute: { width?: number; height?: number; duration?: number } = {}

  let ext = file.name.substring(file.name.lastIndexOf('.') + 1)
  const type = fileType(file.type)
  
  // 根据文件类型获取对应的属性信息
  if (type === 'image') {
    imageAttribute = await getImageAttribute(file)
  } else if (type === 'audio') {
    const audioInfo = await getAudioInfo(file)
    audioAttribute = { duration: audioInfo.duration }
  } else if (type === 'video') {
    const videoInfo = await getVideoInfo(file)
    videoAttribute = {
      width: videoInfo.width,
      height: videoInfo.height,
      duration: videoInfo.duration
    }
  }
  
  const md5 = await getMd5(file)
  const fileName = `${md5}.${ext}`

  return new Promise((resolve) => {
    let observable = QiniuOSS.upload(file, `${path}/${fileName}`, token)
    const observer = {
      complete() {
        resolve({
          filePath: `${path}/${fileName}`,
          name: file.name.substring(0, file.name.lastIndexOf('.')),
          md5: md5,
          size: file.size,
          ext: ext,
          duration: audioAttribute.duration || videoAttribute.duration || 0,
          width: imageAttribute.width || videoAttribute.width,
          height: imageAttribute.height || videoAttribute.height,
          ...argument
        })
      }
    }
    observable.subscribe(observer) // 上传开始
  })
}