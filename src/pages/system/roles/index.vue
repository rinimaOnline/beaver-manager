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
  <div class="system-roles">
    <div class="system-roles__header">
      <h2 class="system-roles__title">角色与权限</h2>
      <el-button type="primary" @click="openCreate">新建角色</el-button>
    </div>

    <el-table v-loading="loading" :data="roleList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="角色名" min-width="120" />
      <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
      <el-table-column prop="menuCount" label="菜单数" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button type="warning" link @click="openMenus(row)">分配菜单</el-button>
          <el-button type="warning" link @click="openModules(row)">接口权限</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="formVisible" :title="isEdit ? '编辑角色' : '新建角色'" width="480px">
      <el-form label-width="80px">
        <el-form-item label="角色名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="menuVisible" title="分配菜单" width="520px">
      <el-tree
        ref="menuTreeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'title', children: 'children' }"
        default-expand-all
      />
      <template #footer>
        <el-button @click="menuVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitMenus">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="moduleVisible" title="接口权限" width="560px">
      <el-alert type="info" :closable="false" show-icon class="system-roles__hint">
        <template #title>
          这里控制该角色能调用哪些后台接口，和「分配菜单」不是一回事——菜单只管侧边栏能看到什么。
          没有勾选的模块，对应接口会直接返回无权访问。
        </template>
      </el-alert>
      <el-alert
        v-if="moduleIsSuper"
        type="warning"
        :closable="false"
        show-icon
        class="system-roles__hint"
        title="超级管理员角色豁免全部模块，无需也不能在此配置。"
      />
      <el-checkbox-group v-else v-model="checkedModules" class="system-roles__modules">
        <el-checkbox v-for="item in moduleList" :key="item.module" :value="item.module">
          {{ item.title }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="moduleVisible = false">取消</el-button>
        <el-button
          v-if="!moduleIsSuper"
          type="primary"
          :loading="saving"
          @click="submitModules"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IAdminModuleItem, IAuthorityInfo, IGetMenuListItem } from "@/types/api/system"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  createAuthorityApi,
  deleteAuthorityApi,
  getAuthorityListApi,
  getAuthorityMenusApi,
  getAuthorityModulesApi,
  getMenuListApi,
  listAdminModulesApi,
  updateAuthorityApi,
  updateAuthorityMenuApi,
  updateAuthorityModuleApi
} from "@/api/system"

interface IMenuTreeNode extends IGetMenuListItem {
  children?: IMenuTreeNode[]
}

