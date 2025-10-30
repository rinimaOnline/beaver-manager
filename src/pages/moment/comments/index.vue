<script lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import { defineComponent, reactive, ref } from "vue"
import { deleteMomentCommentApi, getMomentCommentListApi } from "@/api/moment"

export default defineComponent({
  setup() {
    // 响应式数据
    const loading = ref(false)
    const commentList = ref([])

    // 搜索表单
    const searchForm = reactive({
      momentId: ""
    })

    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 获取评论列表
    const fetchCommentList = async () => {
      if (!searchForm.momentId) {
        ElMessage.warning("请输入动态ID进行查询")
        return
      }

      try {
        loading.value = true
        const res = await getMomentCommentListApi({
          page: pagination.page,
          limit: pagination.pageSize,
          momentId: Number.parseInt(searchForm.momentId)
        })
        if (res.code === 0) {
          commentList.value = res.result.list
          pagination.total = res.result.total
        } else {
          ElMessage.error(res.msg || "获取评论列表失败")
        }
      } catch {
        ElMessage.error("获取评论列表失败")
      } finally {
        loading.value = false
      }
    }

    // 事件处理
    const handleSearch = () => {
      pagination.page = 1
      fetchCommentList()
    }

    const handleReset = () => {
      searchForm.momentId = ""
      commentList.value = []
      pagination.total = 0
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchCommentList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchCommentList()
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确认删除用户 ${row.userId} 的这条评论吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })

        const res = await deleteMomentCommentApi(row.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          fetchCommentList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败")
        }
      }
    }

    return {
      loading,
      commentList,
      searchForm,
      pagination,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleDelete
    }
  }
})
</script>

<template>
  <div class="moment-comments-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">评论管理</span>
          <el-tag type="info" size="small">
            共 {{ pagination.total }} 条评论
          </el-tag>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="动态ID">
            <el-input
              v-model="searchForm.momentId"
              placeholder="请输入动态ID"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <div class="table-section">
        <el-table
          :data="commentList"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="评论ID" width="100" />
          <el-table-column prop="momentId" label="动态ID" width="100" />
          <el-table-column prop="userId" label="用户ID" width="120" show-overflow-tooltip />
          <el-table-column prop="content" label="评论内容" min-width="400" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="评论时间" width="180" />
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(row)"
              >
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
  </div>
</template>

<style lang="less" scoped>
.moment-comments-container {
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

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-right: 12px;
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
</style>
