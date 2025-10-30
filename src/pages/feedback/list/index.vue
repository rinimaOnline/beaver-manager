<script>
import { ElMessage, ElMessageBox } from "element-plus"
import { defineComponent, onMounted, reactive, ref } from "vue"
import { deleteFeedbackApi, getFeedbackDetailApi, getFeedbackListApi, handleFeedbackApi } from "@/api/feedback"
import { FeedbackStatus, FeedbackType } from "@/types/api/feedback"

export default defineComponent({
  name: "FeedbackList",
  setup() {
    const loading = ref(false)
    const feedbackList = ref([])
    const total = ref(0)
    const detailDialogVisible = ref(false)
    const processDialogVisible = ref(false)
    const currentFeedback = ref(null)
    const processFormRef = ref(null)

    // 反馈类型映射
    const feedbackTypeMap = {
      [FeedbackType.BUG_REPORT]: "错误报告",
      [FeedbackType.FEATURE_REQUEST]: "功能请求",
      [FeedbackType.GENERAL_FEEDBACK]: "一般反馈",
      [FeedbackType.COMPLAINT]: "投诉建议",
      [FeedbackType.OTHER]: "其他"
    }

    // 反馈状态映射
    const feedbackStatusMap = {
      [FeedbackStatus.PENDING]: "待处理",
      [FeedbackStatus.IN_PROGRESS]: "处理中",
      [FeedbackStatus.RESOLVED]: "已解决",
      [FeedbackStatus.REJECTED]: "已拒绝",
      [FeedbackStatus.CLOSED]: "已关闭"
    }

    // 搜索表单
    const searchForm = reactive({
      page: 1,
      limit: 10,
      keywords: "",
      userId: "",
      type: null,
      status: null
    })

    // 处理表单
    const processForm = reactive({
      status: null,
      handlerId: null,
      handleResult: ""
    })

    // 处理表单验证规则
    const processFormRules = {
      status: [
        { required: true, message: "请选择处理状态", trigger: "change" }
      ],
      handlerId: [
        { required: true, message: "请输入处理人ID", trigger: "blur" }
      ],
      handleResult: [
        { required: true, message: "请输入处理结果", trigger: "blur" }
      ]
    }

    // 获取反馈列表
    const fetchFeedbackList = async () => {
      loading.value = true
      try {
        const res = await getFeedbackListApi(searchForm)
        if (res.code === 0) {
          feedbackList.value = res.result.list || []
          total.value = res.result.total || 0
        } else {
          ElMessage.error(res.msg || "获取反馈列表失败")
        }
      } catch (error) {
        console.error("获取反馈列表失败:", error)
        ElMessage.error("获取反馈列表失败")
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      searchForm.page = 1
      fetchFeedbackList()
    }

    // 重置
    const handleReset = () => {
      Object.assign(searchForm, {
        page: 1,
        limit: 10,
        keywords: "",
        userId: "",
        type: null,
        status: null
      })
      fetchFeedbackList()
    }

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      searchForm.limit = size
      searchForm.page = 1
      fetchFeedbackList()
    }

    // 处理当前页变化
    const handleCurrentChange = (page) => {
      searchForm.page = page
      fetchFeedbackList()
    }

    // 查看详情
    const handleDetail = async (row) => {
      try {
        const res = await getFeedbackDetailApi(row.id)
        if (res.code === 0) {
          currentFeedback.value = res.result
          detailDialogVisible.value = true
        } else {
          ElMessage.error(res.msg || "获取反馈详情失败")
        }
      } catch (error) {
        console.error("获取反馈详情失败:", error)
        ElMessage.error("获取反馈详情失败")
      }
    }

    // 处理反馈
    const handleProcess = (row) => {
      currentFeedback.value = row
      // 重置处理表单
      Object.assign(processForm, {
        status: null,
        handlerId: null,
        handleResult: ""
      })
      processDialogVisible.value = true
    }

    // 提交处理
    const submitProcess = async () => {
      if (!processFormRef.value) return

      try {
        await processFormRef.value.validate()

        const res = await handleFeedbackApi(currentFeedback.value.id, processForm)
        if (res.code === 0) {
          ElMessage.success("处理成功")
          processDialogVisible.value = false
          fetchFeedbackList()
        } else {
          ElMessage.error(res.msg || "处理失败")
        }
      } catch (error) {
        console.error("处理反馈失败:", error)
        ElMessage.error("处理失败")
      }
    }

    // 删除反馈
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除反馈 ID: ${row.id} 吗？此操作不可恢复。`,
          "确认删除",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )

        const res = await deleteFeedbackApi(row.id)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          fetchFeedbackList()
        } else {
          ElMessage.error(res.msg || "删除失败")
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除反馈失败:", error)
          ElMessage.error("删除失败")
        }
      }
    }

    // 获取类型标签类型
    const getTypeTagType = (type) => {
      const typeMap = {
        [FeedbackType.BUG_REPORT]: "danger",
        [FeedbackType.FEATURE_REQUEST]: "primary",
        [FeedbackType.GENERAL_FEEDBACK]: "info",
        [FeedbackType.COMPLAINT]: "warning",
        [FeedbackType.OTHER]: ""
      }
      return typeMap[type] || ""
    }

    // 获取状态标签类型
    const getStatusTagType = (status) => {
      const statusMap = {
        [FeedbackStatus.PENDING]: "warning",
        [FeedbackStatus.IN_PROGRESS]: "primary",
        [FeedbackStatus.RESOLVED]: "success",
        [FeedbackStatus.REJECTED]: "danger",
        [FeedbackStatus.CLOSED]: "info"
      }
      return statusMap[status] || ""
    }

    onMounted(() => {
      fetchFeedbackList()
    })

    return {
      loading,
      feedbackList,
      total,
      searchForm,
      processForm,
      processFormRef,
      processFormRules,
      detailDialogVisible,
      processDialogVisible,
      currentFeedback,
      feedbackTypeMap,
      feedbackStatusMap,
      fetchFeedbackList,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleDetail,
      handleProcess,
      submitProcess,
      handleDelete,
      getTypeTagType,
      getStatusTagType
    }
  }
})
</script>

<template>
  <div class="feedback-list">
    <!-- 搜索和筛选区域 -->
    <el-card class="box-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keywords"
            placeholder="请输入搜索关键词"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.userId"
            placeholder="请输入用户ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="反馈类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in feedbackTypeMap"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in feedbackStatusMap"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
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

    <!-- 反馈列表 -->
    <el-card class="box-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>反馈管理</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="feedbackList"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ feedbackTypeMap[row.type] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ feedbackStatusMap[row.status] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileNames" label="附件" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.fileNames && row.fileNames.length > 0" size="small">
              {{ row.fileNames.length }}个
            </el-tag>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="handlerId" label="处理人ID" width="100">
          <template #default="{ row }">
            <span v-if="row.handlerId">{{ row.handlerId }}</span>
            <span v-else style="color: #ccc">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 1 || row.status === 2"
              size="small"
              type="primary"
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        :current-page="searchForm.page"
        :page-size="searchForm.limit"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 反馈详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="反馈详情"
      width="50%"
    >
      <div v-if="currentFeedback">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="反馈ID">
            {{ currentFeedback.id }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ currentFeedback.userId }}
          </el-descriptions-item>
          <el-descriptions-item label="反馈类型">
            <el-tag :type="getTypeTagType(currentFeedback.type)">
              {{ feedbackTypeMap[currentFeedback.type] || '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusTagType(currentFeedback.status)">
              {{ feedbackStatusMap[currentFeedback.status] || '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人ID">
            {{ currentFeedback.handlerId || '未分配' }}
          </el-descriptions-item>
          <el-descriptions-item label="处理时间">
            {{ currentFeedback.handleTime || '未处理' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ currentFeedback.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="反馈内容" :span="2">
            <div style="max-height: 200px; overflow-y: auto; white-space: pre-wrap;">
              {{ currentFeedback.content }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentFeedback.handleResult" label="处理结果" :span="2">
            <div style="max-height: 200px; overflow-y: auto; white-space: pre-wrap;">
              {{ currentFeedback.handleResult }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentFeedback.fileNames && currentFeedback.fileNames.length > 0" label="附件文件" :span="2">
            <div>
              <el-tag
                v-for="fileName in currentFeedback.fileNames"
                :key="fileName"
                style="margin-right: 10px; margin-bottom: 5px;"
              >
                {{ fileName }}
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 处理反馈对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理反馈"
      width="40%"
    >
      <el-form
        ref="processFormRef"
        :model="processForm"
        :rules="processFormRules"
        label-width="100px"
      >
        <el-form-item label="处理状态" prop="status">
          <el-select v-model="processForm.status" placeholder="请选择处理状态">
            <el-option label="处理中" :value="2" />
            <el-option label="已解决" :value="3" />
            <el-option label="已拒绝" :value="4" />
            <el-option label="已关闭" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人ID" prop="handlerId">
          <el-input
            v-model.number="processForm.handlerId"
            placeholder="请输入处理人ID"
            type="number"
          />
        </el-form-item>
        <el-form-item label="处理结果" prop="handleResult">
          <el-input
            v-model="processForm.handleResult"
            type="textarea"
            :rows="4"
            placeholder="请输入处理结果"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcess">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.feedback-list {
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
