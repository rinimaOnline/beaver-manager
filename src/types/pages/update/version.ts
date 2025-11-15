import type { IVersionInfo } from '@/types/api/update'

export interface IVersionForm {
  architectureId: number
  version: string
  fileKey: string
  description: string
  releaseNotes: string
  releaseDate: string
}

export interface IVersionState {
  loading: boolean
  dialogVisible: boolean
  deleteDialogVisible: boolean
  dialogTitle: string
  currentPage: number
  pageSize: number
  total: number
  tableData: IVersionInfo[]
  apps: Array<{
    appId: string
    name: string
  }>
  architectures: Array<{
    id: number
    archId: number
  }>
  selectedAppId: string
  selectedArchId: number
  form: IVersionForm
  toDeleteVersion: IVersionInfo | null
} 