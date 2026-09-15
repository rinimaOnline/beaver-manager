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
  <div class="user-identity">
    <div class="user-identity__header">
      <h2 class="user-identity__title">实名审核</h2>
      <p class="user-identity__hint">没有接三方核验，每一条实名都要人工审核：核对姓名、证件号、证件影像与活体采集帧一致后再通过</p>
    </div>

    <el-form :inline="true" class="user-identity__form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="微聊号/用户ID/姓名/证件号" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" style="width: 130px">
          <el-option label="全部" :value="-1" />
          <el-option label="待审核" :value="1" />
          <el-option label="已通过" :value="2" />
          <el-option label="已驳回" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="identityList" border stripe>
      <el-table-column label="用户" min-width="180">
        <template #default="{ row }">
          <div class="user-identity__user">
            <el-avatar :src="row.avatar || ''" :size="28">{{ (row.nickName || row.userId).charAt(0) }}</el-avatar>
            <div class="user-identity__user-text">
              <el-link type="primary" @click="goUser(row.userId)">{{ row.nickName || row.userId }}</el-link>
              <span class="user-identity__user-id">微聊号 {{ row.weliaoId || "—" }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="realName" label="姓名" width="110" />
      <el-table-column prop="idNumber" label="证件号" min-width="180" />
      <el-table-column label="影像" width="200">
        <template #default="{ row }">
          <div class="user-identity__thumbs">
            <el-image
              v-for="(url, index) in thumbsOf(row)"
              :key="index"
              class="user-identity__thumb"
              :src="url"
              :preview-src-list="thumbsOf(row)"
              :initial-index="index"
              fit="cover"
              preview-teleported
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openReview(row)">审核</el-button>
          <el-button link @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="user-identity__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />

    <el-dialog v-model="detailVisible" title="实名资料" width="720px">
      <template v-if="current">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="微聊号">{{ current.weliaoId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ current.userId }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ current.nickName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ current.realName }}</el-descriptions-item>
          <el-descriptions-item label="证件号">{{ current.idNumber }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusLabel(current.status) }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ current.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{ current.reviewerId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ current.reviewedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="current.rejectReason" label="驳回原因" :span="2">{{ current.rejectReason }}</el-descriptions-item>
        </el-descriptions>
        <div class="user-identity__gallery">
          <div v-for="item in galleryOf(current)" :key="item.url" class="user-identity__gallery-item">
            <el-image :src="item.url" :preview-src-list="thumbsOf(current)" fit="contain" preview-teleported />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="reviewVisible" title="审核实名认证" width="480px">
      <el-form ref="reviewFormRef" :model="reviewForm" :rules="reviewRules" label-width="90px">
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="reviewForm.status">
            <el-radio :value="2">通过</el-radio>
            <el-radio :value="3">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="reviewForm.status === 3" label="驳回原因" prop="rejectReason">
          <el-input v-model="reviewForm.rejectReason" type="textarea" :rows="3" placeholder="会展示给用户，请写清楚哪里不符合" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { TagType } from "@/types/common"
import type { IIdentityInfo } from "@/types/api/user"
import { ElMessage } from "element-plus"
import { getIdentityListApi, reviewIdentityApi } from "@/api/user"
import { IdentityStatus } from "@/types/api/user"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const submitting = ref(false)
    const identityList = ref<IIdentityInfo[]>([])
    const current = ref<IIdentityInfo | null>(null)
    const detailVisible = ref(false)
    const reviewVisible = ref(false)
    const reviewFormRef = ref<FormInstance>()
    const searchForm = reactive({ keyword: "", status: IdentityStatus.PENDING as number })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const reviewForm = reactive({ status: IdentityStatus.APPROVED as number, rejectReason: "" })
    const reviewRules: FormRules = {
      status: [{ required: true, message: "请选择审核结果", trigger: "change" }]
    }

    const statusLabel = (status: number) => {
      const map: Record<number, string> = {
        [IdentityStatus.NONE]: "未提交",
        [IdentityStatus.PENDING]: "待审核",
        [IdentityStatus.APPROVED]: "已通过",
        [IdentityStatus.REJECTED]: "已驳回"
      }
      return map[status] || "未知"
    }
    const statusTag = (status: number): TagType => {
      const map: Record<number, TagType> = { 1: "warning", 2: "success", 3: "danger" }
      return map[status] || "info"
    }

    // 证件正反面 + 活体帧，审核人要按同一组预览来回比对
    const galleryOf = (row: IIdentityInfo) => {
      const items: { url: string, label: string }[] = []
      if (row.portraitUrl) items.push({ url: row.portraitUrl, label: "身份证人像面" })
      if (row.emblemUrl) items.push({ url: row.emblemUrl, label: "身份证国徽面" })
      const frames = row.faceFrames?.length ? row.faceFrames : (row.faceUrl ? [row.faceUrl] : [])
      frames.forEach((url, index) => items.push({ url, label: `活体帧 ${index + 1}` }))
      return items
    }
    const thumbsOf = (row: IIdentityInfo) => galleryOf(row).map(item => item.url)

    const fetchList = async () => {
      loading.value = true
      const res = await getIdentityListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: searchForm.status,
        keyword: searchForm.keyword || undefined
      })
      loading.value = false
      if (res.code === 0) {
        identityList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const handleSearch = () => { pagination.page = 1; fetchList() }
    const handleReset = () => {
      searchForm.keyword = ""
      searchForm.status = IdentityStatus.PENDING
      handleSearch()
    }
    const onPageChange = (page: number) => { pagination.page = page; fetchList() }

    const openDetail = (row: IIdentityInfo) => {
      current.value = row
      detailVisible.value = true
    }

    const openReview = (row: IIdentityInfo) => {
      if (row.status !== IdentityStatus.PENDING) {
        ElMessage.warning("该记录不是待审核状态")
        return
      }
      current.value = row
      reviewForm.status = IdentityStatus.APPROVED
      reviewForm.rejectReason = ""
      reviewVisible.value = true
    }

    const submitReview = async () => {
      if (!current.value) return
      if (reviewForm.status === IdentityStatus.REJECTED && !reviewForm.rejectReason.trim()) {
        ElMessage.warning("驳回时请填写原因")
        return
      }
      submitting.value = true
      const res = await reviewIdentityApi({
        userId: current.value.userId,
        status: reviewForm.status,
        rejectReason: reviewForm.rejectReason.trim()
      })
      submitting.value = false
      if (res.code === 0) {
        ElMessage.success(reviewForm.status === IdentityStatus.APPROVED ? "已通过" : "已驳回")
        reviewVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "审核失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(fetchList)

    return {
      loading, submitting, identityList, current, detailVisible, reviewVisible,
      reviewFormRef, reviewForm, reviewRules, searchForm, pagination,
      statusLabel, statusTag, galleryOf, thumbsOf,
      handleSearch, handleReset, onPageChange, openDetail, openReview, submitReview, goUser
    }
  }
})
</script>

<style lang="less" scoped>
.user-identity {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__pagination { margin-top: 16px; justify-content: flex-end; }

  &__user { display: flex; align-items: center; gap: 8px; }
  &__user-text { display: flex; flex-direction: column; line-height: 1.3; }
  &__user-id { color: #909399; font-size: 12px; }

  &__thumbs { display: flex; gap: 4px; flex-wrap: wrap; }
  &__thumb { width: 40px; height: 40px; border-radius: 4px; }

  &__gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
  }
  &__gallery-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #606266;

    .el-image { width: 200px; height: 130px; border: 1px solid #ebeef5; border-radius: 4px; }
  }
}
</style>
