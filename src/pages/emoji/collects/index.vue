<script>
import { ElMessage, ElMessageBox } from "element-plus"
import { defineComponent, onMounted, reactive, ref } from "vue"
import {
  batchDeleteEmojiCollectsApi,
  deleteEmojiCollectApi,
  getEmojiCollectListApi
} from "@/api/emoji"
import config from "@/config/env"

export default defineComponent({
  name: "EmojiCollectList",
  setup() {
    const loading = ref(false)
    const collectList = ref([])
    const total = ref(0)
    const selectedIds = ref([])

    // 搜索表单
    const searchForm = reactive({
      page: 1,
      pageSize: 10,
      userId: "",
      emojiId: "",
      startTime: "",
      endTime: ""
    })

    // 获取文件预览URL
    const getFilePreviewUrl = (fileName) => {
      return `${config.baseAPI}/api/file/preview/${fileName}`
    }

    // 获取收藏列表
    const fetchCollectList = async () => {
      loading.value = true
      try {
        const res = await getEmojiCollectListApi(searchForm)
        if (res.code === 0) {
          collectList.value = res.result.list || []
          total.value = res.result.total || 0
        } else {
          ElMessage.error(res.msg || "获取收藏列表失败")
        }
      } catch (error) {
        console.error("获取收藏列表失败:", error)
        ElMessage.error("获取收藏列表失败")
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      searchForm.page = 1
      fetchCollectList()
    }

    // 重置
    const handleReset = () => {
      Object.assign(searchForm, {
        page: 1,
        pageSize: 10,
        userId: "",
        emojiId: "",
        startTime: "",
        endTime: ""
      })
      fetchCollectList()
    }

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      searchForm.pageSize = size
      searchForm.page = 1
      fetchCollectList()
    }

    // 处理当前页变化
    const handleCurrentChange = (page) => {
      searchForm.page = page
      fetchCollectList()
    }

    // 处理选择变化
    const handleSelectionChange = (selection) => {
      selectedIds.value = selection.map(item => item.id)
    }

    // 删除收藏记录
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除用户 ${row.userId} 对表情 "${row.emojiTitle}" 的收藏记录吗？此操作不可恢复。`,
          "确认删除",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )

        const res = await deleteEmojiCollectApi(row.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          fetchCollectList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除收藏记录失败:", error)
          ElMessage.error("删除失败")
        }
      }
    }

    // 批量删除收藏记录
    const handleBatchDelete = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedIds.value.length} 条收藏记录吗？此操作不可恢复。`,
          "确认批量删除",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )

        const res = await batchDeleteEmojiCollectsApi({ ids: selectedIds.value })
        if (res.code === 0) {
          ElMessage.success("批量删除成功")
          selectedIds.value = []
          fetchCollectList()
        } else {
          ElMessage.error(res.msg || "批量删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("批量删除收藏记录失败:", error)
          ElMessage.error("批量删除失败")
        }
      }
    }

    onMounted(() => {
      fetchCollectList()
    })

    return {
      loading,
      collectList,
      total,
      selectedIds,
      searchForm,
      getFilePreviewUrl,
      fetchCollectList,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleSelectionChange,
      handleDelete,
      handleBatchDelete
    }
  }
})
</script>

<template>
  <div class="emoji-collect-list">
    <!-- 搜索和筛选区域 -->
    <el-card class="box-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.userId"
            placeholder="请输入用户ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="表情ID">
          <el-input
            v-model="searchForm.emojiId"
            placeholder="请输入表情ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="searchForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="searchForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 收藏列表 -->
    <el-card class="box-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>表情收藏管理</span>
          <el-button
            type="danger"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="collectList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="收藏ID" width="120" />
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="emojiId" label="表情ID" width="120" />
        <el-table-column prop="emojiTitle" label="表情名称" min-width="150" />
        <el-table-column prop="emojiFileName" label="表情预览" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.emojiFileName"
              :src="getFilePreviewUrl(row.emojiFileName)"
              :preview-src-list="[getFilePreviewUrl(row.emojiFileName)]"
              style="width: 40px; height: 40px"
              fit="cover"
            />
            <span v-else>无文件</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="收藏时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        :current-page="searchForm.page"
        :page-size="searchForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<style scoped>
.emoji-collect-list {
  padding: 20px;
}

.box-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
