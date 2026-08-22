<template>
  <div v-loading="loading" class="user-circle-panel">
    <template v-if="detail.circleId">
      <div class="user-circle-panel__header">
        <div class="user-circle-panel__info">
          <h3 class="user-circle-panel__title">{{ detail.name || detail.circleId }}</h3>
          <p class="user-circle-panel__meta">圈子ID: {{ detail.circleId }} · 圈主: {{ detail.creatorId }}</p>
          <div class="user-circle-panel__tags">
            <el-tag :type="detail.isDeleted ? 'danger' : 'success'" size="small">
              {{ detail.isDeleted ? "已解散" : "正常" }}
            </el-tag>
            <el-tag type="info" size="small">{{ joinTypeText(detail.joinType) }}</el-tag>
            <el-tag type="info" size="small">{{ detail.memberCount }} 成员 · {{ detail.postCount }} 帖子</el-tag>
          </div>
          <p v-if="detail.description" class="user-circle-panel__desc">{{ detail.description }}</p>
        </div>
        <div class="user-circle-panel__actions">
          <el-button v-if="!detail.isDeleted" size="small" type="danger" @click="handleDissolve">解散圈子</el-button>
        </div>
      </div>

      <div class="user-circle-panel__body">
        <aside class="user-circle-panel__members">
          <div class="user-circle-panel__members-head">
            <span>成员</span>
            <el-tag size="small" type="info">{{ members.length }}</el-tag>
          </div>
          <el-input v-model="memberKeyword" placeholder="搜索成员" clearable size="small" class="user-circle-panel__members-search" />
          <div v-loading="membersLoading" class="user-circle-panel__member-list">
            <div
              v-for="row in filteredMembers"
              :key="row.userId"
              class="user-circle-panel__member-item"
              :class="{ active: selectedMember?.userId === row.userId }"
              @click="selectedMember = row"
            >
              <el-avatar :size="32">{{ row.nickName?.charAt(0) || "?" }}</el-avatar>
              <div class="user-circle-panel__member-info">
                <div class="user-circle-panel__member-name">{{ row.nickName || row.userId }}</div>
                <el-tag size="small" :type="row.role === 1 ? 'warning' : 'info'">{{ roleLabel(row.role) }}</el-tag>
              </div>
            </div>
            <el-empty v-if="!membersLoading && !filteredMembers.length" description="暂无成员" :image-size="48" />
          </div>
          <div v-if="selectedMember" class="user-circle-panel__member-actions">
            <el-button type="primary" plain size="small" @click="emit('go-user', selectedMember.userId)">用户360</el-button>
            <el-button
              v-if="!detail.isDeleted && selectedMember.role !== 1"
              type="danger"
              plain
              size="small"
              @click="handleRemoveMember(selectedMember)"
            >
              移除
            </el-button>
          </div>
        </aside>

        <div class="user-circle-panel__posts">
          <div class="user-circle-panel__posts-head">
            <span>帖子</span>
            <el-tag size="small" type="info">{{ postPagination.total }}</el-tag>
          </div>
          <el-table
            v-loading="postsLoading"
            :data="postList"
            border
            stripe
            size="small"
            highlight-current-row
            @current-change="onPostSelect"
          >
            <el-table-column prop="userId" label="用户" width="130">
              <template #default="{ row }">
                <el-link type="primary" @click.stop="emit('go-user', row.userId)">{{ row.userId }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
            <el-table-column label="互动" width="110">
              <template #default="{ row }">{{ row.commentCount }} 评 · {{ row.likeCount }} 赞</template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="160" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" @click.stop="handleDeletePost(row.postId)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="postPagination.total > 0"
            class="user-circle-panel__pagination"
            small
            background
            layout="total, prev, pager, next"
            :total="postPagination.total"
            :page-size="postPagination.pageSize"
            :current-page="postPagination.page"
            @current-change="onPostPageChange"
          />

          <div v-if="activePostId" class="user-circle-panel__comments">
            <div class="user-circle-panel__comments-head">
              <span>评论 ({{ commentPagination.total }})</span>
            </div>
            <el-table v-loading="commentLoading" :data="commentList" border stripe size="small">
              <el-table-column prop="userId" label="用户" width="130">
                <template #default="{ row }">
                  <el-link type="primary" @click="emit('go-user', row.userId)">{{ row.userId }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
              <el-table-column prop="createdAt" label="时间" width="160" />
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" @click="handleDeleteComment(row.commentId)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </template>
    <el-empty v-else-if="!loading" description="请选择圈子" :image-size="64" />
  </div>
</template>

<script lang="ts">
import type { CircleCommentInfo, CircleInfo, CircleMemberInfo, CirclePostInfo } from "@/types/api/circle"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  deleteCircleApi,
  deleteCircleCommentApi,
  deleteCirclePostApi,
  getCircleCommentListApi,
  getCircleDetailApi,
  getCircleMemberListApi,
  getCirclePostListApi,
  removeCircleMemberApi
} from "@/api/circle"

const emptyDetail = (): CircleInfo => ({
  circleId: "",
  name: "",
  description: "",
  avatar: "",
  creatorId: "",
  joinType: 0,
  memberCount: 0,
  postCount: 0,
  isDeleted: false,
  createdAt: "",
  updatedAt: ""
})

export default defineComponent({
  props: {
    circleId: { type: String, default: "" }
  },
  emits: ["go-user", "changed"],
  setup(props, { emit }) {
    const loading = ref(false)
    const membersLoading = ref(false)
    const postsLoading = ref(false)
    const commentLoading = ref(false)
    const detail = reactive<CircleInfo>(emptyDetail())
    const members = ref<CircleMemberInfo[]>([])
    const postList = ref<CirclePostInfo[]>([])
    const commentList = ref<CircleCommentInfo[]>([])
    const memberKeyword = ref("")
    const selectedMember = ref<CircleMemberInfo | null>(null)
    const activePostId = ref("")
    const postPagination = reactive({ page: 1, pageSize: 10, total: 0 })
    const commentPagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const roleLabel = (role: number) => {
      const map: Record<number, string> = { 1: "圈主", 2: "管理员", 3: "成员" }
      return map[role] || `角色${role}`
    }

    const joinTypeText = (t: number) => (t === 1 ? "审批加入" : "自由加入")

    const filteredMembers = computed(() => {
      const kw = memberKeyword.value.trim().toLowerCase()
      if (!kw) return members.value
      return members.value.filter(m =>
        (m.nickName || "").toLowerCase().includes(kw) ||
        m.userId.toLowerCase().includes(kw)
      )
    })

    const loadMembers = async () => {
      if (!props.circleId) return
      membersLoading.value = true
      const res = await getCircleMemberListApi({ circleId: props.circleId, page: 1, limit: 200 })
      membersLoading.value = false
      if (res.code === 0) {
        members.value = res.result.list || []
      }
    }

    const loadPosts = async () => {
      if (!props.circleId) return
      postsLoading.value = true
      const res = await getCirclePostListApi({
        circleId: props.circleId,
        page: postPagination.page,
        limit: postPagination.pageSize
      })
      postsLoading.value = false
      if (res.code === 0) {
        postList.value = res.result.list || []
        postPagination.total = res.result.total || 0
        if (activePostId.value && !postList.value.find(p => p.postId === activePostId.value)) {
          activePostId.value = postList.value[0]?.postId || ""
        }
        if (!activePostId.value && postList.value.length) {
          activePostId.value = postList.value[0].postId
        }
        if (activePostId.value) {
          await loadComments()
        } else {
          commentList.value = []
          commentPagination.total = 0
        }
      }
    }

    const loadComments = async () => {
      if (!activePostId.value) return
      commentLoading.value = true
      const res = await getCircleCommentListApi({
        postId: activePostId.value,
        page: commentPagination.page,
        limit: commentPagination.pageSize
      })
      commentLoading.value = false
      if (res.code === 0) {
        commentList.value = res.result.list || []
        commentPagination.total = res.result.total || 0
      }
    }

    const loadDetail = async () => {
      if (!props.circleId) {
        Object.assign(detail, emptyDetail())
        members.value = []
        postList.value = []
        commentList.value = []
        activePostId.value = ""
        selectedMember.value = null
        return
      }
      loading.value = true
      postPagination.page = 1
      commentPagination.page = 1
      activePostId.value = ""
      selectedMember.value = null
      const res = await getCircleDetailApi(props.circleId)
      loading.value = false
      if (res.code === 0) {
        Object.assign(detail, res.result)
        await Promise.all([loadMembers(), loadPosts()])
      } else {
        ElMessage.error(res.msg || "加载圈子失败")
        Object.assign(detail, emptyDetail())
      }
    }

    const handleDissolve = async () => {
      await ElMessageBox.confirm(`确认解散圈子「${detail.name}」？此操作不可撤销。`, "解散圈子", { type: "error" })
      const res = await deleteCircleApi(detail.circleId)
      if (res.code === 0) {
        ElMessage.success("圈子已解散")
        emit("changed")
        loadDetail()
      } else {
        ElMessage.error(res.msg || "解散失败")
      }
    }

    const handleRemoveMember = async (row: CircleMemberInfo) => {
      await ElMessageBox.confirm(`确认移除成员「${row.nickName || row.userId}」？`, "移除成员", { type: "warning" })
      const res = await removeCircleMemberApi({ circleId: detail.circleId, memberIds: [row.userId] })
      if (res.code === 0) {
        ElMessage.success("已移除")
        selectedMember.value = null
        loadMembers()
        emit("changed")
      } else {
        ElMessage.error(res.msg || "移除失败")
      }
    }

    const handleDeletePost = async (postId: string) => {
      await ElMessageBox.confirm("确认删除这条帖子？", "删除帖子", { type: "warning" })
      const res = await deleteCirclePostApi(postId)
      if (res.code === 0) {
        ElMessage.success("已删除")
        if (activePostId.value === postId) activePostId.value = ""
        loadPosts()
        loadDetail()
        emit("changed")
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const handleDeleteComment = async (commentId: string) => {
      await ElMessageBox.confirm("确认删除这条评论？", "删除评论", { type: "warning" })
      const res = await deleteCircleCommentApi(commentId)
      if (res.code === 0) {
        ElMessage.success("已删除")
        loadComments()
        loadPosts()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    }

    const onPostSelect = (row: CirclePostInfo | undefined) => {
      activePostId.value = row?.postId || ""
      commentPagination.page = 1
      if (activePostId.value) loadComments()
    }

    const onPostPageChange = (page: number) => {
      postPagination.page = page
      loadPosts()
    }

    watch(() => props.circleId, loadDetail, { immediate: true })

    return {
      loading,
      membersLoading,
      postsLoading,
      commentLoading,
      detail,
      members,
      postList,
      commentList,
      memberKeyword,
      selectedMember,
      activePostId,
      postPagination,
      commentPagination,
      filteredMembers,
      roleLabel,
      joinTypeText,
      handleDissolve,
      handleRemoveMember,
      handleDeletePost,
      handleDeleteComment,
      onPostSelect,
      onPostPageChange,
      emit
    }
  }
})
</script>

<style lang="less">
.user-circle-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  .user-circle-panel__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .user-circle-panel__info {
    flex: 1;
    min-width: 0;
  }

  .user-circle-panel__title {
    margin: 0 0 4px;
    font-size: 16px;
  }

  .user-circle-panel__meta {
    margin: 0 0 8px;
    color: #606266;
    font-size: 13px;
  }

  .user-circle-panel__tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }

  .user-circle-panel__desc {
    margin: 0;
    color: #606266;
    font-size: 13px;
  }

  .user-circle-panel__actions {
    flex-shrink: 0;
  }

  .user-circle-panel__body {
    flex: 1;
    display: flex;
    gap: 12px;
    min-height: 0;
  }

  .user-circle-panel__members {
    width: 240px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    overflow: hidden;
  }

  .user-circle-panel__members-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid #ebeef5;
    font-weight: 600;
    font-size: 14px;
  }

  .user-circle-panel__members-search {
    margin: 8px;
  }

  .user-circle-panel__member-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px 8px;
    min-height: 120px;
  }

  .user-circle-panel__member-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 4px;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
    }
  }

  .user-circle-panel__member-info {
    flex: 1;
    min-width: 0;
  }

  .user-circle-panel__member-name {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-circle-panel__member-actions {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid #ebeef5;
  }

  .user-circle-panel__posts {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .user-circle-panel__posts-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  .user-circle-panel__pagination {
    margin-top: 12px;
    justify-content: flex-end;
  }

  .user-circle-panel__comments {
    margin-top: 16px;
  }

  .user-circle-panel__comments-head {
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
