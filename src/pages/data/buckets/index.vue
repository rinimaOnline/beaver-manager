<template>
  <div class="data-buckets">
    <div class="data-buckets__header">
      <h2 class="data-buckets__title">埋点 Bucket</h2>
      <p class="data-buckets__hint">管理数据采集 Bucket，支持创建、启停与跳转事件统计</p>
    </div>

    <el-form :inline="true" class="data-buckets__form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="名称/描述" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.isActive" placeholder="全部" clearable style="width: 120px">
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleCreate">新建</el-button>
        <el-button link type="primary" @click="goEvents">事件统计</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="bucketList" border stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="名称" min-width="150">
        <template #default="{ row }">
          <el-link type="primary" @click="handleViewDetail(row)">{{ row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createUser" label="创建人" width="120" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.isActive)">{{ getStatusText(row.isActive) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link @click="handleViewDetail(row)">详情</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="data-buckets__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <el-dialog v-model="showCreateDialog" :title="isEdit ? '编辑 Bucket' : '新建 Bucket'" width="500px">
      <el-form ref="bucketFormRef" :model="bucketForm" :rules="bucketFormRules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="bucketForm.name" placeholder="Bucket 名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="bucketForm.description" type="textarea" :rows="3" placeholder="用途说明" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态">
          <el-switch v-model="bucketForm.isActive" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ isEdit ? "保存" : "创建" }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="Bucket 详情" width="560px">
      <el-descriptions v-if="currentBucket" :column="2" border>
        <el-descriptions-item label="UUID" :span="2">{{ currentBucket.uuid }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ currentBucket.name }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentBucket.createUser }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentBucket.isActive)">{{ getStatusText(currentBucket.isActive) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentBucket.description }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentBucket.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentBucket.updatedAt }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button link type="primary" @click="goEventsWithBucket">查看事件统计</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance } from "element-plus"
import type { IBucketInfo } from "@/types/api/track"
import { ElMessage, ElMessageBox } from "element-plus"
import { createBucketApi, deleteBucketApi, getBucketListApi, updateBucketApi } from "@/api/track"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const submitting = ref(false)
    const bucketList = ref<IBucketInfo[]>([])
    const selectedBucketIds = ref<string[]>([])
    const searchForm = reactive({ keyword: "", isActive: undefined as boolean | undefined })
    const showCreateDialog = ref(false)
    const showDetailDialog = ref(false)
    const isEdit = ref(false)
    const bucketForm = reactive({ uuid: "", name: "", description: "", isActive: true })
    const currentBucket = ref<IBucketInfo | null>(null)
    const bucketFormRef = ref<FormInstance>()
    const bucketFormRules = {
      name: [
        { required: true, message: "请输入 Bucket 名称", trigger: "blur" },
        { min: 2, max: 50, message: "名称长度 2-50 字符", trigger: "blur" }
      ],
      description: [
        { required: true, message: "请输入描述", trigger: "blur" },
        { max: 200, message: "描述不超过 200 字符", trigger: "blur" }
      ]
    }
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const fetchBucketList = async () => {
      loading.value = true
      const res = await getBucketListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        isActive: searchForm.isActive
      })
      loading.value = false
      if (res.code === 0) {
        bucketList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载 Bucket 列表失败")
      }
    }

    const getStatusType = (isActive: boolean) => (isActive ? "success" : "danger")
    const getStatusText = (isActive: boolean) => (isActive ? "启用" : "停用")

    const handleSearch = () => {
      pagination.page = 1
      fetchBucketList()
    }

    const handleReset = () => {
      searchForm.keyword = ""
      searchForm.isActive = undefined
      handleSearch()
    }

    const handleSelectionChange = (selection: IBucketInfo[]) => {
      selectedBucketIds.value = selection.map(item => item.uuid)
    }

    const handleCreate = () => {
      isEdit.value = false
      Object.assign(bucketForm, { uuid: "", name: "", description: "", isActive: true })
      showCreateDialog.value = true
    }

    const handleEdit = (row: IBucketInfo) => {
      isEdit.value = true
      Object.assign(bucketForm, { uuid: row.uuid, name: row.name, description: row.description, isActive: row.isActive })
      showCreateDialog.value = true
    }

    const handleViewDetail = (row: IBucketInfo) => {
      currentBucket.value = row
      showDetailDialog.value = true
    }

    const handleDelete = async (row: IBucketInfo) => {
      await ElMessageBox.confirm(`确认删除 Bucket「${row.name}」？`, "删除", { type: "warning" })
      const res = await deleteBucketApi({ uuid: row.uuid })
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchBucketList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleSubmit = async () => {
      if (!bucketFormRef.value) return
      await bucketFormRef.value.validate()
      submitting.value = true
      const res = isEdit.value
        ? await updateBucketApi({ uuid: bucketForm.uuid, name: bucketForm.name, description: bucketForm.description, isActive: bucketForm.isActive })
        : await createBucketApi({ name: bucketForm.name, description: bucketForm.description })
      submitting.value = false
      if (res.code === 0) {
        ElMessage.success(isEdit.value ? "更新成功" : "创建成功")
        showCreateDialog.value = false
        fetchBucketList()
      } else {
        ElMessage.error(res.msg || (isEdit.value ? "更新失败" : "创建失败"))
      }
    }

    const handleCancel = () => {
      showCreateDialog.value = false
      bucketFormRef.value?.resetFields()
    }

    const handlePageChange = (page: number) => {
      pagination.page = page
      fetchBucketList()
    }

    const handleSizeChange = (size: number) => {
      pagination.pageSize = size
      pagination.page = 1
      fetchBucketList()
    }

    const goEvents = () => router.push("/data/events")

    const goEventsWithBucket = () => {
      if (!currentBucket.value) return
      router.push({ path: "/data/events", query: { bucketId: currentBucket.value.uuid } })
    }

    onMounted(fetchBucketList)

    return {
      loading, submitting, bucketList, selectedBucketIds, searchForm,
      showCreateDialog, showDetailDialog, isEdit, bucketForm, currentBucket,
      bucketFormRef, bucketFormRules, pagination,
      getStatusType, getStatusText, handleSearch, handleReset, handleSelectionChange,
      handleCreate, handleEdit, handleViewDetail, handleDelete, handleSubmit, handleCancel,
      handlePageChange, handleSizeChange, goEvents, goEventsWithBucket
    }
  }
})
</script>

<style lang="less" scoped>
.data-buckets {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__pagination { margin-top: 16px; justify-content: flex-end; }
}
</style>
