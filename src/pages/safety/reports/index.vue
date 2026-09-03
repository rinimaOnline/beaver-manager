<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager
  beaver-manager-header-v1
-->

<template>
  <div class="safety-reports">
    <div class="safety-reports__header">
      <h2>举报队列</h2>
      <p>筛选待处理举报，可立案或驳回</p>
    </div>

    <el-form :inline="true">
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" clearable placeholder="状态" style="width: 140px">
          <el-option label="待处理" :value="1" />
          <el-option label="已立案" :value="2" />
          <el-option label="已驳回" :value="3" />
          <el-option label="已完结" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="对象类型">
        <el-select v-model="searchForm.targetType" clearable placeholder="类型" style="width: 140px">
          <el-option label="用户" :value="1" />
          <el-option label="消息" :value="2" />
          <el-option label="动态" :value="3" />
          <el-option label="群组" :value="4" />
          <el-option label="圈子" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="load">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      :row-class-name="rowClassName"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="reporterName" label="举报人" width="140" />
      <el-table-column prop="reporterUserId" label="举报人ID" width="140" />
      <el-table-column label="对象" min-width="160">
        <template #default="{ row }">{{ targetTypeLabel(row.targetType) }} · {{ row.targetId }}</template>
      </el-table-column>
      <el-table-column prop="content" label="原因" min-width="180" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="时间" width="170" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">{{ statusLabel(row.status) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.reporterUserId)">用户360</el-button>
          <el-button v-if="row.status === 1" link type="primary" @click="escalate(row.id)">立案</el-button>
          <el-button v-if="row.status === 1" link type="danger" @click="reject(row.id)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="searchForm.page"
      :page-size="searchForm.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      @size-change="(v: number) => { searchForm.pageSize = v; load() }"
      @current-change="(v: number) => { searchForm.page = v; load() }"
    />
  </div>
</template>

<script lang="ts">
import type { IContentReportInfo } from "@/types/api/moderation"
import { ElMessage, ElMessageBox } from "element-plus"
import { escalateContentReportApi, getContentReportListApi, rejectContentReportApi } from "@/api/moderation"
import { defineComponent, onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

export default defineComponent({
  name: "SafetyReports",
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const list = ref<IContentReportInfo[]>([])
    const total = ref(0)
    const searchForm = reactive({
      page: 1,
      pageSize: 10,
      status: undefined as number | undefined,
      targetType: undefined as number | undefined
    })

    const targetTypeLabel = (t: number) => ({ 1: "用户", 2: "消息", 3: "动态", 4: "群组", 5: "圈子" }[t] || "其他")
    const statusLabel = (s: number) => ({ 1: "待处理", 2: "已立案", 3: "已驳回", 4: "已完结" }[s] || "未知")

    const load = async () => {
      loading.value = true
      const res = await getContentReportListApi({ ...searchForm })
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      list.value = res.result?.list || []
      total.value = res.result?.total || 0
      const focusId = Number(route.query.id || 0)
      if (focusId) {
        const hit = list.value.find(item => item.id === focusId)
        if (hit)
          ElMessage.info(`已定位举报 #${focusId}`)
        else
          ElMessage.warning(`举报 #${focusId} 不在当前筛选结果中，请调整状态或翻页`)
      }
    }

    const rowClassName = ({ row }: { row: IContentReportInfo }) => {
      const focusId = Number(route.query.id || 0)
      return focusId && row.id === focusId ? "is-focus-row" : ""
    }

    const escalate = async (id: number) => {
      await ElMessageBox.confirm("确认立案该举报？", "立案")
      const res = await escalateContentReportApi({ reportId: id })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "立案失败")
        return
      }
      ElMessage.success("已立案")
      load()
    }

    const reject = async (id: number) => {
      const { value } = await ElMessageBox.prompt("驳回原因（可选）", "驳回", { inputPlaceholder: "原因" })
      const res = await rejectContentReportApi({ reportId: id, handleRemark: value })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "驳回失败")
        return
      }
      ElMessage.success("已驳回")
      load()
    }

    const goUser = (userId: string) => {
      if (userId)
        router.push(`/user/profile/${userId}`)
    }

    onMounted(load)

    return { loading, list, total, searchForm, load, escalate, reject, goUser, targetTypeLabel, statusLabel, rowClassName }
  }
})
</script>

<style scoped>
.safety-reports {
  padding: 8px;
}
.safety-reports__header {
  margin-bottom: 16px;
}
</style>
<style>
.safety-reports .is-focus-row > td {
  background: #e8f8ef !important;
}
</style>
