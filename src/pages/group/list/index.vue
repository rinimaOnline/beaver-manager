<script lang="ts">
import type { FormInstance } from "element-plus"
import type { GroupInfo, GroupMemberInfo } from "@/types/api/group"

import {
  Delete,
  Edit,
  RefreshLeft,
  Search as SearchIcon,
  UserFilled,
  View as ViewIcon
} from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  deleteGroupApi,
  getGroupDetailApi,
  getGroupListApi,
  getGroupMemberListApi,
  muteGroupMemberApi,
  removeGroupMemberApi,
  updateGroupApi,
  updateMemberRoleApi
} from "@/api/group"

export default defineComponent({
  components: {
    SearchIcon,
    RefreshLeft,
    UserFilled,
    ViewIcon,
    Edit,
    Delete
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const detailLoading = ref(false)
    const memberLoading = ref(false)
    const saving = ref(false)
    const groupList = ref<GroupInfo[]>([])

    // 搜索表单
    const searchForm = reactive({
      keywords: "",
      status: undefined as number | undefined
    })

    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 弹窗控制
    const showDetailDialog = ref(false)
    const isEdit = ref(false)

    // 群组表单
    const groupForm = reactive({
      id: 0,
      title: "",
      fileName: "",
      abstract: "",
      notice: "",
      tags: "",
      category: "",
      maxMembers: 500,
      status: 1
    })

    // 成员相关
    const memberList = ref<GroupMemberInfo[]>([])
    const memberPagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 表单引用
    const groupFormRef = ref<FormInstance>()

    // 表单验证规则
    const groupFormRules = {
      title: [
        { required: true, message: "请输入群组名称", trigger: "blur" }
      ]
    }

    // 获取群组列表
    const fetchGroupList = async () => {
      loading.value = true
      const res = await getGroupListApi({
        page: pagination.page,
        limit: pagination.pageSize,
        keywords: searchForm.keywords || undefined,
        status: searchForm.status
      })
      loading.value = false
      if (res.code === 0) {
        groupList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取群组列表失败")
      }
    }

    const fetchGroupDetail = async (id: number) => {
      detailLoading.value = true
      const res = await getGroupDetailApi(id)
      detailLoading.value = false
      if (res.code === 0) {
        Object.assign(groupForm, res.result)
      } else {
        ElMessage.error(res.msg || "获取群组详情失败")
      }
    }

    const fetchMemberList = async () => {
      memberLoading.value = true
      const res = await getGroupMemberListApi({
        groupId: String(groupForm.id),
        page: memberPagination.page,
        limit: memberPagination.pageSize
      })
      memberLoading.value = false
      if (res.code === 0) {
        memberList.value = res.result.list || []
        memberPagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取成员列表失败")
      }
    }

    // 工具函数
    const getStatusText = (status: number) => {
      switch (status) {
        case 1: return "正常"
        case 2: return "禁用"
        case 3: return "已解散"
        default: return "-"
      }
    }

    const getStatusType = (status: number) => {
      switch (status) {
        case 1: return "success"
        case 2: return "warning"
        case 3: return "info"
        default: return ""
      }
    }

    const getRoleText = (role: number) => {
      switch (role) {
        case 0: return "成员"
        case 1: return "管理员"
        case 2: return "群主"
        default: return "-"
      }
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchGroupList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        keywords: "",
        status: undefined
      })
      handleSearch()
    }

    const handleSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchGroupList()
    }

    const handleCurrentChange = (page: number) => {
      pagination.page = page
      fetchGroupList()
    }

    const goGroupProfile = (row: GroupInfo) => {
      router.push(`/group/profile/${row.uuid}`)
    }

    const handleView = async (row: GroupInfo) => {
      isEdit.value = false
      await fetchGroupDetail(row.id)
      await fetchMemberList()
      showDetailDialog.value = true
    }

    const handleEdit = async (row: GroupInfo) => {
      isEdit.value = true
      await fetchGroupDetail(row.id)
      await fetchMemberList()
      showDetailDialog.value = true
    }

    const handleDelete = async (row: GroupInfo) => {
      await ElMessageBox.confirm(`确认删除群组「${row.title}」？`, "删除群组", { type: "warning" })
      const res = await deleteGroupApi(row.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchGroupList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleSave = async () => {
      if (!groupFormRef.value) return
      await groupFormRef.value.validate()
      saving.value = true
      const res = await updateGroupApi(groupForm.id, groupForm)
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("保存成功")
        isEdit.value = false
        fetchGroupList()
        fetchGroupDetail(groupForm.id)
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const handleCancelEdit = () => {
      isEdit.value = false
      fetchGroupDetail(groupForm.id)
    }

    // 成员管理事件
    const handleMemberSizeChange = (size: number) => {
      memberPagination.pageSize = size
      fetchMemberList()
    }

    const handleMemberCurrentChange = (page: number) => {
      memberPagination.page = page
      fetchMemberList()
    }

    const handleRemoveMember = async (row: GroupMemberInfo) => {
      await ElMessageBox.confirm(`确认移除成员 ${row.memberNickname}？`, "移除成员", { type: "warning" })
      const res = await removeGroupMemberApi({ groupId: String(groupForm.id), memberIds: [row.userId] })
      if (res.code === 0) {
        ElMessage.success("移除成功")
        fetchMemberList()
      } else {
        ElMessage.error(res.msg || "移除失败")
      }
    }

    const handleMute = async (row: GroupMemberInfo) => {
      const isMuted = row.status === 2
      const res = await muteGroupMemberApi(row.id, { prohibitionTime: isMuted ? 0 : 30 })
      if (res.code === 0) {
        ElMessage.success(isMuted ? "解除禁言成功" : "禁言成功")
        fetchMemberList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const handleChangeRole = async (row: GroupMemberInfo) => {
      const newRole = row.role === 1 ? 0 : 1
      const res = await updateMemberRoleApi(row.id, { role: newRole })
      if (res.code === 0) {
        ElMessage.success("角色修改成功")
        fetchMemberList()
      } else {
        ElMessage.error(res.msg || "角色修改失败")
      }
    }

    // 监听弹窗关闭
    watch(showDetailDialog, (val) => {
      if (!val) {
        isEdit.value = false
        groupFormRef.value?.resetFields()
      }
    })

    // 初始化
    onMounted(() => {
      const q = route.query.groupId as string
      if (q) {
        searchForm.keywords = q
      }
      fetchGroupList()
    })

    return {
      loading,
      detailLoading,
      memberLoading,
      saving,
      groupList,
      searchForm,
      pagination,
      showDetailDialog,
      isEdit,
      groupForm,
      memberList,
      memberPagination,
      groupFormRef,
      groupFormRules,
      fetchGroupList,
      getStatusText,
      getStatusType,
      getRoleText,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      goGroupProfile,
      handleView,
      handleEdit,
      handleDelete,
      handleSave,
      handleCancelEdit,
      handleMemberSizeChange,
      handleMemberCurrentChange,
      handleRemoveMember,
      handleMute,
      handleChangeRole
    }
  }
})
</script>

<template>
  <div class="group-list-container">
    <!-- 主内容卡片 -->
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="card-title">群组列表</span>
            <el-tag type="info" size="small">
              共 {{ pagination.total }} 条数据
            </el-tag>
          </div>
        </div>
      </template>

      <!-- 搜索筛选区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="群组名称">
            <el-input
              v-model="searchForm.keywords"
              placeholder="请输入群组名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><SearchIcon /></el-icon>
              </template>
            </el-input>
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
              <el-option label="已解散" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><SearchIcon /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <div class="table-section">
        <el-table
          :data="groupList"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="头像" width="80">
            <template #default="{ row }">
              <el-avatar :src="row.avatar" :size="40">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="群组名称" min-width="150" show-overflow-tooltip />

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="currentMembers" label="成员数" width="100" />
          <el-table-column prop="creatorId" label="创建者ID" width="120" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="360" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="success" @click="goGroupProfile(row)">
                群组360
              </el-button>
              <el-button size="small" type="primary" @click="handleView(row)">
                <el-icon><ViewIcon /></el-icon>
                详情
              </el-button>
              <el-button size="small" type="warning" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
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

    <!-- 群组详情/编辑弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑群组' : '群组详情'"
      v-model="showDetailDialog"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading">
        <!-- 群组基本信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>群组信息</span>
              <el-button v-if="!isEdit" type="primary" @click="isEdit = true">
                编辑
              </el-button>
              <div v-else>
                <el-button @click="handleCancelEdit">
                  取消
                </el-button>
                <el-button type="primary" @click="handleSave" :loading="saving">
                  保存
                </el-button>
              </div>
            </div>
          </template>

          <el-form
            ref="groupFormRef"
            :model="groupForm"
            :rules="groupFormRules"
            label-width="100px"
            :disabled="!isEdit"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="群组名称" prop="title">
                  <el-input v-model="groupForm.title" placeholder="请输入群组名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="群组分类" prop="category">
                  <el-input v-model="groupForm.category" placeholder="请输入群组分类" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="头像" prop="avatar">
                  <el-input v-model="groupForm.avatar" placeholder="请输入头像URL" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最大成员数" prop="maxMembers">
                  <el-input-number v-model="groupForm.maxMembers" :min="1" :max="5000" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="群组简介" prop="abstract">
              <el-input
                v-model="groupForm.abstract"
                type="textarea"
                placeholder="请输入群组简介"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="群公告" prop="notice">
              <el-input
                v-model="groupForm.notice"
                type="textarea"
                placeholder="请输入群公告"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="标签" prop="tags">
              <el-input v-model="groupForm.tags" placeholder="请输入标签，多个用逗号分隔" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="groupForm.status">
                <el-radio :label="1">
                  正常
                </el-radio>
                <el-radio :label="2">
                  禁用
                </el-radio>
                <el-radio :label="3">
                  已解散
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 群成员管理 -->
        <el-card class="members-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>成员管理</span>
              <el-tag type="info" size="small">
                共 {{ memberPagination.total }} 人
              </el-tag>
            </div>
          </template>

          <el-table
            v-loading="memberLoading"
            :data="memberList"
            style="width: 100%"
          >
            <el-table-column prop="userId" label="用户ID" width="120" />
            <el-table-column prop="memberNickname" label="昵称" min-width="120" />
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }">
                <el-tag>{{ getRoleText(row.role) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 2 ? 'danger' : 'success'">
                  {{ row.status === 2 ? '禁言' : '正常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="加入时间" width="180" />
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button type="warning" size="small" @click="handleChangeRole(row)">
                  改角色
                </el-button>
                <el-button type="info" size="small" @click="handleMute(row)">
                  {{ row.status === 2 ? '解除禁言' : '禁言' }}
                </el-button>
                <el-button type="danger" size="small" @click="handleRemoveMember(row)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              :current-page="memberPagination.page"
              :page-size="memberPagination.pageSize"
              :total="memberPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleMemberSizeChange"
              @current-change="handleMemberCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.group-list-container {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-card,
.members-card {
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
