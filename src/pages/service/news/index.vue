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
  <div class="news-page">
    <div class="news-page__header">
      <div>
        <h2 class="news-page__title">微聊新闻</h2>
        <p class="news-page__subtitle">
          发布后出现在客户端会话列表里的「微聊新闻」入口，点进去是信息流。正文支持 Markdown，也可以只配一个外链。
        </p>
      </div>
      <el-button v-if="tab === 'article'" type="primary" @click="openArticleCreate">新建文章</el-button>
      <el-button v-else type="primary" @click="openChannelCreate">新建频道</el-button>
    </div>

    <el-tabs v-model="tab">
      <el-tab-pane label="文章" name="article">
        <el-form :inline="true" class="news-page__filter" @submit.prevent="searchArticles">
          <el-form-item>
            <el-input
              v-model="filter.keywords"
              placeholder="标题关键词"
              clearable
              style="width: 220px"
              @keyup.enter="searchArticles"
              @clear="searchArticles"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="filter.channelId" placeholder="全部频道" clearable style="width: 150px" @change="searchArticles">
              <el-option v-for="item in channels" :key="item.channelId" :label="item.name" :value="item.channelId" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filter.status" placeholder="全部状态" clearable style="width: 130px" @change="searchArticles">
              <el-option label="已发布" :value="1" />
              <el-option label="草稿" :value="STATUS_FILTER_DRAFT" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="searchArticles">查询</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="list" border stripe>
          <el-table-column label="标题" min-width="260" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="news-page__title-cell">
                <el-image
                  v-if="row.coverUrl"
                  :src="row.coverUrl"
                  fit="cover"
                  class="news-page__thumb"
                  :preview-src-list="[row.coverUrl]"
                  preview-teleported
                />
                <div class="news-page__title-text">
                  <span>
                    <el-tag v-if="row.isTop" size="small" type="danger" effect="plain">置顶</el-tag>
                    {{ row.title }}
                  </span>
                  <span v-if="row.summary" class="news-page__summary">{{ row.summary }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="频道" width="110" align="center">
            <template #default="{ row }">{{ row.channelName || "—" }}</template>
          </el-table-column>
          <el-table-column label="形态" width="90" align="center">
            <template #default="{ row }">{{ CONTENT_LABELS[row.contentType] || "—" }}</template>
          </el-table-column>
          <el-table-column label="封面" width="100" align="center">
            <template #default="{ row }">{{ COVER_LABELS[row.coverLayout] || "—" }}</template>
          </el-table-column>
          <el-table-column label="来源" width="110" show-overflow-tooltip>
            <template #default="{ row }">{{ row.source || "—" }}</template>
          </el-table-column>
          <el-table-column label="发布时间" min-width="170">
            <template #default="{ row }">{{ formatDateTime(row.publishedAt) }}</template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status"
                :active-value="1"
                :inactive-value="0"
                :loading="togglingId === row.articleId"
                @change="(v: string | number | boolean) => toggleArticleStatus(row, Number(v))"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openArticleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleArticleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有新闻" />
          </template>
        </el-table>

        <el-pagination
          class="news-page__pager"
          background
          layout="total, prev, pager, next"
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          @current-change="onPageChange"
        />
      </el-tab-pane>

      <el-tab-pane label="频道" name="channel">
        <p class="news-page__hint news-page__hint--notice">
          客户端列表页顶部那排 tab。第一个「全部」是客户端自己加的，不在这里配、也删不掉。
          频道下还有文章时不能删除，只想让它对用户隐藏就改成下架。
        </p>
        <el-table v-loading="channelLoading" :data="channels" border stripe>
          <el-table-column prop="name" label="频道名" min-width="160" />
          <el-table-column prop="articleCount" label="文章数" width="100" align="center" />
          <el-table-column prop="sort" label="排序" width="90" align="center" />
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status"
                :active-value="1"
                :inactive-value="0"
                :loading="togglingChannelId === row.channelId"
                @change="(v: string | number | boolean) => toggleChannelStatus(row, Number(v))"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="180">
            <template #default="{ row }">{{ row.createdAt || "—" }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openChannelEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleChannelDelete(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有频道" />
          </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 文章编辑 -->
    <el-dialog v-model="articleVisible" :title="editingId ? '编辑文章' : '新建文章'" width="720px" destroy-on-close>
      <el-form ref="formRef" v-loading="detailLoading" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="频道" prop="channelId">
          <el-select v-model="form.channelId" placeholder="选择频道" style="width: 100%">
            <el-option
              v-for="item in channels"
              :key="item.channelId"
              :label="item.status === 1 ? item.name : `${item.name}（已下架）`"
              :value="item.channelId"
            />
          </el-select>
          <p v-if="!channels.length" class="news-page__hint">
            还没有频道，先去「频道」页签建一个。
          </p>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="100" show-word-limit placeholder="列表和正文页的大标题" />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            placeholder="列表里标题下面那一行，留空则不显示"
          />
          <p class="news-page__hint">留空客户端就不显示这一行，不会去正文里截——Markdown 正文开头经常是标题或图片语法。</p>
        </el-form-item>

        <el-form-item label="来源">
          <el-input v-model="form.source" maxlength="32" placeholder="如「微聊新闻」，留空不显示" />
        </el-form-item>

        <el-form-item label="封面版式" prop="coverLayout">
          <el-radio-group v-model="form.coverLayout">
            <el-radio v-for="(label, value) in COVER_LABELS" :key="value" :value="Number(value)">{{ label }}</el-radio>
          </el-radio-group>
          <p class="news-page__hint">{{ COVER_HINTS[form.coverLayout] }}</p>
        </el-form-item>

        <el-form-item v-if="needCover" label="封面图" prop="coverUrl">
          <div class="news-page__upload">
            <el-image v-if="form.coverUrl" :src="form.coverUrl" fit="cover" class="news-page__preview" />
            <div>
              <el-button :loading="uploading" @click="pickCover">{{ form.coverUrl ? "更换封面" : "上传封面" }}</el-button>
              <el-button v-if="form.coverUrl" link type="danger" @click="removeCover">移除</el-button>
              <p class="news-page__hint">建议 16:9，宽度 750px 以内，2MB 以下</p>
            </div>
          </div>
          <input ref="coverInput" type="file" accept="image/*" hidden @change="onCoverChange">
        </el-form-item>

        <el-form-item label="内容形态" prop="contentType">
          <el-radio-group v-model="form.contentType">
            <el-radio v-for="(label, value) in CONTENT_LABELS" :key="value" :value="Number(value)">{{ label }}</el-radio>
          </el-radio-group>
          <p class="news-page__hint">{{ CONTENT_HINTS[form.contentType] }}</p>
        </el-form-item>

        <el-form-item v-if="isRich" label="正文" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="12"
            maxlength="20000"
            show-word-limit
            placeholder="支持 Markdown：**加粗**、# 标题、- 列表、[文字](链接)、![图](图片地址)"
          />
          <p class="news-page__hint">
            支持 Markdown。下面是客户端实际渲染的效果，两端用的是同一套净化规则。
          </p>
          <div class="news-page__preview-box" v-html="contentPreview" />
        </el-form-item>

        <el-form-item :label="isRich ? '阅读原文' : '跳转地址'" prop="linkUrl">
          <el-input v-model="form.linkUrl" :placeholder="isRich ? '可选，正文末尾会多一个「阅读原文」' : '必填，点开直接打开这个地址'" />
        </el-form-item>

        <el-form-item label="置顶">
          <el-switch v-model="form.isTop" active-text="排在列表最前面" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
          <span class="news-page__hint news-page__hint--inline">同置顶档内数字小的靠前；再往后按发布时间倒序</span>
        </el-form-item>

        <el-form-item label="发布时间">
          <el-date-picker
            v-model="form.publishedAt"
            type="datetime"
            placeholder="留空则保存时取当前时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
          <p class="news-page__hint">
            对用户显示的时间，也是未读红点的判定依据。填将来的时间就是定时发布：状态已是「已发布」但时间没到，客户端看不到。
          </p>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="运营自己看的，不下发给客户端" />
        </el-form-item>

        <el-form-item label="发布">
          <el-switch v-model="form.published" active-text="发布后立即对用户可见" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="articleVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitArticle">保存</el-button>
      </template>
    </el-dialog>

    <!-- 频道编辑 -->
    <el-dialog v-model="channelVisible" :title="editingChannelId ? '编辑频道' : '新建频道'" width="440px" destroy-on-close>
      <el-form ref="channelFormRef" :model="channelForm" :rules="channelRules" label-width="80px">
        <el-form-item label="频道名" prop="name">
          <el-input v-model="channelForm.name" maxlength="12" show-word-limit placeholder="如「热点」「科技」" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="channelForm.sort" :min="0" :max="9999" />
          <span class="news-page__hint news-page__hint--inline">数字小的靠前</span>
        </el-form-item>
        <el-form-item label="上架">
          <el-switch v-model="channelForm.published" active-text="上架后出现在客户端 tab 里" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="channelVisible = false">取消</el-button>
        <el-button type="primary" :loading="channelSaving" @click="submitChannel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { INewsArticleItem, INewsChannelItem } from "@/types/api/news"
import { ElMessage, ElMessageBox } from "element-plus"
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue"
import {
  createNewsApi,
  createNewsChannelApi,
  deleteNewsApi,
  deleteNewsChannelApi,
  getNewsApi,
  getNewsChannelListApi,
  getNewsListApi,
  updateNewsApi,
  updateNewsChannelApi
} from "@/api/news"
import { uploadFile } from "@/api/upload"
import { renderMarkdown } from "@/utils/markdown"
import {
  NEWS_CONTENT,
  NEWS_CONTENT_LABELS,
  NEWS_COVER,
  NEWS_COVER_LABELS,
  NEWS_STATUS_FILTER_DRAFT
} from "@/types/api/news"

const CONTENT_HINTS: Record<number, string> = {
  [NEWS_CONTENT.RICH]: "正文写在下面，用户点开进站内正文页。跳转地址此时是可选的「阅读原文」。",
  [NEWS_CONTENT.LINK]: "没有站内正文，用户点开直接打开跳转地址（手机上是内嵌浏览器，电脑上交给系统浏览器）。"
}

const COVER_HINTS: Record<number, string> = {
  [NEWS_COVER.SMALL]: "标题在左、缩略图在右，列表里最省地方，适合大多数文章。",
  [NEWS_COVER.LARGE]: "整条宽度的大图，图片压在标题上方，适合重点稿。",
  [NEWS_COVER.NONE]: "只有标题和摘要，不用传图。"
}

export default defineComponent({
  name: "ServiceNews",
  setup() {
    const tab = ref<"article" | "channel">("article")

    // -------------------- 文章 --------------------
    const loading = ref(false)
    const saving = ref(false)
    const detailLoading = ref(false)
    const uploading = ref(false)
    const togglingId = ref("")
    const list = ref<INewsArticleItem[]>([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = 20
    const articleVisible = ref(false)
    const editingId = ref("")
    const formRef = ref<FormInstance>()
    const coverInput = ref<HTMLInputElement>()

    const filter = reactive<{ keywords: string, channelId?: string, status?: number }>({
      keywords: "",
      channelId: undefined,
      status: undefined
    })

    const form = reactive({
      channelId: "",
      title: "",
      summary: "",
      source: "",
      coverUrl: "",
      // 上传时顺手记下原图宽高，客户端拿它撑骨架位，免得图没下完时列表抖一下
      coverWidth: 0,
      coverHeight: 0,
      coverLayout: NEWS_COVER.SMALL as number,
      contentType: NEWS_CONTENT.RICH as number,
      content: "",
      linkUrl: "",
      isTop: false,
      sort: 0,
      publishedAt: "",
      remark: "",
      published: false
    })

    const isRich = computed(() => form.contentType === NEWS_CONTENT.RICH)
    const needCover = computed(() => form.coverLayout !== NEWS_COVER.NONE)
    const contentPreview = computed(() => (isRich.value ? renderMarkdown(form.content) : ""))

    const rules = computed<FormRules>(() => ({
      channelId: [{ required: true, message: "请选择频道", trigger: "change" }],
      title: [{ required: true, message: "请填写标题", trigger: "blur" }],
      content: isRich.value ? [{ required: true, message: "请填写正文", trigger: "blur" }] : [],
      coverUrl: needCover.value ? [{ required: true, message: "请上传封面", trigger: "change" }] : [],
      // 纯外链没有站内正文，链接就是全部内容，空了点进去是白屏
      linkUrl: isRich.value ? [] : [{ required: true, message: "纯外链必须填跳转地址", trigger: "blur" }]
    }))

    const loadArticles = async () => {
      loading.value = true
      const res = await getNewsListApi({
        page: page.value,
        pageSize,
        keywords: filter.keywords.trim() || undefined,
        channelId: filter.channelId,
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

    const searchArticles = () => {
      page.value = 1
      loadArticles()
    }

    const onPageChange = (next: number) => {
      page.value = next
      loadArticles()
    }

    const resetForm = () => {
      form.channelId = channels.value[0]?.channelId || ""
      form.title = ""
      form.summary = ""
      form.source = ""
      form.coverUrl = ""
      form.coverWidth = 0
      form.coverHeight = 0
      form.coverLayout = NEWS_COVER.SMALL
      form.contentType = NEWS_CONTENT.RICH
      form.content = ""
      form.linkUrl = ""
      form.isTop = false
      form.sort = 0
      form.publishedAt = ""
      form.remark = ""
      form.published = false
    }

    const openArticleCreate = () => {
      editingId.value = ""
      resetForm()
      articleVisible.value = true
    }

    /** 列表接口不回正文，编辑时单独拉一次 detail */
    const openArticleEdit = async (row: INewsArticleItem) => {
      editingId.value = row.articleId
      resetForm()
      articleVisible.value = true
      detailLoading.value = true
      const res = await getNewsApi(row.articleId)
      detailLoading.value = false
      if (res.code !== 0 || !res.result) {
        ElMessage.error(res.msg || "加载详情失败")
        articleVisible.value = false
        return
      }
      const d = res.result.detail
      form.channelId = d.channelId
      form.title = d.title
      form.summary = d.summary
      form.source = d.source
      form.coverUrl = d.coverUrl
      form.coverWidth = d.coverWidth
      form.coverHeight = d.coverHeight
      form.coverLayout = d.coverLayout
      form.contentType = d.contentType
      form.content = d.content
      form.linkUrl = d.linkUrl
      form.isTop = d.isTop
      form.sort = d.sort
      form.publishedAt = toPickerValue(d.publishedAt)
      form.remark = d.remark
      form.published = d.status === 1
    }

    const pickCover = () => coverInput.value?.click()

    /** 读原图宽高。读不出来就回 0，客户端会回落到 16:9，不至于卡住上传 */
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

    const removeCover = () => {
      form.coverUrl = ""
      form.coverWidth = 0
      form.coverHeight = 0
      if (coverInput.value)
        coverInput.value.value = ""
      formRef.value?.validateField("coverUrl")
    }

    const onCoverChange = async (e: Event) => {
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
        form.coverUrl = result.fileUrl
        form.coverWidth = size.width
        form.coverHeight = size.height
        formRef.value?.validateField("coverUrl")
        ElMessage.success("封面上传成功")
      }
      catch {
        ElMessage.error("封面上传失败")
      }
      finally {
        uploading.value = false
        if (coverInput.value)
          coverInput.value.value = ""
      }
    }

    const submitArticle = async () => {
      const valid = await formRef.value?.validate().catch(() => false)
      if (!valid)
        return

      // 切换过形态/版式的话把用不上的那半清空，免得残留旧内容一起发出去
      const payload = {
        channelId: form.channelId,
        title: form.title.trim(),
        summary: form.summary.trim(),
        source: form.source.trim(),
        coverUrl: needCover.value ? form.coverUrl : "",
        coverWidth: needCover.value ? form.coverWidth : 0,
        coverHeight: needCover.value ? form.coverHeight : 0,
        coverLayout: form.coverLayout,
        contentType: form.contentType,
        content: isRich.value ? form.content : "",
        linkUrl: form.linkUrl.trim(),
        isTop: form.isTop,
        sort: form.sort,
        status: form.published ? 1 : 0,
        publishedAt: form.publishedAt || "",
        remark: form.remark
      }

      saving.value = true
      const res = editingId.value
        ? await updateNewsApi({ articleId: editingId.value, ...payload })
        : await createNewsApi(payload)
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("保存成功")
      articleVisible.value = false
      loadArticles()
      // 文章数变了，频道那页的计数跟着刷
      loadChannels()
    }

    const toggleArticleStatus = async (row: INewsArticleItem, status: number) => {
      togglingId.value = row.articleId
      const res = await updateNewsApi({ articleId: row.articleId, status })
      togglingId.value = ""
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      row.status = status
      // 草稿第一次上架时服务端会补发布时间，本地行上还是空的，拉一次看到真实值
      if (status === 1 && !row.publishedAt)
        loadArticles()
      ElMessage.success(status === 1 ? "已发布" : "已下架")
    }

    const handleArticleDelete = async (row: INewsArticleItem) => {
      try {
        await ElMessageBox.confirm(
          `删除「${row.title}」后已经分享出去的链接也会打不开，确定删除？`,
          "删除文章",
          { type: "warning" }
        )
      }
      catch {
        return
      }
      const res = await deleteNewsApi(row.articleId)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      loadArticles()
      loadChannels()
    }

    // -------------------- 频道 --------------------
    const channelLoading = ref(false)
    const channelSaving = ref(false)
    const togglingChannelId = ref("")
    const channels = ref<INewsChannelItem[]>([])
    const channelVisible = ref(false)
    const editingChannelId = ref("")
    const channelFormRef = ref<FormInstance>()

    const channelForm = reactive({
      name: "",
      sort: 0,
      published: true
    })

    const channelRules: FormRules = {
      name: [{ required: true, message: "请填写频道名", trigger: "blur" }]
    }

    const loadChannels = async () => {
      channelLoading.value = true
      const res = await getNewsChannelListApi()
      channelLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载频道失败")
        return
      }
      channels.value = res.result?.list || []
    }

    const openChannelCreate = () => {
      editingChannelId.value = ""
      channelForm.name = ""
      channelForm.sort = 0
      channelForm.published = true
      channelVisible.value = true
    }

    const openChannelEdit = (row: INewsChannelItem) => {
      editingChannelId.value = row.channelId
      channelForm.name = row.name
      channelForm.sort = row.sort
      channelForm.published = row.status === 1
      channelVisible.value = true
    }

    const submitChannel = async () => {
      const valid = await channelFormRef.value?.validate().catch(() => false)
      if (!valid)
        return

      const payload = {
        name: channelForm.name.trim(),
        sort: channelForm.sort,
        status: channelForm.published ? 1 : 0
      }

      channelSaving.value = true
      const res = editingChannelId.value
        ? await updateNewsChannelApi({ channelId: editingChannelId.value, ...payload })
        : await createNewsChannelApi(payload)
      channelSaving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("保存成功")
      channelVisible.value = false
      loadChannels()
      // 频道名变了，文章列表那一列跟着刷
      loadArticles()
    }

    const toggleChannelStatus = async (row: INewsChannelItem, status: number) => {
      togglingChannelId.value = row.channelId
      const res = await updateNewsChannelApi({ channelId: row.channelId, status })
      togglingChannelId.value = ""
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      row.status = status
      ElMessage.success(status === 1 ? "已上架" : "已下架")
    }

    const handleChannelDelete = async (row: INewsChannelItem) => {
      if (row.articleCount > 0) {
        ElMessage.warning(`「${row.name}」下还有 ${row.articleCount} 篇文章，请先移走或删除；只想对用户隐藏就改成下架`)
        return
      }
      try {
        await ElMessageBox.confirm(`确定删除频道「${row.name}」？`, "删除频道", { type: "warning" })
      }
      catch {
        return
      }
      const res = await deleteNewsChannelApi(row.channelId)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      loadChannels()
    }

    // -------------------- 公用 --------------------

    /**
     * 服务端回的是 RFC3339，el-date-picker 配的 value-format 是
     * "YYYY-MM-DD HH:mm:ss"，直接塞进去它认不出来、会显示空。
     */
    const toPickerValue = (raw: string) => {
      if (!raw)
        return ""
      const d = new Date(raw)
      if (Number.isNaN(d.getTime()))
        return ""
      const pad = (n: number) => String(n).padStart(2, "0")
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
        + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }

    const formatDateTime = (raw: string) => toPickerValue(raw) || "—"

    // 切到「无图」时把图一起清掉：留着它保存时也会被清成空串，界面上却还显示着
    watch(() => form.coverLayout, (next) => {
      if (next === NEWS_COVER.NONE && form.coverUrl)
        removeCover()
    })

    onMounted(async () => {
      await loadChannels()
      loadArticles()
    })

    return {
      tab,
      loading,
      saving,
      detailLoading,
      uploading,
      togglingId,
      list,
      total,
      page,
      pageSize,
      filter,
      form,
      formRef,
      coverInput,
      rules,
      isRich,
      needCover,
      contentPreview,
      articleVisible,
      editingId,
      channelLoading,
      channelSaving,
      togglingChannelId,
      channels,
      channelVisible,
      editingChannelId,
      channelForm,
      channelFormRef,
      channelRules,
      CONTENT_LABELS: NEWS_CONTENT_LABELS,
      CONTENT_HINTS,
      COVER_LABELS: NEWS_COVER_LABELS,
      COVER_HINTS,
      STATUS_FILTER_DRAFT: NEWS_STATUS_FILTER_DRAFT,
      searchArticles,
      onPageChange,
      openArticleCreate,
      openArticleEdit,
      pickCover,
      removeCover,
      onCoverChange,
      submitArticle,
      toggleArticleStatus,
      handleArticleDelete,
      openChannelCreate,
      openChannelEdit,
      submitChannel,
      toggleChannelStatus,
      handleChannelDelete,
      formatDateTime
    }
  }
})
</script>

<style scoped>
.news-page {
  padding: 20px;
}

.news-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.news-page__title {
  margin: 0 0 4px;
  font-size: 18px;
}

.news-page__subtitle {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.news-page__filter {
  margin-bottom: 8px;
}

.news-page__title-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.news-page__title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.news-page__summary {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-page__thumb {
  width: 56px;
  height: 40px;
  border-radius: 4px;
  flex-shrink: 0;
}

.news-page__pager {
  margin-top: 16px;
  justify-content: flex-end;
}

.news-page__upload {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.news-page__preview {
  width: 160px;
  height: 90px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.news-page__hint {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.news-page__hint--inline {
  margin-left: 12px;
}

.news-page__hint--notice {
  width: 100%;
  margin: 0 0 12px;
  padding: 6px 10px;
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border-radius: 4px;
  box-sizing: border-box;
}

.news-page__preview-box {
  width: 100%;
  max-height: 360px;
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

.news-page__preview-box :deep(h1),
.news-page__preview-box :deep(h2),
.news-page__preview-box :deep(h3) {
  margin: 10px 0 6px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.news-page__preview-box :deep(h1) { font-size: 18px; }
.news-page__preview-box :deep(h2) { font-size: 16px; }
.news-page__preview-box :deep(h3) { font-size: 15px; }

.news-page__preview-box :deep(p) {
  margin: 0 0 8px;
}

.news-page__preview-box :deep(ul),
.news-page__preview-box :deep(ol) {
  margin: 0 0 8px;
  padding-left: 20px;
}

.news-page__preview-box :deep(a) {
  color: var(--el-color-primary);
}

.news-page__preview-box :deep(img) {
  max-width: 100%;
}

.news-page__preview-box :deep(blockquote) {
  margin: 0 0 8px;
  padding-left: 10px;
  color: var(--el-text-color-secondary);
  border-left: 3px solid var(--el-border-color);
}

.news-page__preview-box :deep(code) {
  padding: 1px 4px;
  font-size: 13px;
  background: var(--el-fill-color-dark);
  border-radius: 3px;
}
</style>
