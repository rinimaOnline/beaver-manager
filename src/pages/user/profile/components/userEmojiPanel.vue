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
  <div v-loading="loading" class="user-emoji-panel">
    <template v-if="emoji">
      <div class="user-emoji-panel__header">
        <h3 class="user-emoji-panel__title">{{ emoji.title }}</h3>
        <el-button type="danger" size="small" @click="handleDelete">删除表情</el-button>
      </div>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="表情ID">{{ emoji.emojiId }}</el-descriptions-item>
        <el-descriptions-item label="预览">
          <el-image
            v-if="emoji.fileUrl"
            :src="emoji.fileUrl"
            :preview-src-list="[emoji.fileUrl]"
            style="width: 80px; height: 80px"
            fit="cover"
          />
          <span v-else>无预览</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ emoji.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ emoji.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </template>
    <el-empty v-else-if="!loading" description="请选择一个表情" :image-size="80" />
  </div>
</template>

<script lang="ts">
import type { IEmojiInfo } from "@/types/api/emoji"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteEmojiApi } from "@/api/emoji"

export default defineComponent({
  props: {
    emoji: { type: Object as () => IEmojiInfo | null, default: null }
  },
  emits: ["deleted"],
  setup(props, { emit }) {
    const loading = ref(false)

    const handleDelete = async () => {
      if (!props.emoji) return
      await ElMessageBox.confirm(`确认删除表情「${props.emoji.title}」？`, "删除表情", { type: "warning" })
      loading.value = true
      const res = await deleteEmojiApi(props.emoji.emojiId)
      loading.value = false
      if (res.code === 0) {
        ElMessage.success("已删除")
        emit("deleted")
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    return { loading, handleDelete }
  }
})
</script>

<style lang="less">
.user-emoji-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 16px;
  overflow-y: auto;

  .user-emoji-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .user-emoji-panel__title {
    margin: 0;
    font-size: 16px;
  }
}
</style>
