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
  <div class="invite-code-page">
    <div class="invite-code-page__header">
      <div>
        <h2 class="invite-code-page__title">邀请码配置</h2>
        <p class="invite-code-page__subtitle">
          每个邀请码是一个「桶」：用它注册的用户会自动加上这个码的好友和群。
          绑定用户的码可选开启「传导」，让下级注册也算进上级。无码注册走「无码默认好友/群组」。
        </p>
      </div>
      <el-button type="primary" @click="openCreate">新建</el-button>
    </div>

    <el-form :inline="true" class="invite-code-page__filter" @submit.prevent="search">
      <el-form-item>
        <el-input
          v-model="keyword"
          placeholder="邀请码 / 名称"
          clearable
          style="width: 240px"
          @keyup.enter="search"
          @clear="search"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="status" style="width: 130px" @change="search">
          <el-option label="全部状态" :value="-1" />
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="source" style="width: 150px" @change="search">
          <el-option label="全部类型" :value="-1" />
          <el-option label="独立推广码" :value="0" />
          <el-option label="绑定用户" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="邀请码" min-width="140">
        <template #default="{ row }">
          <span class="invite-code-page__code">{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.name || "—" }}</template>
      </el-table-column>
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.source === 1" size="small" type="success">绑定用户</el-tag>
          <el-tag v-else size="small">独立推广码</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="归属" min-width="160">
        <template #default="{ row }">
          <template v-if="row.source === 1">
            <div class="invite-code-page__name">{{ row.ownerNickName || "未设置昵称" }}</div>
            <div class="invite-code-page__id">微聊号 {{ row.ownerWeliaoId || "—" }}</div>
          </template>
          <span v-else class="invite-code-page__id">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="friendCount" label="好友数" width="80" align="center" />
      <el-table-column prop="groupCount" label="群数" width="70" align="center" />
      <el-table-column prop="registerTotal" label="累计注册" width="90" align="center" />
      <el-table-column prop="registerDirect" label="直接注册" width="90" align="center" />
      <el-table-column label="传导" width="110" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.propagateEnabled" size="small" type="warning">已开·{{ row.maxDepth }}层</el-tag>
          <el-tag v-else size="small" type="info">关</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status"
            :active-value="1"
            :inactive-value="0"
            :loading="togglingId === row.id"
            @change="(v: string | number | boolean) => toggleStatus(row, Number(v))"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="210" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row)">配置详情</el-button>
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有邀请码，点右上角「新建」创建一个" />
      </template>
    </el-table>

    <el-pagination
      class="invite-code-page__pager"
      background
      layout="total, prev, pager, next"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      @current-change="onPage"
    />

    <el-dialog v-model="formVisible" :title="isEdit ? '编辑邀请码' : '新建邀请码'" width="560px" destroy-on-close>
      <el-form :model="form" label-width="120px">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="32" show-word-limit placeholder="给运营看的备注名" />
        </el-form-item>
        <el-form-item label="类型">
          <template v-if="isEdit">
            <el-tag v-if="form.source === 1" size="small" type="success">绑定用户</el-tag>
            <el-tag v-else size="small">独立推广码</el-tag>
          </template>
          <el-radio-group v-else v-model="form.source">
            <el-radio :label="0">独立推广码</el-radio>
            <el-radio :label="1">绑定用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.source === 1" label="绑定用户">
          <template v-if="isEdit">
            <div>
              <div class="invite-code-page__name">{{ ownerNickName || "—" }}</div>
              <div class="invite-code-page__id">微聊号 {{ ownerWeliaoId || "—" }}</div>
            </div>
          </template>
          <template v-else>
            <el-button @click="openOwnerPicker">
              {{ form.ownerUserId ? "重新选择" : "选择用户" }}
            </el-button>
            <span v-if="form.ownerUserId" class="invite-code-page__owner">
              {{ ownerNickName || form.ownerUserId }}（微聊号 {{ ownerWeliaoId || "—" }}）
            </span>
          </template>
        </el-form-item>
        <el-form-item v-if="!isEdit && form.source === 0" label="邀请码">
          <el-input v-model="form.code" maxlength="32" placeholder="留空自动生成" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="邀请码">
          <span class="invite-code-page__code">{{ form.code }}</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="开启传导">
          <el-switch v-model="form.propagateEnabled" />
          <span class="invite-code-page__hint">开启后下级注册也会计入这个码的上级链</span>
        </el-form-item>
        <el-form-item v-if="form.propagateEnabled" label="传导层数（1=仅直接注册的下级，2=再往下一级…）">
          <el-input-number v-model="form.maxDepth" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ownerPickerVisible" title="选择绑定用户" width="720px" destroy-on-close>
      <el-form :inline="true" @submit.prevent="searchUsers">
        <el-form-item>
          <el-input
            v-model="userKeyword"
            placeholder="昵称 / 微聊号 / 邮箱 / 手机号"
            clearable
            style="width: 280px"
            @keyup.enter="searchUsers"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="userLoading" @click="searchUsers">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="userLoading" :data="userList" border stripe max-height="360">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="invite-code-page__user">
              <el-avatar :src="row.avatar" :size="32">{{ (row.nickName || row.id).slice(0, 1) }}</el-avatar>
              <div>
                <div class="invite-code-page__name">{{ row.nickName || "未设置昵称" }}</div>
                <div class="invite-code-page__id">微聊号 {{ row.weliaoId || "—" }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="账号" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.email || row.phone || "—" }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="chooseOwner(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="invite-code-page__pager"
        background
        layout="total, prev, pager, next"
        :current-page="userPage"
        :page-size="userPageSize"
        :total="userTotal"
        @current-change="onUserPage"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IInviteConfigItem } from "@/types/api/inviteCode"
