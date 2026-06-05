<template>
  <div class="system-admins">
    <div class="system-admins__header">
      <h2 class="system-admins__title">管理员账号</h2>
      <el-button type="primary" @click="openCreate">新建管理员</el-button>
    </div>

    <el-form :inline="true" class="system-admins__form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="昵称/手机号" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px">
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="adminList" border stripe>
      <el-table-column prop="nickName" label="昵称" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="userId" label="管理员ID" min-width="160" show-overflow-tooltip />
      <el-table-column label="角色" min-width="140">
        <template #default="{ row }">
          <el-tag v-for="name in row.authorityNames" :key="name" size="small" class="system-admins__tag">
            {{ name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="system-admins__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />

    <el-dialog v-model="formVisible" :title="isEdit ? '编辑管理员' : '新建管理员'" width="480px">
      <el-form label-width="90px">
        <el-form-item label="昵称">
          <el-input v-model="form.nickName" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item :label="isEdit ? '新密码' : '密码'">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? '不修改请留空' : ''" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.authorityIds" multiple style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IAdminUserInfo, IAuthorityInfo } from "@/types/api/system"
import { ElMessage } from "element-plus"
import {
  createAdminUserApi,
  getAdminUserListApi,
  getAuthorityListApi,
  updateAdminUserApi
} from "@/api/system"

export default defineComponent({
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const adminList = ref<IAdminUserInfo[]>([])
    const roleOptions = ref<IAuthorityInfo[]>([])
    const formVisible = ref(false)
    const isEdit = ref(false)
    const editUserId = ref("")

    const searchForm = reactive({ keyword: "", status: undefined as number | undefined })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const form = reactive({
      nickName: "",
      phone: "",
      password: "",
      status: 1,
      authorityIds: [] as number[]
    })

    const fetchRoles = async () => {
      const res = await getAuthorityListApi()
      if (res.code === 0) {
        roleOptions.value = res.result.list || []
      }
    }

    const fetchList = async () => {
      loading.value = true
      const res = await getAdminUserListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        status: searchForm.status
      })
      loading.value = false
      if (res.code === 0) {
        adminList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const openCreate = () => {
      isEdit.value = false
      editUserId.value = ""
      form.nickName = ""
      form.phone = ""
      form.password = ""
      form.status = 1
      form.authorityIds = []
      formVisible.value = true
    }

    const openEdit = (row: IAdminUserInfo) => {
      isEdit.value = true
      editUserId.value = row.userId
      form.nickName = row.nickName
      form.phone = row.phone
      form.password = ""
      form.status = row.status
      form.authorityIds = [...row.authorityIds]
      formVisible.value = true
    }

    const submitForm = async () => {
      if (!form.nickName.trim()) {
        ElMessage.warning("请填写昵称")
        return
      }
      saving.value = true
      let res
      if (isEdit.value) {
        res = await updateAdminUserApi(editUserId.value, {
          nickName: form.nickName,
          status: form.status,
          password: form.password || undefined,
          authorityIds: form.authorityIds
        })
      } else {
        if (!form.phone || !form.password) {
          saving.value = false
          ElMessage.warning("请填写手机号和密码")
          return
        }
        res = await createAdminUserApi({
          nickName: form.nickName,
          phone: form.phone,
          password: form.password,
          authorityIds: form.authorityIds
        })
      }
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("保存成功")
        formVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    onMounted(() => {
      fetchRoles()
      fetchList()
    })

    return {
      loading, saving, adminList, roleOptions, formVisible, isEdit, searchForm, pagination, form,
      handleSearch, onPageChange, openCreate, openEdit, submitForm
    }
  }
})
</script>

<style lang="less">
.system-admins {
  padding: 20px;

  .system-admins__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .system-admins__title {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .system-admins__form {
    margin-bottom: 12px;
  }

  .system-admins__tag {
    margin-right: 4px;
    margin-bottom: 4px;
  }

  .system-admins__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
