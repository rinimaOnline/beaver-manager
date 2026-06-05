<template>
  <div class="friend-requests">
    <div class="friend-requests__header">
      <h2 class="friend-requests__title">好友申请</h2>
      <p class="friend-requests__hint">好友申请记录审计，支持按双方用户与状态筛选</p>
    </div>

    <el-form :inline="true" class="friend-requests__form">
      <el-form-item label="发起用户ID">
        <el-input v-model="searchForm.sendUserId" placeholder="发起用户ID" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="接收用户ID">
        <el-input v-model="searchForm.revUserId" placeholder="接收用户ID" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="发起状态">
        <el-select v-model="searchForm.sendStatus" placeholder="发起状态" clearable style="width: 120px">
          <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="接收状态">
        <el-select v-model="searchForm.revStatus" placeholder="接收状态" clearable style="width: 120px">
          <el-option v-for="opt in statusOptions" :key="'r' + opt.value" :label="opt.label" :value="opt.value" />
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
        <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="requestList" border stripe @selection-change="onSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="sendUserId" label="发起用户ID" width="130" show-overflow-tooltip />
      <el-table-column prop="sendUserName" label="发起用户" width="120" show-overflow-tooltip />
      <el-table-column prop="revUserId" label="接收用户ID" width="130" show-overflow-tooltip />
      <el-table-column prop="revUserName" label="接收用户" width="120" show-overflow-tooltip />
      <el-table-column prop="message" label="申请消息" min-width="180" show-overflow-tooltip />
      <el-table-column label="发起状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.sendStatus)" size="small">{{ getStatusText(row.sendStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="接收状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.revStatus)" size="small">{{ getStatusText(row.revStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="申请时间" width="170" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.sendUserId)">发起360</el-button>
          <el-button link type="primary" @click="goUser(row.revUserId)">接收360</el-button>
          <el-button link @click="handleViewDetail(row)">详情</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="friend-requests__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />

    <el-dialog v-model="showDetailDialog" title="好友申请详情" width="600px" :close-on-click-modal="false">
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请ID" :span="2">{{ requestDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="发起用户ID">{{ requestDetail.sendUserId }}</el-descriptions-item>
          <el-descriptions-item label="发起用户">{{ requestDetail.sendUserName }}</el-descriptions-item>
          <el-descriptions-item label="接收用户ID">{{ requestDetail.revUserId }}</el-descriptions-item>
          <el-descriptions-item label="接收用户">{{ requestDetail.revUserName }}</el-descriptions-item>
          <el-descriptions-item label="申请消息" :span="2">{{ requestDetail.message || "无" }}</el-descriptions-item>
          <el-descriptions-item label="发起状态">
            <el-tag :type="getStatusTagType(requestDetail.sendStatus)" size="small">{{ getStatusText(requestDetail.sendStatus) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="接收状态">
            <el-tag :type="getStatusTagType(requestDetail.revStatus)" size="small">{{ getStatusText(requestDetail.revStatus) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ requestDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ requestDetail.updateTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="danger" @click="handleDeleteFromDetail">删除申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IFriendVerifyDetailInfo, IFriendVerifyInfo } from "@/types/api/friend"
import { ElMessage, ElMessageBox } from "element-plus"
import { batchDeleteFriendVerifyApi, deleteFriendVerifyApi, getFriendVerifyDetailApi, getFriendVerifyListApi } from "@/api/friend"

const statusOptions = [
  { label: "未处理", value: 0 },
  { label: "已通过", value: 1 },
  { label: "已拒绝", value: 2 },
  { label: "忽略", value: 3 },
  { label: "删除", value: 4 }
]

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const detailLoading = ref(false)
    const requestList = ref<IFriendVerifyInfo[]>([])
    const selectedIds = ref<string[]>([])
    const requestDetail = reactive<IFriendVerifyDetailInfo>({
      id: "", sendUserId: "", sendUserName: "", revUserId: "", revUserName: "",
      sendStatus: 0, revStatus: 0, message: "", createTime: "", updateTime: ""
    })
    const searchForm = reactive({
      sendUserId: "", revUserId: "",
      sendStatus: undefined as number | undefined,
      revStatus: undefined as number | undefined,
      startTime: "", endTime: ""
    })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const showDetailDialog = ref(false)
    const dateRange = ref<string[]>([])

    const fetchRequestList = async () => {
      loading.value = true
      const res = await getFriendVerifyListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        sendUserId: searchForm.sendUserId || undefined,
        revUserId: searchForm.revUserId || undefined,
        sendStatus: searchForm.sendStatus,
        revStatus: searchForm.revStatus,
        startTime: searchForm.startTime || undefined,
        endTime: searchForm.endTime || undefined
      })
      loading.value = false
      if (res.code === 0) {
        requestList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取申请列表失败")
      }
    }

    const fetchRequestDetail = async (verifyId: string) => {
      detailLoading.value = true
      const res = await getFriendVerifyDetailApi({ verifyId })
      detailLoading.value = false
      if (res.code === 0) {
        Object.assign(requestDetail, res.result)
      } else {
        ElMessage.error(res.msg || "获取详情失败")
      }
    }

    const getStatusText = (status: number) => statusOptions.find(o => o.value === status)?.label || "未知"
    const getStatusTagType = (status: number) => ({ 0: "warning", 1: "success", 2: "danger", 3: "info", 4: "danger" }[status] || "info")

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
      fetchRequestList()
    }

    const handleReset = () => {
      Object.assign(searchForm, { sendUserId: "", revUserId: "", sendStatus: undefined, revStatus: undefined, startTime: "", endTime: "" })
      dateRange.value = []
      handleSearch()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchRequestList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchRequestList()
    }

    const handleViewDetail = async (row: IFriendVerifyInfo) => {
      await fetchRequestDetail(row.id)
      showDetailDialog.value = true
    }

    const handleDelete = async (row: IFriendVerifyInfo) => {
      await ElMessageBox.confirm(`确认删除「${row.sendUserName}」向「${row.revUserName}」的申请记录？`, "删除申请", { type: "warning" })
      const res = await deleteFriendVerifyApi({ verifyId: row.id })
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchRequestList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleDeleteFromDetail = async () => {
      await ElMessageBox.confirm("确认删除这个好友申请记录？", "删除申请", { type: "warning" })
      const res = await deleteFriendVerifyApi({ verifyId: requestDetail.id })
      if (res.code === 0) {
        ElMessage.success("删除成功")
        showDetailDialog.value = false
        fetchRequestList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const onSelectionChange = (rows: IFriendVerifyInfo[]) => {
      selectedIds.value = rows.map(r => r.id)
    }

    const handleBatchDelete = async () => {
      if (!selectedIds.value.length) return
      await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条申请记录？`, "批量删除", { type: "warning" })
      const res = await batchDeleteFriendVerifyApi({ ids: selectedIds.value })
      if (res.code === 0) {
        ElMessage.success("批量删除成功")
        selectedIds.value = []
        fetchRequestList()
      } else {
        ElMessage.error(res.msg || "批量删除失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(() => {
      const q = route.query.userId as string
      if (q) searchForm.sendUserId = q
      fetchRequestList()
    })

    return {
      loading, detailLoading, requestList, requestDetail, searchForm, pagination, selectedIds,
      showDetailDialog, dateRange, statusOptions,
      handleDateRangeChange, handleSearch, handleReset, onSizeChange, onPageChange,
      handleViewDetail, handleDelete, handleDeleteFromDetail, onSelectionChange, handleBatchDelete,
      getStatusText, getStatusTagType, goUser
    }
  }
})
</script>

<style lang="less">
.friend-requests {
  padding: 20px;

  .friend-requests__header {
    margin-bottom: 16px;

    .friend-requests__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .friend-requests__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .friend-requests__form {
    margin-bottom: 12px;
  }

  .friend-requests__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
