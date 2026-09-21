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
  <div class="notification-page">
    <div class="notification-page__header">
      <div>
        <h2 class="notification-page__title">站内通知</h2>
        <p class="notification-page__subtitle">
          发到用户的「服务通知」里，会留在通知列表中可以回看。全员通知只写一条记录、按已读游标算未读，
          不会给每个用户落一行；定向通知会给每个收件人落一行，所以一次最多 500 人。
        </p>
      </div>
      <el-button type="primary" @click="openSend">发通知</el-button>
    </div>

    <el-form :inline="true" class="notification-page__filter" @submit.prevent="search">
      <el-form-item>
        <el-input
          v-model="filter.keywords"
          placeholder="标题或正文关键词"
          clearable
          style="width: 240px"
          @keyup.enter="search"
          @clear="search"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="content" label="正文" min-width="260" show-overflow-tooltip />
      <el-table-column label="范围" width="110" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.scope === NotificationScope.broadcast ? 'warning' : 'info'">
            {{ row.scope === NotificationScope.broadcast ? "全员" : "定向" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="收件人" width="100" align="center">
        <template #default="{ row }">
          {{ row.scope === NotificationScope.broadcast ? "全体用户" : `${row.recipients} 人` }}
        </template>
      </el-table-column>
      <el-table-column label="跳转" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.linkUrl || "—" }}</template>
      </el-table-column>
      <el-table-column prop="createdBy" label="发送人" width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.createdBy || "—" }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="发送时间" width="170" />
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? "有效" : "已撤回" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-button v-if="row.status === 1" link type="danger" @click="handleRevoke(row)">撤回</el-button>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有发过站内通知" />
      </template>
    </el-table>

    <el-pagination
      class="notification-page__pager"
      background
      layout="total, prev, pager, next"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      @current-change="onPageChange"
    />

    <el-dialog v-model="sendVisible" title="发送站内通知" width="620px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="投放范围" prop="scope">
          <el-radio-group v-model="form.scope">
            <el-radio :value="NotificationScope.targeted">指定用户</el-radio>
            <el-radio :value="NotificationScope.broadcast">全体用户</el-radio>
          </el-radio-group>
          <p class="notification-page__hint">
            全员通知发出即对所有在线用户生效，离线用户下次进 App 时拉到；只保留最近 30 天。
          </p>
        </el-form-item>

        <el-form-item v-if="form.scope === NotificationScope.targeted" label="收件人" prop="userIds">
          <el-input
            v-model="form.userIds"
            type="textarea"
            :rows="3"
            placeholder="用户 ID，一行一个，或用逗号 / 空格分隔，最多 500 个"
          />
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="64" show-word-limit placeholder="通知列表里的那行标题" />
        </el-form-item>

        <el-form-item label="正文" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="5" maxlength="2000" show-word-limit />
        </el-form-item>

        <el-form-item label="跳转地址">
          <el-input v-model="form.linkUrl" placeholder="可选，点通知后打开的链接" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="sendVisible = false">取消</el-button>
        <el-button type="primary" :loading="sending" @click="submit">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { ISystemNotificationItem } from "@/types/api/notification"
import { ElMessage, ElMessageBox } from "element-plus"
import { defineComponent, onMounted, reactive, ref } from "vue"
import {
  getSystemNotificationListApi,
  revokeSystemNotificationApi,
  sendSystemNotificationApi
} from "@/api/notification"
import { NotificationScope } from "@/types/api/notification"

/** 定向通知的人数上限，和服务端 maxTargetedRecipients 对齐 */
const MAX_RECIPIENTS = 500

/** 收件人框里可以换行、逗号、空格随便混着填，这里统一拆开去重 */
function parseUserIds(raw: string): string[] {
  const seen = new Set<string>()
  raw
    .split(/[\s,，;；]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => seen.add(item))
  return [...seen]
}

export default defineComponent({
  name: "SystemNotificationPage",
  setup() {
    const list = ref<ISystemNotificationItem[]>([])
    const loading = ref(false)
    const sending = ref(false)
    const sendVisible = ref(false)
    const page = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const formRef = ref<FormInstance>()

    const filter = reactive({ keywords: "" })
    const form = reactive({
      scope: NotificationScope.targeted as number,
      userIds: "",
      title: "",
      content: "",
      linkUrl: ""
    })

    const rules: FormRules = {
      title: [{ required: true, message: "请填写标题", trigger: "blur" }],
      content: [{ required: true, message: "请填写正文", trigger: "blur" }],
      userIds: [
        {
          validator: (_rule, value: string, callback) => {
            if (form.scope === NotificationScope.broadcast) return callback()
            const ids = parseUserIds(value || "")
            if (ids.length === 0) return callback(new Error("请填写至少一个用户 ID"))
            if (ids.length > MAX_RECIPIENTS)
              return callback(new Error(`一次最多 ${MAX_RECIPIENTS} 人，更大范围请用全员通知`))
            callback()
          },
          trigger: "blur"
        }
      ]
    }

    const load = async () => {
      loading.value = true
      const res = await getSystemNotificationListApi({
        page: page.value,
        pageSize: pageSize.value,
        keywords: filter.keywords || undefined
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
      page.value = 1
      load()
    }

    const onPageChange = (next: number) => {
      page.value = next
      load()
    }

    const openSend = () => {
      form.scope = NotificationScope.targeted
      form.userIds = ""
      form.title = ""
      form.content = ""
      form.linkUrl = ""
      sendVisible.value = true
    }

    const submit = async () => {
      if (!formRef.value) return
      await formRef.value.validate(async valid => {
        if (!valid) return

        const broadcast = form.scope === NotificationScope.broadcast
        if (broadcast) {
          try {
            await ElMessageBox.confirm(
              "这条通知会发给全体用户，且无法撤回已经弹出的提醒，确定发送吗？",
              "发送全员通知",
              { type: "warning" }
            )
          }
          catch {
            return
          }
        }

        sending.value = true
        const res = await sendSystemNotificationApi({
          title: form.title.trim(),
          content: form.content.trim(),
          linkUrl: form.linkUrl.trim() || undefined,
          scope: form.scope,
          userIds: broadcast ? undefined : parseUserIds(form.userIds)
        })
        sending.value = false

        if (res.code !== 0) {
          ElMessage.error(res.msg || "发送失败")
          return
        }
        ElMessage.success(broadcast ? "已发给全体用户" : `已发给 ${res.result?.recipients || 0} 人`)
        sendVisible.value = false
        search()
      })
    }

    const handleRevoke = (row: ISystemNotificationItem) => {
      ElMessageBox.confirm(
        "撤回后用户的通知列表里不再显示这条，但已经弹出过的提醒收不回来。",
        "撤回通知",
        { type: "warning" }
      )
        .then(async () => {
          const res = await revokeSystemNotificationApi(row.eventId)
          if (res.code !== 0) {
            ElMessage.error(res.msg || "撤回失败")
            return
          }
          ElMessage.success("已撤回")
          load()
        })
        .catch(() => {})
    }

    onMounted(load)

    return {
      NotificationScope,
      list,
      loading,
      sending,
      sendVisible,
      page,
      pageSize,
      total,
      filter,
      form,
      rules,
      formRef,
      search,
      onPageChange,
      openSend,
      submit,
      handleRevoke
    }
  }
})
</script>

<style lang="scss" scoped>
.notification-page {
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
    max-width: 720px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.6;
  }

  &__filter {
    margin-bottom: 8px;
  }

  &__hint {
    margin: 6px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.6;
  }

  &__pager {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