export default defineComponent({
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const roleList = ref<IAuthorityInfo[]>([])
    const menuList = ref<IGetMenuListItem[]>([])
    const menuTree = ref<IMenuTreeNode[]>([])
    const formVisible = ref(false)
    const menuVisible = ref(false)
    const moduleVisible = ref(false)
    const moduleList = ref<IAdminModuleItem[]>([])
    const checkedModules = ref<string[]>([])
    const moduleIsSuper = ref(false)
    const isEdit = ref(false)
    const currentRoleId = ref(0)
    const menuTreeRef = ref()

    const form = reactive({
      id: 0,
      name: "",
      description: "",
      status: 1,
      sort: 0
    })

    const buildMenuTree = (list: IGetMenuListItem[]) => {
      const map = new Map<number, IMenuTreeNode>()
      const roots: IMenuTreeNode[] = []
      list.forEach(item => map.set(item.id, { ...item, children: [] }))
      list.forEach((item) => {
        const node = map.get(item.id)!
        if (item.parentId && map.has(item.parentId)) {
          map.get(item.parentId)!.children!.push(node)
        } else {
          roots.push(node)
        }
      })
      return roots
    }

    const fetchRoles = async () => {
      loading.value = true
      const res = await getAuthorityListApi()
      loading.value = false
      if (res.code === 0) {
        roleList.value = res.result.list || []
      } else {
        ElMessage.error(res.msg || "加载角色失败")
      }
    }

    const fetchMenus = async () => {
      const res = await getMenuListApi({})
      if (res.code === 0) {
        menuList.value = res.result.list || []
        menuTree.value = buildMenuTree(menuList.value)
      }
    }

    const openCreate = () => {
      isEdit.value = false
      form.id = 0
      form.name = ""
      form.description = ""
      form.status = 1
      form.sort = 0
      formVisible.value = true
    }

    const openEdit = (row: IAuthorityInfo) => {
      isEdit.value = true
      form.id = row.id
      form.name = row.name
      form.description = row.description
      form.status = row.status
      form.sort = row.sort
      formVisible.value = true
    }

    const submitForm = async () => {
      if (!form.name.trim()) {
        ElMessage.warning("请填写角色名")
        return
      }
      saving.value = true
      let res
      if (isEdit.value) {
        res = await updateAuthorityApi({
          id: form.id,
          name: form.name,
          description: form.description,
          status: form.status,
          sort: form.sort
        })
      } else {
        res = await createAuthorityApi({ name: form.name, description: form.description })
      }
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("保存成功")
        formVisible.value = false
        fetchRoles()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    const openModules = async (row: IAuthorityInfo) => {
      currentRoleId.value = row.id
      if (moduleList.value.length === 0) {
        const catalog = await listAdminModulesApi()
        if (catalog.code !== 0) {
          ElMessage.error(catalog.msg || "加载模块列表失败")
          return
        }
        moduleList.value = catalog.result.list || []
      }
      const res = await getAuthorityModulesApi(row.id)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载模块授权失败")
        return
      }
      moduleIsSuper.value = res.result.isSuper
      checkedModules.value = res.result.modules || []
      moduleVisible.value = true
    }

    const submitModules = async () => {
      saving.value = true
      const res = await updateAuthorityModuleApi({
        id: currentRoleId.value,
        modules: checkedModules.value
      })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      // 服务端授权缓存 30 秒，提示一下免得以为没保存成功
      ElMessage.success("已保存，最多 30 秒后生效")
      moduleVisible.value = false
    }

    const openMenus = async (row: IAuthorityInfo) => {
      currentRoleId.value = row.id
      await fetchMenus()
      const res = await getAuthorityMenusApi(row.id)
      menuVisible.value = true
      await nextTick()
      if (res.code === 0 && menuTreeRef.value) {
        menuTreeRef.value.setCheckedKeys(res.result.menuIds || [], false)
      }
    }

    const handleDelete = async (row: IAuthorityInfo) => {
      await ElMessageBox.confirm(`确认删除角色「${row.name}」？`, "删除角色", { type: "warning" })
      const res = await deleteAuthorityApi({ id: row.id })
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchRoles()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const submitMenus = async () => {
      if (!menuTreeRef.value) {
        return
      }
      const checked = menuTreeRef.value.getCheckedKeys(false) as number[]
      const half = menuTreeRef.value.getHalfCheckedKeys() as number[]
      const menuIds = [...new Set([...checked, ...half])]
      saving.value = true
      const res = await updateAuthorityMenuApi({
        id: currentRoleId.value,
        menus: menuIds.map(id => ({ id }))
      })
      saving.value = false
      if (res.code === 0) {
        ElMessage.success("菜单权限已更新")
        menuVisible.value = false
        fetchRoles()
      } else {
        ElMessage.error(res.msg || "保存失败")
      }
    }

    onMounted(fetchRoles)

    return {
      loading, saving, roleList, menuTree, formVisible, menuVisible, isEdit, form, menuTreeRef,
      moduleVisible, moduleList, checkedModules, moduleIsSuper,
      openCreate, openEdit, submitForm, openMenus, submitMenus, handleDelete,
      openModules, submitModules
    }
  }
})
</script>

<style lang="less">
.system-roles {
  padding: 20px;

  .system-roles__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .system-roles__title {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .system-roles__hint {
    margin-bottom: 12px;
  }

  .system-roles__modules {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}
</style>
