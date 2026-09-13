/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * beaver-manager-header-v1
 */

import type { ICheckinRule, IInviteRule, IRewardConfigItem, IRewardLogItem } from "@/types/api/reward"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getCheckinRulesApi() {
  return ajax<{ list: ICheckinRule[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/reward/v1/checkin/rules`
  })
}

export function saveCheckinRuleApi(data: Partial<ICheckinRule>) {
  return ajax<{ ok: boolean }>({
    method: "POST",
    url: `${config.baseAPI}/admin/reward/v1/checkin/rules/save`,
    data
  })
}

export function deleteCheckinRuleApi(id: number) {
  return ajax<{ ok: boolean }>({
    method: "POST",
    url: `${config.baseAPI}/admin/reward/v1/checkin/rules/delete`,
    data: { id }
  })
}

export function getInviteRulesApi() {
  return ajax<{ list: IInviteRule[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/reward/v1/invite/rules`
  })
}

export function saveInviteRuleApi(data: Partial<IInviteRule>) {
  return ajax<{ ok: boolean }>({
    method: "POST",
    url: `${config.baseAPI}/admin/reward/v1/invite/rules/save`,
    data
  })
}

export function deleteInviteRuleApi(id: number) {
  return ajax<{ ok: boolean }>({
    method: "POST",
    url: `${config.baseAPI}/admin/reward/v1/invite/rules/delete`,
    data: { id }
  })
}

export function getRewardConfigApi() {
  return ajax<{ list: IRewardConfigItem[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/reward/v1/config`
  })
}

export function saveRewardConfigApi(data: { keyName: string, value: string, remark?: string }) {
  return ajax<{ ok: boolean }>({
    method: "POST",
    url: `${config.baseAPI}/admin/reward/v1/config/save`,
    data
  })
}

export function getRewardLogsApi(params: { userId?: string, source?: string, page?: number, limit?: number }) {
  return ajax<{ total: number, list: IRewardLogItem[] }>({
    method: "GET",
    url: `${config.baseAPI}/admin/reward/v1/logs`,
    params
  })
}
