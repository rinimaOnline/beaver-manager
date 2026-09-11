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
  <div class="onboarding-page">
    <div class="onboarding-page__header">
      <div>
        <h2 class="onboarding-page__title">默认群组</h2>
        <p class="onboarding-page__subtitle">
          新注册的普通用户会自动加入这些群。停用或删除只影响之后的注册，已在群里的用户不会被移出。
        </p>
      </div>
      <el-button type="primary" @click="openPicker">添加群组</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="群组" min-width="240">
        <template #default="{ row }">
          <div class="onboarding-page__user">
            <el-avatar :src="row.avatar" :size="36">{{ (row.title || row.groupId).slice(0, 1) }}</el-avatar>
            <div>
              <div class="onboarding-page__name">{{ row.title || "群已不存在" }}</div>
              <div class="onboarding-page__id">{{ row.groupId }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="90" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status"
            :active-value="1"
            :inactive-value="0"
            :loading="togglingId === row.id"
            @change="(v: string | number | boolean) => toggleStatus(row, Number(v))"
          />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.remark || "—" }}</template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="190" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有默认群，新用户注册后不会自动进群" />
      </template>
    </el-table>

    <el-dialog v-model="pickerVisible" title="添加默认群组" width="720px" destroy-on-close>
      <el-form :inline="true" @submit.prevent="searchGroups">
        <el-form-item>
          <el-input
            v-model="groupKeyword"
            placeholder="群名称 / 群 ID"
            clearable
            style="width: 280px"
            @keyup.enter="searchGroups"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="groupLoading" @click="searchGroups">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="groupLoading"
        :data="groupList"
        border
        stripe
        max-height="360"
        @selection-change="onGroupSelection"
      >
        <el-table-column type="selection" width="42" :selectable="row => !addedGroupIds.has(row.groupId)" />
        <el-table-column label="群组" min-width="220">
          <template #default="{ row }">
            <div class="onboarding-page__user">
              <el-avatar :src="row.fileName" :size="32">{{ (row.title || row.groupId).slice(0, 1) }}</el-avatar>
              <div>
                <div class="onboarding-page__name">{{ row.title || "未命名群" }}</div>
                <div class="onboarding-page__id">{{ row.groupId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="addedGroupIds.has(row.groupId)" size="small" type="info">已添加</el-tag>
            <el-tag v-else-if="row.status === 1" size="small" type="success">正常</el-tag>
            <el-tag v-else size="small">已解散</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="onboarding-page__pager"
        background
        layout="total, prev, pager, next"
        :current-page="groupPage"
        :page-size="groupPageSize"
        :total="groupTotal"
        @current-change="onGroupPage"
      />
      <template #footer>
        <el-button @click="pickerVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="!selectedGroupIds.length" @click="submitAdd">
          添加 {{ selectedGroupIds.length ? `(${selectedGroupIds.length})` : "" }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑默认群组" width="420px">
      <el-form label-width="80px">
        <el-form-item label="排序">
          <el-input-number v-model="editForm.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { GroupInfo } from "@/types/api/group"
import type { IOnboardingGroupItem } from "@/types/api/onboarding"
import { ElMessage, ElMessageBox } from "element-plus"
import { getGroupListApi } from "@/api/group"
import {
  addOnboardingGroupsApi,
  deleteOnboardingGroupApi,
  getOnboardingGroupsApi,
  updateOnboardingGroupApi
} from "@/api/onboarding"
import { computed, defineComponent, onMounted, reactive, ref } from "vue"

export default defineComponent({
  name: "OnboardingGroups",
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const togglingId = ref(0)
    const list = ref<IOnboardingGroupItem[]>([])
    const pickerVisible = ref(false)
    const editVisible = ref(false)
    const groupLoading = ref(false)
    const groupKeyword = ref("")
    const groupList = ref<GroupInfo[]>([])
    const groupPage = ref(1)
    const groupPageSize = 10
    const groupTotal = ref(0)
    const selectedGroupIds = ref<string[]>([])
    const editForm = reactive({ id: 0, sort: 0, remark: "" })

    const addedGroupIds = computed(() => new Set(list.value.map(item => item.groupId)))

    const load = async () => {
      loading.value = true
      const res = await getOnboardingGroupsApi()
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      list.value = res.result?.list || []
    }

    const loadGroups = async () => {
      groupLoading.value = true
      const res = await getGroupListApi({
        page: groupPage.value,
        limit: groupPageSize,
        keywords: groupKeyword.value.trim() || undefined,
        status: 1
      })
      groupLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "搜索群组失败")
        return
      }
      groupList.value = res.result?.list || []
      groupTotal.value = res.result?.total || 0
    }

    const openPicker = () => {
      groupKeyword.value = ""
      groupPage.value = 1
      selectedGroupIds.value = []
      pickerVisible.value = true
      loadGroups()
    }

    const searchGroups = () => {
      groupPage.value = 1
      loadGroups()
    }

    const onGroupPage = (page: number) => {
      groupPage.value = page
      loadGroups()
    }

    const onGroupSelection = (rows: GroupInfo[]) => {
      selectedGroupIds.value = rows.map(row => row.groupId)
    }

    const submitAdd = async () => {
      if (!selectedGroupIds.value.length) {
        ElMessage.warning("请先选择群组")
        return
      }
      saving.value = true
      const res = await addOnboardingGroupsApi({ groupIds: selectedGroupIds.value })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "添加失败")
        return
      }
      ElMessage.success(`已添加 ${res.result?.added ?? selectedGroupIds.value.length} 个默认群`)
      pickerVisible.value = false
      load()
    }

    const openEdit = (row: IOnboardingGroupItem) => {
      editForm.id = row.id
      editForm.sort = row.sort
      editForm.remark = row.remark || ""
      editVisible.value = true
    }

    const submitEdit = async () => {
      saving.value = true
      const res = await updateOnboardingGroupApi({
        id: editForm.id,
        sort: editForm.sort,
        remark: editForm.remark
      })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("已保存")
      editVisible.value = false
      load()
    }

    const toggleStatus = async (row: IOnboardingGroupItem, status: number) => {
      togglingId.value = row.id
      const res = await updateOnboardingGroupApi({ id: row.id, status })
      togglingId.value = 0
      if (res.code !== 0) {
        ElMessage.error(res.msg || "更新失败")
        return
      }
      row.status = status
    }

    const handleDelete = async (row: IOnboardingGroupItem) => {
      await ElMessageBox.confirm(
        `确认从默认群里移除「${row.title || row.groupId}」？之后注册的用户不会再自动加入这个群。`,
        "删除默认群",
        { type: "warning" }
      )
      const res = await deleteOnboardingGroupApi(row.id)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      load()
    }

    onMounted(load)

    return {
      loading,
      saving,
      togglingId,
      list,
      pickerVisible,
      editVisible,
      groupLoading,
      groupKeyword,
      groupList,
      groupPage,
      groupPageSize,
      groupTotal,
      selectedGroupIds,
      editForm,
      addedGroupIds,
      openPicker,
      searchGroups,
      onGroupPage,
      onGroupSelection,
      submitAdd,
      openEdit,
      submitEdit,
      toggleStatus,
      handleDelete
    }
  }
})
</script>

<style lang="less" scoped>
.onboarding-page {
  padding: 8px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 16px;
  }

  &__title {
    margin: 0 0 6px;
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    max-width: 640px;
    line-height: 1.5;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__name {
    font-weight: 500;
  }

  &__id {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
