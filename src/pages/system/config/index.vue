<template>
  <div class="system-config">
    <div class="system-config__header">
      <h2 class="system-config__title">字典与参数</h2>
      <p class="system-config__hint">基础字典、运营概览与常用配置入口</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="运营概览" name="overview">
        <el-row v-loading="overviewLoading" :gutter="16" class="system-config__stats">
          <el-col :span="6">
            <div class="stat-card">
              <span class="stat-card__num">{{ overview?.userTotal ?? "-" }}</span>
              <span class="stat-card__label">用户总数</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <span class="stat-card__num">{{ overview?.groupTotal ?? "-" }}</span>
              <span class="stat-card__label">群组总数</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <span class="stat-card__num">{{ overview?.pendingReportCount ?? "-" }}</span>
              <span class="stat-card__label">待处理举报</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <span class="stat-card__num">{{ sensitiveWordTotal }}</span>
              <span class="stat-card__label">启用敏感词</span>
            </div>
          </el-col>
        </el-row>
        <div class="system-config__links">
          <el-button @click="goTo('/safety/policy')">敏感词库管理</el-button>
          <el-button @click="goTo('/release/apps')">版本发布</el-button>
          <el-button @click="goTo('/system/roles')">角色与权限</el-button>
          <el-button @click="goTo('/data/events')">事件统计</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="城市字典" name="cities">
        <el-form :inline="true" class="system-config__form">
          <el-form-item label="关键词">
            <el-input v-model="cityKeyword" placeholder="城市名/代码" clearable @keyup.enter="filterCities" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="filterCities">筛选</el-button>
            <el-button @click="resetCityFilter">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="cityLoading" :data="displayCities" border stripe max-height="480">
          <el-table-column prop="code" label="城市代码" width="120" />
          <el-table-column prop="name" label="城市名称" min-width="160" />
        </el-table>
        <div class="system-config__count">共 {{ displayCities.length }} 条</div>
      </el-tab-pane>

      <el-tab-pane label="快捷入口" name="links">
        <div class="system-config__links">
          <el-button @click="goTo('/release/apps')">版本发布</el-button>
          <el-button @click="goTo('/system/roles')">角色与权限</el-button>
          <el-button @click="goTo('/data/events')">事件统计</el-button>
          <el-button @click="goTo('/safety/policy')">敏感词与策略</el-button>
          <el-button @click="goTo('/open/developers')">开发者审核</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import type { ICityInfo } from "@/types/api/dictionary"
import type { IDashboardOverview } from "@/types/api/overview"
import { ElMessage } from "element-plus"
import { getCitiesApi } from "@/api/dictionary"
import { getDashboardOverviewApi } from "@/api/overview"
import { getSensitiveWordListApi } from "@/api/moderation"

export default defineComponent({
  setup() {
    const router = useRouter()
    const activeTab = ref("overview")
    const cityLoading = ref(false)
    const overviewLoading = ref(false)
    const cityKeyword = ref("")
    const cityList = ref<ICityInfo[]>([])
    const overview = ref<IDashboardOverview | null>(null)
    const sensitiveWordTotal = ref("-")

    const displayCities = computed(() => {
      const kw = cityKeyword.value.trim().toLowerCase()
      if (!kw) return cityList.value
      return cityList.value.filter(c =>
        c.name.toLowerCase().includes(kw) || c.code.toLowerCase().includes(kw)
      )
    })

    const fetchCities = async () => {
      cityLoading.value = true
      const res = await getCitiesApi({})
      cityLoading.value = false
      if (res.code === 0) {
        cityList.value = res.result.cities || []
      } else {
        ElMessage.error(res.msg || "加载城市字典失败")
      }
    }

    const fetchOverview = async () => {
      overviewLoading.value = true
      const [dashRes, wordRes] = await Promise.all([
        getDashboardOverviewApi(),
        getSensitiveWordListApi({ page: 1, pageSize: 1, isActive: true })
      ])
      overviewLoading.value = false
      if (dashRes.code === 0) {
        overview.value = dashRes.result
      }
      if (wordRes.code === 0) {
        sensitiveWordTotal.value = String(wordRes.result.total || 0)
      }
    }

    const filterCities = () => {}
    const resetCityFilter = () => { cityKeyword.value = "" }
    const goTo = (path: string) => router.push(path)

    watch(activeTab, tab => {
      if (tab === "cities" && !cityList.value.length) fetchCities()
      if (tab === "overview" && !overview.value) fetchOverview()
    })

    onMounted(fetchOverview)

    return {
      activeTab, cityLoading, overviewLoading, cityKeyword, displayCities,
      overview, sensitiveWordTotal,
      filterCities, resetCityFilter, goTo
    }
  }
})
</script>

<style lang="less" scoped>
.system-config {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__count { margin-top: 8px; color: #909399; font-size: 13px; }
  &__links { display: flex; flex-wrap: wrap; gap: 8px; }
  &__stats { margin-bottom: 16px; }

  .stat-card {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 16px;
    text-align: center;

    &__num {
      display: block;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    &__label {
      font-size: 13px;
      color: #909399;
    }
  }
}
</style>
