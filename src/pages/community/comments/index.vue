<template>
  <div class="community-comments">
    <div class="community-comments__header">
      <h2 class="community-comments__title">评论治理</h2>
      <p class="community-comments__hint">按用户/动态定位评论，支持批量删除与跳转动态、用户360</p>
    </div>

    <div class="community-comments__body">
      <aside class="moment-sidebar">
        <div class="moment-sidebar__title">动态定位</div>
        <el-input v-model="userKeyword" placeholder="用户ID查近期动态" clearable size="small" @keyup.enter="loadUserMoments" />
        <el-button size="small" type="primary" class="moment-sidebar__btn" :loading="momentLoading" @click="loadUserMoments">加载动态</el-button>
        <el-input v-model="searchForm.momentId" placeholder="或直接输入动态ID" clearable size="small" class="moment-sidebar__input" />
        <div class="moment-list">
          <div
            v-for="m in momentOptions"
            :key="m.momentId"
            class="moment-item"
            :class="{ active: searchForm.momentId === m.momentId }"
            @click="selectMoment(m.momentId)"
          >
            <div class="moment-item__content">{{ m.content || m.momentId }}</div>
            <div class="moment-item__meta">{{ m.commentCount }} 评论 · {{ m.createdAt }}</div>
          </div>
          <el-empty v-if="!momentLoading && !momentOptions.length" description="输入用户ID加载动态" :image-size="48" />
        </div>
      </aside>

      <section class="comment-main">
        <el-form :inline="true" class="community-comments__form">
          <el-form-item label="动态ID">
            <el-input v-model="searchForm.momentId" placeholder="动态ID" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSearch">查询评论</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button :disabled="!selectedIds.length" type="danger" @click="batchDelete">批量删除</el-button>
            <el-button link type="primary" @click="goMoments">动态流</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="commentList" border stripe @selection-change="onSelectionChange">
          <el-table-column type="selection" width="45" />
          <el-table-column prop="id" label="评论ID" width="90" />
          <el-table-column prop="momentId" label="动态ID" width="100" />
          <el-table-column prop="userId" label="用户" width="140">
            <template #default="{ row }">
              <el-link type="primary" @click="goUser(row.userId)">{{ row.userId }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="评论内容" min-width="260" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="时间" width="170" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="goMoment(row.momentId)">动态</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="community-comments__pagination"
          background
          layout="total, sizes, prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50]"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import type { MomentCommentInfo, MomentInfo } from "@/types/api/moment"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteMomentCommentApi, getMomentCommentListApi, getMomentListApi } from "@/api/moment"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const momentLoading = ref(false)
    const commentList = ref<MomentCommentInfo[]>([])
    const momentOptions = ref<MomentInfo[]>([])
    const selectedIds = ref<number[]>([])
    const userKeyword = ref("")
    const searchForm = reactive({ momentId: "" })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const fetchCommentList = async () => {
      if (!searchForm.momentId) {
        ElMessage.warning("请选择或输入动态ID")
        return
      }
      loading.value = true
      const res = await getMomentCommentListApi({
        page: pagination.page,
        limit: pagination.pageSize,
        momentId: Number.parseInt(searchForm.momentId, 10)
      })
      loading.value = false
      if (res.code === 0) {
        commentList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const loadUserMoments = async () => {
      if (!userKeyword.value.trim()) return
      momentLoading.value = true
      const res = await getMomentListApi({ page: 1, limit: 20, userId: userKeyword.value.trim() })
      momentLoading.value = false
      if (res.code === 0) {
        momentOptions.value = res.result.list || []
        if (momentOptions.value.length && !searchForm.momentId) {
          selectMoment(momentOptions.value[0].momentId)
        }
      } else {
        ElMessage.error(res.msg || "加载动态失败")
      }
    }

    const selectMoment = (momentId: string) => {
      searchForm.momentId = momentId
      handleSearch()
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchCommentList()
    }

    const handleReset = () => {
      searchForm.momentId = ""
      userKeyword.value = ""
      momentOptions.value = []
      commentList.value = []
      selectedIds.value = []
      pagination.total = 0
    }

    const onSelectionChange = (rows: MomentCommentInfo[]) => {
      selectedIds.value = rows.map(r => r.id)
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchCommentList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchCommentList()
    }

    const handleDelete = async (row: MomentCommentInfo) => {
      await ElMessageBox.confirm(`确认删除用户 ${row.userId} 的这条评论？`, "删除评论", { type: "warning" })
      const res = await deleteMomentCommentApi(row.id)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchCommentList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const batchDelete = async () => {
      if (!selectedIds.value.length) return
      await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条评论？`, "批量删除", { type: "warning" })
      for (const id of selectedIds.value) {
        await deleteMomentCommentApi(id)
      }
      ElMessage.success("批量删除完成")
      selectedIds.value = []
      fetchCommentList()
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goMoment = (momentId: number | string) => router.push({ path: "/community/moments", query: { momentId: String(momentId) } })
    const goMoments = () => router.push("/community/moments")

    onMounted(() => {
      const q = route.query.momentId as string
      if (q) {
        searchForm.momentId = q
        fetchCommentList()
      }
    })

    return {
      loading, momentLoading, commentList, momentOptions, selectedIds, userKeyword, searchForm, pagination,
      loadUserMoments, selectMoment, handleSearch, handleReset, onSelectionChange,
      onSizeChange, onPageChange, handleDelete, batchDelete, goUser, goMoment, goMoments
    }
  }
})
</script>

<style lang="less" scoped>
.community-comments {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__pagination { margin-top: 16px; justify-content: flex-end; }

  &__body {
    display: flex;
    gap: 16px;
    min-height: 480px;
  }
}

.moment-sidebar {
  width: 280px;
  flex-shrink: 0;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  background: #fff;

  &__title { font-weight: 600; margin-bottom: 8px; font-size: 13px; }
  &__btn { width: 100%; margin-top: 8px; margin-bottom: 8px; }
  &__input { margin-bottom: 8px; }
}

.moment-list {
  max-height: 420px;
  overflow-y: auto;
}

.moment-item {
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 6px;
  border: 1px solid transparent;

  &:hover, &.active {
    background: #ecf5ff;
    border-color: #b3d8ff;
  }

  &__content {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    font-size: 11px;
    color: #909399;
    margin-top: 4px;
  }
}

.comment-main {
  flex: 1;
  min-width: 0;
}
</style>
