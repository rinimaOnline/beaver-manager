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
  <div class="tpl-page">
    <div class="tpl-page__header">
      <div>
        <h2 class="tpl-page__title">通知模板</h2>
        <p class="tpl-page__subtitle">
          触发点由代码决定（能提供哪些变量也是），文案、开关和要不要弹窗在这里改，<b>保存即生效，不用发版重启</b>。
          关掉某个触发点，这类通知就整条不发了。
        </p>
      </div>
      <el-button :loading="loading" @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="触发点" min-width="200">
        <template #default="{ row }">
          <div class="tpl-page__name">
            {{ row.name }}
            <el-tag v-if="row.isDefault" size="small" type="info">默认</el-tag>
          </div>
          <div class="tpl-page__code">{{ row.code }}</div>
        </template>
      </el-table-column>
      <el-table-column label="什么时候触发" min-width="260" show-overflow-tooltip>
        <template #default="{ row }">{{ row.desc }}</template>
      </el-table-column>
      <el-table-column label="标题" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">{{ row.title }}</template>
      </el-table-column>
      <el-table-column label="正文" min-width="280" show-overflow-tooltip>
        <template #default="{ row }">{{ row.content }}</template>
      </el-table-column>
      <el-table-column label="启用" width="90" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.enabled"
            :loading="togglingCode === row.code"
            @change="(v: string | number | boolean) => toggleEnabled(row, Boolean(v))"
          />
        </template>
      </el-table-column>
      <el-table-column label="弹窗" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.popup ? 'warning' : 'info'">{{ row.popup ? "弹" : "不弹" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最后修改" width="230">
        <template #default="{ row }">
          <span v-if="row.isDefault">—</span>
          <span v-else>{{ row.updatedAt }}<span v-if="row.updatedBy"> · {{ row.updatedBy }}</span></span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="!row.isDefault" link type="danger" @click="handleReset(row)">恢复默认</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有可配置的触发点" />
      </template>
    </el-table>

    <el-dialog v-model="editVisible" :title="`编辑「${editing?.name || ''}」`" width="640px" destroy-on-close>
      <el-alert v-if="editing" :closable="false" type="info" class="tpl-page__alert">
        <div>{{ editing.desc }}</div>
        <div class="tpl-page__vars">
          可用变量：
          <el-tag
            v-for="p in editing.placeholders"
            :key="p.key"
            size="small"
            class="tpl-page__var"
            @click="insert(p.key)"
          >
            {{ token(p.key) }} {{ p.desc }}
          </el-tag>
          <span v-if="!editing.placeholders.length">这个触发点没有变量</span>
        </div>
      </el-alert>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="86px">
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
          <span class="tpl-page__hint">关掉之后这个触发点整条不发，既不进通知列表也不弹窗。</span>
        </el-form-item>
        <el-form-item label="弹窗">
          <el-switch v-model="form.popup" />
          <span class="tpl-page__hint">开了会在客户端弹一次，适合安全提醒这类要立刻看到的。</span>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input
            ref="contentRef"
            v-model="form.content"
            type="textarea"
            :rows="5"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="跳转地址">
          <el-input v-model="form.linkUrl" placeholder="可选，点通知后打开的链接" />
        </el-form-item>
        <el-form-item label="预览">
          <div class="tpl-page__preview">
            <div class="tpl-page__preview-title">{{ previewTitle }}</div>
            <div class="tpl-page__preview-body">{{ previewContent }}</div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { INotificationTemplateItem } from "@/types/api/notification"
import { ElMessage, ElMessageBox } from "element-plus"
import { computed, defineComponent, onMounted, reactive, ref } from "vue"
import {
  getNotificationTemplatesApi,
  resetNotificationTemplateApi,
  saveNotificationTemplateApi
} from "@/api/notification"

/** 和服务端 placeholderPattern 一致：{字母开头的标识符} */
const PLACEHOLDER = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g

/**
 * 把变量名包成 {name} 给模板显示。
 *
 * 必须走函数，不能在模板里直接写字符串字面量——那样结尾的 }} 会被 Vue 当成
 * 插值的结束符，编译直接报 "Unexpected token"（vue-tsc 不报，只有 build 才炸）。
 */
function token(key: string): string {
  return `{${key}}`
}

/**
 * 预览用的假数据：按变量名猜一个像样的值，纯粹为了让运营看清排版。
 * 真正的替换在服务端发送时做，这里只是所见即所得。
 */
function sampleValue(key: string): string {
  if (/amount|fee/i.test(key)) return "12.34"
  if (/time|date/i.test(key)) return "2026-09-21 10:00:00"
  if (/ip/i.test(key)) return "1.2.3.4"
  if (/order/i.test(key)) return "WD20260921001"
  if (/device/i.test(key)) return "iPhone 17 Pro"
  if (/reason/i.test(key)) return "示例原因"
  return `示例${key}`
}

function preview(text: string, allowed: Set<string>): string {
  return text.replace(PLACEHOLDER, (token, key: string) =>
    allowed.has(key) ? sampleValue(key) : token
  )
}

