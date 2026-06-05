<template>
  <div class="friend-relations">
    <div class="friend-relations__header">
      <h2 class="friend-relations__title">好友关系</h2>
      <p class="friend-relations__hint">双向好友关系审计，支持批量删除与恢复，可跳转用户360</p>
    </div>

    <el-form :inline="true" class="friend-relations__form">
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userId" placeholder="用户ID" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="好友ID">
        <el-input v-model="searchForm.friendId" placeholder="好友ID" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.isDeleted" placeholder="状态" clearable style="width: 120px">
          <el-option label="正常" :value="false" />
          <el-option label="已删除" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始"
          end-placeholder="结束"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateRangeChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="friend-relations__toolbar">
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <el-table v-loading="loading" :data="friendList" border stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="sendUserId" label="发起用户ID" width="130" show-overflow-tooltip />
      <el-table-column prop="sendUserName" label="发起用户" width="120" show-overflow-tooltip />
      <el-table-column prop="revUserId" label="接收用户ID" width="130" show-overflow-tooltip />
      <el-table-column prop="revUserName" label="接收用户" width="120" show-overflow-tooltip />
      <el-table-column prop="isDeleted" label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isDeleted ? 'danger' : 'success'" size="small">{{ row.isDeleted ? "已删除" : "正常" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.sendUserId)">发起360</el-button>
          <el-button link type="primary" @click="goUser(row.revUserId)">接收360</el-button>
          <el-button link @click="handleViewDetail(row)">详情</el-button>
          <el-button v-if="!row.isDeleted" link type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button v-else link type="success" @click="handleRestore(row)">恢复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="friend-relations__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />

    <el-dialog v-model="showDetailDialog" title="好友关系详情" width="600px" :close-on-click-modal="false">
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关系ID" :span="2">{{ friendDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="发起用户ID">{{ friendDetail.sendUserId }}</el-descriptions-item>
          <el-descriptions-item label="发起用户">{{ friendDetail.sendUserName }}</el-descriptions-item>
          <el-descriptions-item label="接收用户ID">{{ friendDetail.revUserId }}</el-descriptions-item>
          <el-descriptions-item label="接收用户">{{ friendDetail.revUserName }}</el-descriptions-item>
          <el-descriptions-item label="发起方备注" :span="2">{{ friendDetail.sendUserNotice || "无" }}</el-descriptions-item>
          <el-descriptions-item label="接收方备注" :span="2">{{ friendDetail.revUserNotice || "无" }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="friendDetail.isDeleted ? 'danger' : 'success'" size="small">{{ friendDetail.isDeleted ? "已删除" : "正常" }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ friendDetail.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button v-if="!friendDetail.isDeleted" type="danger" @click="handleDeleteFromDetail">删除关系</el-button>
        <el-button v-else type="success" @click="handleRestoreFromDetail">恢复关系</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IFriendInfo } from "@/types/api/friend"
import { ElMessage, ElMessageBox } from "element-plus"
import { batchDeleteFriendsApi, deleteFriendApi, getFriendDetailApi, getFriendListApi, restoreFriendApi } from "@/api/friend"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const detailLoading = ref(false)
    const friendList = ref<IFriendInfo[]>([])
    const friendDetail = reactive<IFriendInfo>({
      id: "", sendUserId: "", sendUserName: "", revUserId: "", revUserName: "",
      sendUserNotice: "", revUserNotice: "", isDeleted: false, createTime: "", updateTime: ""
    })
    const searchForm = reactive({ userId: "", friendId: "", isDeleted: undefined as boolean | undefined, startTime: "", endTime: "" })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const showDetailDialog = ref(false)
    const dateRange = ref<string[]>([])
    const selectedIds = ref<string[]>([])

    const fetchFriendList = async () => {
      loading.value = true
      const res = await getFriendListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        userId: searchForm.userId || undefined,
        friendId: searchForm.friendId || undefined,
        isDeleted: searchForm.isDeleted,
        startTime: searchForm.startTime || undefined,
        endTime: searchForm.endTime || undefined
      })
      loading.value = false
      if (res.code === 0) {
        friendList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取好友关系失败")
      }
    }

    const fetchFriendDetail = async (id: string) => {
      detailLoading.value = true
      const res = await getFriendDetailApi(id)
      detailLoading.value = false
      if (res.code === 0) {
        Object.assign(friendDetail, res.result)
      } else {
        ElMessage.error(res.msg || "获取详情失败")
      }
    }

    const handleDateRangeChange = (value: string[] | null) => {
      if (value?.length === 2) {
        searchForm.startTime = value[0]
        searchForm.endTime = value[1]
      } else {
        searchForm.startTime = ""
        searchForm.endTime = ""
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchFriendList()
    }

    const handleReset = () => {
      Object.assign(searchForm, { userId: "", friendId: "", isDeleted: undefined, startTime: "", endTime: "" })
      dateRange.value = []
      handleSearch()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchFriendList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchFriendList()
    }

    const handleViewDetail = async (row: IFriendInfo) => {
      await fetchFriendDetail(row.id)
      showDetailDialog.value = true
    }

    const handleDelete = async (row: IFriendInfo) => {
      await ElMessageBox.confirm(`确认删除「${row.sendUserName}」与「${row.revUserName}」的好友关系？`, "删除关系", { type: "warning" })
      const res = await deleteFriendApi(row.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchFriendList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleRestore = async (row: IFriendInfo) => {
      await ElMessageBox.confirm(`确认恢复「${row.sendUserName}」与「${row.revUserName}」的好友关系？`, "恢复关系", { type: "warning" })
      const res = await restoreFriendApi({ friendId: row.id })
      if (res.code === 0) {
        ElMessage.success("恢复成功")
        fetchFriendList()
      } else {
        ElMessage.error(res.msg || "恢复失败")
      }
    }

    const handleDeleteFromDetail = async () => {
      await ElMessageBox.confirm("确认删除这个好友关系？", "删除关系", { type: "warning" })
      const res = await deleteFriendApi(friendDetail.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        showDetailDialog.value = false
        fetchFriendList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleRestoreFromDetail = async () => {
      await ElMessageBox.confirm("确认恢复这个好友关系？", "恢复关系", { type: "warning" })
      const res = await restoreFriendApi({ friendId: friendDetail.id })
      if (res.code === 0) {
        ElMessage.success("恢复成功")
        showDetailDialog.value = false
        fetchFriendList()
      } else {
        ElMessage.error(res.msg || "恢复失败")
      }
    }

    const handleSelectionChange = (rows: IFriendInfo[]) => {
      selectedIds.value = rows.map(r => r.id)
    }

    const handleBatchDelete = async () => {
      if (!selectedIds.value.length) {
        ElMessage.warning("请选择好友关系")
        return
      }
      await ElMessageBox.confirm(`确认批量删除 ${selectedIds.value.length} 条好友关系？`, "批量删除", { type: "warning" })
      const res = await batchDeleteFriendsApi({ ids: selectedIds.value })
      if (res.code === 0) {
        ElMessage.success("批量删除成功")
        fetchFriendList()
      } else {
        ElMessage.error(res.msg || "批量删除失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(() => {
      const q = route.query.userId as string
      if (q) searchForm.userId = q
      fetchFriendList()
    })

    return {
      loading, detailLoading, friendList, friendDetail, searchForm, pagination,
      showDetailDialog, dateRange, selectedIds,
      handleDateRangeChange, handleSearch, handleReset, onSizeChange, onPageChange,
      handleViewDetail, handleDelete, handleRestore, handleDeleteFromDetail, handleRestoreFromDetail,
      handleSelectionChange, handleBatchDelete, goUser
    }
  }
})
</script>

<style lang="less">
.friend-relations {
  padding: 20px;

  .friend-relations__header {
    margin-bottom: 16px;

    .friend-relations__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .friend-relations__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .friend-relations__form {
    margin-bottom: 12px;
  }

  .friend-relations__toolbar {
    margin-bottom: 12px;
  }

  .friend-relations__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
