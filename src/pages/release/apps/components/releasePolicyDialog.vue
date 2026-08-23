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
  <el-dialog
    v-model="visible"
    title="发版策略"
    width="560px"
    destroy-on-close
    append-to-body
    @open="loadPolicy"
  >
    <div v-if="archLabel" class="release-policy__arch">{{ archLabel }}</div>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="release-policy__tip"
    >
      按 deviceId 哈希分桶灰度（0–100%）。正式版全量发布，灰度版按比例命中；低于最低版本时强制更新。
    </el-alert>

    <el-form ref="formRef" :model="form" label-width="96px">
      <el-form-item label="正式版本" required>
        <el-select
          v-model="form.stableVersionId"
          placeholder="选择全量正式版"
          style="width: 100%"
          :disabled="!versions.length"
        >
          <el-option
            v-for="v in versions"
            :key="v.versionId"
            :label="v.version"
            :value="v.versionId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="灰度版本">
        <el-select
          v-model="form.grayVersionId"
          placeholder="不启用灰度"
          clearable
          style="width: 100%"
          :disabled="!versions.length"
        >
          <el-option
            v-for="v in versions"
            :key="v.versionId"
            :label="v.version"
            :value="v.versionId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="灰度比例">
        <el-slider v-model="form.rolloutPercent" :max="100" show-input />
      </el-form-item>

      <el-form-item label="最低版本">
        <el-input v-model="form.minVersion" placeholder="如 1.0.0，低于此版本强制更新" clearable />
      </el-form-item>

      <el-form-item label="强制更新">
        <el-switch v-model="form.forceUpdate" />
        <span class="release-policy__hint">命中更新的用户无法跳过</span>
      </el-form-item>

      <el-form-item label="启用策略">
        <el-switch v-model="form.isActive" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import {  ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getReleasePoliciesApi, upsertReleasePolicyApi } from '@/api/update'
import type { IVersionInfo } from '@/types/api/update'

const defaultForm = () => ({
  stableVersionId: undefined as number | undefined,
  grayVersionId: undefined as number | undefined,
  rolloutPercent: 0,
  minVersion: '',
  forceUpdate: false,
  isActive: true
})

export default defineComponent({
  name: 'ReleasePolicyDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    appId: { type: String, required: true },
    architectureId: { type: Number, default: 0 },
    archLabel: { type: String, default: '' },
    versions: { type: Array as () => IVersionInfo[], default: () => [] }
  },
  emits: ['update:modelValue', 'saved'],
  setup(props, { emit }) {
    const submitting = ref(false)
    const form = ref(defaultForm())

    const visible = computed({
      get: () => props.modelValue,
      set: (val: boolean) => emit('update:modelValue', val)
    })

    const loadPolicy = async () => {
      if (!props.appId || !props.architectureId) return
      form.value = defaultForm()
      const res = await getReleasePoliciesApi({ appId: props.appId })
      if (res.code !== 0 || !res.result) {
        ElMessage.error(res.msg || '获取发版策略失败')
        return
      }
      const policy = res.result.policies.find(p => p.architectureId === props.architectureId)
      if (policy) {
        form.value = {
          stableVersionId: policy.stableVersionId || undefined,
          grayVersionId: policy.grayVersionId || undefined,
          rolloutPercent: policy.rolloutPercent,
          minVersion: policy.minVersion || '',
          forceUpdate: policy.forceUpdate,
          isActive: policy.isActive
        }
      } else if (props.versions.length) {
        form.value.stableVersionId = props.versions[0].versionId
      }
    }

    watch(() => props.architectureId, () => {
      if (visible.value) loadPolicy()
    })

    const submit = async () => {
      if (!props.appId || !props.architectureId) return
      if (!form.value.stableVersionId) {
        ElMessage.warning('请选择正式版本')
        return
      }
      if (form.value.grayVersionId && form.value.rolloutPercent <= 0) {
        ElMessage.warning('启用灰度版本时请设置灰度比例')
        return
      }
      submitting.value = true
      const res = await upsertReleasePolicyApi({
        appId: props.appId,
        architectureId: props.architectureId,
        stableVersionId: form.value.stableVersionId,
        grayVersionId: form.value.grayVersionId,
        rolloutPercent: form.value.rolloutPercent,
        minVersion: form.value.minVersion || undefined,
        forceUpdate: form.value.forceUpdate,
        isActive: form.value.isActive
      })
      submitting.value = false
      if (res.code === 0) {
        ElMessage.success('发版策略已保存')
        visible.value = false
        emit('saved')
      } else {
        ElMessage.error(res.msg || '保存失败')
      }
    }

    return { visible, form, submitting, loadPolicy, submit }
  }
})
</script>

<style lang="less">
.release-policy {
  &__arch {
    margin-bottom: 12px;
    font-size: 13px;
    color: #606266;
  }

  &__tip {
    margin-bottom: 16px;
  }

  &__hint {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
