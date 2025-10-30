<script lang="ts">
import type { FormInstance } from "element-plus"
import type { IBucketInfo } from "@/types/api/track"
import type { IApiResponse } from "@/types/auth"

import { ElMessage, ElMessageBox } from "element-plus"
import {
  getBucketListApi,
  createBucketApi,
  updateBucketApi,
  deleteBucketApi
} from "@/api/track"

export default defineComponent({
  setup() {
    // 响应式数据
    const loading = ref(false)
    const submitting = ref(false)
    const bucketList = ref<IBucketInfo[]>([])
    const selectedBucketIds = ref<string[]>([])

    // 搜索表单
    const searchForm = reactive({
      keyword: "",
      isActive: undefined as boolean | undefined
    })

    // 弹窗控制
    const showCreateDialog = ref(false)
    const showDetailDialog = ref(false)
    const isEdit = ref(false)

    // Bucket 表单
    const bucketForm = reactive({
      uuid: "",
      name: "",
      description: "",
      isActive: true
    })

    // 当前查看的 Bucket 详情
    const currentBucket = ref<IBucketInfo | null>(null)

    // 表单引用
    const bucketFormRef = ref<FormInstance>()

    // 表单验证规则
    const bucketFormRules = {
      name: [
        { required: true, message: "请输入 Bucket 名称", trigger: "blur" },
        { min: 2, max: 50, message: "名称长度在 2 到 50 个字符", trigger: "blur" }
      ],
      description: [
        { required: true, message: "请输入 Bucket 描述", trigger: "blur" },
        { max: 200, message: "描述不能超过 200 个字符", trigger: "blur" }
      ]
    }

    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 获取 Bucket 列表
    const fetchBucketList = async () => {
      try {
        loading.value = true
        const response: IApiResponse<any> = await getBucketListApi({
          page: pagination.page,
          pageSize: pagination.pageSize,
          keyword: searchForm.keyword || undefined,
          isActive: searchForm.isActive
        })

        if (response.code === 0) {
          bucketList.value = response.result.list
          pagination.total = response.result.total
        } else {
          ElMessage.error(response.msg || "获取 Bucket 列表失败")
        }
      } catch (error) {
        ElMessage.error((error as any)?.message || "获取 Bucket 列表失败")
      } finally {
        loading.value = false
      }
    }

    // 工具函数
    const getStatusType = (isActive: boolean) => {
      return isActive ? "success" : "danger"
    }

    const getStatusText = (isActive: boolean) => {
      return isActive ? "激活" : "停用"
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchBucketList()
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        keyword: "",
        isActive: undefined
      })
      pagination.page = 1
      fetchBucketList()
    }

    const handleSelectionChange = (selection: IBucketInfo[]) => {
      selectedBucketIds.value = selection.map(item => item.uuid)
    }

    const handleCreate = () => {
      isEdit.value = false
      Object.assign(bucketForm, {
        uuid: "",
        name: "",
        description: "",
        isActive: true
      })
      showCreateDialog.value = true
    }

    const handleEdit = (row: IBucketInfo) => {
      isEdit.value = true
      Object.assign(bucketForm, {
        uuid: row.uuid,
        name: row.name,
        description: row.description,
        isActive: row.isActive
      })
      showCreateDialog.value = true
    }

    const handleViewDetail = (row: IBucketInfo) => {
      currentBucket.value = row
      showDetailDialog.value = true
    }

    const handleDelete = async (row: IBucketInfo) => {
      try {
        await ElMessageBox.confirm(`确认删除 Bucket "${row.name}" 吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const response: IApiResponse<any> = await deleteBucketApi({
          uuid: row.uuid
        })

        if (response.code === 0) {
          ElMessage.success("删除成功")
          fetchBucketList()
        } else {
          ElMessage.error(response.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error((error as any)?.message || "删除失败")
        }
      }
    }

    const handleSubmit = async () => {
      if (!bucketFormRef.value) return

      try {
        await bucketFormRef.value.validate()
        submitting.value = true

        let response: IApiResponse<any>

        if (isEdit.value) {
          response = await updateBucketApi({
            uuid: bucketForm.uuid,
            name: bucketForm.name,
            description: bucketForm.description,
            isActive: bucketForm.isActive
          })
        } else {
          response = await createBucketApi({
            name: bucketForm.name,
            description: bucketForm.description
          })
        }

        if (response.code === 0) {
          ElMessage.success(isEdit.value ? "更新成功" : "创建成功")
          showCreateDialog.value = false
          fetchBucketList()
        } else {
          ElMessage.error(response.msg || (isEdit.value ? "更新失败" : "创建失败"))
        }
      } catch (error) {
        if (typeof error === "string") return
        ElMessage.error((error as any)?.message || (isEdit.value ? "更新失败" : "创建失败"))
      } finally {
        submitting.value = false
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

    // 生命周期
    onMounted(() => {
      fetchBucketList()
    })

    return {
      loading,
      submitting,
      bucketList,
      selectedBucketIds,
      searchForm,
      showCreateDialog,
      showDetailDialog,
      isEdit,
      bucketForm,
      currentBucket,
      bucketFormRef,
      bucketFormRules,
      pagination,
      getStatusType,
      getStatusText,
      handleSearch,
      handleReset,
      handleSelectionChange,
      handleCreate,
      handleEdit,
      handleViewDetail,
      handleDelete,
      handleSubmit,
      handleCancel,
      handlePageChange,
      handleSizeChange
    }
  }
})
</script>

<template>
  <div class="track-buckets-page">
    <div class="page-header">
      <div class="page-title">
        <h2>Bucket 管理</h2>
        <p>管理数据统计的 Bucket 配置</p>
      </div>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词" prop="keyword">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入 Bucket 名称或描述"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-select
            v-model="searchForm.isActive"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="激活" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleCreate">
            新建 Bucket
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="bucketList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="Bucket 名称" min-width="150">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createUser" label="创建者" width="120" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.isActive)">
              {{ getStatusText(row.isActive) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column prop="updatedAt" label="更新时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
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
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑 Bucket 弹窗 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEdit ? '编辑 Bucket' : '新建 Bucket'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="bucketFormRef"
        :model="bucketForm"
        :rules="bucketFormRules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="bucketForm.name"
            placeholder="请输入 Bucket 名称"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="bucketForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入 Bucket 描述"
          />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="isActive">
          <el-switch
            v-model="bucketForm.isActive"
            active-text="激活"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? "更新" : "创建" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Bucket 详情弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      title="Bucket 详情"
      width="600px"
    >
      <div v-if="currentBucket" class="bucket-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="UUID">
            {{ currentBucket.uuid }}
          </el-descriptions-item>
          <el-descriptions-item label="名称">
            {{ currentBucket.name }}
          </el-descriptions-item>
          <el-descriptions-item label="创建者">
            {{ currentBucket.createUser }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentBucket.isActive)">
              {{ getStatusText(currentBucket.isActive) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentBucket.description }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ currentBucket.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ currentBucket.updatedAt }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.track-buckets-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      h2 {
        margin: 0 0 8px 0;
        color: #303133;
        font-size: 20px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .table-card {
    border-radius: 8px;
    
    .el-table {
      .el-link {
        font-weight: 500;
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .bucket-detail {
    .el-descriptions {
      :deep(.el-descriptions__label) {
        font-weight: 600;
      }
    }
  }
}
</style> 