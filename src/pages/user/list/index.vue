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
  <div class="user-list-container">
    <!-- 主内容卡片 -->
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="card-title">用户列表</span>
            <el-tag type="info" size="small">
              共 {{ pagination.total }} 条数据
            </el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新增用户
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索筛选区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="昵称/微聊号/邮箱/手机号"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input
              v-model="searchForm.email"
              placeholder="精确搜邮箱"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 140px"
            >
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="searchForm.userType"
              placeholder="请选择类型"
              clearable
              style="width: 140px"
            >
              <el-option label="普通用户" :value="1" />
              <el-option label="推送机器人" :value="2" />
              <el-option label="智能机器人" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="官方">
            <el-select
              v-model="searchForm.isOfficial"
              placeholder="是否官方"
              clearable
              style="width: 120px"
            >
              <el-option label="官方" :value="true" />
              <el-option label="非官方" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="来源">
            <el-select
              v-model="searchForm.source"
              placeholder="请选择来源"
              clearable
              style="width: 140px"
            >
              <el-option label="注册" :value="1" />
              <el-option label="管理员创建" :value="2" />
              <el-option label="导入" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
            <el-button link type="primary" @click="filterBanned">已禁用用户</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 批量操作栏 -->
      <el-alert
        v-if="selectedUserIds.length > 0"
        type="info"
        :closable="false"
        class="batch-alert"
      >
        <template #title>
          <div class="batch-content">
            <span>已选择 <strong>{{ selectedUserIds.length }}</strong> 项</span>
            <div class="batch-buttons">
              <el-button type="success" size="small" @click="handleBatchEnable">
                <el-icon><Check /></el-icon>
                批量启用
              </el-button>
              <el-button type="warning" size="small" @click="handleBatchDisable">
                <el-icon><Close /></el-icon>
                批量禁用
              </el-button>
              <el-button type="danger" size="small" @click="handleBatchDelete">
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
            </div>
          </div>
        </template>
      </el-alert>

      <!-- 数据表格 -->
      <div class="table-section">
        <el-table
          :data="userList"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="nickName" label="昵称" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.nickName }}</span>
              <el-tag v-if="row.isOfficial" type="primary" size="small" effect="light" class="official-tag">
                官方
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="weliaoId" label="微聊号" width="170" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.weliaoId || "—" }}
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="130" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.phone || "—" }}
            </template>
          </el-table-column>
          <el-table-column prop="avatar" label="头像" width="80" align="center">
            <template #default="{ row }">
              <el-avatar 
                :src="row.avatar || ''" 
                :size="40"
              >
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />

          <el-table-column prop="userType" label="类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getUserTypeTag(row.userType)" size="small" plain>
                {{ getUserTypeText(row.userType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="source" label="来源" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getSourceType(row.source)" size="small" plain>
                {{ getSourceText(row.source) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间"  />
          <el-table-column label="操作" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="success" @click="openUserProfile(row.id)">
                用户360
              </el-button>
              <el-button size="small" type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="warning" @click="handleResetPassword(row)">
                <el-icon><Key /></el-icon>
                重置密码
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 创建/编辑用户弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑用户' : '新增用户'"
      v-model="showCreateDialog"
      width="580px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="userForm.nickName" placeholder="请输入昵称">
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="与手机号二选一">
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" maxlength="11" placeholder="与邮箱二选一" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 新增时不填微聊号：建号时服务端自动发一个 wl_ 系统号，建完再改 -->
            <el-form-item v-if="isEdit" label="微聊号" prop="weliaoId">
              <el-input v-model="userForm.weliaoId" maxlength="20" placeholder="6-20 位，字母开头" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="个性签名" prop="abstract">
          <el-input
            v-model="userForm.abstract"
            type="textarea"
            placeholder="请输入个性签名"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="官方账号" prop="isOfficial">
          <el-switch v-model="userForm.isOfficial" />
          <span class="form-hint">
            开启后客户端会在这个号的昵称后面挂「官方」徽标。只是身份标识，不影响任何权限。
          </span>
        </el-form-item>

        <!-- 新建接口（CreateUserReq）没有 status 字段，只在编辑时显示/提交 -->
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">
              正常
            </el-radio>
            <el-radio :label="2">
              禁用
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog
      title="重置密码"
      v-model="showPasswordDialog"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordFormRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handlePasswordSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<script lang="ts">
import type { FormInstance } from "element-plus"
import type { IUserInfo } from "@/types/api/user"

import { ElMessage, ElMessageBox } from "element-plus"
import {
  batchDeleteUsersApi,
  batchUpdateUserStatusApi,
  createUserApi,
  deleteUserApi,
  getUserListApi,
  resetUserPasswordApi,
  updateUserApi
} from "@/api/user"
export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const submitting = ref(false)
    const userList = ref<IUserInfo[]>([])
    const selectedUserIds = ref<string[]>([])

    // 搜索表单
    const searchForm = reactive({
      keyword: "",
      email: "",
      status: undefined as number | undefined,
      source: undefined as number | undefined,
      userType: undefined as number | undefined,
      isOfficial: undefined as boolean | undefined
    })

    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 弹窗控制
    const showCreateDialog = ref(false)
    const showPasswordDialog = ref(false)
    const isEdit = ref(false)

    // 用户表单
    const userForm = reactive({
      id: "",
      weliaoId: "",
      nickName: "",
      email: "",
      phone: "",
      password: "",
      abstract: "",
      status: 1,
      isOfficial: false
    })

    // 密码表单
    const passwordForm = reactive({
      userId: "",
      newPassword: "",
      confirmPassword: ""
    })

    // 表单引用
    const userFormRef = ref<FormInstance | null>(null)
    const passwordFormRef = ref<FormInstance | null>(null)

    // 表单验证规则
    // 邮箱/手机号二选一：两个都空才报错，所以校验挂在两边、互相看对方
    const eitherContact = (_rule: any, _value: any, callback: any) => {
      if (!userForm.email && !userForm.phone) {
        callback(new Error("邮箱和手机号至少填一个"))
        return
      }
      callback()
    }

    const userFormRules = {
      nickName: [
        { required: true, message: "请输入昵称", trigger: "blur" }
      ],
      email: [
        { validator: eitherContact, trigger: "blur" },
        { type: "email" as const, message: "邮箱格式不正确", trigger: "blur" }
      ],
      phone: [
        { validator: eitherContact, trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确", trigger: "blur" }
      ],
      // 后台改微聊号不受产品层限制：6-20 位 / 字母开头 / wl_ 前缀 / 官方保留词
      // 这几条只拦用户自己在客户端改号（服务端 ValidateUserWeliaoID），运营是被信任的
      // ——官方号本来就该叫 weliao_kefu，也可能要占一个 wl_ 开头的号。
      // 这里只留跟库对齐的长度上限，唯一性仍由服务端 + 唯一索引兜底。
      weliaoId: [
        { max: 32, message: "微聊号不能超过 32 个字符", trigger: "blur" }
      ],
      password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码至少6位", trigger: "blur" }
      ]
    }

    const passwordFormRules = {
      newPassword: [
        { required: true, message: "请输入新密码", trigger: "blur" },
        { min: 6, message: "密码至少6位", trigger: "blur" }
      ],
      confirmPassword: [
        { required: true, message: "请确认密码", trigger: "blur" },
        {
          validator: (_rule: any, value: any, callback: any) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error("两次输入的密码不一致"))
            } else {
              callback()
            }
          },
          trigger: "blur"
        }
      ]
    }

    // 获取用户列表
    const fetchUserList = async () => {
      loading.value = true
      const response = await getUserListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        email: searchForm.email || undefined,
        status: searchForm.status,
        source: searchForm.source,
        userType: searchForm.userType,
        isOfficial: searchForm.isOfficial
      })
      loading.value = false
      if (response.code === 0) {
        userList.value = response.result.list || []
        pagination.total = response.result.total || 0
      } else {
        ElMessage.error(response.msg || "获取用户列表失败")
      }
    }

    // 工具函数
    const getStatusType = (status: number) => {
      return status === 1 ? "success" : "danger"
    }

    const getStatusText = (status: number) => {
      return status === 1 ? "正常" : "禁用"
    }

    const getSourceText = (source: number) => {
      const sourceMap: Record<number, string> = {
        1: "注册",
        2: "管理员创建",
        3: "导入"
      }
      return sourceMap[source] || "未知"
    }

    const getSourceType = (source: number) => {
      const typeMap: Record<number, "success" | "warning" | "info" | "danger" | undefined> = {
        1: "info",
        2: "success",
        3: "warning"
      }
      return typeMap[source] || "info"
    }

    const getUserTypeText = (userType: number) => {
      const typeMap: Record<number, string> = {
        1: "普通用户",
        2: "推送机器人",
        3: "智能机器人"
      }
      return typeMap[userType] || "未知"
    }

    const getUserTypeTag = (userType: number) => {
      const typeMap: Record<number, "success" | "warning" | "info" | "danger" | undefined> = {
        1: "info",
        2: "warning",
        3: "success"
      }
      return typeMap[userType] || "info"
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchUserList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        keyword: "",
        email: "",
        status: undefined,
        source: undefined,
        userType: undefined,
        isOfficial: undefined
      })
      handleSearch()
    }

    const filterBanned = () => {
      searchForm.status = 2
      handleSearch()
    }

    const handleSelectionChange = (selection: IUserInfo[]) => {
      selectedUserIds.value = selection.map(item => item.id)
    }

    const handleSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchUserList()
    }

    const handleCurrentChange = (page: number) => {
      pagination.page = page
      fetchUserList()
    }

    const handleEdit = (row: IUserInfo) => {
      resetUserForm()
      isEdit.value = true
      Object.assign(userForm, {
        id: row.id,
        weliaoId: row.weliaoId,
        nickName: row.nickName,
        email: row.email,
        phone: row.phone,
        abstract: row.abstract,
        status: row.status,
        isOfficial: row.isOfficial,
        password: ""
      })
      showCreateDialog.value = true
    }

    const handleDelete = async (row: IUserInfo) => {
      await ElMessageBox.confirm(`确认删除用户「${row.nickName}」？`, "删除用户", { type: "warning" })
      const response = await deleteUserApi(row.id)
      if (response.code === 0) {
        ElMessage.success("删除成功")
        fetchUserList()
      } else {
        ElMessage.error(response.msg || "删除失败")
      }
    }

    const handleResetPassword = (row: IUserInfo) => {
      resetPasswordForm()
      passwordForm.userId = row.id
      showPasswordDialog.value = true
    }

    const handleBatchDelete = async () => {
      await ElMessageBox.confirm(`确认删除选中的 ${selectedUserIds.value.length} 个用户？`, "批量删除", { type: "warning" })
      const response = await batchDeleteUsersApi({ ids: selectedUserIds.value })
      if (response.code === 0) {
        ElMessage.success("批量删除成功")
        fetchUserList()
      } else {
        ElMessage.error(response.msg || "批量删除失败")
      }
    }

    const handleBatchDisable = async () => {
      await handleBatchUpdateStatus(2, "禁用")
    }

    const handleBatchEnable = async () => {
      await handleBatchUpdateStatus(1, "启用")
    }

    const handleBatchUpdateStatus = async (status: number, action: string) => {
      await ElMessageBox.confirm(`确认${action}选中的 ${selectedUserIds.value.length} 个用户？`, "批量操作", { type: "warning" })
      const response = await batchUpdateUserStatusApi({ ids: selectedUserIds.value, status })
      if (response.code === 0) {
        ElMessage.success(`批量${action}成功`)
        fetchUserList()
      } else {
        ElMessage.error(response.msg || `批量${action}失败`)
      }
    }

    const handleSubmit = async () => {
      if (!userFormRef.value) return
      await userFormRef.value.validate()
      submitting.value = true
      const formData = {
        nickName: userForm.nickName,
        email: userForm.email,
        phone: userForm.phone,
        abstract: userForm.abstract,
        isOfficial: userForm.isOfficial
      }
      const response = isEdit.value
        ? await updateUserApi(userForm.id, {
            ...formData,
            // 没改就不传：传了服务端要跑一遍唯一性校验，没必要
            ...(userForm.weliaoId ? { weliaoId: userForm.weliaoId } : {}),
            status: userForm.status
          })
        : await createUserApi({ ...formData, password: userForm.password })
      submitting.value = false
      if (response.code === 0) {
        ElMessage.success(isEdit.value ? "更新成功" : "创建成功")
        showCreateDialog.value = false
        fetchUserList()
      } else {
        ElMessage.error(response.msg || (isEdit.value ? "更新失败" : "创建失败"))
      }
    }

    const handlePasswordSubmit = async () => {
      if (!passwordFormRef.value) return
      await passwordFormRef.value.validate()
      submitting.value = true
      const response = await resetUserPasswordApi({
        userId: passwordForm.userId,
        newPassword: passwordForm.newPassword
      })
      submitting.value = false
      if (response.code === 0) {
        ElMessage.success("密码重置成功")
        showPasswordDialog.value = false
      } else {
        ElMessage.error(response.msg || "密码重置失败")
      }
    }

    const resetUserForm = () => {
      Object.assign(userForm, {
        id: "",
        weliaoId: "",
        nickName: "",
        email: "",
        phone: "",
        password: "",
        abstract: "",
        status: 1,
        isOfficial: false
      })
      isEdit.value = false
    }

    const resetPasswordForm = () => {
      Object.assign(passwordForm, {
        userId: "",
        newPassword: "",
        confirmPassword: ""
      })
    }

    // 监听弹窗关闭
    watch(showCreateDialog, (val) => {
      if (!val) {
        resetUserForm()
        userFormRef.value?.resetFields()
      }
    })

    watch(showPasswordDialog, (val) => {
      if (!val) {
        resetPasswordForm()
        passwordFormRef.value?.resetFields()
      }
    })

    const openUserProfile = (userId: string) => {
      router.push(`/user/profile/${userId}`)
    }

    onMounted(() => {
      const q = route.query.keyword as string
      const qStatus = route.query.status as string
      if (q) {
        searchForm.keyword = q
      }
      if (qStatus) {
        const status = Number.parseInt(qStatus, 10)
        if (!Number.isNaN(status)) {
          searchForm.status = status
        }
      }
      fetchUserList()
    })

    return {
      loading,
      submitting,
      userList,
      selectedUserIds,
      searchForm,
      pagination,
      showCreateDialog,
      showPasswordDialog,
      isEdit,
      userForm,
      passwordForm,
      userFormRef,
      passwordFormRef,
      userFormRules,
      passwordFormRules,
      fetchUserList,
      getStatusType,
      getStatusText,
      getSourceText,
      getSourceType,
      getUserTypeText,
      getUserTypeTag,
      handleSearch,
      handleReset,
      filterBanned,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      handleEdit,
      handleDelete,
      handleResetPassword,
      handleBatchDelete,
      handleBatchDisable,
      handleBatchEnable,
      handleBatchUpdateStatus,
      handleSubmit,
      handlePasswordSubmit,
      resetUserForm,
      resetPasswordForm,
      openUserProfile
    }
  }
})
</script>


<style lang="less" scoped>
.user-list-container {
  height: 100%;
  overflow-y: auto;
}

.main-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  :deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.search-section {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
  flex-shrink: 0;

  .search-form {
    width: 100%;
    overflow-x: auto;
  }
}

.batch-alert {
  margin-bottom: 16px;
  flex-shrink: 0;

  .batch-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .batch-buttons {
      display: flex;
      gap: 8px;
    }
  }
}

.table-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-table {
    flex: 1;
  }

  .pagination-wrapper {
    flex-shrink: 0;
    padding-top: 20px;
  }
}



.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  .el-button {
    margin-left: 10px;
  }
}

.official-tag {
  margin-left: 6px;
}

.form-hint {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
