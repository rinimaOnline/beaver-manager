<template>
  <div class="community-moments">
    <div class="community-moments__header">
      <h2 class="community-moments__title">动态流</h2>
      <p class="community-moments__hint">社区动态检索、详情审计与违规处置，可联动用户360与评论治理</p>
    </div>

    <el-form :inline="true" class="community-moments__form">
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userId" placeholder="用户ID" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="可见性">
        <el-select v-model="searchForm.visibility" placeholder="可见性" clearable style="width: 120px">
          <el-option label="公开" :value="0" />
          <el-option label="仅好友" :value="1" />
          <el-option label="仅自己" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keywords" placeholder="内容关键词" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="momentList" border stripe>
      <el-table-column prop="momentId" label="动态ID" min-width="120" show-overflow-tooltip />
      <el-table-column prop="userId" label="用户ID" width="120" show-overflow-tooltip />
      <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
      <el-table-column label="媒体" width="90" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.files?.length" size="small">{{ row.files.length }} 个</el-tag>
          <span v-else class="community-moments__muted">无</span>
        </template>
      </el-table-column>
      <el-table-column label="可见性" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getVisibilityTagType(row.visibility)" size="small">{{ getVisibilityText(row.visibility) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="commentCount" label="评论" width="70" align="center" />
      <el-table-column prop="likeCount" label="点赞" width="70" align="center" />
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isDeleted ? 'danger' : 'success'" size="small">{{ row.isDeleted ? "已删除" : "正常" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="发布时间" width="170" />
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goUser(row.userId)">用户360</el-button>
          <el-button link type="primary" @click="goComments(row.momentId)">评论</el-button>
          <el-button link @click="handleViewDetail(row)">详情</el-button>
          <el-button v-if="!row.isDeleted" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="community-moments__pagination"
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />

    <el-dialog v-model="showDetailDialog" title="动态详情" width="760px" :close-on-click-modal="false">
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="动态ID">{{ momentDetail.momentId }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ momentDetail.userId }}</el-descriptions-item>
          <el-descriptions-item label="可见性">
            <el-tag :type="getVisibilityTagType(momentDetail.visibility)" size="small">{{ getVisibilityText(momentDetail.visibility) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="momentDetail.isDeleted ? 'danger' : 'success'" size="small">{{ momentDetail.isDeleted ? "已删除" : "正常" }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="位置" :span="2">{{ momentDetail.location || "未设置" }}</el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">
            <div class="community-moments__detail-content">{{ momentDetail.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item v-if="momentDetail.files?.length" label="媒体" :span="2">
            <div class="community-moments__files">
              <div v-for="(file, index) in momentDetail.files" :key="index" class="community-moments__file">
                <img v-if="file.type?.includes('image')" :src="file.url" class="community-moments__preview" @click="handlePreviewImage(file.url)">
                <video v-else-if="file.type?.includes('video')" :src="file.url" class="community-moments__preview" controls />
                <a v-else :href="file.url" target="_blank">{{ file.url }}</a>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="评论数">{{ momentDetail.commentCount }}</el-descriptions-item>
          <el-descriptions-item label="点赞数">{{ momentDetail.likeCount }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ momentDetail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ momentDetail.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button v-if="!momentDetail.isDeleted" type="danger" @click="handleDeleteFromDetail">删除动态</el-button>
      </template>
    </el-dialog>

    <ElImageViewer v-if="showImageViewer" :url-list="[previewImageUrl]" @close="showImageViewer = false" />
  </div>
</template>

<script lang="ts">
import type { MomentInfo } from "@/types/api/moment"
import { ElImageViewer, ElMessage, ElMessageBox } from "element-plus"
import { deleteMomentApi, getMomentDetailApi, getMomentListApi } from "@/api/moment"

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
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const detailLoading = ref(false)
    const momentList = ref<MomentInfo[]>([])
    const momentDetail = reactive<MomentInfo>(emptyDetail())
    const searchForm = reactive({ userId: "", visibility: undefined as number | undefined, keywords: "" })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const showDetailDialog = ref(false)
    const showImageViewer = ref(false)
    const previewImageUrl = ref("")

    const fetchMomentList = async () => {
      loading.value = true
      const res = await getMomentListApi({
        page: pagination.page,
        limit: pagination.pageSize,
        userId: searchForm.userId || undefined,
        visibility: searchForm.visibility,
        keywords: searchForm.keywords || undefined
      })
      loading.value = false
      if (res.code === 0) {
        momentList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "获取动态列表失败")
      }
    }

    const fetchMomentDetail = async (id: string) => {
      detailLoading.value = true
      const res = await getMomentDetailApi(id)
      detailLoading.value = false
      if (res.code === 0) {
        Object.assign(momentDetail, res.result)
      } else {
        ElMessage.error(res.msg || "获取动态详情失败")
      }
    }

    const getVisibilityText = (visibility: number) => ({ 0: "公开", 1: "仅好友", 2: "仅自己" }[visibility] || "未知")
    const getVisibilityTagType = (visibility: number) => ({ 0: "success", 1: "warning", 2: "info" }[visibility] || "")

    const handleSearch = () => {
      pagination.page = 1
      fetchMomentList()
    }

    const handleReset = () => {
      Object.assign(searchForm, { userId: "", visibility: undefined, keywords: "" })
      handleSearch()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchMomentList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchMomentList()
    }

    const handleViewDetail = async (row: MomentInfo) => {
      await fetchMomentDetail(row.momentId)
      showDetailDialog.value = true
    }

    const handleDelete = async (row: MomentInfo) => {
      await ElMessageBox.confirm(`确认删除用户 ${row.userId} 的这条动态？`, "删除动态", { type: "warning" })
      const res = await deleteMomentApi(row.momentId)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        fetchMomentList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleDeleteFromDetail = async () => {
      await ElMessageBox.confirm("确认删除这条动态？", "删除动态", { type: "warning" })
      const res = await deleteMomentApi(momentDetail.momentId)
      if (res.code === 0) {
        ElMessage.success("删除成功")
        showDetailDialog.value = false
        fetchMomentList()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handlePreviewImage = (url: string) => {
      previewImageUrl.value = url
      showImageViewer.value = true
    }

    const goUser = (userId: string) => router.push(`/user/profile/${userId}`)
    const goComments = (momentId: string) => router.push({ path: "/community/comments", query: { momentId } })

    onMounted(() => {
      const qUserId = route.query.userId as string
      const qMomentId = route.query.momentId as string
      if (qUserId) searchForm.userId = qUserId
      if (qMomentId) searchForm.keywords = qMomentId
      fetchMomentList()
    })

    return {
      loading, detailLoading, momentList, momentDetail, searchForm, pagination,
      showDetailDialog, showImageViewer, previewImageUrl,
      handleSearch, handleReset, onSizeChange, onPageChange,
      handleViewDetail, handleDelete, handleDeleteFromDetail, handlePreviewImage,
      getVisibilityText, getVisibilityTagType, goUser, goComments
    }
  }
})
</script>

<style lang="less">
.community-moments {
  padding: 20px;

  .community-moments__header {
    margin-bottom: 16px;

    .community-moments__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .community-moments__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .community-moments__form {
    margin-bottom: 12px;
  }

  .community-moments__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .community-moments__muted {
    color: #909399;
  }

  .community-moments__detail-content {
    max-height: 200px;
    overflow-y: auto;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .community-moments__files {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .community-moments__file {
      .community-moments__preview {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        cursor: pointer;
        border-width: 1px;
        border-style: solid;
        border-color: #dcdfe6;
      }
    }
  }
}
</style>
