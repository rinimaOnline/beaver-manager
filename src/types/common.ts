// 基础API响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页查询参数
export interface PageParams {
  page?: number
  size?: number
}

// 分页响应结构
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// 统计数据项
export interface StatItem {
  title: string
  value: string | number
  color: string
  icon?: string
}

// 菜单项
export interface MenuItem {
  path: string
  title: string
  icon?: string
  children?: MenuItem[]
}

// 表格列配置
export interface TableColumn {
  prop: string
  label: string
  width?: number | string
  fixed?: boolean | "left" | "right"
  sortable?: boolean
}