import type { IUserInfo } from "@/types/api/user"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createInviteConfigApi,
  deleteInviteConfigApi,
  getInviteConfigListApi,
  updateInviteConfigApi
} from "@/api/inviteCode"
import { getUserListApi } from "@/api/user"
import { defineComponent, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"

export default defineComponent({
  name: "OnboardingInviteCode",
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const saving = ref(false)
    const togglingId = ref(0)
    const list = ref<IInviteConfigItem[]>([])
    const keyword = ref("")
    const status = ref(-1)
    const source = ref(-1)
    const page = ref(1)
    const pageSize = 10
    const total = ref(0)

    const formVisible = ref(false)
    const isEdit = ref(false)
    const ownerNickName = ref("")
    const ownerWeliaoId = ref("")
    const form = reactive({
      id: 0,
      name: "",
      source: 0,
      ownerUserId: "",
      code: "",
      status: 1,
      propagateEnabled: false,
      maxDepth: 1,
      remark: ""
    })

    const ownerPickerVisible = ref(false)
    const userLoading = ref(false)
    const userKeyword = ref("")
    const userList = ref<IUserInfo[]>([])
    const userPage = ref(1)
    const userPageSize = 10
    const userTotal = ref(0)

    const load = async () => {
      loading.value = true
      const res = await getInviteConfigListApi({
        keyword: keyword.value.trim() || undefined,
        status: status.value,
        source: source.value,
        page: page.value,
        pageSize
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

    const onPage = (p: number) => {
      page.value = p
      load()
    }

    const openCreate = () => {
      isEdit.value = false
      ownerNickName.value = ""
      ownerWeliaoId.value = ""
      Object.assign(form, {
        id: 0,
        name: "",
        source: 0,
        ownerUserId: "",
        code: "",
        status: 1,
        propagateEnabled: false,
        maxDepth: 1,
        remark: ""
      })
      formVisible.value = true
    }

    const openEdit = (row: IInviteConfigItem) => {
      isEdit.value = true
      ownerNickName.value = row.ownerNickName
      ownerWeliaoId.value = row.ownerWeliaoId
      Object.assign(form, {
        id: row.id,
        name: row.name,
        source: row.source,
        ownerUserId: row.ownerUserId,
        code: row.code,
        status: row.status,
        propagateEnabled: row.propagateEnabled,
        maxDepth: row.maxDepth || 1,
        remark: row.remark
      })
      formVisible.value = true
    }

    const loadUsers = async () => {
      userLoading.value = true
      const res = await getUserListApi({
        page: userPage.value,
        pageSize: userPageSize,
        keyword: userKeyword.value.trim() || undefined,
        status: 1
      })
      userLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "搜索用户失败")
        return
      }
      userList.value = res.result?.list || []
      userTotal.value = res.result?.total || 0
    }

    const openOwnerPicker = () => {
      userKeyword.value = ""
      userPage.value = 1
      ownerPickerVisible.value = true
      loadUsers()
    }

    const searchUsers = () => {
      userPage.value = 1
      loadUsers()
    }

    const onUserPage = (p: number) => {
      userPage.value = p
      loadUsers()
    }

    const chooseOwner = (row: IUserInfo) => {
      form.ownerUserId = row.id
      ownerNickName.value = row.nickName
      ownerWeliaoId.value = row.weliaoId
      ownerPickerVisible.value = false
    }

    const submitForm = async () => {
      if (isEdit.value) {
        saving.value = true
        const res = await updateInviteConfigApi({
          id: form.id,
          name: form.name.trim(),
          status: form.status,
          propagateEnabled: form.propagateEnabled,
          maxDepth: form.maxDepth,
          remark: form.remark.trim()
        })
        saving.value = false
        if (res.code !== 0) {
          ElMessage.error(res.msg || "保存失败")
          return
        }
        ElMessage.success("已保存")
        formVisible.value = false
        load()
        return
      }

      if (form.source === 1 && !form.ownerUserId) {
        ElMessage.warning("请选择要绑定的用户")
        return
      }
      saving.value = true
      const res = await createInviteConfigApi({
        name: form.name.trim() || undefined,
        source: form.source,
        ownerUserId: form.source === 1 ? form.ownerUserId : undefined,
        code: form.source === 0 ? form.code.trim() || undefined : undefined,
        propagateEnabled: form.propagateEnabled,
        maxDepth: form.maxDepth,
        status: form.status,
        remark: form.remark.trim() || undefined
      })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "创建失败")
        return
      }
      ElMessage.success(`已创建，邀请码 ${res.result?.code ?? ""}`)
      formVisible.value = false
      search()
    }

    const toggleStatus = async (row: IInviteConfigItem, next: number) => {
      togglingId.value = row.id
      const res = await updateInviteConfigApi({ id: row.id, status: next })
      togglingId.value = 0
      if (res.code !== 0) {
        ElMessage.error(res.msg || "更新失败")
        return
      }
      row.status = next
    }

    const handleDelete = async (row: IInviteConfigItem) => {
      await ElMessageBox.confirm(
        `确认删除邀请码「${row.code}」？之后无法再用它注册，已注册的用户不受影响。`,
        "删除邀请码",
        { type: "warning" }
      )
      const res = await deleteInviteConfigApi(row.id)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      load()
    }

    const goDetail = (row: IInviteConfigItem) => {
      router.push({ path: "/onboarding/invite-code/detail", query: { id: String(row.id) } })
    }

    onMounted(load)

    return {
      loading,
      saving,
      togglingId,
      list,
      keyword,
      status,
      source,
      page,
      pageSize,
      total,
      formVisible,
      isEdit,
      form,
      ownerNickName,
      ownerWeliaoId,
      ownerPickerVisible,
      userLoading,
      userKeyword,
      userList,
      userPage,
      userPageSize,
      userTotal,
      search,
      onPage,
      openCreate,
      openEdit,
      openOwnerPicker,
      searchUsers,
      onUserPage,
      chooseOwner,
      submitForm,
      toggleStatus,
      handleDelete,
      goDetail
    }
  }
})
</script>

<style lang="less" scoped>
.invite-code-page {
  padding: 8px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 16px;
  }

  &__title {
    margin: 0 0 6px;
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    max-width: 720px;
    line-height: 1.5;
  }

  &__filter {
    margin-bottom: 12px;
  }

  &__code {
    font-family: var(--el-font-family, monospace);
    font-weight: 600;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__name {
    font-weight: 500;
  }

  &__id {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__hint {
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__owner {
    margin-left: 12px;
    color: var(--el-text-color-regular);
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
