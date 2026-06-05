<template>
  <div class="risk-users">
    <div class="risk-users__header">
      <h2 class="risk-users__title">风险用户</h2>
      <p class="risk-users__hint">已封禁及高风险账号，支持就地封禁/解封与处置留痕</p>
    </div>

    <el-form :inline="true" class="risk-users__form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="昵称/邮箱/ID" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" style="width: 100px" @change="handleSearch">
          <el-option label="已封禁" :value="2" />
          <el-option label="正常" :value="1" />
          <el-option label="全部" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="userList" border stripe>
      <el-table-column prop="nickName" label="用户" width="120" />
      <el-table-column prop="id" label="用户ID" min-width="140" show-overflow-tooltip />
      <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 2 ? 'danger' : 'success'" size="small">
            {{ row.status === 2 ? "已封禁" : "正常" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="170" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="goProfile(row.id)">用户360</el-button>
          <el-button type="warning" link @click="goSanctions(row.id)">处置记录</el-button>
          <el-button v-if="row.status !== 2" link type="danger" @click="handleBan(row)">封禁</el-button>
          <el-button v-else link type="success" @click="handleUnban(row)">解封</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="risk-users__pagination"
      background
      layout="total, prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="onPageChange"
    />

    <el-dialog v-model="banDialogVisible" title="封禁用户" width="420px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ banTarget?.nickName }} ({{ banTarget?.id }})</span>
        </el-form-item>
        <el-form-item label="原因" required>
          <el-input v-model="banReason" type="textarea" :rows="3" placeholder="封禁原因，将写入审计日志" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="confirmBan">确认封禁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IUserInfo } from "@/types/api/user"
import { ElMessage, ElMessageBox } from "element-plus"
import { executeUserControlApi } from "@/api/moderation"
import { getUserListApi } from "@/api/user"

export default defineComponent({
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const actionLoading = ref(false)
    const banDialogVisible = ref(false)
    const banReason = ref("")
    const banTarget = ref<IUserInfo | null>(null)
    const userList = ref<IUserInfo[]>([])
    const searchForm = reactive({ keyword: "", status: 2 })
    const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

    const fetchList = async () => {
      loading.value = true
      const res = await getUserListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        status: searchForm.status || undefined
      })
      loading.value = false
      if (res.code === 0) {
        userList.value = res.result.list || []
        pagination.total = res.result.total || 0
      } else {
        ElMessage.error(res.msg || "加载失败")
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      fetchList()
    }

    const onPageChange = (page: number) => {
      pagination.page = page
      fetchList()
    }

    const goProfile = (userId: string) => router.push(`/user/profile/${userId}`)
    const goSanctions = (userId: string) => router.push({ path: "/user/sanctions", query: { userId } })

    const handleBan = (row: IUserInfo) => {
      banTarget.value = row
      banReason.value = ""
      banDialogVisible.value = true
    }

    const confirmBan = async () => {
      if (!banTarget.value || !banReason.value.trim()) {
        ElMessage.warning("请填写封禁原因")
        return
      }
      actionLoading.value = true
      const res = await executeUserControlApi({
        userId: banTarget.value.id,
        action: "ban_user",
        reason: banReason.value.trim()
      })
      actionLoading.value = false
      if (res.code === 0) {
        ElMessage.success("已封禁")
        banDialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || "封禁失败")
      }
    }

    const handleUnban = async (row: IUserInfo) => {
      await ElMessageBox.confirm(`确认解封用户 ${row.nickName || row.id}？`, "解封", { type: "warning" })
      const res = await executeUserControlApi({
        userId: row.id,
        action: "unban_user",
        reason: "风控中心解封"
      })
      if (res.code === 0) {
        ElMessage.success("已解封")
        fetchList()
      } else {
        ElMessage.error(res.msg || "解封失败")
      }
    }

    onMounted(fetchList)

    return {
      loading, actionLoading, banDialogVisible, banReason, banTarget, userList, searchForm, pagination,
      handleSearch, onPageChange, goProfile, goSanctions, handleBan, confirmBan, handleUnban
    }
  }
})
</script>

<style lang="less" scoped>
.risk-users {
  padding: 20px;

  &__header { margin-bottom: 16px; }
  &__title { margin: 0 0 4px; }
  &__hint { margin: 0; color: #909399; font-size: 13px; }
  &__form { margin-bottom: 12px; }
  &__pagination { margin-top: 16px; justify-content: flex-end; }
}
</style>
