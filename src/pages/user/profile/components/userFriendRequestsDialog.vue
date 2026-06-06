<template>
  <el-dialog
    :model-value="visible"
    :title="`好友申请 · ${userId}`"
    width="960px"
    top="6vh"
    destroy-on-close
    :close-on-click-modal="false"
    class="user-friend-requests-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-tabs v-model="direction" @tab-change="onDirectionChange">
      <el-tab-pane label="发出的申请" name="sent" />
      <el-tab-pane label="收到的申请" name="received" />
    </el-tabs>

    <el-form :inline="true" class="user-friend-requests-dialog__form">
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px">
          <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
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

    <el-table v-loading="loading" :data="requestList" border stripe max-height="420" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="sendUserName" label="发起用户" width="120" show-overflow-tooltip />
      <el-table-column prop="revUserName" label="接收用户" width="120" show-overflow-tooltip />
      <el-table-column prop="message" label="申请消息" min-width="160" show-overflow-tooltip />
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
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.sendUserId)">发起360</el-button>
          <el-button link type="primary" @click="goUser(row.revUserId)">接收360</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="user-friend-requests-dialog__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />

    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import type { IFriendVerifyInfo } from "@/types/api/friend"
import { ElMessage, ElMessageBox } from "element-plus"
import { batchDeleteFriendVerifyApi, deleteFriendVerifyApi, getFriendVerifyListApi } from "@/api/friend"

const statusOptions = [
  { label: "未处理", value: 0 },
  { label: "已通过", value: 1 },
  { label: "已拒绝", value: 2 },
  { label: "忽略", value: 3 },
  { label: "删除", value: 4 }
]

export default defineComponent({
  props: {
    visible: { type: Boolean, default: false },
    userId: { type: String, required: true }
  },
  emits: ["update:visible"],
  setup(props, { emit }) {
    const router = useRouter()
    const loading = ref(false)
    const direction = ref<"sent" | "received">("sent")
    const requestList = ref<IFriendVerifyInfo[]>([])
    const selectedIds = ref<string[]>([])
    const dateRange = ref<string[]>([])
    const searchForm = reactive({
      status: undefined as number | undefined,
      startTime: "",
      endTime: ""
    })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const getStatusText = (status: number) => statusOptions.find(o => o.value === status)?.label || "未知"
    const getStatusTagType = (status: number) => ({ 0: "warning", 1: "success", 2: "danger", 3: "info", 4: "danger" }[status] || "info")

    const buildParams = () => {
      const base = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        startTime: searchForm.startTime || undefined,
        endTime: searchForm.endTime || undefined
      }
      if (direction.value === "sent") {
        return {
          ...base,
          sendUserId: props.userId,
          sendStatus: searchForm.status
        }
      }
      return {
        ...base,
        revUserId: props.userId,
        revStatus: searchForm.status
      }
    }

    const fetchRequestList = async () => {
      if (!props.userId) return
      loading.value = true
      const res = await getFriendVerifyListApi(buildParams())
      loading.value = false
      if (res.code === 0) {
        requestList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取申请列表失败")
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
      fetchRequestList()
    }

    const handleReset = () => {
      searchForm.status = undefined
      searchForm.startTime = ""
      searchForm.endTime = ""
      dateRange.value = []
      handleSearch()
    }

    const onDirectionChange = () => {
      selectedIds.value = []
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

    const goUser = (id: string) => {
      emit("update:visible", false)
      router.push(`/user/profile/${id}`)
    }

    watch(
      () => props.visible,
      v => {
        if (v) {
          direction.value = "sent"
          handleReset()
        }
      }
    )

    return {
      emit,
      loading,
      direction,
      requestList,
      selectedIds,
      dateRange,
      searchForm,
      pagination,
      statusOptions,
      getStatusText,
      getStatusTagType,
      handleDateRangeChange,
      handleSearch,
      handleReset,
      onDirectionChange,
      onSizeChange,
      onPageChange,
      handleDelete,
      onSelectionChange,
      handleBatchDelete,
      goUser
    }
  }
})
</script>

<style lang="less">
.user-friend-requests-dialog {
  .user-friend-requests-dialog__form {
    margin-bottom: 12px;
  }

  .user-friend-requests-dialog__pagination {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
