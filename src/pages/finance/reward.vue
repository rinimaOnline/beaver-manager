<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-manager-header-v1
-->

<template>
  <div class="reward">
    <div class="reward__header">
      <div>
        <h2 class="reward__title">签到与邀请奖励</h2>
        <p class="reward__subtitle">
          规则改完立刻生效，无需重启服务或发版。奖励直接入用户钱包余额，能否提现由
          <router-link class="reward__link" to="/finance/config">财务中心 → 系统配置</router-link>
          的「提现最小金额」决定
        </p>
      </div>
    </div>

    <el-tabs v-model="tab">
      <!-- ---------------- 签到规则 ---------------- -->
      <el-tab-pane label="签到规则" name="checkin">
        <div class="reward__bar">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="单日规则每次签到都发；连续规则在「连续签到天数」正好命中时额外叠加；累计规则按累计签到总天数命中。三类可同时生效。"
          />
          <div class="reward__bar-actions">
            <el-button :loading="checkinLoading" @click="loadCheckin">刷新</el-button>
            <el-button type="primary" @click="openCheckin()">新增规则</el-button>
          </div>
        </div>

        <el-table v-loading="checkinLoading" :data="checkinRules" border stripe>
          <el-table-column label="类型" width="110">
            <template #default="{ row }">
              <el-tag size="small" :type="checkinTypeTag(row.type)">{{ checkinTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="命中天数" width="100" align="center">
            <template #default="{ row }">{{ row.type === 0 ? "—" : row.day }}</template>
          </el-table-column>
          <el-table-column label="奖励金额" width="120">
            <template #default="{ row }">{{ row.rewardText }} 元</template>
          </el-table-column>
          <el-table-column label="发放方式" width="110" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.autoGrant === 1 ? 'success' : 'info'">
                {{ row.autoGrant === 1 ? "自动入账" : "仅记录" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="说明" min-width="180" show-overflow-tooltip />
          <el-table-column prop="sort" label="排序" width="70" align="center" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="(v: any) => toggleCheckin(row, Number(v))"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openCheckin(row)">编辑</el-button>
              <el-button link type="danger" @click="removeCheckin(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ---------------- 邀请规则 ---------------- -->
      <el-tab-pane label="邀请规则" name="invite">
        <div class="reward__bar">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="「每邀请 N 人」可重复发放，N=1 即每拉来一位好友发一次；「邀请达标」只在累计人数第一次够时发一次；「本人完成」奖励的是被邀请人自己。"
          />
          <div class="reward__bar-actions">
            <el-button :loading="inviteLoading" @click="loadInvite">刷新</el-button>
            <el-button type="primary" @click="openInvite()">新增规则</el-button>
          </div>
        </div>

        <el-table v-loading="inviteLoading" :data="inviteRules" border stripe>
          <el-table-column label="触发场景" width="130">
            <template #default="{ row }">
              <el-tag size="small">{{ sceneText(row.scene) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="触发动作" width="120">
            <template #default="{ row }">{{ actionText(row.triggerAction) }}</template>
          </el-table-column>
          <el-table-column label="人数" width="90" align="center">
            <template #default="{ row }">{{ row.scene === 0 ? "—" : row.requiredCount }}</template>
          </el-table-column>
          <el-table-column label="奖励金额" width="120">
            <template #default="{ row }">{{ row.rewardText }} 元</template>
          </el-table-column>
          <el-table-column label="可领次数" width="100" align="center">
            <template #default="{ row }">{{ row.maxClaims < 0 ? "不限" : row.maxClaims }}</template>
          </el-table-column>
          <el-table-column label="发放方式" width="110" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.autoGrant === 1 ? 'success' : 'info'">
                {{ row.autoGrant === 1 ? "自动入账" : "仅记录" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="说明" min-width="160" show-overflow-tooltip />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="(v: any) => toggleInvite(row, Number(v))"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openInvite(row)">编辑</el-button>
              <el-button link type="danger" @click="removeInvite(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ---------------- 开关 ---------------- -->
      <el-tab-pane label="开关配置" name="config">
        <el-form v-loading="configLoading" label-width="220px" class="reward__form">
          <el-form-item v-for="item in configItems" :key="item.keyName" :label="configLabel(item.keyName)">
            <el-switch
              v-if="isSwitchKey(item.keyName)"
              v-model="configForm[item.keyName]"
              active-value="1"
              inactive-value="0"
              active-text="开"
              inactive-text="关"
            />
            <el-select v-else-if="item.keyName === 'invite_trigger_action'" v-model="configForm[item.keyName]" style="width: 240px">
              <el-option label="注册即发（register）" value="register" />
              <el-option label="实名后发（realname）" value="realname" />
            </el-select>
            <el-input v-else v-model="configForm[item.keyName]" style="width: 320px" />
            <div class="reward__tip">{{ item.remark }}</div>
          </el-form-item>
          <el-form-item>
            <el-button :loading="configLoading" @click="loadConfig">重新拉取</el-button>
            <el-button type="primary" :loading="configSaving" @click="saveConfig">保存全部</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ---------------- 发放流水 ---------------- -->
      <el-tab-pane label="发放流水" name="logs">
        <div class="reward__bar">
          <div class="reward__filters">
            <el-input v-model="logQuery.userId" placeholder="受奖用户ID" clearable style="width: 200px" @keyup.enter="reloadLogs" />
            <el-select v-model="logQuery.source" placeholder="来源" clearable style="width: 140px" @change="reloadLogs">
              <el-option label="签到" value="checkin" />
              <el-option label="邀请" value="invite" />
            </el-select>
            <el-button type="primary" :loading="logLoading" @click="reloadLogs">查询</el-button>
          </div>
        </div>

        <el-table v-loading="logLoading" :data="logs" border stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="userId" label="受奖用户" width="130" show-overflow-tooltip />
          <el-table-column label="来源" width="90">
            <template #default="{ row }">{{ row.source === "checkin" ? "签到" : "邀请" }}</template>
          </el-table-column>
          <el-table-column label="触发来源用户" width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row.fromUserId || "—" }}</template>
          </el-table-column>
          <el-table-column label="金额" width="110">
            <template #default="{ row }">{{ row.amountText }} 元</template>
          </el-table-column>
          <el-table-column label="入账" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="grantTagType(row.granted)">{{ grantText(row.granted) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="orderId" label="钱包单号" width="180" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          <el-table-column label="时间" width="170">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="reward__pager"
          layout="total, prev, pager, next"
          :total="logTotal"
          :current-page="logQuery.page"
          :page-size="logQuery.limit"
          @current-change="onLogPage"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 签到规则编辑 -->
    <el-dialog v-model="checkinVisible" :title="checkinForm.id ? '编辑签到规则' : '新增签到规则'" width="560px" destroy-on-close>
      <el-form label-width="120px">
        <el-form-item label="规则类型" required>
          <el-radio-group v-model="checkinForm.type">
            <el-radio-button :value="0">单日</el-radio-button>
            <el-radio-button :value="1">连续</el-radio-button>
            <el-radio-button :value="2">累计</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="checkinForm.type !== 0" label="命中天数" required>
          <el-input-number v-model="checkinForm.day" :min="1" :step="1" style="width: 200px" />
          <div class="reward__tip">
            {{ checkinForm.type === 1 ? "连续签到到第几天时额外发放" : "累计签到总天数达到多少时额外发放" }}
          </div>
        </el-form-item>
        <el-form-item label="奖励金额" required>
          <el-input-number v-model="checkinForm.rewardYuan" :min="0" :precision="2" :step="1" style="width: 200px" />
          <span class="reward__unit">元</span>
        </el-form-item>
        <el-form-item label="自动入账">
          <el-switch v-model="checkinForm.autoGrant" :active-value="1" :inactive-value="0" />
          <div class="reward__tip">关闭后只写发放记录，不进用户钱包余额</div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="checkinForm.sort" :min="0" :step="1" style="width: 200px" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="checkinForm.remark" placeholder="会展示给用户，如「连续签到 7 天」" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="checkinForm.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkinVisible = false">取消</el-button>
        <el-button type="primary" :loading="checkinSaving" @click="submitCheckin">保存</el-button>
      </template>
    </el-dialog>

    <!-- 邀请规则编辑 -->
    <el-dialog v-model="inviteVisible" :title="inviteForm.id ? '编辑邀请规则' : '新增邀请规则'" width="560px" destroy-on-close>
      <el-form label-width="120px">
        <el-form-item label="触发场景" required>
          <el-radio-group v-model="inviteForm.scene">
            <el-radio-button :value="2">每邀请N人</el-radio-button>
            <el-radio-button :value="1">邀请达标</el-radio-button>
            <el-radio-button :value="0">本人完成</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="触发动作" required>
          <el-select v-model="inviteForm.triggerAction" style="width: 220px">
            <el-option label="被邀请人注册（register）" value="register" />
            <el-option label="被邀请人实名（realname）" value="realname" />
          </el-select>
          <div class="reward__tip">需与「开关配置 → 邀请奖励触发动作」一致，否则规则永远不会触发</div>
        </el-form-item>
        <el-form-item v-if="inviteForm.scene !== 0" label="人数" required>
          <el-input-number v-model="inviteForm.requiredCount" :min="1" :step="1" style="width: 200px" />
          <div class="reward__tip">{{ inviteForm.scene === 2 ? "每满这么多人发一次" : "累计达到这个人数发一次" }}</div>
        </el-form-item>
        <el-form-item label="奖励金额" required>
          <el-input-number v-model="inviteForm.rewardYuan" :min="0" :precision="2" :step="1" style="width: 200px" />
          <span class="reward__unit">元</span>
        </el-form-item>
        <el-form-item label="可领取次数">
          <el-input-number v-model="inviteForm.maxClaims" :min="-1" :step="1" style="width: 200px" />
          <div class="reward__tip">-1 表示不限次</div>
        </el-form-item>
        <el-form-item label="自动入账">
          <el-switch v-model="inviteForm.autoGrant" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="inviteForm.sort" :min="0" :step="1" style="width: 200px" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="inviteForm.remark" placeholder="会展示给用户，如「每邀请 1 位好友注册」" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="inviteForm.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteVisible = false">取消</el-button>
        <el-button type="primary" :loading="inviteSaving" @click="submitInvite">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { ICheckinRule, IInviteRule, IRewardConfigItem, IRewardLogItem } from "@/types/api/reward"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  deleteCheckinRuleApi,
  deleteInviteRuleApi,
  getCheckinRulesApi,
  getInviteRulesApi,
  getRewardConfigApi,
  getRewardLogsApi,
  saveCheckinRuleApi,
  saveInviteRuleApi,
  saveRewardConfigApi
} from "@/api/reward"
import { fenToYuanNumber, formatTime, yuanToFen } from "@/utils/money"
import { defineComponent, onMounted, reactive, ref } from "vue"

/** 开关型配置项，其余按文本/下拉渲染 */
const SWITCH_KEYS = new Set(["checkin_enabled", "checkin_cycle_repeat", "invite_enabled"])

const CONFIG_LABELS: Record<string, string> = {
  checkin_enabled: "签到总开关",
  checkin_cycle_repeat: "连续签到周期循环",
  invite_enabled: "邀请奖励总开关",
  invite_trigger_action: "邀请奖励触发动作"
}

export default defineComponent({
  name: "RewardConfig",
  setup() {
    const tab = ref("checkin")

    // ---------- 签到规则 ----------
    const checkinRules = ref<ICheckinRule[]>([])
    const checkinLoading = ref(false)
    const checkinSaving = ref(false)
    const checkinVisible = ref(false)
    const checkinForm = reactive({
      id: 0,
      type: 0,
      day: 7,
      rewardYuan: 1,
      autoGrant: 1,
      status: 1,
      sort: 0,
      remark: ""
    })

    const loadCheckin = async () => {
      checkinLoading.value = true
      try {
        const res = await getCheckinRulesApi()
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取签到规则失败")
          return
        }
        checkinRules.value = res.result?.list || []
      } finally {
        checkinLoading.value = false
      }
    }

    const openCheckin = (row?: ICheckinRule) => {
      checkinForm.id = row?.id || 0
      checkinForm.type = row?.type ?? 0
      checkinForm.day = row?.day || 7
      checkinForm.rewardYuan = fenToYuanNumber(row?.rewardFen || 0)
      checkinForm.autoGrant = row?.autoGrant ?? 1
      checkinForm.status = row?.status ?? 1
      checkinForm.sort = row?.sort || 0
      checkinForm.remark = row?.remark || ""
      checkinVisible.value = true
    }

    const submitCheckin = async () => {
      if (checkinForm.type !== 0 && checkinForm.day <= 0) {
        ElMessage.warning("连续/累计规则必须填写命中天数")
        return
      }
      checkinSaving.value = true
      try {
        const res = await saveCheckinRuleApi({
          id: checkinForm.id || undefined,
          type: checkinForm.type,
          day: checkinForm.type === 0 ? 0 : checkinForm.day,
          rewardFen: yuanToFen(checkinForm.rewardYuan),
          autoGrant: checkinForm.autoGrant,
          status: checkinForm.status,
          sort: checkinForm.sort,
          remark: checkinForm.remark
        } as any)
        if (res.code !== 0) {
          ElMessage.error(res.msg || "保存失败")
          return
        }
        ElMessage.success("保存成功")
        checkinVisible.value = false
        await loadCheckin()
      } finally {
        checkinSaving.value = false
      }
    }

    const toggleCheckin = async (row: ICheckinRule, status: number) => {
      const res = await saveCheckinRuleApi({ ...row, status } as any)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "更新状态失败")
        return
      }
      await loadCheckin()
    }

    const removeCheckin = async (row: ICheckinRule) => {
      await ElMessageBox.confirm("删除后该档奖励立即停止发放，确认删除？", "提示", { type: "warning" })
      const res = await deleteCheckinRuleApi(row.id)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      await loadCheckin()
    }

    // ---------- 邀请规则 ----------
    const inviteRules = ref<IInviteRule[]>([])
    const inviteLoading = ref(false)
    const inviteSaving = ref(false)
    const inviteVisible = ref(false)
    const inviteForm = reactive({
      id: 0,
      scene: 2,
      triggerAction: "register",
      requiredCount: 1,
      rewardYuan: 8.8,
      maxClaims: -1,
      autoGrant: 1,
      status: 1,
      sort: 0,
      remark: ""
    })

    const loadInvite = async () => {
      inviteLoading.value = true
      try {
        const res = await getInviteRulesApi()
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取邀请规则失败")
          return
        }
        inviteRules.value = res.result?.list || []
      } finally {
        inviteLoading.value = false
      }
    }

    const openInvite = (row?: IInviteRule) => {
      inviteForm.id = row?.id || 0
      inviteForm.scene = row?.scene ?? 2
      inviteForm.triggerAction = row?.triggerAction || "register"
      inviteForm.requiredCount = row?.requiredCount || 1
      inviteForm.rewardYuan = fenToYuanNumber(row?.rewardFen || 0)
      inviteForm.maxClaims = row?.maxClaims ?? -1
      inviteForm.autoGrant = row?.autoGrant ?? 1
      inviteForm.status = row?.status ?? 1
      inviteForm.sort = row?.sort || 0
      inviteForm.remark = row?.remark || ""
      inviteVisible.value = true
    }

    const submitInvite = async () => {
      inviteSaving.value = true
      try {
        const res = await saveInviteRuleApi({
          id: inviteForm.id || undefined,
          scene: inviteForm.scene,
          triggerAction: inviteForm.triggerAction,
          requiredCount: inviteForm.requiredCount,
          rewardFen: yuanToFen(inviteForm.rewardYuan),
          maxClaims: inviteForm.maxClaims,
          autoGrant: inviteForm.autoGrant,
          status: inviteForm.status,
          sort: inviteForm.sort,
          remark: inviteForm.remark
        } as any)
        if (res.code !== 0) {
          ElMessage.error(res.msg || "保存失败")
          return
        }
        ElMessage.success("保存成功")
        inviteVisible.value = false
        await loadInvite()
      } finally {
        inviteSaving.value = false
      }
    }

    const toggleInvite = async (row: IInviteRule, status: number) => {
      const res = await saveInviteRuleApi({ ...row, status } as any)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "更新状态失败")
        return
      }
      await loadInvite()
    }

    const removeInvite = async (row: IInviteRule) => {
      await ElMessageBox.confirm("删除后该条邀请奖励立即停止发放，确认删除？", "提示", { type: "warning" })
      const res = await deleteInviteRuleApi(row.id)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      await loadInvite()
    }

    // ---------- 开关配置 ----------
    const configItems = ref<IRewardConfigItem[]>([])
    const configForm = reactive<Record<string, string>>({})
    const configLoading = ref(false)
    const configSaving = ref(false)

    const loadConfig = async () => {
      configLoading.value = true
      try {
        const res = await getRewardConfigApi()
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取配置失败")
          return
        }
        configItems.value = res.result?.list || []
        for (const item of configItems.value)
          configForm[item.keyName] = item.value
      } finally {
        configLoading.value = false
      }
    }

    const saveConfig = async () => {
      configSaving.value = true
      try {
        for (const item of configItems.value) {
          const value = (configForm[item.keyName] ?? "").trim()
          if (value === item.value)
            continue
          const res = await saveRewardConfigApi({ keyName: item.keyName, value, remark: item.remark })
          if (res.code !== 0) {
            ElMessage.error(`${item.keyName} 保存失败：${res.msg || ""}`)
            return
          }
        }
        ElMessage.success("保存成功")
        await loadConfig()
      } finally {
        configSaving.value = false
      }
    }

    // ---------- 发放流水 ----------
    const logs = ref<IRewardLogItem[]>([])
    const logTotal = ref(0)
    const logLoading = ref(false)
    const logQuery = reactive({ userId: "", source: "", page: 1, limit: 20 })

    const loadLogs = async () => {
      logLoading.value = true
      try {
        const res = await getRewardLogsApi({ ...logQuery })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "查询失败")
          return
        }
        logs.value = res.result?.list || []
        logTotal.value = res.result?.total || 0
      } finally {
        logLoading.value = false
      }
    }

    const reloadLogs = () => {
      logQuery.page = 1
      loadLogs()
    }

    const onLogPage = (page: number) => {
      logQuery.page = page
      loadLogs()
    }

    onMounted(() => {
      loadCheckin()
      loadInvite()
      loadConfig()
      loadLogs()
    })

    return {
      tab,
      checkinRules,
      checkinLoading,
      checkinSaving,
      checkinVisible,
      checkinForm,
      loadCheckin,
      openCheckin,
      submitCheckin,
      toggleCheckin,
      removeCheckin,
      inviteRules,
      inviteLoading,
      inviteSaving,
      inviteVisible,
      inviteForm,
      loadInvite,
      openInvite,
      submitInvite,
      toggleInvite,
      removeInvite,
      configItems,
      configForm,
      configLoading,
      configSaving,
      loadConfig,
      saveConfig,
      logs,
      logTotal,
      logLoading,
      logQuery,
      reloadLogs,
      onLogPage,
      formatTime,
      isSwitchKey: (key: string) => SWITCH_KEYS.has(key),
      configLabel: (key: string) => CONFIG_LABELS[key] || key,
      // 2=入账中：只会出现在「抢占成功但进程没走完」的情况，钱到底出没出去要人工核对，
      // 系统不会自动重试，所以用 danger 标出来而不是当成普通的待补发。
      // 3=仅记录：规则配了「不自动入账」，按设计就不发钱，不是异常。
      grantText: (g: number) => (g === 1 ? "已入账" : g === 2 ? "入账中" : g === 3 ? "仅记录" : "待补发"),
      grantTagType: (g: number) => (g === 1 ? "success" : g === 2 ? "danger" : g === 3 ? "info" : "warning"),
      checkinTypeText: (t: number) => (t === 0 ? "单日" : t === 1 ? "连续" : "累计"),
      checkinTypeTag: (t: number) => (t === 0 ? "success" : t === 1 ? "warning" : "info"),
      sceneText: (s: number) => (s === 0 ? "本人完成" : s === 1 ? "邀请达标" : "每邀请N人"),
      actionText: (a: string) => (a === "realname" ? "被邀请人实名" : "被邀请人注册")
    }
  }
})
</script>

<style lang="less" scoped>
.reward {
  padding: 8px;

  &__header {
    margin-bottom: 8px;
  }

  &__title {
    margin: 0;
    font-size: 18px;
  }

  &__subtitle {
    margin: 4px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  &__link {
    color: var(--el-color-primary);
  }

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  &__bar-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
  }

  &__filters {
    display: flex;
    gap: 8px;
  }

  &__form {
    max-width: 760px;
    margin-top: 8px;
  }

  // el-form-item 的 content 是 flex 行，tip 不占满宽就会被挤到开关右边，
  // 和 el-switch 的 active-text 连成一句读不通的话。
  &__tip {
    width: 100%;
    margin-top: 2px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.6;
  }

  &__unit {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
