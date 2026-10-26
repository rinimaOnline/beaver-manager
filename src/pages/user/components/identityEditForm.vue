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
  <div class="identity-edit-form">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="证件类型" prop="idType">
          <el-select v-model="form.idType" style="width: 100%">
            <el-option
              v-for="item in ID_TYPE_OPTIONS"
              :key="item.code"
              :label="item.label"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="实名姓名" prop="realName">
          <el-input v-model="form.realName" maxlength="40" placeholder="证件上的姓名" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="证件号" prop="idNumber">
          <el-input v-model="form.idNumber" maxlength="32" :placeholder="idNumberHint" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="证件影像">
      <div class="identity-edit-form__slots">
        <div v-for="item in singleSlots" :key="item.key" class="identity-edit-form__slot" v-loading="uploadingKey === item.key">
          <button v-if="!form[item.key]" type="button" class="identity-edit-form__empty" @click="uploadSingle(item.key)">
            <span>{{ item.label }}</span>
            <em>点击上传</em>
          </button>
          <div v-else class="identity-edit-form__preview">
            <el-image :src="form[item.key]" fit="cover" :preview-src-list="[form[item.key]]" preview-teleported />
            <span>{{ item.label }}</span>
            <div class="identity-edit-form__actions">
              <el-button link type="primary" @click="uploadSingle(item.key)">更换</el-button>
              <el-button link type="danger" @click="form[item.key] = ''">移除</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-form-item>

    <el-form-item label="活体动作帧">
      <div class="identity-edit-form__slots">
        <div
          v-for="(url, index) in form.faceFrames"
          :key="`${url}-${index}`"
          class="identity-edit-form__slot"
          v-loading="uploadingKey === `frame-${index}`"
        >
          <div class="identity-edit-form__preview">
            <el-image :src="url" fit="cover" :preview-src-list="[url]" preview-teleported />
            <span>动作帧 {{ index + 1 }}</span>
            <div class="identity-edit-form__actions">
              <el-button link type="primary" @click="replaceFrame(index)">更换</el-button>
              <el-button link type="danger" @click="removeFrame(index)">移除</el-button>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="identity-edit-form__add"
          :disabled="!!uploadingKey"
          @click="addFrame"
        >
          <el-icon><Plus /></el-icon>
          <span>添加帧</span>
        </button>
      </div>
    </el-form-item>

    <p class="identity-edit-form__hint">
      姓名和证件号要一起填。影像可后补、可替换。没提交过实名的会直接记成已通过；已有记录只改资料，审核状态不动。
    </p>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import type { IIdentityEditValue } from "@/utils/identity"
import { ID_TYPE_OPTIONS, idTypeMeta } from "@/utils/identity"
import { ElMessage } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import { uploadFile } from "@/api/upload"

const MAX_IMAGE_MB = 8

type SingleKey = "portraitUrl" | "emblemUrl" | "faceUrl"

export default defineComponent({
  name: "IdentityEditForm",
  components: { Plus },
  props: {
    modelValue: {
      type: Object as PropType<IIdentityEditValue>,
      required: true
    }
  },
  setup(props) {
    const form = props.modelValue
    const uploadingKey = ref("")
    const idNumberHint = computed(() => {
      switch (form.idType) {
        case 2: return "如 A123456(3)"
        case 3: return "7 或 8 位数字"
        case 4: return "1 位字母 + 9 位数字"
        default: return "15 或 18 位证件号"
      }
    })
    const singleSlots = computed(() => {
      const meta = idTypeMeta(form.idType)
      return [
        { key: "portraitUrl" as SingleKey, label: meta.front },
        { key: "emblemUrl" as SingleKey, label: meta.back },
        { key: "faceUrl" as SingleKey, label: "活体正脸" }
      ]
    })

    const pickImage = async (): Promise<string> => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      const files = await new Promise<File[]>((resolve) => {
        input.onchange = () => resolve(Array.from(input.files || []))
        input.oncancel = () => resolve([])
        input.click()
      })
      const file = files[0]
      if (!file) return ""
      if (!file.type.startsWith("image/")) {
        ElMessage.error("只能上传图片")
        return ""
      }
      if (file.size / 1024 / 1024 >= MAX_IMAGE_MB) {
        ElMessage.error(`图片不能超过 ${MAX_IMAGE_MB}MB`)
        return ""
      }
      const result = await uploadFile(file)
      return result.fileUrl
    }

    const uploadSingle = async (key: SingleKey) => {
      uploadingKey.value = key
      try {
        const url = await pickImage()
        if (url) form[key] = url
      } catch {
        ElMessage.error("图片上传失败")
      } finally {
        uploadingKey.value = ""
      }
    }

    const replaceFrame = async (index: number) => {
      uploadingKey.value = `frame-${index}`
      try {
        const url = await pickImage()
        if (url) form.faceFrames.splice(index, 1, url)
      } catch {
        ElMessage.error("图片上传失败")
      } finally {
        uploadingKey.value = ""
      }
    }

    const addFrame = async () => {
      uploadingKey.value = `frame-${form.faceFrames.length}`
      try {
        const url = await pickImage()
        if (url) form.faceFrames.push(url)
      } catch {
        ElMessage.error("图片上传失败")
      } finally {
        uploadingKey.value = ""
      }
    }

    const removeFrame = (index: number) => {
      form.faceFrames.splice(index, 1)
    }

    return {
      form,
      uploadingKey,
      ID_TYPE_OPTIONS,
      idNumberHint,
      singleSlots,
      uploadSingle,
      replaceFrame,
      addFrame,
      removeFrame
    }
  }
})
</script>

<style lang="less" scoped>
.identity-edit-form {
  &__slots {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__slot,
  &__add,
  &__empty,
  &__preview {
    width: 132px;
  }

  &__empty,
  &__add {
    height: 108px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    background: var(--el-fill-color-blank);
    color: var(--el-text-color-secondary);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 12px;

    em {
      font-style: normal;
      color: var(--el-color-primary);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__preview {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .el-image {
      width: 132px;
      height: 88px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 6px;
    }
  }

  &__actions {
    display: flex;
    gap: 4px;
  }

  &__hint {
    margin: 0 0 4px 100px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
