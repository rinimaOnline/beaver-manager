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
  <div class="safety-audit">
    <div class="safety-audit__header">
      <h2 class="safety-audit__title">操作审计日志</h2>
      <p class="safety-audit__subtitle">只读记录，涵盖工单处置、敏感词维护与管控动作的执行结果</p>
    </div>

    <el-form :inline="true">
      <el-form-item label="操作人">
        <el-input
          v-model="searchForm.operatorId"
          placeholder="操作人ID（精确匹配）"
          clearable
          style="width: 200px"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item label="动作">
        <el-select v-model="searchForm.action" clearable placeholder="全部动作" style="width: 180px">
          <el-option
            v-for="opt in actionOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="对象类型">
        <el-select v-model="searchForm.targetType" clearable placeholder="全部类型" style="width: 160px">
          <el-option
            v-for="opt in targetTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="对象ID">
        <el-input
          v-model="searchForm.targetId"
          placeholder="对象ID（精确匹配）"
          clearable
          style="width: 180px"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item label="工单ID">
        <el-input-number v-model="searchForm.caseId" :min="0" :controls="false" style="width: 120px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">搜索</el-button>
        <el-button :loading="loading" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 服务端 list_logs 只支持 operatorId / action / targetType / targetId / caseId 精确筛选，没有时间区间参数 -->
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="safety-audit__hint"
      title="日志按 ID 倒序返回，服务端暂不支持按时间区间筛选，需要看更早的记录请翻页。"
    />

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="createdAt" label="时间" width="200" />
      <el-table-column prop="operatorId" label="操作人" width="150" />
      <el-table-column label="动作" width="150">
        <template #default="{ row }">{{ actionLabel(row.action) }}</template>
      </el-table-column>
      <el-table-column label="对象" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          {{ targetTypeLabel(row.targetType) }}<span v-if="row.targetId"> · {{ row.targetId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工单" width="100">
        <template #default="{ row }">
          <el-button v-if="row.caseId" link type="primary" @click="goCase(row.caseId)">
            #{{ row.caseId }}
          </el-button>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="结果" width="90">
        <template #default="{ row }">
          <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
            {{ row.result === "success" ? "成功" : row.result || "未知" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="detail" label="详情" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ row.detail || "—" }}</template>
      </el-table-column>
      <el-table-column label="错误" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <el-text v-if="row.errorMessage" type="danger" size="small">{{ row.errorMessage }}</el-text>
          <span v-else>—</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      background
      class="safety-audit__pager"
      layout="total, sizes, prev, pager, next"
      :current-page="searchForm.page"
      :page-size="searchForm.pageSize"
      :total="total"
      :page-sizes="[20, 50, 100]"
      @size-change="(v: number) => { searchForm.pageSize = v; searchForm.page = 1; load() }"
      @current-change="(v: number) => { searchForm.page = v; load() }"
    />
  </div>
</template>

<script lang="ts">
import type { IOperationLogInfo } from "@/types/api/moderation"
import { ElMessage } from "element-plus"
import { getOperationLogListApi } from "@/api/moderation"
import { defineComponent, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"

// 与服务端 RecordOperation 落库的 action 字面量一一对应
const actionOptions = [
  { label: "举报立案", value: "escalate_report" },
  { label: "驳回举报", value: "reject_report" },
  { label: "创建工单", value: "create_case" },
  { label: "处置工单", value: "handle_case" },
  { label: "新增敏感词", value: "create_sensitive_word" },
  { label: "更新敏感词", value: "update_sensitive_word" },
  { label: "删除敏感词", value: "delete_sensitive_word" },
  { label: "调整接口权限", value: "update_authority_module" },
  { label: "封禁用户", value: "ban_user" },
  { label: "解封用户", value: "unban_user" },
  { label: "删除消息", value: "delete_message" },
  { label: "清空会话", value: "clear_conversation" },
  { label: "删除动态", value: "delete_moment" },
  { label: "解散群组", value: "dissolve_group" },
  { label: "踢出成员", value: "kick_member" }
]

const targetTypeOptions = [
  { label: "工单", value: "case" },
  { label: "举报", value: "report" },
  { label: "敏感词", value: "sensitive_word" },
  { label: "角色权限", value: "authority" },
  { label: "管控动作", value: "control" }
]

export default defineComponent({
  name: "SafetyAuditLogs",
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const list = ref<IOperationLogInfo[]>([])
    const total = ref(0)

    const searchForm = reactive({
      page: 1,
      pageSize: 20,
      operatorId: "",
      action: "",
      targetType: "",
      targetId: "",
      caseId: 0
    })

    const actionLabel = (action: string) =>
      actionOptions.find(opt => opt.value === action)?.label || action || "—"
    const targetTypeLabel = (targetType: string) =>
      targetTypeOptions.find(opt => opt.value === targetType)?.label || targetType || "—"

    const load = async () => {
      loading.value = true
      const res = await getOperationLogListApi({
        page: searchForm.page,
        pageSize: searchForm.pageSize,
        operatorId: searchForm.operatorId || undefined,
        action: searchForm.action || undefined,
        targetType: searchForm.targetType || undefined,
        targetId: searchForm.targetId || undefined,
        caseId: searchForm.caseId > 0 ? searchForm.caseId : undefined
      })
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      list.value = res.result?.list || []
      total.value = res.result?.total || 0
    }

    const search = () => {
      searchForm.page = 1
      load()
    }

    const reset = () => {
      searchForm.operatorId = ""
      searchForm.action = ""
      searchForm.targetType = ""
      searchForm.targetId = ""
      searchForm.caseId = 0
      search()
    }

    const goCase = (caseId: number) => {
      router.push(`/safety/cases?id=${caseId}`)
    }

    onMounted(load)

    return {
      loading,
      list,
      total,
      searchForm,
      actionOptions,
      targetTypeOptions,
      actionLabel,
      targetTypeLabel,
      load,
      search,
      reset,
      goCase
    }
  }
})
</script>

<style lang="less" scoped>
.safety-audit {
  padding: 8px;

  &__header {
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 6px;
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__hint {
    margin-bottom: 12px;
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
