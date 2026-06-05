<template>
  <div class="unified-search">
    <div class="search-header">
      <h2>统一检索</h2>
      <p class="hint">支持用户ID、邮箱、群组ID、消息ID、会话ID</p>
    </div>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="输入关键词检索"
        clearable
        size="large"
        @keyup.enter="doSearch"
      >
        <template #append>
          <el-button :loading="loading" type="primary" @click="doSearch">检索</el-button>
        </template>
      </el-input>
    </div>

    <div v-loading="loading" class="search-results">
      <section v-if="result.users.length" class="result-section">
        <h3>用户 ({{ result.users.length }})</h3>
        <div
          v-for="u in result.users"
          :key="u.userId"
          class="result-item"
          @click="goUserProfile(u.userId)"
        >
          <span class="title">{{ u.nickName || u.userId }}</span>
          <span class="sub">{{ u.email }} · {{ statusLabel(u.status) }}</span>
        </div>
      </section>

      <section v-if="result.groups.length" class="result-section">
        <h3>群组 ({{ result.groups.length }})</h3>
        <div
          v-for="g in result.groups"
          :key="g.groupId"
          class="result-item"
          @click="goGroupList(g.groupId)"
        >
          <span class="title">{{ g.title || g.groupId }}</span>
          <span class="sub">{{ g.groupId }}</span>
        </div>
      </section>

      <section v-if="result.messages.length" class="result-section">
        <h3>消息 ({{ result.messages.length }})</h3>
        <div
          v-for="m in result.messages"
          :key="m.messageId"
          class="result-item"
          @click="goMessage(m.messageId)"
        >
          <span class="title">{{ m.msgPreview || m.messageId }}</span>
          <span class="sub">{{ m.sendUserId }} · {{ m.createTime }}</span>
        </div>
      </section>

      <section v-if="result.conversations.length" class="result-section">
        <h3>会话 ({{ result.conversations.length }})</h3>
        <div
          v-for="c in result.conversations"
          :key="c.conversationId"
          class="result-item"
          @click="goSessionAudit(c.conversationId)"
        >
          <span class="title">{{ c.conversationId }}</span>
          <span class="sub">{{ c.lastMessage }}</span>
        </div>
      </section>

      <el-empty v-if="searched && !hasResult" description="未找到匹配结果" />
    </div>
  </div>
</template>

<script lang="ts">
import type { IAdminUnifiedSearchRes } from "@/types/api/operations"
import { ElMessage } from "element-plus"
import { adminUnifiedSearchApi } from "@/api/operations"

const emptyResult = (): IAdminUnifiedSearchRes => ({
  users: [], groups: [], messages: [], conversations: []
})

export default defineComponent({
  setup() {
    const router = useRouter()
    const route = useRoute()
    const keyword = ref("")
    const loading = ref(false)
    const searched = ref(false)
    const result = ref<IAdminUnifiedSearchRes>(emptyResult())

    const hasResult = computed(() =>
      result.value.users.length > 0
      || result.value.groups.length > 0
      || result.value.messages.length > 0
      || result.value.conversations.length > 0
    )

    const statusLabel = (s: number) => (s === 2 ? "禁用" : s === 3 ? "已删除" : "正常")

    const doSearch = async () => {
      if (!keyword.value.trim()) {
        ElMessage.warning("请输入关键词")
        return
      }
      loading.value = true
      searched.value = true
      const res = await adminUnifiedSearchApi({ keyword: keyword.value.trim(), limit: 15 })
      loading.value = false
      if (res.code === 0) {
        result.value = res.result
      } else {
        ElMessage.error(res.msg || "检索失败")
        result.value = emptyResult()
      }
    }

    const goUserProfile = (userId: string) => router.push(`/user/profile/${userId}`)
    const goGroupList = (groupId: string) => router.push(`/group/profile/${groupId}`)
    const goMessage = (messageId: string) => {
      router.push({ path: "/compliance/messages", query: { messageId } })
    }
    const goSessionAudit = (conversationId: string) => {
      router.push({ path: "/compliance/sessions", query: { conversationId } })
    }

    onMounted(() => {
      const q = route.query.q as string
      if (q) {
        keyword.value = q
        doSearch()
      }
    })

    return {
      keyword, loading, searched, result, hasResult, statusLabel,
      doSearch, goUserProfile, goGroupList, goMessage, goSessionAudit
    }
  }
})
</script>

<style lang="less">
.unified-search {
  padding: 20px;

  .search-header {
    margin-bottom: 20px;

    h2 { margin: 0 0 6px; }
    .hint { color: #909399; font-size: 13px; margin: 0; }
  }

  .search-bar { max-width: 720px; margin-bottom: 24px; }

  .result-section {
    margin-bottom: 24px;

    h3 { font-size: 14px; margin: 0 0 10px; color: #303133; }
  }

  .result-item {
    padding: 12px 14px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;

    &:hover { border-color: #409eff; background: #f5f9ff; }

    .title { display: block; font-weight: 500; margin-bottom: 4px; }
    .sub { font-size: 12px; color: #909399; }
  }
}
</style>
