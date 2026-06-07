<template>
  <div class="system-online">
    <el-card class="system-online__card">
      <template #header>
        <div class="system-online__header">
          <span class="system-online__title">连接监控</span>
          <el-tag type="info" size="small">在线 {{ stats.userCount }} 人</el-tag>
          <el-tag size="small">PC {{ stats.desktopCount }}</el-tag>
          <el-tag type="success" size="small">移动 {{ stats.mobileCount }}</el-tag>
        </div>
      </template>

      <el-form :inline="true" class="system-online__form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户ID / 昵称 / 邮箱"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="userList" border stripe>
        <el-table-column prop="userId" label="用户ID" width="120" show-overflow-tooltip />
        <el-table-column label="用户" width="180">
          <template #default="{ row }">
            <div class="system-online__user-cell">
              <el-avatar :size="36">{{ row.nickName?.charAt(0) || row.userId?.charAt(0) || "U" }}</el-avatar>
              <div>
                <div class="system-online__nick">{{ row.nickName || "-" }}</div>
                <div class="system-online__sub">{{ row.email || "-" }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="在线终端" width="160">
          <template #default="{ row }">
            <el-tag
              v-for="(slot, index) in row.slots"
              :key="`${slot.instanceId}-${slot.slot}-${index}`"
              size="small"
              class="system-online__slot-tag"
              :type="slotTagType(slot.slot)"
            >
              {{ slotLabel(slot.slot) }}
            </el-tag>
            <span v-if="!row.slots?.length">-</span>
          </template>
        </el-table-column>
        <el-table-column label="WS 实例" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ formatInstances(row.slots) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="goUserProfile(row.userId)">用户360</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="system-online__pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100]"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import type { IOnlineStats, IOnlineUserItem } from "@/types/api/monitor"
import { ElMessage } from "element-plus"
import { getOnlineStatsApi, getOnlineUserListApi } from "@/api/monitor"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const userList = ref<IOnlineUserItem[]>([])
    const stats = ref<IOnlineStats>({
      userCount: 0,
      desktopCount: 0,
      mobileCount: 0
    })
    const searchForm = reactive({ keyword: "" })
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const slotLabel = (slot: string) => {
      if (slot === "mobile") return "移动端"
      if (slot === "desktop") return "PC 端"
      return slot
    }

    const slotTagType = (slot: string) => {
      if (slot === "mobile") return "success"
      if (slot === "desktop") return "primary"
      return "info"
    }

    const formatInstances = (slots: IOnlineUserItem["slots"]) => {
      if (!slots?.length) return "-"
      return [...new Set(slots.map((item) => item.instanceId))].join("、")
    }

    const fetchStats = async () => {
      const res = await getOnlineStatsApi()
      if (res.code === 0 && res.result) {
        stats.value = res.result
      }
    }

    const fetchList = async () => {
      loading.value = true
      const res = await getOnlineUserListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword.trim() || undefined
      })
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载连接列表失败")
        return
      }
      userList.value = res.result?.list || []
      pagination.total = res.result?.total || 0
    }

    const fetchData = async () => {
      await Promise.all([fetchStats(), fetchList()])
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchData()
    }

    const handleReset = () => {
      searchForm.keyword = ""
      pagination.page = 1
      userList.value = []
      pagination.total = 0
      stats.value = { userCount: 0, desktopCount: 0, mobileCount: 0 }
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const onSizeChange = (size: number) => {
      pagination.pageSize = size
      pagination.page = 1
      fetchList()
    }

    const goUserProfile = (userId: string) => {
      router.push(`/user/profile/${userId}`)
    }

    return {
      loading,
      userList,
      stats,
      searchForm,
      pagination,
      slotLabel,
      slotTagType,
      formatInstances,
      handleSearch,
      handleReset,
      onPageChange,
      onSizeChange,
      goUserProfile
    }
  }
})
</script>

<style scoped lang="less">
.system-online {
  &__card {
    border-radius: 8px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--beaver-text-primary, #2d3436);
  }

  &__form {
    margin-bottom: 16px;
  }

  &__user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__nick {
    font-size: 14px;
    color: var(--beaver-text-primary, #2d3436);
  }

  &__sub {
    margin-top: 2px;
    font-size: 12px;
    color: var(--beaver-text-secondary, #636e72);
  }

  &__slot-tag {
    margin-right: 6px;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
