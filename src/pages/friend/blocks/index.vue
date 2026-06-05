<template>
  <div class="friend-blocks">
    <div class="friend-blocks__header">
      <h2 class="friend-blocks__title">拉黑记录</h2>
      <p class="friend-blocks__hint">社交关系域拉黑审计，风控视角请见「风控中心 → 社交黑名单」</p>
      <el-tag type="info">共 {{ pagination.total }} 条</el-tag>
    </div>

    <el-form :inline="true" class="friend-blocks__form">
      <el-form-item label="拉黑方ID">
        <el-input v-model="searchForm.userId" placeholder="用户ID" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="被拉黑方ID">
        <el-input v-model="searchForm.blockedUserId" placeholder="用户ID" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="friend-blocks__toolbar">
      <el-button type="warning" :disabled="!selectedIds.length" @click="handleBatchUnblock">批量解除拉黑</el-button>
    </div>

    <el-table v-loading="loading" :data="blockList" border stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="userId" label="拉黑方ID" width="140" show-overflow-tooltip />
      <el-table-column prop="userName" label="拉黑方昵称" width="140" />
      <el-table-column prop="blockedUserId" label="被拉黑方ID" width="140" show-overflow-tooltip />
      <el-table-column prop="blockedUserName" label="被拉黑方昵称" width="140" />
      <el-table-column prop="createTime" label="拉黑时间" min-width="180" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.userId)">拉黑方360</el-button>
          <el-button link type="primary" @click="goUser(row.blockedUserId)">被拉黑360</el-button>
          <el-button link type="warning" @click="handleUnblock(row)">解除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无黑名单记录" />
      </template>
    </el-table>

    <el-pagination
      class="friend-blocks__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />
  </div>
</template>

<script lang="ts">
import type { IFriendBlockInfo } from "@/types/api/friend"
import { ElMessage, ElMessageBox } from "element-plus"
import { getFriendBlockListApi, unblockFriendUsersApi } from "@/api/friend"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const blockList = ref<IFriendBlockInfo[]>([])
    const selectedIds = ref<string[]>([])
    const searchForm = reactive({ userId: "", blockedUserId: "" })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const fetchBlockList = async () => {
      loading.value = true
      const res = await getFriendBlockListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        userId: searchForm.userId || undefined,
        blockedUserId: searchForm.blockedUserId || undefined
      })
      loading.value = false
      if (res.code === 0) {
        blockList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取黑名单失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchBlockList()
    }

    const handleReset = () => {
      searchForm.userId = ""
      searchForm.blockedUserId = ""
      handleSearch()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchBlockList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchBlockList()
    }

    const handleSelectionChange = (rows: IFriendBlockInfo[]) => {
      selectedIds.value = rows.map(r => r.id)
    }

    const handleUnblock = async (row: IFriendBlockInfo) => {
      await ElMessageBox.confirm(
        `确认解除「${row.userName || row.userId}」对「${row.blockedUserName || row.blockedUserId}」的拉黑？`,
        "解除拉黑",
        { type: "warning" }
      )
      const res = await unblockFriendUsersApi({ ids: [row.id] })
      if (res.code === 0) {
        ElMessage.success("已解除拉黑")
        fetchBlockList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const handleBatchUnblock = async () => {
      if (!selectedIds.value.length) {
        ElMessage.warning("请选择记录")
        return
      }
      await ElMessageBox.confirm(`确认批量解除 ${selectedIds.value.length} 条拉黑记录？`, "批量解除", { type: "warning" })
      const res = await unblockFriendUsersApi({ ids: selectedIds.value })
      if (res.code === 0) {
        ElMessage.success("批量解除成功")
        fetchBlockList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(() => {
      const q = useRoute().query.userId as string
      if (q) searchForm.userId = q
      fetchBlockList()
    })

    return {
      loading, blockList, searchForm, pagination, selectedIds,
      handleSearch, handleReset, onSizeChange, onPageChange,
      handleSelectionChange, handleUnblock, handleBatchUnblock, goUser
    }
  }
})
</script>

<style lang="less">
.friend-blocks {
  padding: 20px;

  .friend-blocks__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .friend-blocks__title {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 12px;
    }

    .friend-blocks__hint {
      flex: 1;
      margin: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .friend-blocks__form {
    margin-bottom: 12px;
  }

  .friend-blocks__toolbar {
    margin-bottom: 12px;
  }

  .friend-blocks__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
