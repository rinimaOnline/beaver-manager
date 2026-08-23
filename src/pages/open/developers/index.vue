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
  <div class="developer-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>开发者审核</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="openApplyDialog">代用户申请</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="developerList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="companyName" label="公司名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="description" label="应用场景描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditRemark" label="审核备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goUser(row.userId)">用户360</el-button>
            <el-button v-if="row.status === 0" link type="primary" @click="handleAudit(row)">审核</el-button>
            <el-text v-else type="info">已审核</el-text>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="审核开发者申请"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请人">
          {{ currentDeveloper?.realName }}
        </el-descriptions-item>
        <el-descriptions-item label="公司名称">
          {{ currentDeveloper?.companyName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentDeveloper?.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ currentDeveloper?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="应用场景">
          {{ currentDeveloper?.description }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        label-width="100px"
        style="margin-top: 20px"
      >
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="auditForm.status">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注" prop="auditRemark">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAudit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="applyDialogVisible" title="代用户申请开发者" width="520px">
      <el-form ref="applyFormRef" :model="applyForm" :rules="applyRules" label-width="100px">
        <el-form-item label="用户ID" prop="applicantUserId">
          <el-input v-model="applyForm.applicantUserId" placeholder="目标用户 ID" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="applyForm.realName" />
        </el-form-item>
        <el-form-item label="公司名称">
          <el-input v-model="applyForm.companyName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="applyForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="applyForm.email" />
        </el-form-item>
        <el-form-item label="应用场景">
          <el-input v-model="applyForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="applyLoading" @click="submitApply">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { IDeveloperInfo } from "@/types/api/open"
import { Search } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { applyDeveloperApi, auditDeveloperApi, getDeveloperListApi } from "@/api/open"

export default defineComponent({
  components: { Search },
  setup() {
    const loading = ref(false)
    const developerList = ref<IDeveloperInfo[]>([])
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const searchForm = reactive({ status: undefined as number | undefined })
    const auditDialogVisible = ref(false)
    const submitLoading = ref(false)
    const currentDeveloper = ref<IDeveloperInfo | null>(null)
    const auditFormRef = ref<FormInstance>()
    const auditForm = reactive({ id: "", status: 1, auditRemark: "" })
    const auditRules: FormRules = {
      status: [{ required: true, message: "请选择审核结果", trigger: "change" }]
    }
    const applyDialogVisible = ref(false)
    const applyLoading = ref(false)
    const applyFormRef = ref<FormInstance>()
    const applyForm = reactive({
      applicantUserId: "",
      realName: "",
      companyName: "",
      phone: "",
      email: "",
      description: ""
    })
    const applyRules: FormRules = {
      applicantUserId: [{ required: true, message: "请输入用户ID", trigger: "blur" }],
      realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
      phone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
      email: [{ required: true, message: "请输入邮箱", trigger: "blur" }]
    }

    const formatTime = (timestamp: number) => {
      if (!timestamp) return "-"
      return new Date(timestamp * 1000).toLocaleString("zh-CN")
    }

    const getStatusText = (status: number) => ({ 0: "待审核", 1: "已通过", 2: "已拒绝" }[status] || "未知")
    const getStatusType = (status: number) => ({ 0: "warning", 1: "success", 2: "danger" }[status] || "info")

    const loadDeveloperList = async () => {
      loading.value = true
      const res = await getDeveloperListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: searchForm.status
      })
      loading.value = false
      if (res.code === 0) {
        developerList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载开发者列表失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      loadDeveloperList()
    }

    const handleReset = () => {
      searchForm.status = undefined
      handleSearch()
    }

    const handleSizeChange = () => loadDeveloperList()
    const handlePageChange = () => loadDeveloperList()

    const router = useRouter()

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    const handleAudit = (row: IDeveloperInfo) => {
      currentDeveloper.value = row
      auditForm.id = row.id
      auditForm.status = 1
      auditForm.auditRemark = ""
      auditDialogVisible.value = true
    }

    const handleSubmitAudit = async () => {
      if (!auditFormRef.value) return
      await auditFormRef.value.validate()
      submitLoading.value = true
      const res = await auditDeveloperApi({
        id: auditForm.id,
        status: auditForm.status,
        auditRemark: auditForm.auditRemark
      })
      submitLoading.value = false
      if (res.code === 0) {
        ElMessage.success("审核成功")
        auditDialogVisible.value = false
        loadDeveloperList()
      } else {
        ElMessage.error(res.msg || "审核失败")
      }
    }

    const openApplyDialog = () => {
      applyForm.applicantUserId = ""
      applyForm.realName = ""
      applyForm.companyName = ""
      applyForm.phone = ""
      applyForm.email = ""
      applyForm.description = ""
      applyDialogVisible.value = true
    }

    const submitApply = async () => {
      if (!applyFormRef.value) return
      await applyFormRef.value.validate()
      applyLoading.value = true
      const res = await applyDeveloperApi({
        applicantUserId: applyForm.applicantUserId,
        realName: applyForm.realName,
        companyName: applyForm.companyName || undefined,
        phone: applyForm.phone,
        email: applyForm.email,
        description: applyForm.description || undefined
      })
      applyLoading.value = false
      if (res.code === 0) {
        ElMessage.success("申请已提交")
        applyDialogVisible.value = false
        loadDeveloperList()
      } else {
        ElMessage.error(res.msg || "提交失败")
      }
    }

    onMounted(loadDeveloperList)

    return {
      loading, developerList, pagination, searchForm,
      auditDialogVisible, submitLoading, currentDeveloper, auditFormRef, auditForm, auditRules,
      applyDialogVisible, applyLoading, applyFormRef, applyForm, applyRules,
      formatTime, getStatusText, getStatusType,
      handleSearch, handleReset, handleSizeChange, handlePageChange,
      handleAudit, handleSubmitAudit, openApplyDialog, submitApply, goUser
    }
  }
})
</script>

<style lang="less">
.developer-audit-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
