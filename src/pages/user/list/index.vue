
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
              placeholder="昵称/邮箱/手机号"
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
          <el-table-column prop="nickName" label="昵称" width="120" show-overflow-tooltip />
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
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="操作" width="360" fixed="right" align="center">
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
              <el-input v-model="userForm.email" placeholder="请输入邮箱">
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
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

        <el-form-item label="状态" prop="status">
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
import type { IApiResponse } from "@/types/auth"

import { MD5 } from "crypto-js"
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
      source: undefined as number | undefined
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
      nickName: "",
      email: "",
      password: "",
      abstract: "",
      status: 1
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
    const userFormRules = {
      nickName: [
        { required: true, message: "请输入昵称", trigger: "blur" }
      ],
      email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email" as const, message: "邮箱格式不正确", trigger: "blur" }
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
        source: searchForm.source
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
        source: undefined
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
        nickName: row.nickName,
        email: row.email,
        abstract: row.abstract,
        status: row.status,
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
        abstract: userForm.abstract,
        status: userForm.status,
        ...(isEdit.value ? {} : { password: MD5(userForm.password).toString() })
      }
      const response = isEdit.value
        ? await updateUserApi(userForm.id, formData)
        : await createUserApi({ ...formData, password: formData.password || "" })
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
        newPassword: MD5(passwordForm.newPassword).toString()
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
        nickName: "",
        email: "",
        password: "",
        abstract: "",
        status: 1
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
</style>