export default defineComponent({
  name: "NotificationTemplatePage",
  setup() {
    const list = ref<INotificationTemplateItem[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const editVisible = ref(false)
    const editing = ref<INotificationTemplateItem | null>(null)
    const togglingCode = ref("")
    const formRef = ref<FormInstance>()
    const contentRef = ref<any>(null)

    const form = reactive({
      code: "",
      title: "",
      content: "",
      linkUrl: "",
      enabled: true,
      popup: false
    })

    const allowedKeys = computed(
      () => new Set((editing.value?.placeholders || []).map(item => item.key))
    )

    const rules: FormRules = {
      title: [{ required: true, message: "请填写标题", trigger: "blur" }],
      content: [{ required: true, message: "请填写正文", trigger: "blur" }]
    }

    const previewTitle = computed(() => preview(form.title, allowedKeys.value))
    const previewContent = computed(() => preview(form.content, allowedKeys.value))

    const load = async () => {
      loading.value = true
      const res = await getNotificationTemplatesApi()
      loading.value = false

      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      list.value = res.result?.list || []
    }

    const openEdit = (row: INotificationTemplateItem) => {
      editing.value = row
      form.code = row.code
      form.title = row.title
      form.content = row.content
      form.linkUrl = row.linkUrl
      form.enabled = row.enabled
      form.popup = row.popup
      editVisible.value = true
    }

    /** 点变量标签直接往正文末尾插，省得运营手打错 */
    const insert = (key: string) => {
      form.content = `${form.content}{${key}}`
    }

    const submit = async () => {
      if (!formRef.value) return
      await formRef.value.validate(async valid => {
        if (!valid) return

        // 服务端也会校验，这里先挡一道，省一次往返
        const unknown = new Set<string>()
        for (const text of [form.title, form.content, form.linkUrl]) {
          for (const match of text.matchAll(PLACEHOLDER)) {
            if (!allowedKeys.value.has(match[1])) unknown.add(match[1])
          }
        }
        if (unknown.size > 0) {
          ElMessage.error(`未知的变量：${[...unknown].map(k => `{${k}}`).join(" ")}`)
          return
        }

        saving.value = true
        const res = await saveNotificationTemplateApi({
          code: form.code,
          title: form.title.trim(),
          content: form.content.trim(),
          linkUrl: form.linkUrl.trim(),
          enabled: form.enabled,
          popup: form.popup
        })
        saving.value = false

        if (res.code !== 0) {
          ElMessage.error(res.msg || "保存失败")
          return
        }
        ElMessage.success("已保存，立即生效")
        editVisible.value = false
        load()
      })
    }

    /**
     * 列表里直接开关。
     *
     * 复用保存接口，把这一行当前生效的文案原样带回去——只动 enabled 一个字段。
     * 之所以不另开一个"只改开关"的接口：保存接口本来就要校验占位符，
     * 走同一条路就不会出现"开关改得了、文案校验绕过去了"的口子。
     */
    const toggleEnabled = async (row: INotificationTemplateItem, next: boolean) => {
      togglingCode.value = row.code
      const res = await saveNotificationTemplateApi({
        code: row.code,
        title: row.title,
        content: row.content,
        linkUrl: row.linkUrl,
        enabled: next,
        popup: row.popup
      })
      togglingCode.value = ""

      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      ElMessage.success(next ? "已启用" : "已关闭，这类通知不再发送")
      load()
    }

    const handleReset = (row: INotificationTemplateItem) => {
      ElMessageBox.confirm("恢复成代码里的默认文案和开关，确定吗？", "恢复默认", { type: "warning" })
        .then(async () => {
          const res = await resetNotificationTemplateApi(row.code)
          if (res.code !== 0) {
            ElMessage.error(res.msg || "重置失败")
            return
          }
          ElMessage.success("已恢复默认")
          load()
        })
        .catch(() => {})
    }

    onMounted(load)

    return {
      list,
      loading,
      saving,
      editVisible,
      editing,
      form,
      rules,
      formRef,
      contentRef,
      previewTitle,
      previewContent,
      load,
      openEdit,
      insert,
      token,
      togglingCode,
      toggleEnabled,
      submit,
      handleReset
    }
  }
})
</script>

<style lang="less" scoped>
.tpl-page {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 20px;
  }

  &__subtitle {
    margin: 0;
    max-width: 760px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.6;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  &__code {
    margin-top: 2px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  &__alert {
    margin-bottom: 16px;
  }

  &__vars {
    margin-top: 8px;
    line-height: 2;
  }

  &__var {
    margin-right: 6px;
    cursor: pointer;
  }

  &__hint {
    margin-left: 12px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  &__preview {
    width: 100%;
    padding: 12px 14px;
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;
    background: var(--el-fill-color-lighter);
  }

  &__preview-title {
    font-weight: 500;
  }

  &__preview-body {
    margin-top: 6px;
    color: var(--el-text-color-regular);
    font-size: 13px;
    line-height: 1.7;
    white-space: pre-wrap;
  }
}
</style>
