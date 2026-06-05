<template>
  <div class="risk-blocklist">
    <div class="risk-blocklist__header">
      <h2 class="risk-blocklist__title">社交黑名单</h2>
      <p class="risk-blocklist__hint">用户主动拉黑关系，辅助判断骚扰与冲突风险</p>
    </div>

    <el-form :inline="true" class="risk-blocklist__form">
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userId" placeholder="拉黑方" clearable />
      </el-form-item>
      <el-form-item label="被拉黑ID">
        <el-input v-model="searchForm.blockedUserId" placeholder="被拉黑方" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button link type="primary" @click="goFriendBlocks">好友拉黑管理</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="blockList" border stripe>
      <el-table-column prop="userName" label="用户" width="120" />
      <el-table-column prop="userId" label="用户ID" min-width="130" />
      <el-table-column prop="blockedUserName" label="被拉黑" width="120" />
      <el-table-column prop="blockedUserId" label="被拉黑ID" min-width="130" />
      <el-table-column prop="createTime" label="时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="goUser(row.userId)">用户360</el-button>
          <el-button type="warning" link @click="handleUnblock(row)">解除拉黑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="risk-blocklist__pagination"
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
import type { IFriendBlockInfo } from "@/types/api/friend"
import { ElMessage, ElMessageBox } from "element-plus"
import { getFriendBlockListApi, unblockFriendUsersApi } from "@/api/friend"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const blockList = ref<IFriendBlockInfo[]>([])
    const searchForm = reactive({ userId: "", blockedUserId: "" })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const fetchList = async () => {
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
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const handleReset = () => {
      searchForm.userId = ""
      searchForm.blockedUserId = ""
      handleSearch()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    const goFriendBlocks = () => router.push("/friend/blocks")

    const handleUnblock = async (row: IFriendBlockInfo) => {
      await ElMessageBox.confirm(
        `确认解除「${row.userName || row.userId}」对「${row.blockedUserName || row.blockedUserId}」的拉黑？`,
        "解除拉黑",
        { type: "warning" }
      )
      const res = await unblockFriendUsersApi({ ids: [row.id] })
      if (res.code === 0) {
        ElMessage.success("已解除拉黑")
        fetchList()
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    }

    onMounted(fetchList)

    return {
      loading, blockList, searchForm, pagination,
      handleSearch, handleReset, onPageChange, goUser, goFriendBlocks, handleUnblock
    }
  }
})
</script>

<style lang="less">
.risk-blocklist {
  padding: 20px;

  .risk-blocklist__header {
    margin-bottom: 16px;

    .risk-blocklist__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .risk-blocklist__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .risk-blocklist__form {
    margin-bottom: 12px;
  }

  .risk-blocklist__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
