<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-manager-header-v1
-->

<template>
  <div v-loading="loading" class="group-detail">
    <div class="group-detail__bar">
      <el-button link type="primary" @click="$router.push('/group/list')">← 返回群列表</el-button>
    </div>

    <div v-if="info" class="group-detail__body">
      <!-- 左：群资料卡 -->
      <el-card class="group-detail__side" shadow="never">
        <div class="group-detail__hero">
          <el-avatar :src="info.fileName" :size="64">{{ (info.title || info.groupId).slice(0, 1) }}</el-avatar>
          <h3 class="group-detail__name">{{ info.title || "未命名群" }}</h3>
          <div class="group-detail__sub">{{ info.groupId }}</div>
          <el-tag v-if="info.status === 1" size="small" type="success">正常</el-tag>
          <el-tag v-else-if="info.status === 2" size="small" type="warning">冻结</el-tag>
          <el-tag v-else size="small" type="info">已解散</el-tag>
        </div>

        <el-descriptions :column="1" size="small" border class="group-detail__desc">
          <el-descriptions-item label="真实人数">{{ info.memberCount }} 人</el-descriptions-item>
          <el-descriptions-item label="展示人数">
            <el-tag v-if="info.displayMemberText" type="warning" size="small">{{ info.displayMemberText }}</el-tag>
            <span v-else class="group-detail__muted">按真实人数</span>
          </el-descriptions-item>
          <el-descriptions-item label="全员禁言">{{ info.muteAll ? "已开启" : "未开启" }}</el-descriptions-item>
          <el-descriptions-item label="群主">{{ info.creatorId || "—" }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ info.createdAt || "—" }}</el-descriptions-item>
          <el-descriptions-item label="群公告">
            <span v-if="info.notice">{{ info.notice }}</span>
            <span v-else class="group-detail__muted">未设置</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="group-detail__ops">
          <el-button type="primary" :disabled="info.status === 3" @click="openEdit">编辑资料</el-button>
          <el-button
            :disabled="info.status === 3"
            @click="toggleFreeze"
          >{{ info.status === 2 ? "解除冻结" : "冻结群" }}</el-button>
          <el-button type="danger" :disabled="info.status === 3" @click="handleDissolve">解散群</el-button>
        </div>
      </el-card>

      <!-- 右：Tab -->
      <el-card class="group-detail__main" shadow="never">
        <el-tabs v-model="tab">
          <el-tab-pane :label="`成员管理（${memberTotal}）`" name="members">
            <el-form :inline="true" class="group-detail__filter">
              <el-form-item>
                <el-select v-model="roleFilter" placeholder="全部角色" clearable style="width: 140px" @change="loadMembers(1)">
                  <el-option label="群主" :value="1" />
                  <el-option label="管理员" :value="2" />
                  <el-option label="普通成员" :value="3" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <span class="group-detail__muted">只列在册成员（已退出 / 被踢的不显示）</span>
              </el-form-item>
            </el-form>

            <el-table v-loading="memberLoading" :data="members" border stripe size="small">
              <el-table-column label="成员" min-width="200">
                <template #default="{ row }">
                  <div class="group-detail__member">
                    <el-avatar :size="30">{{ (row.displayName || row.userId).slice(0, 1) }}</el-avatar>
                    <div>
                      <div>{{ row.displayName || row.memberNickname || "未命名" }}</div>
                      <div class="group-detail__sub">微聊号 {{ row.weliaoId || "—" }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="角色" width="100" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.role === 1" size="small" type="danger">群主</el-tag>
                  <el-tag v-else-if="row.role === 2" size="small" type="warning">管理员</el-tag>
                  <el-tag v-else size="small" type="info">成员</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="禁言" width="110" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.prohibitionTime > 0" size="small" type="danger">
                    剩 {{ row.prohibitionTime }} 分
                  </el-tag>
                  <span v-else class="group-detail__muted">—</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="加入时间" width="170" />
              <el-table-column label="操作" width="230" fixed="right">
                <template #default="{ row }">
                  <template v-if="row.role !== 1">
                    <el-button link type="primary" @click="toggleRole(row)">
                      {{ row.role === 2 ? "取消管理员" : "设为管理员" }}
                    </el-button>
                    <el-button link type="primary" @click="openMute(row)">
                      {{ row.prohibitionTime > 0 ? "改禁言" : "禁言" }}
                    </el-button>
                    <el-button link type="danger" @click="handleRemove(row)">移除</el-button>
                  </template>
                  <span v-else class="group-detail__muted">群主不可操作</span>
                </template>
              </el-table-column>
              <template #empty>
                <el-empty description="没有匹配的成员" />
              </template>
            </el-table>

            <el-pagination
              class="group-detail__pager"
              background
              layout="total, prev, pager, next"
              :current-page="memberPage"
              :page-size="memberPageSize"
              :total="memberTotal"
              @current-change="loadMembers"
            />
          </el-tab-pane>

          <el-tab-pane :label="`自动发言（${tasks.length}）`" name="autochat">
            <div class="group-detail__filter">
              <el-button type="primary" @click="$router.push({ path: '/group/autochat', query: { groupId: info.groupId } })">
                去配置自动发言
              </el-button>
            </div>
            <el-table v-loading="taskLoading" :data="tasks" border stripe size="small">
              <el-table-column prop="name" label="任务" min-width="160" />
              <el-table-column label="节奏" width="150">
                <template #default="{ row }">
                  {{ row.minIntervalSec }}~{{ row.maxIntervalSec }} 秒 / 条
                </template>
              </el-table-column>
              <el-table-column label="文案 / 虚拟号" width="140" align="center">
                <template #default="{ row }">
                  {{ row.scriptCount }} 条 / {{ row.botReadyCount }} 号
                </template>
              </el-table-column>
              <el-table-column label="已发" width="110" align="center">
                <template #default="{ row }">{{ row.sentTotal }}</template>
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 1" size="small" type="success">运行中</el-tag>
                  <el-tag v-else size="small" type="info">已停用</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="最近状态" min-width="160">
                <template #default="{ row }">
                  <el-tag v-if="row.lastError" size="small" type="danger">{{ row.lastError }}</el-tag>
                  <span v-else-if="row.lastSentAt">{{ formatTime(row.lastSentAt) }}</span>
                  <span v-else class="group-detail__muted">还没发过</span>
                </template>
              </el-table-column>
              <template #empty>
                <el-empty description="这个群还没有自动发言任务" />
              </template>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <el-empty v-else-if="!loading" description="群组不存在或已被删除" />

    <!-- 编辑资料 -->
    <el-dialog v-model="editVisible" title="编辑群组" width="560px" destroy-on-close>
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="群名称">
          <el-input v-model="editForm.title" maxlength="32" show-word-limit />
        </el-form-item>
        <el-form-item label="群公告">
          <el-input v-model="editForm.notice" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="群头像">
          <el-input v-model="editForm.fileName" placeholder="头像图片 URL，留空不改" />
        </el-form-item>
        <el-form-item label="全员禁言">
          <el-switch v-model="editForm.muteAll" />
          <span class="group-detail__hint">开启后自动发言任务也会被一起禁言</span>
        </el-form-item>
        <el-form-item label="展示人数">
          <el-input
            v-model="editForm.displayMemberText"
            maxlength="32"
            show-word-limit
            placeholder="留空按真实人数展示；填了就顶替，如「100万+」"
          />
          <div class="group-detail__hint">
            当前真实人数 {{ info?.memberCount ?? 0 }} 人。这里只改客户端展示的那行字，
            成员列表和入群人数上限仍按真实人数算。
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 禁言 -->
    <el-dialog v-model="muteVisible" title="禁言成员" width="420px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="成员">
          {{ muteTarget?.displayName || muteTarget?.userId }}
        </el-form-item>
        <el-form-item label="禁言时长">
          <el-input-number v-model="muteMinutes" :min="0" :max="43200" />
          <span class="group-detail__hint">分钟，填 0 表示解除禁言</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="muteVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitMute">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { GetGroupDetailRes, GroupMemberInfo } from "@/types/api/group"
import type { IAutoChatTask } from "@/types/api/groupautochat"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  deleteGroupApi,
  getGroupDetailApi,
  getGroupMemberListApi,
  muteGroupMemberApi,
  removeGroupMemberApi,
  updateGroupApi,
  updateMemberRoleApi
} from "@/api/group"
import { getAutoChatTasksApi } from "@/api/groupautochat"
import { defineComponent, onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

export default defineComponent({
  name: "GroupDetail",
  setup() {
    const route = useRoute()
    const router = useRouter()
    const groupDbId = Number(route.params.id)

    const loading = ref(false)
    const saving = ref(false)
    const info = ref<GetGroupDetailRes | null>(null)
    const tab = ref("members")

    const members = ref<GroupMemberInfo[]>([])
    const memberLoading = ref(false)
    const memberPage = ref(1)
    const memberPageSize = 10
    const memberTotal = ref(0)
    const roleFilter = ref<number | undefined>(undefined)

    const tasks = ref<IAutoChatTask[]>([])
    const taskLoading = ref(false)

    const editVisible = ref(false)
    const editForm = reactive({ title: "", notice: "", fileName: "", muteAll: false, displayMemberText: "" })

    const muteVisible = ref(false)
    const muteTarget = ref<GroupMemberInfo | null>(null)
    const muteMinutes = ref(60)

    const loadInfo = async () => {
      loading.value = true
      const res = await getGroupDetailApi(groupDbId)
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载群组失败")
        return
      }
      info.value = res.result || null
    }

    const loadMembers = async (page = 1) => {
      if (!info.value) return
      memberPage.value = page
      memberLoading.value = true
      const res = await getGroupMemberListApi({
        groupId: info.value.groupId,
        page,
        limit: memberPageSize,
        role: roleFilter.value,
        // 只看在册成员：2=退出 3=被踢的不该出现在管理列表里
        status: 1
      })
      memberLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载成员失败")
        return
      }
      members.value = res.result?.list || []
      memberTotal.value = res.result?.total || 0
    }

    const loadTasks = async () => {
      if (!info.value) return
      taskLoading.value = true
      const res = await getAutoChatTasksApi({ groupId: info.value.groupId })
      taskLoading.value = false
      if (res.code !== 0) return
      tasks.value = res.result?.list || []
    }

    const openEdit = () => {
      if (!info.value) return
      editForm.title = info.value.title || ""
      editForm.notice = info.value.notice || ""
      editForm.fileName = info.value.fileName || ""
      editForm.muteAll = info.value.muteAll || false
      editForm.displayMemberText = info.value.displayMemberText || ""
      editVisible.value = true
    }

    const submitEdit = async () => {
      saving.value = true
      const res = await updateGroupApi(groupDbId, {
        title: editForm.title,
        notice: editForm.notice,
        fileName: editForm.fileName,
        muteAll: editForm.muteAll,
        displayMemberText: editForm.displayMemberText.trim()
      })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("已保存")
      editVisible.value = false
      loadInfo()
    }

    // 冻结/解冻走的是 status 字段：2=冻结 1=正常
    const toggleFreeze = async () => {
      if (!info.value) return
      const next = info.value.status === 2 ? 1 : 2
      await ElMessageBox.confirm(
        next === 2
          ? "冻结后该群将无法收发消息，确认冻结？"
          : "确认解除冻结，恢复该群正常使用？",
        next === 2 ? "冻结群" : "解除冻结",
        { type: "warning" }
      )
      const res = await updateGroupApi(groupDbId, { status: next })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      ElMessage.success(next === 2 ? "已冻结" : "已解除冻结")
      loadInfo()
    }

    const handleDissolve = async () => {
      if (!info.value) return
      await ElMessageBox.confirm(
        `确认解散「${info.value.title || info.value.groupId}」？解散后全部成员都会失去该群，此操作不可撤销。`,
        "解散群",
        { type: "warning", confirmButtonText: "确认解散", confirmButtonClass: "el-button--danger" }
      )
      const res = await deleteGroupApi(groupDbId)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "解散失败")
        return
      }
      ElMessage.success("已解散")
      router.push("/group/list")
    }

    const toggleRole = async (row: GroupMemberInfo) => {
      const next = row.role === 2 ? 3 : 2
      const res = await updateMemberRoleApi(row.id, { role: next })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      ElMessage.success(next === 2 ? "已设为管理员" : "已取消管理员")
      loadMembers(memberPage.value)
    }

    const openMute = (row: GroupMemberInfo) => {
      muteTarget.value = row
      muteMinutes.value = row.prohibitionTime > 0 ? row.prohibitionTime : 60
      muteVisible.value = true
    }

    const submitMute = async () => {
      if (!muteTarget.value) return
      saving.value = true
      const res = await muteGroupMemberApi(muteTarget.value.id, { prohibitionTime: muteMinutes.value })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "操作失败")
        return
      }
      ElMessage.success(muteMinutes.value > 0 ? "已禁言" : "已解除禁言")
      muteVisible.value = false
      loadMembers(memberPage.value)
    }

    const handleRemove = async (row: GroupMemberInfo) => {
      if (!info.value) return
      await ElMessageBox.confirm(
        `确认把「${row.displayName || row.userId}」移出群聊？`,
        "移除成员",
        { type: "warning" }
      )
      const res = await removeGroupMemberApi({
        groupId: info.value.groupId,
        memberIds: [row.userId]
      })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "移除失败")
        return
      }
      ElMessage.success("已移除")
      loadMembers(memberPage.value)
      loadInfo()
    }

    const formatTime = (unix: number) => (unix ? new Date(unix * 1000).toLocaleString("zh-CN") : "—")

    onMounted(async () => {
      await loadInfo()
      if (info.value) {
        loadMembers(1)
        loadTasks()
      }
    })

    return {
      loading,
      saving,
      info,
      tab,
      members,
      memberLoading,
      memberPage,
      memberPageSize,
      memberTotal,
      roleFilter,
      tasks,
      taskLoading,
      editVisible,
      editForm,
      muteVisible,
      muteTarget,
      muteMinutes,
      loadMembers,
      openEdit,
      submitEdit,
      toggleFreeze,
      handleDissolve,
      toggleRole,
      openMute,
      submitMute,
      handleRemove,
      formatTime
    }
  }
})
</script>

<style scoped lang="less">
.group-detail {
  padding: 20px;

  &__bar {
    margin-bottom: 12px;
  }

  &__body {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  &__side {
    width: 320px;
    flex-shrink: 0;
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__hero {
    text-align: center;
    padding-bottom: 12px;
  }

  &__name {
    margin: 10px 0 4px;
    font-size: 16px;
    font-weight: 600;
  }

  &__sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }

  &__muted {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__desc {
    margin: 12px 0;
  }

  &__ops {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__filter {
    margin-bottom: 12px;
  }

  &__member {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__hint {
    margin-left: 10px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  &__pager {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
