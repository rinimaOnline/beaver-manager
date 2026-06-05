<template>
  <div class="assets-emoji-collects">
    <div class="assets-emoji-collects__header">
      <h2 class="assets-emoji-collects__title">表情收藏</h2>
    </div>

    <el-form :inline="true" class="assets-emoji-collects__form">
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userId" placeholder="用户ID" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="表情ID">
        <el-input v-model="searchForm.emojiId" placeholder="表情ID" clearable style="width: 150px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="collectList" border stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="userId" label="用户ID" width="140" />
      <el-table-column prop="emojiId" label="表情ID" width="140" />
      <el-table-column prop="emojiTitle" label="表情名称" min-width="150" />
      <el-table-column label="预览" width="100">
        <template #default="{ row }">
          <el-image
            v-if="row.emojiFileName"
            :src="getFilePreviewUrl(row.emojiFileName)"
            :preview-src-list="[getFilePreviewUrl(row.emojiFileName)]"
            style="width: 40px; height: 40px"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="收藏时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.userId)">用户360</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      class="assets-emoji-collects__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="searchForm.page"
      :page-size="searchForm.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts">
import type { IEmojiCollectInfo } from "@/types/api/emoji"
import { ElMessage, ElMessageBox } from "element-plus"
import { batchDeleteEmojiCollectsApi, deleteEmojiCollectApi, getEmojiCollectListApi } from "@/api/emoji"
import config from "@/config/env"

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const collectList = ref<IEmojiCollectInfo[]>([])
    const total = ref(0)
    const selectedIds = ref<string[]>([])
    const searchForm = reactive({
      page: 1,
      pageSize: 10,
      userId: "",
      emojiId: "",
      startTime: "",
      endTime: ""
    })

    const getFilePreviewUrl = (fileName: string) => `${config.baseAPI}/api/file/preview/${fileName}`

    const fetchCollectList = async () => {
      loading.value = true
      const res = await getEmojiCollectListApi(searchForm)
      loading.value = false
      if (res.code === 0) {
        collectList.value = res.result.list || []
        total.value = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取收藏列表失败")
      }
    }

    const handleSearch = () => {
      searchForm.page = 1
      fetchCollectList()
    }

    const handleReset = () => {
      Object.assign(searchForm, { page: 1, pageSize: 10, userId: "", emojiId: "", startTime: "", endTime: "" })
      fetchCollectList()
    }

    const handleSizeChange = (size: number) => {
      searchForm.pageSize = size
      searchForm.page = 1
      fetchCollectList()
    }

    const handleCurrentChange = (page: number) => {
      searchForm.page = page
      fetchCollectList()
    }

    const handleSelectionChange = (rows: IEmojiCollectInfo[]) => {
      selectedIds.value = rows.map(item => item.id)
    }

    const handleDelete = async (row: IEmojiCollectInfo) => {
      await ElMessageBox.confirm(`确认删除用户 ${row.userId} 对「${row.emojiTitle}」的收藏？`, "删除收藏", { type: "warning" })
      const res = await deleteEmojiCollectApi(row.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchCollectList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleBatchDelete = async () => {
      await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条收藏？`, "批量删除", { type: "warning" })
      const res = await batchDeleteEmojiCollectsApi({ ids: selectedIds.value })
      if (res.code === 0) {
        ElMessage.success("批量删除成功")
        selectedIds.value = []
        fetchCollectList()
      } else {
        ElMessage.error(res.msg || "批量删除失败")
      }
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)

    onMounted(() => {
      const q = route.query.userId as string
      if (q) searchForm.userId = q
      fetchCollectList()
    })

    return {
      loading, collectList, total, selectedIds, searchForm,
      getFilePreviewUrl, handleSearch, handleReset, handleSizeChange, handleCurrentChange,
      handleSelectionChange, handleDelete, handleBatchDelete, goUser
    }
  }
})
</script>

<style lang="less">
.assets-emoji-collects {
  padding: 20px;

  .assets-emoji-collects__header {
    margin-bottom: 16px;

    .assets-emoji-collects__title {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .assets-emoji-collects__form {
    margin-bottom: 12px;
  }

  .assets-emoji-collects__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
