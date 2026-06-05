<template>
  <div class="system-menus">
    <el-card>
      <template #header>
        <div class="system-menus__header">
          <span>菜单管理</span>
          <el-button type="primary" @click="handleCreate">新增菜单</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="menuList" border stripe row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="parentId" label="父级ID" width="90" />
        <el-table-column prop="title" label="标题" width="140" />
        <el-table-column prop="name" label="路由名" width="140" />
        <el-table-column prop="path" label="路径" min-width="180" show-overflow-tooltip />
        <el-table-column prop="icon" label="图标" width="120" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="隐藏" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hidden ? 'danger' : 'success'" size="small">
              {{ row.hidden ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无菜单数据" />
        </template>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : '新增菜单'" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="父级ID">
          <el-input-number v-model="form.parentId" :min="0" />
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="菜单标题" />
        </el-form-item>
        <el-form-item label="路由名" required>
          <el-input v-model="form.name" placeholder="路由 name" />
        </el-form-item>
        <el-form-item label="路径" required>
          <el-input v-model="form.path" placeholder="/xxx/yyy" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="图标标识" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="隐藏">
          <el-switch v-model="form.hidden" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IGetMenuListItem } from "@/types/api/system"
import { ElMessage, ElMessageBox } from "element-plus"
import { createMenuApi, deleteMenuApi, getMenuListApi, updateMenuApi } from "@/api/system"

export default defineComponent({
  setup() {
    const loading = ref(false)
    const menuList = ref<IGetMenuListItem[]>([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)

    const form = reactive({
      id: 0,
      parentId: 0,
      path: "",
      name: "",
      title: "",
      icon: "",
      sort: 0,
      hidden: false
    })

    const resetForm = () => {
      form.id = 0
      form.parentId = 0
      form.path = ""
      form.name = ""
      form.title = ""
      form.icon = ""
      form.sort = 0
      form.hidden = false
    }

    const fetchMenuList = async () => {
      loading.value = true
      const res = await getMenuListApi({})
      loading.value = false
      if (res.code === 0) {
        menuList.value = res.result.list || []
      } else {
        ElMessage.error(res.msg || "获取菜单失败")
      }
    }

    const handleCreate = () => {
      resetForm()
      isEdit.value = false
      dialogVisible.value = true
    }

    const handleEdit = (row: IGetMenuListItem) => {
      isEdit.value = true
      form.id = row.id
      form.parentId = row.parentId
      form.path = row.path
      form.name = row.name
      form.title = row.title
      form.icon = row.icon
      form.sort = row.sort
      form.hidden = row.hidden
      dialogVisible.value = true
    }

    const handleDelete = async (row: IGetMenuListItem) => {
      await ElMessageBox.confirm(`确认删除菜单「${row.title}」？`, "提示", { type: "warning" })
      const res = await deleteMenuApi({ id: row.id })
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchMenuList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleSubmit = async () => {
      if (!form.path || !form.name || !form.title) {
        ElMessage.warning("请填写必填项")
        return
      }
      const res = isEdit.value
        ? await updateMenuApi({ ...form })
        : await createMenuApi({ ...form })
      if (res.code === 0) {
        ElMessage.success(isEdit.value ? "更新成功" : "创建成功")
        dialogVisible.value = false
        fetchMenuList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    onMounted(fetchMenuList)

    return {
      loading,
      menuList,
      dialogVisible,
      isEdit,
      form,
      handleCreate,
      handleEdit,
      handleDelete,
      handleSubmit,
      fetchMenuList
    }
  }
})
</script>

<style lang="less" scoped>
.system-menus {
  padding: 16px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
