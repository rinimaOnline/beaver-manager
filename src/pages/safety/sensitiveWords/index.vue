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
  <div class="safety-words">
    <div class="safety-words__header">
      <div>
        <h2 class="safety-words__title">敏感词库</h2>
        <p class="safety-words__subtitle">维护命中词条与等级，停用后不再参与拦截</p>
      </div>
      <el-button type="primary" @click="openCreate">新增敏感词</el-button>
    </div>

    <el-form :inline="true">
      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="词条或分类"
          clearable
          style="width: 200px"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item label="状态">
        <!-- 服务端 isActive 是非指针 bool，传 false 等于不筛选，所以没有「仅停用」选项 -->
        <el-select v-model="searchForm.onlyActive" style="width: 140px">
          <el-option label="全部" :value="false" />
          <el-option label="仅启用中" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="word" label="词条" min-width="160" show-overflow-tooltip />
      <el-table-column label="分类" width="140">
        <template #default="{ row }">{{ row.category || "—" }}</template>
      </el-table-column>
      <el-table-column label="等级" width="100">
        <template #default="{ row }">
          <el-tag :type="levelTagType(row.level)" size="small">{{ levelLabel(row.level) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
            {{ row.isActive ? "启用" : "停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.remark || "—" }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="toggleActive(row)">
            {{ row.isActive ? "停用" : "启用" }}
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      background
      class="safety-words__pager"
      layout="total, sizes, prev, pager, next"
      :current-page="searchForm.page"
      :page-size="searchForm.pageSize"
      :total="total"
      :page-sizes="[20, 50, 100]"
      @size-change="(v: number) => { searchForm.pageSize = v; searchForm.page = 1; load() }"
      @current-change="(v: number) => { searchForm.page = v; load() }"
    />

    <el-dialog v-model="formVisible" :title="isEdit ? '编辑敏感词' : '新增敏感词'" width="480px">
      <el-form label-width="80px">
        <el-form-item label="词条">
          <el-input v-model="form.word" placeholder="必填" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" placeholder="如 涉政 / 广告" />
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="form.level" style="width: 100%">
            <el-option label="低" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态">
          <el-switch v-model="form.isActive" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <!-- 更新接口只覆盖非空字段：分类/备注清空后仍是旧值，提前说明免得以为没保存成功 -->
      <el-alert
        v-if="isEdit"
        type="info"
        :closable="false"
        show-icon
        title="分类与备注留空不会清除原有内容，只有填写新值才会覆盖。"
      />
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { ISensitiveWordInfo } from "@/types/api/moderation"
import type { TagType } from "@/types/common"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createSensitiveWordApi,
  deleteSensitiveWordApi,
  getSensitiveWordListApi,
  updateSensitiveWordApi
} from "@/api/moderation"
import { defineComponent, onMounted, reactive, ref } from "vue"

export default defineComponent({
  name: "SafetySensitiveWords",
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const list = ref<ISensitiveWordInfo[]>([])
    const total = ref(0)
    const formVisible = ref(false)
    const isEdit = ref(false)

    const searchForm = reactive({
      page: 1,
      pageSize: 20,
      keyword: "",
      onlyActive: false
    })

    const form = reactive({
      id: 0,
      word: "",
      category: "",
      level: 1,
      isActive: true,
      remark: ""
    })

    const levelLabel = (level: number) => ({ 1: "低", 2: "中", 3: "高" }[level] || "未知")
    const levelTagType = (level: number): TagType =>
      ({ 1: "info", 2: "warning", 3: "danger" }[level] as TagType) || "info"

    const load = async () => {
      loading.value = true
      const res = await getSensitiveWordListApi({
        page: searchForm.page,
        pageSize: searchForm.pageSize,
        keyword: searchForm.keyword || undefined,
        isActive: searchForm.onlyActive ? true : undefined
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
      searchForm.page = 1
      load()
    }

    const openCreate = () => {
      isEdit.value = false
      form.id = 0
      form.word = ""
      form.category = ""
      form.level = 1
      form.isActive = true
      form.remark = ""
      formVisible.value = true
    }

    const openEdit = (row: ISensitiveWordInfo) => {
      isEdit.value = true
      form.id = row.id
      form.word = row.word
      form.category = row.category
      form.level = row.level || 1
      form.isActive = row.isActive
      form.remark = row.remark
      formVisible.value = true
    }

    const submitForm = async () => {
      if (!form.word.trim()) {
        ElMessage.warning("请填写词条")
        return
      }
      saving.value = true
      const res = isEdit.value
        ? await updateSensitiveWordApi({
            id: form.id,
            word: form.word.trim(),
            category: form.category,
            level: form.level,
            isActive: form.isActive,
            remark: form.remark
          })
        : await createSensitiveWordApi({
            word: form.word.trim(),
            category: form.category,
            level: form.level,
            remark: form.remark
          })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("保存成功")
      formVisible.value = false
      load()
    }

    // 更新接口的 isActive 每次都会被写入，所以停用/启用直接复用同一个接口，
    // 但其余字段必须原样回传，否则等级会被判定为「未填写」而保持旧值。
    const toggleActive = async (row: ISensitiveWordInfo) => {
      await ElMessageBox.confirm(
        `确认${row.isActive ? "停用" : "启用"}敏感词「${row.word}」？`,
        row.isActive ? "停用敏感词" : "启用敏感词"
      )
      const res = await updateSensitiveWordApi({
        id: row.id,
        word: row.word,
        category: row.category,
        level: row.level,
        isActive: !row.isActive,
        remark: row.remark
      })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      ElMessage.success(row.isActive ? "已停用" : "已启用")
      load()
    }

    const handleDelete = async (row: ISensitiveWordInfo) => {
      await ElMessageBox.confirm(`确认删除敏感词「${row.word}」？`, "删除敏感词", { type: "warning" })
      const res = await deleteSensitiveWordApi({ id: row.id })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("删除成功")
      load()
    }

    onMounted(load)

    return {
      loading,
      saving,
      list,
      total,
      searchForm,
      formVisible,
      isEdit,
      form,
      levelLabel,
      levelTagType,
      load,
      search,
      openCreate,
      openEdit,
      submitForm,
      toggleActive,
      handleDelete
    }
  }
})
</script>

<style lang="less" scoped>
.safety-words {
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

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
