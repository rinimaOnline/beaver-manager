<template>
  <div class="user-search">
    <div class="page-header">
      <h2>用户检索</h2>
      <p class="hint">检索后进入用户360查看完整运营数据</p>
    </div>

    <el-form :inline="true" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="keyword" placeholder="昵称 / 邮箱 / 用户ID" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">检索</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="userList" border stripe @row-click="onRowClick">
      <el-table-column prop="id" label="用户ID" min-width="160" />
      <el-table-column prop="nickName" label="昵称" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 2 ? 'danger' : 'success'" size="small">
            {{ row.status === 2 ? "禁用" : "正常" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click.stop="openProfile(row.id)">用户360</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />
  </div>
</template>

<script lang="ts">
import type { IUserInfo } from "@/types/api/user"
import { ElMessage } from "element-plus"
import { getUserListApi } from "@/api/user"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const keyword = ref("")
    const loading = ref(false)
    const userList = ref<IUserInfo[]>([])
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const fetchList = async () => {
      loading.value = true
      const res = await getUserListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: keyword.value || undefined
      })
      loading.value = false
      if (res.code === 0) {
        userList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "检索失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const onPageChange = (p: number) => {
      pagination.page = p
      fetchList()
    }

    const openProfile = (userId: string) => router.push(`/user/profile/${userId}`)
    const onRowClick = (row: IUserInfo) => openProfile(row.id)

    onMounted(() => {
      const q = route.query.keyword as string
      if (q) {
        keyword.value = q
      }
      fetchList()
    })

    return {
      keyword, loading, userList, pagination,
      handleSearch, onPageChange, openProfile, onRowClick
    }
  }
})
</script>

<style lang="less">
.user-search {
  padding: 20px;

  .page-header {
    margin-bottom: 16px;
    h2 { margin: 0 0 4px; }
    .hint { color: #909399; font-size: 13px; margin: 0; }
  }

  .search-form { margin-bottom: 12px; }
  .pagination { margin-top: 16px; justify-content: flex-end; }
}
</style>
