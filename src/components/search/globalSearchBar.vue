<template>
  <div ref="rootRef" class="global-search-bar">
    <el-input
      v-model="keyword"
      placeholder="全局检索：用户 / 群 / 消息 / 会话 ID"
      clearable
      class="global-search-bar__input"
      @focus="onFocus"
      @keyup.enter="doSearch"
      @clear="onClear"
    >
      <template #append>
        <el-button :icon="Search" :loading="loading" @click="doSearch">检索</el-button>
      </template>
    </el-input>

    <div v-if="panelVisible" v-loading="loading" class="global-search-bar__panel">
      <section v-if="result.users.length" class="global-search-bar__section">
        <h4>用户 ({{ result.users.length }})</h4>
        <div
          v-for="u in result.users"
          :key="u.userId"
          class="global-search-bar__item"
          @click="goUserProfile(u.userId)"
        >
          <span class="global-search-bar__title">{{ u.nickName || u.userId }}</span>
          <span class="global-search-bar__sub">{{ u.email }} · {{ statusLabel(u.status) }}</span>
        </div>
      </section>

      <section v-if="result.groups.length" class="global-search-bar__section">
        <h4>群组 ({{ result.groups.length }})</h4>
        <div
          v-for="g in result.groups"
          :key="g.groupId"
          class="global-search-bar__item"
          @click="goGroupProfile(g.groupId)"
        >
          <span class="global-search-bar__title">{{ g.title || g.groupId }}</span>
          <span class="global-search-bar__sub">{{ g.groupId }}</span>
        </div>
      </section>

      <section v-if="result.messages.length" class="global-search-bar__section">
        <h4>消息 ({{ result.messages.length }})</h4>
        <div
          v-for="m in result.messages"
          :key="m.messageId"
          class="global-search-bar__item"
          @click="goMessage(m.messageId)"
        >
          <span class="global-search-bar__title">{{ m.msgPreview || m.messageId }}</span>
          <span class="global-search-bar__sub">{{ m.sendUserId }} · {{ m.createTime }}</span>
        </div>
      </section>

      <section v-if="result.conversations.length" class="global-search-bar__section">
        <h4>会话 ({{ result.conversations.length }})</h4>
        <div
          v-for="c in result.conversations"
          :key="c.conversationId"
          class="global-search-bar__item"
          @click="goSessionAudit(c.conversationId)"
        >
          <span class="global-search-bar__title">{{ c.conversationId }}</span>
          <span class="global-search-bar__sub">{{ c.lastMessage }}</span>
        </div>
      </section>

      <el-empty v-if="searched && !hasResult && !loading" description="未找到匹配结果" :image-size="56" />
    </div>
  </div>
</template>

<script lang="ts">
import type { IAdminUnifiedSearchRes } from "@/types/api/operations"
import { Search } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { adminUnifiedSearchApi } from "@/api/operations"
import { navigateToUserGroup } from "@/utils/navigateGroup"

const emptyResult = (): IAdminUnifiedSearchRes => ({
  users: [], groups: [], messages: [], conversations: []
})

export default defineComponent({
  setup() {
    const router = useRouter()
    const rootRef = ref<HTMLElement | null>(null)
    const keyword = ref("")
    const loading = ref(false)
    const searched = ref(false)
    const panelVisible = ref(false)
    const result = ref<IAdminUnifiedSearchRes>(emptyResult())

    const hasResult = computed(() =>
      result.value.users.length > 0
      || result.value.groups.length > 0
      || result.value.messages.length > 0
      || result.value.conversations.length > 0
    )

    const statusLabel = (s: number) => (s === 2 ? "禁用" : s === 3 ? "已删除" : "正常")

    const closePanel = () => {
      panelVisible.value = false
    }

    const doSearch = async () => {
      if (!keyword.value.trim()) {
        ElMessage.warning("请输入关键词")
        return
      }
      panelVisible.value = true
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

    const onFocus = () => {
      if (searched.value) panelVisible.value = true
    }

    const onClear = () => {
      searched.value = false
      result.value = emptyResult()
      closePanel()
    }

    const navigate = (path: string, query?: Record<string, string>) => {
      closePanel()
      if (query) router.push({ path, query })
      else router.push(path)
    }

    const goUserProfile = (userId: string) => navigate(`/user/profile/${userId}`)
    const goGroupProfile = async (groupId: string) => {
      closePanel()
      await navigateToUserGroup(router, groupId)
    }
    const goMessage = (messageId: string) => navigate("/compliance/messages", { messageId })
    const goSessionAudit = (conversationId: string) => navigate("/compliance/sessions", { conversationId })

    const onDocumentClick = (e: MouseEvent) => {
      if (!rootRef.value?.contains(e.target as Node)) closePanel()
    }

    onMounted(() => document.addEventListener("click", onDocumentClick))
    onUnmounted(() => document.removeEventListener("click", onDocumentClick))

    return {
      Search,
      rootRef,
      keyword,
      loading,
      searched,
      panelVisible,
      result,
      hasResult,
      statusLabel,
      doSearch,
      onFocus,
      onClear,
      goUserProfile,
      goGroupProfile,
      goMessage,
      goSessionAudit
    }
  }
})
</script>

<style lang="less">
.global-search-bar {
  position: relative;
  width: 100%;
  max-width: 480px;

  .global-search-bar__input {
    width: 100%;
  }

  .global-search-bar__panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 2000;
    max-height: 480px;
    overflow-y: auto;
    padding: 12px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .global-search-bar__section {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      margin: 0 0 8px;
      font-size: 13px;
      color: #606266;
    }
  }

  .global-search-bar__item {
    padding: 10px 12px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    margin-bottom: 6px;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
      background: #f5f9ff;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .global-search-bar__title {
    display: block;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 2px;
  }

  .global-search-bar__sub {
    font-size: 12px;
    color: #909399;
  }
}
</style>
