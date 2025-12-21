// 文件上传响应
export interface IUploadFileRes {
  fileName: string
  fileName: string
  size: number
  path: string
  hash: string
  type: string
}

// 文件列表请求
export interface IGetFileListReq {
  page?: number
  pageSize?: number
  type?: string
}

// 文件列表响应
export interface IGetFileListRes {
  total: number
  files: IUploadFileRes[]
}

// 获取文件详情请求参数
export interface IGetFileDetailReq {
  id: number
}

// 获取文件详情响应
export interface IGetFileDetailRes extends IFileInfo {}

// 删除文件请求参数
export interface IDeleteFileReq {
  id: number
}

// 删除文件响应
export interface IDeleteFileRes {}

// 批量删除文件请求参数
export interface IBatchDeleteFileReq {
  ids: number[]
}

// 批量删除文件响应
export interface IBatchDeleteFileRes {}

// 文件类型枚举
export enum FileType {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  OTHER = "other"
}
