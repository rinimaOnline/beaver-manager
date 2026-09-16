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
  <div class="invite-data-page">
    <div class="invite-data-page__header">
      <h2 class="invite-data-page__title">邀请数据</h2>
      <p class="invite-data-page__subtitle">
        输入用户ID，查它是被谁邀请的、以及它命中了哪些邀请码的上级链（传导后算进哪些码）。
      </p>
    </div>

    <el-form :inline="true" class="invite-data-page__filter" @submit.prevent="query">
      <el-form-item>
        <el-input
          v-model="userId"
          placeholder="用户ID"
          clearable
          style="width: 280px"
          @keyup.enter="query"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="query">查询</el-button>
      </el-form-item>
    </el-form>

    <el-descriptions v-if="queried" :column="3" border class="invite-data-page__desc">
      <el-descriptions-item label="用户ID">{{ result.userId || "—" }}</el-descriptions-item>
      <el-descriptions-item label="昵称">{{ result.nickName || "—" }}</el-descriptions-item>
      <el-descriptions-item label="邀请人ID">{{ result.inviterId || "—（直接注册 / 无码）" }}</el-descriptions-item>
    </el-descriptions>

    <el-table v-if="queried" :data="result.lineage" border stripe class="invite-data-page__table">
      <el-table-column label="邀请码" min-width="140">
        <template #default="{ row }">
          <span class="invite-data-page__code">{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.name || "—" }}</template>
      </el-table-column>
      <el-table-column label="级别" width="100" align="center">
        <template #default="{ row }">{{ row.level }} 级</template>
      </el-table-column>
      <el-table-column label="传导" width="130" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.propagateEnabled" size="small" type="warning">已开·{{ row.maxDepth }}层</el-tag>
          <el-tag v-else size="small" type="info">关</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否触发" width="110" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.applied" size="small" type="success">已触发</el-tag>
          <el-tag v-else size="small" type="info">未触发</el-tag>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="该用户没有命中任何已配置的祖先邀请码" />
      </template>
    </el-table>
  </div>
</template>

<script lang="ts">
import type { IInviteUserLineageRes } from "@/types/api/inviteCode"
import { ElMessage } from "element-plus"
import { getInviteUserLineageApi } from "@/api/inviteCode"
import { defineComponent, reactive, ref } from "vue"

export default defineComponent({
  name: "OnboardingInviteData",
  setup() {
    const loading = ref(false)
    const queried = ref(false)
    const userId = ref("")
    const result = reactive<IInviteUserLineageRes>({
      userId: "",
      nickName: "",
      inviterId: "",
      lineage: []
    })

    const query = async () => {
      const id = userId.value.trim()
      if (!id) {
        ElMessage.warning("请输入用户ID")
        return
      }
      loading.value = true
      const res = await getInviteUserLineageApi(id)
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "查询失败")
        return
      }
      result.userId = res.result?.userId || ""
      result.nickName = res.result?.nickName || ""
      result.inviterId = res.result?.inviterId || ""
      result.lineage = res.result?.lineage || []
      queried.value = true
    }

    return {
      loading,
      queried,
      userId,
      result,
      query
    }
  }
})
</script>

<style lang="less" scoped>
.invite-data-page {
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
    max-width: 720px;
    line-height: 1.5;
  }

  &__filter {
    margin-bottom: 12px;
  }

  &__desc {
    margin-bottom: 16px;
  }

  &__code {
    font-family: var(--el-font-family, monospace);
    font-weight: 600;
  }
}
</style>
