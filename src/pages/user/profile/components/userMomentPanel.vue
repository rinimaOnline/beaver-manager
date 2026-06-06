<template>
  <div v-loading="loading" class="user-moment-panel">
    <template v-if="detail.momentId">
      <div class="user-moment-panel__header">
        <h3 class="user-moment-panel__title">动态详情</h3>
        <div class="user-moment-panel__actions">
          <el-button v-if="!detail.isDeleted" type="danger" size="small" @click="handleDeleteMoment">删除动态</el-button>
        </div>
      </div>

      <el-descriptions :column="2" border size="small" class="user-moment-panel__desc">
        <el-descriptions-item label="动态ID">{{ detail.momentId }}</el-descriptions-item>
        <el-descriptions-item label="可见性">
          <el-tag :type="visibilityTag(detail.visibility)" size="small">{{ visibilityText(detail.visibility) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detail.isDeleted ? 'danger' : 'success'" size="small">{{ detail.isDeleted ? "已删" : "正常" }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="互动">{{ detail.commentCount }} 评论 · {{ detail.likeCount }} 点赞</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">{{ detail.content || "-" }}</el-descriptions-item>
        <el-descriptions-item label="位置" :span="2">{{ detail.location || "未设置" }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="detail.files?.length" class="user-moment-panel__files">
        <div v-for="(file, idx) in detail.files" :key="idx" class="user-moment-panel__file">
          <img v-if="file.type?.includes('image')" :src="file.url" class="user-moment-panel__preview" @click="previewImage(file.url)">
          <video v-else-if="file.type?.includes('video')" :src="file.url" class="user-moment-panel__preview" controls />
          <a v-else :href="file.url" target="_blank">{{ file.url }}</a>
        </div>
      </div>

      <div class="user-moment-panel__comments">
        <div class="user-moment-panel__comments-head">
          <span class="user-moment-panel__comments-title">评论 ({{ commentPagination.total }})</span>
          <el-button :disabled="!selectedCommentIds.length" type="danger" size="small" @click="batchDeleteComments">
            批量删除
          </el-button>
        </div>
        <el-table
          v-loading="commentLoading"
          :data="commentList"
          border
          stripe
          size="small"
          @selection-change="onCommentSelection"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="userId" label="用户" width="130">
            <template #default="{ row }">
              <el-link type="primary" @click="emit('go-user', row.userId)">{{ row.userId }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="时间" width="160" />
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button link type="danger" @click="handleDeleteComment(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="commentPagination.total > 0"
          class="user-moment-panel__pagination"
          small
          background
          layout="total, prev, pager, next"
          :total="commentPagination.total"
          :page-size="commentPagination.pageSize"
          :current-page="commentPagination.page"
          @current-change="onCommentPageChange"
        />
      </div>
    </template>
    <el-empty v-else-if="!loading" description="请选择一条动态" :image-size="80" />

    <ElImageViewer v-if="showImageViewer" :url-list="[previewImageUrl]" @close="showImageViewer = false" />
  </div>
</template>

<script lang="ts">
import type { MomentCommentInfo, MomentInfo } from "@/types/api/moment"
import { ElImageViewer, ElMessage, ElMessageBox } from "element-plus"
import { deleteMomentApi, deleteMomentCommentApi, getMomentCommentListApi, getMomentDetailApi } from "@/api/moment"

const emptyDetail = (): MomentInfo => ({
  momentId: "",
  userId: "",
  content: "",
  files: [],
  isDeleted: false,
  visibility: 0,
  location: "",
  commentCount: 0,
  likeCount: 0,
  createdAt: "",
  updatedAt: ""
})

export default defineComponent({
  components: { ElImageViewer },
  props: {
    momentId: { type: String, default: "" }
  },
  emits: ["deleted", "go-user"],
  setup(props, { emit }) {
    const loading = ref(false)
    const commentLoading = ref(false)
    const detail = reactive<MomentInfo>(emptyDetail())
    const commentList = ref<MomentCommentInfo[]>([])
    const selectedCommentIds = ref<number[]>([])
    const commentPagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const showImageViewer = ref(false)
    const previewImageUrl = ref("")

    const visibilityText = (v: number) => ({ 0: "公开", 1: "仅好友", 2: "仅自己" }[v] || "未知")
    const visibilityTag = (v: number) => ({ 0: "success", 1: "warning", 2: "info" }[v] || "")

    const fetchComments = async () => {
      if (!props.momentId) return
      commentLoading.value = true
      const res = await getMomentCommentListApi({
        page: commentPagination.page,
        limit: commentPagination.pageSize,
        momentId: Number.parseInt(props.momentId, 10)
      })
      commentLoading.value = false
      if (res.code === 0) {
        commentList.value = res.result.list || []
        commentPagination.total = res.result.total || 0
      }
    }

    const loadDetail = async () => {
      if (!props.momentId) {
        Object.assign(detail, emptyDetail())
        commentList.value = []
        return
      }
      loading.value = true
      commentPagination.page = 1
      const res = await getMomentDetailApi(props.momentId)
      loading.value = false
      if (res.code === 0) {
        Object.assign(detail, res.result)
        await fetchComments()
      } else {
        ElMessage.error(res.msg || "加载动态失败")
        Object.assign(detail, emptyDetail())
      }
    }

    const handleDeleteMoment = async () => {
      await ElMessageBox.confirm("确认删除这条动态？", "删除动态", { type: "warning" })
      const res = await deleteMomentApi(detail.momentId)
      if (res.code === 0) {
        ElMessage.success("已删除")
        emit("deleted")
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleDeleteComment = async (id: number) => {
      await ElMessageBox.confirm("确认删除这条评论？", "删除评论", { type: "warning" })
      const res = await deleteMomentCommentApi(id)
      if (res.code === 0) {
        ElMessage.success("已删除")
        fetchComments()
        loadDetail()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const batchDeleteComments = async () => {
      if (!selectedCommentIds.value.length) return
      await ElMessageBox.confirm(`确认删除选中的 ${selectedCommentIds.value.length} 条评论？`, "批量删除", { type: "warning" })
      for (const id of selectedCommentIds.value) {
        await deleteMomentCommentApi(id)
      }
      ElMessage.success("批量删除完成")
      selectedCommentIds.value = []
      fetchComments()
      loadDetail()
    }

    const onCommentSelection = (rows: MomentCommentInfo[]) => {
      selectedCommentIds.value = rows.map(r => r.id)
    }

    const onCommentPageChange = (page: number) => {
      commentPagination.page = page
      fetchComments()
    }

    const previewImage = (url: string) => {
      previewImageUrl.value = url
      showImageViewer.value = true
    }

    watch(() => props.momentId, loadDetail, { immediate: true })

    return {
      loading,
      commentLoading,
      detail,
      commentList,
      selectedCommentIds,
      commentPagination,
      showImageViewer,
      previewImageUrl,
      visibilityText,
      visibilityTag,
      handleDeleteMoment,
      handleDeleteComment,
      batchDeleteComments,
      onCommentSelection,
      onCommentPageChange,
      previewImage
    }
  }
})
</script>

<style lang="less">
.user-moment-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 16px;
  overflow-y: auto;

  .user-moment-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .user-moment-panel__title {
    margin: 0;
    font-size: 16px;
  }

  .user-moment-panel__desc {
    margin-bottom: 12px;
  }

  .user-moment-panel__files {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .user-moment-panel__preview {
    max-width: 120px;
    max-height: 120px;
    border-radius: 4px;
    cursor: pointer;
  }

  .user-moment-panel__comments-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .user-moment-panel__comments-title {
    font-weight: 600;
    font-size: 14px;
  }

  .user-moment-panel__pagination {
    margin-top: 12px;
    justify-content: flex-end;
  }
}
</style>
