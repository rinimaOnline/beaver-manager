// 城市信息
export interface ICityInfo {
  code: string // 城市代码
  name: string // 城市名称
}

// 获取城市列表请求参数
export interface IGetCitiesReq {}

// 获取城市列表响应
export interface IGetCitiesRes {
  cities: ICityInfo[] // 城市列表
} 