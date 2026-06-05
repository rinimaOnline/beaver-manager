<template>
  <div class="user-sanctions">
    <div class="user-sanctions__header">
      <h2 class="user-sanctions__title">账号处置记录</h2>
      <p class="user-sanctions__hint">封禁、解封等账号级管控操作留痕，可关联用户360与工单</p>
    </div>

    <el-form :inline="true" class="user-sanctions__form">
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.targetId" placeholder="被处置用户ID" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="动作">
        <el-select v-model="searchForm.actionType" placeholder="全部" clearable style="width: 120px">
          <el-option label="封禁" value="ban_user" />
          <el-option label="解封" value="unban_user" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人">
        <el-input v-model="searchForm.operatorId" placeholder="管理员ID" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button link type="primary" @click="goRiskUsers">前往封禁</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="logList" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="动作" width="90">
        <template #default="{ row }">
          <el-tag :type="row.action === 'ban_user' ? 'danger' : 'success'" size="small">
            {{ actionLabel(row.action) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetId" label="用户ID" min-width="140" show-overflow-tooltip />
      <el-table-column prop="operatorId" label="操作人" width="140" />
      <el-table-column prop="caseId" label="工单" width="80">
        <template #default="{ row }">
          <el-button v-if="row.caseId" type="primary" link @click="goCase(row.caseId)">{{ row.caseId }}</el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="结果" width="80">
        <template #default="{ row }">
          <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="detail" label="详情" min-width="160" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="goUser(row.targetId)">用户360</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="user-sanctions__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />
  </div>
</template>

<script lang="ts">
import type { IGetOperationLogListReq, IOperationLogInfo } from "@/types/api/moderation"
import { ElMessage } from "element-plus"
import { getOperationLogListApi } from "@/api/moderation"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const logList = ref<IOperationLogInfo[]>([])
    const searchForm = reactive({
      targetId: "",
      actionType: "" as string,
      operatorId: ""
    })
    const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

    const actionLabel = (action: string) => {
      const map: Record<string, string> = { ban_user: "封禁", unban_user: "解封" }
      return map[action] || action
    }

    const buildParams = (): IGetOperationLogListReq => {
      const params: IGetOperationLogListReq = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        targetType: "user"
      }
      if (searchForm.targetId) {
        params.targetId = searchForm.targetId
      }
      if (searchForm.operatorId) {
        params.operatorId = searchForm.operatorId
      }
      if (searchForm.actionType) {
        params.action = searchForm.actionType
      } else {
        params.actions = "ban_user,unban_user"
      }
      return params
    }

    const fetchList = async () => {
      loading.value = true
      const res = await getOperationLogListApi(buildParams())
      loading.value = false
      if (res.code === 0) {
        logList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const handleReset = () => {
      searchForm.targetId = ""
      searchForm.actionType = ""
      searchForm.operatorId = ""
      handleSearch()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const goUser = (userId: string) => {
      if (userId) {
        router.push(`/user/profile/${userId}`)
      }
    }

    const goCase = (caseId: number) => {
      router.push({ path: "/safety/cases", query: { caseId: String(caseId) } })
    }

    const goRiskUsers = () => router.push("/risk/users")

    onMounted(() => {
      const qUserId = route.query.userId as string
      if (qUserId) {
        searchForm.targetId = qUserId
      }
      fetchList()
    })

    return {
      loading, logList, searchForm, pagination,
      actionLabel, handleSearch, handleReset, onPageChange, goUser, goCase, goRiskUsers
    }
  }
})
</script>

<style lang="less">
.user-sanctions {
  padding: 20px;

  .user-sanctions__header {
    margin-bottom: 16px;

    .user-sanctions__title {
      margin-top: 0;
      margin-bottom: 4px;
      margin-left: 0;
      margin-right: 0;
    }

    .user-sanctions__hint {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      color: #909399;
      font-size: 13px;
    }
  }

  .user-sanctions__form {
    margin-bottom: 12px;
  }

  .user-sanctions__pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
