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
  <div class="invite-setting-page">
    <div class="invite-setting-page__header">
      <div>
        <h2 class="invite-setting-page__title">注册设置</h2>
        <p class="invite-setting-page__subtitle">
          控制普通用户注册时是否必须填邀请码。
        </p>
      </div>
      <div class="invite-setting-page__actions">
        <el-button :loading="loading" @click="load">重新拉取</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </div>
    </div>

    <el-form v-loading="loading" label-width="180px" class="invite-setting-page__form">
      <el-form-item label="允许无邀请码注册">
        <el-switch v-model="allowEmptyInviteCode" active-text="允许" inactive-text="必须填码" />
        <div class="invite-setting-page__tip">
          开启后，不填邀请码也能注册，这类用户走「无码默认好友 / 无码默认群组」；
          关闭后，注册必须填一个有效的邀请码。
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus"
import { getInviteSettingApi, saveInviteSettingApi } from "@/api/inviteCode"
import { defineComponent, onMounted, ref } from "vue"

export default defineComponent({
  name: "OnboardingInviteSetting",
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const allowEmptyInviteCode = ref(false)

    const load = async () => {
      loading.value = true
      try {
        const res = await getInviteSettingApi()
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取设置失败")
          return
        }
        allowEmptyInviteCode.value = !!res.result?.allowEmptyInviteCode
      }
      catch (e: any) {
        ElMessage.error(e?.message || "获取设置失败")
      }
      finally {
        loading.value = false
      }
    }

    const save = async () => {
      saving.value = true
      const res = await saveInviteSettingApi({ allowEmptyInviteCode: allowEmptyInviteCode.value })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("已保存")
      load()
    }

    onMounted(load)

    return {
      loading,
      saving,
      allowEmptyInviteCode,
      load,
      save
    }
  }
})
</script>

<style lang="less" scoped>
.invite-setting-page {
  padding: 8px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__title {
    margin: 0 0 6px;
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__form {
    max-width: 640px;
  }

  &__tip {
    width: 100%;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
}
</style>
