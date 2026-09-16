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
  <div class="invite-tree-page">
    <div class="invite-tree-page__header">
      <div>
        <h2 class="invite-tree-page__title">邀请树</h2>
        <p class="invite-tree-page__subtitle">
          输入用户ID或邀请码，查看该用户往下的邀请关系链路。
        </p>
      </div>
    </div>

    <el-form :inline="true" class="invite-tree-page__query" @submit.prevent="query">
      <el-form-item>
        <el-radio-group v-model="mode">
          <el-radio-button label="userId">用户ID</el-radio-button>
          <el-radio-button label="code">邀请码</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="keyword"
          :placeholder="mode === 'userId' ? '输入用户ID' : '输入邀请码'"
          clearable
          style="width: 260px"
          @keyup.enter="query"
        />
      </el-form-item>
      <el-form-item label="层级">
        <el-input-number v-model="depth" :min="1" :max="8" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="query">查询</el-button>
      </el-form-item>
    </el-form>

    <template v-if="queried && result">
      <el-descriptions :column="2" border class="invite-tree-page__root">
        <el-descriptions-item label="根用户">
          {{ result.rootNickName || "—" }}
        </el-descriptions-item>
        <el-descriptions-item label="根用户ID">
          {{ result.rootUserId || "—" }}
        </el-descriptions-item>
        <el-descriptions-item label="根邀请码">
          <el-tag v-if="result.rootCode" size="small">{{ result.rootCode }}</el-tag>
          <span v-else>—</span>
        </el-descriptions-item>
        <el-descriptions-item label="上级">
          <template v-if="result.inviterId">
            {{ result.inviterName || "—" }}（{{ result.inviterId }}）
          </template>
          <span v-else>无上级</span>
        </el-descriptions-item>
        <el-descriptions-item label="下级总数">
          {{ result.total }}
        </el-descriptions-item>
      </el-descriptions>

      <el-tree
        v-if="treeData.length"
        v-loading="loading"
        class="invite-tree-page__tree"
        :data="treeData"
        node-key="userId"
        :props="{ label: 'nickName', children: 'children' }"
        default-expand-all
      >
        <template #default="{ data }">
          <div class="invite-tree-page__node">
            <span class="invite-tree-page__node-name">{{ data.nickName || "未设置昵称" }}</span>
            <span class="invite-tree-page__node-meta">微聊号 {{ data.weliaoId || "—" }}</span>
            <el-tag v-if="data.inviteCode" size="small" class="invite-tree-page__node-code">
              {{ data.inviteCode }}
            </el-tag>
            <el-tag size="small" type="info">L{{ data.level }}</el-tag>
            <span v-if="data.childCount" class="invite-tree-page__node-meta">下级 {{ data.childCount }}</span>
          </div>
        </template>
      </el-tree>
      <el-empty v-else description="该用户暂无下级" />
    </template>
    <el-empty v-else-if="queried" description="没有查询到该用户" />
  </div>
</template>

<script lang="ts">
import type { IInviteTreeNode, IInviteTreeRes } from "@/types/api/onboarding"
import { ElMessage } from "element-plus"
import { getInviteTreeApi } from "@/api/onboarding"
import { computed, defineComponent, ref } from "vue"

interface ITreeNode extends IInviteTreeNode {
  children: ITreeNode[]
}

export default defineComponent({
  name: "OnboardingInviteTree",
  setup() {
    const loading = ref(false)
    const queried = ref(false)
    const mode = ref<"userId" | "code">("userId")
    const keyword = ref("")
    const depth = ref(3)
    const result = ref<IInviteTreeRes | null>(null)

    const treeData = computed<ITreeNode[]>(() => {
      const res = result.value
      if (!res || !res.nodes?.length) {
        return []
      }
      const map = new Map<string, ITreeNode>()
      res.nodes.forEach((node) => {
        map.set(node.userId, { ...node, children: [] })
      })
      const roots: ITreeNode[] = []
      res.nodes.forEach((node) => {
        const current = map.get(node.userId)!
        const parent = map.get(node.inviterId)
        if (parent) {
          parent.children.push(current)
        }
        else {
          roots.push(current)
        }
      })
      return roots
    })

    const query = async () => {
      const value = keyword.value.trim()
      if (!value) {
        ElMessage.warning(mode.value === "userId" ? "请输入用户ID" : "请输入邀请码")
        return
      }
      loading.value = true
      try {
        const res = await getInviteTreeApi({
          userId: mode.value === "userId" ? value : undefined,
          code: mode.value === "code" ? value : undefined,
          depth: depth.value
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "查询失败")
          return
        }
        result.value = res.result?.rootUserId ? res.result : null
        queried.value = true
      }
      catch (e: any) {
        ElMessage.error(e?.message || "查询失败")
      }
      finally {
        loading.value = false
      }
    }

    return {
      loading,
      queried,
      mode,
      keyword,
      depth,
      result,
      treeData,
      query
    }
  }
})
</script>

<style lang="less" scoped>
.invite-tree-page {
  padding: 8px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
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

  &__query {
    margin-bottom: 16px;
  }

  &__root {
    margin-bottom: 16px;
  }

  &__tree {
    padding: 8px 0;
  }

  &__node {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__node-name {
    font-weight: 500;
  }

  &__node-meta {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
