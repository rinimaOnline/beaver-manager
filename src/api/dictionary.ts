/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-manager-header-v1
 */

import type {
  IGetCitiesReq,
  IGetCitiesRes
} from "@/types/api/dictionary"

const defaultCities: IGetCitiesRes["cities"] = [
  { code: "ALL", name: "全国" },
  { code: "010", name: "北京" },
  { code: "021", name: "上海" },
  { code: "020", name: "广州" },
  { code: "0755", name: "深圳" },
  { code: "0571", name: "杭州" },
  { code: "028", name: "成都" },
  { code: "027", name: "武汉" },
  { code: "029", name: "西安" },
  { code: "025", name: "南京" },
  { code: "023", name: "重庆" },
  { code: "022", name: "天津" },
  { code: "0512", name: "苏州" },
  { code: "0731", name: "长沙" },
  { code: "0532", name: "青岛" },
  { code: "0510", name: "无锡" },
  { code: "0574", name: "宁波" },
  { code: "0371", name: "郑州" },
  { code: "0757", name: "佛山" },
  { code: "0769", name: "东莞" },
]

// 城市字典已并入静态列表，不再打已下线的 dictionary 服务。
export function getCitiesApi(_params: IGetCitiesReq) {
  return Promise.resolve({
    code: 0,
    msg: "",
    result: { cities: defaultCities },
  })
} 