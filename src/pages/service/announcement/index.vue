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
  <div class="announcement-page">
    <div class="announcement-page__header">
      <div>
        <h2 class="announcement-page__title">运营公告</h2>
        <p class="announcement-page__subtitle">
          发布后会按「弹出位置」和「触发时机」在移动端和桌面端弹窗展示，投放范围是全体登录用户。
        </p>
      </div>
      <el-button type="primary" @click="openCreate">新建公告</el-button>
    </div>

    <el-form :inline="true" class="announcement-page__filter" @submit.prevent="search">
      <el-form-item>
        <el-input
          v-model="filter.keywords"
          placeholder="标题关键词"
          clearable
          style="width: 220px"
          @keyup.enter="search"
          @clear="search"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="filter.type" placeholder="全部类型" clearable style="width: 130px" @change="search">
          <el-option v-for="(label, value) in TYPE_LABELS" :key="value" :label="label" :value="Number(value)" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filter.status" placeholder="全部状态" clearable style="width: 130px" @change="search">
          <el-option label="已发布" :value="1" />
          <el-option label="草稿" :value="STATUS_FILTER_DRAFT" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="announcement-page__title-cell">
            <el-image
              v-if="row.imageUrl"
              :src="row.imageUrl"
              fit="cover"
              class="announcement-page__thumb"
              :preview-src-list="[row.imageUrl]"
              preview-teleported
            />
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="TYPE_TAGS[row.type]">{{ TYPE_LABELS[row.type] || "—" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" width="90" align="center">
        <template #default="{ row }">{{ CONTENT_LABELS[row.contentType] || "—" }}</template>
      </el-table-column>
      <el-table-column label="弹出位置" min-width="170">
        <template #default="{ row }">{{ describePages(row.pages) }}</template>
      </el-table-column>
      <el-table-column label="触发时机" width="150">
        <template #default="{ row }">{{ TRIGGER_LABELS[row.trigger] || "—" }}</template>
      </el-table-column>
      <el-table-column label="投放人群" width="120">
        <template #default="{ row }">{{ AUDIENCE_LABELS[row.audience] || "全员" }}</template>
      </el-table-column>
      <el-table-column label="生效时间" min-width="200">
        <template #default="{ row }">{{ describeRange(row.startTime, row.endTime) }}</template>
      </el-table-column>
      <el-table-column prop="confirmedCount" label="已确认" width="90" align="center" />
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status"
            :active-value="1"
            :inactive-value="0"
            :loading="togglingId === row.announcementId"
            @change="(v: string | number | boolean) => toggleStatus(row, Number(v))"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有公告" />
      </template>
    </el-table>

    <el-pagination
      class="announcement-page__pager"
      background
      layout="total, prev, pager, next"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      @current-change="onPageChange"
    />

    <el-dialog v-model="editVisible" :title="editingId ? '编辑公告' : '新建公告'" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="60" show-word-limit placeholder="弹窗大标题，如「安全守护，隐私至上」" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio v-for="(label, value) in TYPE_LABELS" :key="value" :value="Number(value)">{{ label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="内容形态" prop="contentType">
          <el-radio-group v-model="form.contentType">
            <el-radio v-for="(label, value) in CONTENT_LABELS" :key="value" :value="Number(value)">{{ label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="needContent" label="正文" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="isRich ? 10 : 5"
            :maxlength="isRich ? 5000 : 1000"
            show-word-limit
            :placeholder="isRich ? '支持 Markdown：**加粗**、# 标题、- 列表、[文字](链接)、![图](图片地址)' : ''"
          />
          <template v-if="isRich">
            <p class="announcement-page__hint">
              支持 Markdown。下面是客户端实际渲染的效果，两端用的是同一套净化规则。
            </p>
            <div class="announcement-page__preview-box" v-html="contentPreview" />
          </template>
        </el-form-item>

        <el-form-item v-if="needImage" :label="isRich ? '题图（可选）' : '图片'" prop="imageUrl">
          <p v-if="isPoster" class="announcement-page__hint announcement-page__hint--notice">
            纯图片是「海报模式」：客户端只显示这张图和按钮，标题、角标、正文都不出现（标题仅用于后台识别）。
          </p>
          <div class="announcement-page__upload">
            <el-image v-if="form.imageUrl" :src="form.imageUrl" fit="contain" class="announcement-page__preview" />
            <div>
              <el-button :loading="uploading" @click="pickImage">{{ form.imageUrl ? "更换图片" : "上传图片" }}</el-button>
              <el-button v-if="form.imageUrl" link type="danger" @click="removeImage">移除</el-button>
              <p class="announcement-page__hint">建议宽度 750px 以内，2MB 以下</p>
            </div>
          </div>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileChange">
        </el-form-item>

        <el-form-item v-if="!isPoster" label="顶部图标">
          <div class="announcement-page__upload">
            <el-image v-if="form.iconUrl" :src="form.iconUrl" fit="contain" class="announcement-page__icon" />
            <div>
              <el-button :loading="uploadingIcon" @click="pickIcon">{{ form.iconUrl ? "更换图标" : "上传图标" }}</el-button>
              <el-button v-if="form.iconUrl" link type="danger" @click="removeIcon">移除</el-button>
              <p class="announcement-page__hint">
                标题上方那一块。配了图标就显示图标（客户端会自动加一圈光晕），不配则显示「{{ TYPE_LABELS[form.type] }}」角标。
              </p>
            </div>
          </div>
          <input ref="iconInput" type="file" accept="image/*" hidden @change="onIconChange">
        </el-form-item>

        <el-form-item label="弹出位置" prop="pages">
          <el-checkbox-group v-model="form.pages">
            <el-checkbox
              v-for="item in PAGE_OPTIONS"
              :key="item.value"
              :value="item.value"
              :disabled="item.value !== 'launch' && form.pages.includes('launch')"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
          <p class="announcement-page__hint">
            勾了「不限页面」就会覆盖其它选项，进 App 任意页面都能弹。<br>
            位置只对移动端生效：桌面端没有发现/我这些页面，一律进 App 就弹，不按位置筛。
          </p>
        </el-form-item>

        <el-form-item label="触发时机" prop="trigger">
          <el-select v-model="form.trigger" style="width: 100%">
            <el-option
              v-for="(label, value) in TRIGGER_LABELS"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
          <p class="announcement-page__hint">{{ TRIGGER_HINTS[form.trigger] }}</p>
        </el-form-item>

        <el-form-item label="投放人群" prop="audience">
          <el-select v-model="form.audience" style="width: 100%">
            <el-option
              v-for="(label, value) in AUDIENCE_LABELS"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
          <p class="announcement-page__hint">{{ AUDIENCE_HINTS[form.audience] }}</p>
        </el-form-item>

        <el-form-item label="按钮文案">
          <el-input v-model="form.buttonText" maxlength="10" placeholder="留空则用「我知道了」" />
        </el-form-item>

        <el-form-item label="跳转地址">
          <el-input v-model="form.linkUrl" placeholder="留空则弹窗不可点击" />
        </el-form-item>

        <el-form-item label="生效时间">
          <el-date-picker
            v-model="form.range"
            type="datetimerange"
            range-separator="至"
            start-placeholder="立即生效"
            end-placeholder="不过期"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
          <span class="announcement-page__hint announcement-page__hint--inline">多条同时命中时，数字小的先弹</span>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="运营自己看的，不下发给客户端" />
        </el-form-item>

        <el-form-item label="发布">
          <el-switch v-model="form.published" active-text="发布后立即对用户可见" />
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
import type { IAnnouncementItem } from "@/types/api/announcement"
import { ElMessage, ElMessageBox } from "element-plus"
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue"
import {
  createAnnouncementApi,
  deleteAnnouncementApi,
  getAnnouncementListApi,
  updateAnnouncementApi
} from "@/api/announcement"
import { uploadFile } from "@/api/upload"
import { renderMarkdown } from "@/utils/markdown"
import {
  ANNOUNCEMENT_CONTENT,
  ANNOUNCEMENT_CONTENT_LABELS,
  ANNOUNCEMENT_PAGES,
  ANNOUNCEMENT_STATUS_FILTER_DRAFT,
  ANNOUNCEMENT_AUDIENCE,
  ANNOUNCEMENT_AUDIENCE_LABELS,
  ANNOUNCEMENT_TRIGGER,
  ANNOUNCEMENT_TRIGGER_LABELS,
  ANNOUNCEMENT_TYPE_LABELS
} from "@/types/api/announcement"

const TRIGGER_HINTS: Record<number, string> = {
  [ANNOUNCEMENT_TRIGGER.NEW_DEVICE]: "同一账号换手机或换电脑登录时各弹一次，确认后该设备不再弹。",
  [ANNOUNCEMENT_TRIGGER.EVERY_LAUNCH]: "每次进入 App 都弹，点了确认下次照弹，直到公告下架。谨慎使用。",
  [ANNOUNCEMENT_TRIGGER.DAILY]: "每天首次进入弹一次，当天不再重复打扰。",
  [ANNOUNCEMENT_TRIGGER.ONCE]: "确认后永不再弹，换设备也不弹。"
}

const AUDIENCE_HINTS: Record<number, string> = {
  [ANNOUNCEMENT_AUDIENCE.ALL]: "所有登录用户都会收到。",
  [ANNOUNCEMENT_AUDIENCE.UNVERIFIED]:
    "只发给没提交过实名、或实名被驳回的用户；待审中的不打扰。实名入口只在手机上，所以这类公告桌面端不弹。"
}

const TYPE_TAGS: Record<number, "primary" | "success" | "warning"> = {
  0: "primary",
  1: "success",
  2: "warning"
}

export default defineComponent({
  name: "ServiceAnnouncement",
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const uploading = ref(false)
    const uploadingIcon = ref(false)
    const togglingId = ref("")
    const list = ref<IAnnouncementItem[]>([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = 20
    const editVisible = ref(false)
    const editingId = ref("")
    const formRef = ref<FormInstance>()
    const fileInput = ref<HTMLInputElement>()
    const iconInput = ref<HTMLInputElement>()

    const filter = reactive<{ keywords: string, type?: number, status?: number }>({
      keywords: "",
      type: undefined,
      status: undefined
    })

    const form = reactive({
      title: "",
      content: "",
      imageUrl: "",
      iconUrl: "",
      // 上传时顺手记下原图宽高，客户端拿它撑骨架位，避免图没下完时弹窗先缩后弹
      imageWidth: 0,
      imageHeight: 0,
      contentType: ANNOUNCEMENT_CONTENT.TEXT as number,
      type: 0,
      pages: ["launch"] as string[],
      trigger: ANNOUNCEMENT_TRIGGER.ONCE as number,
      audience: ANNOUNCEMENT_AUDIENCE.ALL as number,
      buttonText: "",
      linkUrl: "",
      range: undefined as [string, string] | undefined,
      sort: 0,
      remark: "",
      published: false
    })

    const needContent = computed(() => form.contentType !== ANNOUNCEMENT_CONTENT.IMAGE)
    const needImage = computed(() => form.contentType !== ANNOUNCEMENT_CONTENT.TEXT)
    const isRich = computed(() => form.contentType === ANNOUNCEMENT_CONTENT.RICH)
    // 海报模式下客户端只渲染图片，图标配了也没地方显示，所以整项藏起来
    const isPoster = computed(() => form.contentType === ANNOUNCEMENT_CONTENT.IMAGE)
    // 富文本的图片只是可选题图，Markdown 正文里本来就能内嵌图，别逼着运营传一张
    const imageRequired = computed(() => needImage.value && !isRich.value)
    const contentPreview = computed(() => (isRich.value ? renderMarkdown(form.content) : ""))

    const rules = computed<FormRules>(() => ({
      title: [{ required: true, message: "请填写标题", trigger: "blur" }],
      content: needContent.value ? [{ required: true, message: "请填写正文", trigger: "blur" }] : [],
      imageUrl: imageRequired.value ? [{ required: true, message: "请上传图片", trigger: "change" }] : [],
      pages: [
        {
          validator: (_r: unknown, value: string[], cb: (e?: Error) => void) =>
            value?.length ? cb() : cb(new Error("至少选一个弹出位置")),
          trigger: "change"
        }
      ]
    }))

    // 勾了「不限页面」就把具体页面清掉，免得存成 launch,chat 这种自相矛盾的值
    // （服务端也会收敛成 launch，但这里先收敛，界面上不至于看着还勾着）。
    watch(() => form.pages, (next) => {
      if (next.includes("launch") && next.length > 1)
        form.pages = ["launch"]
    })

    const load = async () => {
      loading.value = true
      const res = await getAnnouncementListApi({
        page: page.value,
        pageSize,
        keywords: filter.keywords.trim() || undefined,
        type: filter.type,
        status: filter.status
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

    const resetForm = () => {
      form.title = ""
      form.content = ""
      form.imageUrl = ""
      form.iconUrl = ""
      form.imageWidth = 0
      form.imageHeight = 0
      form.contentType = ANNOUNCEMENT_CONTENT.TEXT
      form.type = 0
      form.pages = ["launch"]
      form.trigger = ANNOUNCEMENT_TRIGGER.ONCE
      form.audience = ANNOUNCEMENT_AUDIENCE.ALL
      form.buttonText = ""
      form.linkUrl = ""
      form.range = undefined
      form.sort = 0
      form.remark = ""
      form.published = false
    }

    const openCreate = () => {
      editingId.value = ""
      resetForm()
      editVisible.value = true
    }

    const openEdit = (row: IAnnouncementItem) => {
      editingId.value = row.announcementId
      form.title = row.title
      form.content = row.content
      form.imageUrl = row.imageUrl
      form.iconUrl = row.iconUrl
      form.imageWidth = row.imageWidth
      form.imageHeight = row.imageHeight
      form.contentType = row.contentType
      form.type = row.type
      form.pages = row.pages ? row.pages.split(",").filter(Boolean) : ["launch"]
      form.trigger = row.trigger
      form.audience = row.audience ?? ANNOUNCEMENT_AUDIENCE.ALL
      form.buttonText = row.buttonText
      form.linkUrl = row.linkUrl
      form.range = row.startTime && row.endTime ? [row.startTime, row.endTime] : undefined
      form.sort = row.sort
      form.remark = row.remark
      form.published = row.status === 1
      editVisible.value = true
    }

    const pickImage = () => fileInput.value?.click()

    /** 读原图宽高。读不出来就回 0，客户端会回落到默认比例，不至于卡住上传 */
    const readImageSize = (file: File): Promise<{ width: number, height: number }> => {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(url)
          resolve({ width: img.naturalWidth, height: img.naturalHeight })
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          resolve({ width: 0, height: 0 })
        }
        img.src = url
      })
    }

    const removeImage = () => {
      form.imageUrl = ""
      form.imageWidth = 0
      form.imageHeight = 0
      if (fileInput.value)
        fileInput.value.value = ""
      formRef.value?.validateField("imageUrl")
    }

    const onFileChange = async (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file)
        return
      if (!file.type.startsWith("image/")) {
        ElMessage.error("只能上传图片文件")
        return
      }
      if (file.size / 1024 / 1024 >= 2) {
        ElMessage.error("图片大小不能超过 2MB")
        return
      }
      const size = await readImageSize(file)
      uploading.value = true
      try {
        const result = await uploadFile(file)
        form.imageUrl = result.fileUrl
        form.imageWidth = size.width
        form.imageHeight = size.height
        formRef.value?.validateField("imageUrl")
        ElMessage.success("图片上传成功")
      }
      catch {
        ElMessage.error("图片上传失败")
      }
      finally {
        uploading.value = false
        if (fileInput.value)
          fileInput.value.value = ""
      }
    }

    const pickIcon = () => iconInput.value?.click()

    const removeIcon = () => {
      form.iconUrl = ""
      if (iconInput.value)
        iconInput.value.value = ""
    }

    const onIconChange = async (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file)
        return
      if (!file.type.startsWith("image/")) {
        ElMessage.error("只能上传图片文件")
        return
      }
      if (file.size / 1024 / 1024 >= 1) {
        ElMessage.error("图标大小不能超过 1MB")
        return
      }
      uploadingIcon.value = true
      try {
        const result = await uploadFile(file)
        form.iconUrl = result.fileUrl
        ElMessage.success("图标上传成功")
      }
      catch {
        ElMessage.error("图标上传失败")
      }
      finally {
        uploadingIcon.value = false
        if (iconInput.value)
          iconInput.value.value = ""
      }
    }

    const submit = async () => {
      const valid = await formRef.value?.validate().catch(() => false)
      if (!valid)
        return

      // 纯文字/纯图片时把用不上的那半清空，免得切换形态后残留旧内容一起发出去。
      const payload = {
        title: form.title.trim(),
        content: needContent.value ? form.content : "",
        imageUrl: needImage.value ? form.imageUrl : "",
        iconUrl: isPoster.value ? "" : form.iconUrl,
        imageWidth: needImage.value ? form.imageWidth : 0,
        imageHeight: needImage.value ? form.imageHeight : 0,
        contentType: form.contentType,
        type: form.type,
        pages: form.pages.join(","),
        trigger: form.trigger,
        audience: form.audience,
        buttonText: form.buttonText.trim(),
        linkUrl: form.linkUrl.trim(),
        startTime: form.range?.[0] || "",
        endTime: form.range?.[1] || "",
        sort: form.sort,
        status: form.published ? 1 : 0,
        remark: form.remark
      }

      saving.value = true
      const res = editingId.value
        ? await updateAnnouncementApi({ announcementId: editingId.value, ...payload })
        : await createAnnouncementApi(payload)
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("保存成功")
      editVisible.value = false
      load()
    }

    const toggleStatus = async (row: IAnnouncementItem, status: number) => {
      togglingId.value = row.announcementId
      const res = await updateAnnouncementApi({ announcementId: row.announcementId, status })
      togglingId.value = ""
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      row.status = status
      ElMessage.success(status === 1 ? "已发布" : "已下架")
    }

    const handleDelete = async (row: IAnnouncementItem) => {
      try {
        await ElMessageBox.confirm(
          `删除「${row.title}」会连同用户的确认记录一起清掉，确定删除？`,
          "删除公告",
          { type: "warning" }
        )
      }
      catch {
        return
      }
      const res = await deleteAnnouncementApi(row.announcementId)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      load()
    }

    const describePages = (pages: string) => {
      const labels = (pages || "")
        .split(",")
        .filter(Boolean)
        .map(v => ANNOUNCEMENT_PAGES.find(item => item.value === v)?.label || v)
      return labels.length ? labels.join(" / ") : "—"
    }

    const describeRange = (start: string, end: string) => {
      if (!start && !end)
        return "长期有效"
      return `${start || "即刻"} ~ ${end || "不过期"}`
    }

    onMounted(load)

    return {
      loading,
      saving,
      uploading,
      uploadingIcon,
      togglingId,
      list,
      total,
      page,
      pageSize,
      filter,
      form,
      formRef,
      fileInput,
      iconInput,
      rules,
      needContent,
      needImage,
      isRich,
      isPoster,
      contentPreview,
      editVisible,
      editingId,
      TYPE_LABELS: ANNOUNCEMENT_TYPE_LABELS,
      CONTENT_LABELS: ANNOUNCEMENT_CONTENT_LABELS,
      TRIGGER_LABELS: ANNOUNCEMENT_TRIGGER_LABELS,
      AUDIENCE_LABELS: ANNOUNCEMENT_AUDIENCE_LABELS,
      AUDIENCE_HINTS,
      PAGE_OPTIONS: ANNOUNCEMENT_PAGES,
      STATUS_FILTER_DRAFT: ANNOUNCEMENT_STATUS_FILTER_DRAFT,
      TRIGGER_HINTS,
      TYPE_TAGS,
      search,
      onPageChange,
      openCreate,
      openEdit,
      pickImage,
      removeImage,
      onFileChange,
      pickIcon,
      removeIcon,
      onIconChange,
      submit,
      toggleStatus,
      handleDelete,
      describePages,
      describeRange
    }
  }
})
</script>

<style scoped>
.announcement-page {
  padding: 20px;
}

.announcement-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.announcement-page__title {
  margin: 0 0 4px;
  font-size: 18px;
}

.announcement-page__subtitle {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.announcement-page__filter {
  margin-bottom: 8px;
}

.announcement-page__title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.announcement-page__thumb {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  flex-shrink: 0;
}

.announcement-page__pager {
  margin-top: 16px;
  justify-content: flex-end;
}

.announcement-page__upload {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.announcement-page__preview {
  width: 96px;
  height: 96px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.announcement-page__icon {
  width: 64px;
  height: 64px;
  border: 1px solid var(--el-border-color);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(7, 193, 96, 0.18) 0%, rgba(7, 193, 96, 0.02) 70%);
}

.announcement-page__hint--notice {
  width: 100%;
  margin: 0 0 8px;
  padding: 6px 10px;
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border-radius: 4px;
}

.announcement-page__hint {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.announcement-page__hint--inline {
  margin-left: 12px;
}

.announcement-page__preview-box {
  width: 100%;
  max-height: 320px;
  padding: 12px 14px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  box-sizing: border-box;
}

.announcement-page__preview-box :deep(h1),
.announcement-page__preview-box :deep(h2),
.announcement-page__preview-box :deep(h3) {
  margin: 10px 0 6px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.announcement-page__preview-box :deep(h1) { font-size: 18px; }
.announcement-page__preview-box :deep(h2) { font-size: 16px; }
.announcement-page__preview-box :deep(h3) { font-size: 15px; }

.announcement-page__preview-box :deep(p) {
  margin: 0 0 8px;
}

.announcement-page__preview-box :deep(ul),
.announcement-page__preview-box :deep(ol) {
  margin: 0 0 8px;
  padding-left: 20px;
}

.announcement-page__preview-box :deep(a) {
  color: var(--el-color-primary);
}

.announcement-page__preview-box :deep(img) {
  max-width: 100%;
}

.announcement-page__preview-box :deep(blockquote) {
  margin: 0 0 8px;
  padding-left: 10px;
  color: var(--el-text-color-secondary);
  border-left: 3px solid var(--el-border-color);
}

.announcement-page__preview-box :deep(code) {
  padding: 1px 4px;
  font-size: 13px;
  background: var(--el-fill-color-dark);
  border-radius: 3px;
}
</style>
