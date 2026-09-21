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
          控制普通用户注册时是否必须填邀请码，以及未实名用户能不能聊天。
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
          开启后，不填邀请码也能注册，这类用户会命中「默认好友 / 默认群组」里绑定邀请码留空的那些条目；
          关闭后，注册必须填一个有效的邀请码。
        </div>
      </el-form-item>

      <el-form-item label="强制实名才能聊天">
        <el-switch v-model="forceIdentityChat" active-text="强制" inactive-text="不强制" />
        <div class="invite-setting-page__tip">
          开启后，实名审核<strong>通过</strong>之前发不出任何消息，客户端会把用户锁在实名认证页上。
          存量老用户一并生效，不区分注册时间。
          <br>
          这是一道全站闸门：线上出问题（比如审核积压、大面积投诉）就把它关掉，一分钟内全端恢复发消息，
          不用重新发版。
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus"
import { getOnboardingSettingApi, saveOnboardingSettingApi } from "@/api/onboarding"
import { defineComponent, onMounted, ref } from "vue"

export default defineComponent({
  name: "OnboardingInviteSetting",
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const allowEmptyInviteCode = ref(false)
    const forceIdentityChat = ref(true)

    const load = async () => {
      loading.value = true
      try {
        const res = await getOnboardingSettingApi()
        if (res.code !== 0) {
          ElMessage.error(res.msg || "获取设置失败")
          return
        }
        allowEmptyInviteCode.value = !!res.result?.allowEmptyInviteCode
        forceIdentityChat.value = !!res.result?.forceIdentityChat
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
      try {
        const res = await saveOnboardingSettingApi({
          allowEmptyInviteCode: allowEmptyInviteCode.value,
          forceIdentityChat: forceIdentityChat.value,
        })
        if (res.code !== 0) {
          ElMessage.error(res.msg || "保存失败")
          return
        }
        ElMessage.success("已保存")
        load()
      }
      catch (e: any) {
        ElMessage.error(e?.message || "保存失败")
      }
      finally {
        saving.value = false
      }
    }

    onMounted(load)

    return {
      loading,
      saving,
      allowEmptyInviteCode,
      forceIdentityChat,
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
