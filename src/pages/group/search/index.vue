<template>
  <div class="group-search">
    <div class="page-header">
      <h2>群组检索</h2>
      <p class="hint">按群名称或群ID检索，点击可进入群组360、群消息审计</p>
    </div>

    <el-form :inline="true" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="keyword" placeholder="群名 / 群ID" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">检索</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="groupList" border stripe>
      <el-table-column prop="uuid" label="群ID" min-width="160" />
      <el-table-column prop="title" label="群名称" min-width="140" />
      <el-table-column prop="creatorId" label="群主" width="140" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 3 ? 'danger' : 'success'" size="small">
            {{ row.status === 3 ? "已解散" : "正常" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="goList(row.uuid)">群组360</el-button>
          <el-button link @click="goMessages(row.uuid)">群消息</el-button>
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
import type { GroupInfo } from "@/types/api/group"
import { ElMessage } from "element-plus"
import { getGroupListApi } from "@/api/group"

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const keyword = ref("")
    const loading = ref(false)
    const groupList = ref<GroupInfo[]>([])
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const fetchList = async () => {
      loading.value = true
      const res = await getGroupListApi({
        page: pagination.page,
        limit: pagination.pageSize,
        keywords: keyword.value || undefined
      })
      loading.value = false
      if (res.code === 0) {
        groupList.value = res.result.list || []
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

    const goList = (groupId: string) => {
      router.push(`/group/profile/${groupId}`)
    }

    const goMessages = (groupId: string) => {
      router.push({ path: "/group/messages", query: { groupId } })
    }

    onMounted(() => {
      const q = route.query.groupId as string
      if (q) keyword.value = q
      fetchList()
    })

    return { keyword, loading, groupList, pagination, handleSearch, onPageChange, goList, goMessages }
  }
})
</script>

<style lang="less">
.group-search {
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
