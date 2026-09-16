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
  <div class="invite-detail-page">
    <div class="invite-detail-page__top">
      <el-button link type="primary" @click="goBack">← 返回邀请码列表</el-button>
      <div class="invite-detail-page__title">
        <span class="invite-detail-page__code">{{ configCode || "—" }}</span>
        <span class="invite-detail-page__name">{{ configName || "—" }}</span>
        <el-tag v-if="configStatus === 1" size="small" type="success">启用</el-tag>
        <el-tag v-else-if="configStatus === 0" size="small" type="info">停用</el-tag>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="invite-detail-page__tabs">
      <!-- 自动好友 -->
      <el-tab-pane label="自动好友" name="friends">
        <div class="invite-detail-page__bar">
          <p class="invite-detail-page__hint">
            用这个邀请码注册的用户会自动加上以下好友。停用或删除只影响之后注册的用户。
          </p>
          <el-button type="primary" @click="openFriendPicker">添加好友</el-button>
        </div>
        <el-table v-loading="friendLoading" :data="friendList" border stripe>
          <el-table-column label="用户" min-width="220">
            <template #default="{ row }">
              <div class="invite-detail-page__user">
                <el-avatar :src="row.avatar" :size="36">{{ (row.nickName || row.userId).slice(0, 1) }}</el-avatar>
                <div>
                  <div class="invite-detail-page__uname">{{ row.nickName || "未设置昵称" }}</div>
                  <div class="invite-detail-page__uid">微聊号 {{ row.weliaoId || "—" }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="账号" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ row.phone || row.email || "—" }}</template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status"
                :active-value="1"
                :inactive-value="0"
                :loading="friendTogglingId === row.id"
                @change="(v: string | number | boolean) => toggleFriend(row, Number(v))"
              />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row.remark || "—" }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openFriendEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteFriend(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有自动好友" />
          </template>
        </el-table>
      </el-tab-pane>

      <!-- 自动群 -->
      <el-tab-pane label="自动群" name="groups">
        <div class="invite-detail-page__bar">
          <p class="invite-detail-page__hint">
            用这个邀请码注册的用户会自动加入以下群。停用或删除只影响之后注册的用户。
          </p>
          <el-button type="primary" @click="openGroupPicker">添加群组</el-button>
        </div>
        <el-table v-loading="groupLoading" :data="groupList" border stripe>
          <el-table-column label="群组" min-width="240">
            <template #default="{ row }">
              <div class="invite-detail-page__user">
                <el-avatar :src="row.avatar" :size="36">{{ (row.title || row.groupId).slice(0, 1) }}</el-avatar>
                <div>
                  <div class="invite-detail-page__uname">{{ row.title || "群已不存在" }}</div>
                  <div class="invite-detail-page__uid">{{ row.groupId }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status"
                :active-value="1"
                :inactive-value="0"
                :loading="groupTogglingId === row.id"
                @change="(v: string | number | boolean) => toggleGroup(row, Number(v))"
              />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row.remark || "—" }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openGroupEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteGroup(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有自动群" />
          </template>
        </el-table>
      </el-tab-pane>

      <!-- 注册名单 -->
      <el-tab-pane label="注册名单" name="registrations">
        <div class="invite-detail-page__bar">
          <el-select v-model="regLevel" style="width: 130px" @change="searchReg">
            <el-option label="全部级别" :value="0" />
            <el-option label="2 级" :value="2" />
            <el-option label="3 级" :value="3" />
            <el-option label="4 级" :value="4" />
            <el-option label="5 级" :value="5" />
          </el-select>
        </div>
        <el-table v-loading="regLoading" :data="regList" border stripe>
          <el-table-column label="用户" min-width="240">
            <template #default="{ row }">
              <div class="invite-detail-page__user">
                <el-avatar :src="row.avatar" :size="36">{{ (row.nickName || row.userId).slice(0, 1) }}</el-avatar>
                <div>
                  <div class="invite-detail-page__uname">{{ row.nickName || "未设置昵称" }}</div>
                  <div class="invite-detail-page__uid">微聊号 {{ row.weliaoId || "—" }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="级别" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.level <= 1 ? 'success' : 'warning'">{{ row.level }} 级</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" width="190" />
          <template #empty>
            <el-empty description="还没有注册记录" />
          </template>
        </el-table>
        <el-pagination
          class="invite-detail-page__pager"
          background
          layout="total, prev, pager, next"
          :current-page="regPage"
          :page-size="regPageSize"
          :total="regTotal"
          @current-change="onRegPage"
        />
      </el-tab-pane>

      <!-- 统计 -->
      <el-tab-pane label="统计" name="stats">
        <div v-loading="statsLoading">
          <div class="invite-detail-page__stat-row">
            <div class="invite-detail-page__stat">
              <div class="invite-detail-page__stat-num">{{ stats.total }}</div>
              <div class="invite-detail-page__stat-label">累计注册</div>
            </div>
            <div class="invite-detail-page__stat">
              <div class="invite-detail-page__stat-num">{{ stats.friendCount }}</div>
              <div class="invite-detail-page__stat-label">自动好友数</div>
            </div>
            <div class="invite-detail-page__stat">
              <div class="invite-detail-page__stat-num">{{ stats.groupCount }}</div>
              <div class="invite-detail-page__stat-label">自动群数</div>
            </div>
          </div>
          <el-table :data="stats.levels" border stripe class="invite-detail-page__stat-table">
            <el-table-column label="级别" align="center">
              <template #default="{ row }">{{ row.level }} 级</template>
            </el-table-column>
            <el-table-column prop="count" label="注册人数" align="center" />
            <template #empty>
              <el-empty description="还没有分级数据" />
            </template>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 好友选择器 -->
    <el-dialog v-model="friendPickerVisible" title="添加自动好友" width="720px" destroy-on-close>
      <el-form :inline="true" @submit.prevent="searchUsers">
        <el-form-item>
          <el-input
            v-model="userKeyword"
            placeholder="昵称 / 微聊号 / 邮箱 / 手机号"
            clearable
            style="width: 280px"
            @keyup.enter="searchUsers"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="userLoading" @click="searchUsers">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="userLoading"
        :data="userList"
        border
        stripe
        max-height="360"
        @selection-change="onUserSelection"
      >
        <el-table-column type="selection" width="42" :selectable="row => !addedUserIds.has(row.id)" />
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="invite-detail-page__user">
              <el-avatar :src="row.avatar" :size="32">{{ (row.nickName || row.id).slice(0, 1) }}</el-avatar>
              <div>
                <div class="invite-detail-page__uname">{{ row.nickName || "未设置昵称" }}</div>
                <div class="invite-detail-page__uid">微聊号 {{ row.weliaoId || "—" }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="addedUserIds.has(row.id)" size="small" type="info">已添加</el-tag>
            <el-tag v-else-if="row.status === 1" size="small" type="success">正常</el-tag>
            <el-tag v-else size="small">禁用</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="invite-detail-page__pager"
        background
        layout="total, prev, pager, next"
        :current-page="userPage"
        :page-size="userPageSize"
        :total="userTotal"
        @current-change="onUserPage"
      />
      <template #footer>
        <el-button @click="friendPickerVisible = false">取消</el-button>
        <el-button type="primary" :loading="friendSaving" :disabled="!selectedUserIds.length" @click="submitFriendAdd">
          添加 {{ selectedUserIds.length ? `(${selectedUserIds.length})` : "" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 好友编辑 -->
    <el-dialog v-model="friendEditVisible" title="编辑自动好友" width="420px">
      <el-form label-width="80px">
        <el-form-item label="排序">
          <el-input-number v-model="friendEditForm.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="friendEditForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="friendEditVisible = false">取消</el-button>
        <el-button type="primary" :loading="friendSaving" @click="submitFriendEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 群选择器 -->
    <el-dialog v-model="groupPickerVisible" title="添加自动群" width="720px" destroy-on-close>
      <el-form :inline="true" @submit.prevent="searchGroups">
        <el-form-item>
          <el-input
            v-model="groupKeyword"
            placeholder="群名称 / 群 ID"
            clearable
            style="width: 280px"
            @keyup.enter="searchGroups"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="groupPickLoading" @click="searchGroups">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="groupPickLoading"
        :data="groupPickList"
        border
        stripe
        max-height="360"
        @selection-change="onGroupSelection"
      >
        <el-table-column type="selection" width="42" :selectable="row => !addedGroupIds.has(row.groupId)" />
        <el-table-column label="群组" min-width="220">
          <template #default="{ row }">
            <div class="invite-detail-page__user">
              <el-avatar :src="row.fileName" :size="32">{{ (row.title || row.groupId).slice(0, 1) }}</el-avatar>
              <div>
                <div class="invite-detail-page__uname">{{ row.title || "未命名群" }}</div>
                <div class="invite-detail-page__uid">{{ row.groupId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="addedGroupIds.has(row.groupId)" size="small" type="info">已添加</el-tag>
            <el-tag v-else-if="row.status === 1" size="small" type="success">正常</el-tag>
            <el-tag v-else size="small">已解散</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="invite-detail-page__pager"
        background
        layout="total, prev, pager, next"
        :current-page="groupPage"
        :page-size="groupPageSize"
        :total="groupTotal"
        @current-change="onGroupPage"
      />
      <template #footer>
        <el-button @click="groupPickerVisible = false">取消</el-button>
        <el-button type="primary" :loading="groupSaving" :disabled="!selectedGroupIds.length" @click="submitGroupAdd">
          添加 {{ selectedGroupIds.length ? `(${selectedGroupIds.length})` : "" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 群编辑 -->
    <el-dialog v-model="groupEditVisible" title="编辑自动群" width="420px">
      <el-form label-width="80px">
        <el-form-item label="排序">
          <el-input-number v-model="groupEditForm.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="groupEditForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupEditVisible = false">取消</el-button>
        <el-button type="primary" :loading="groupSaving" @click="submitGroupEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type {
  IInviteBindFriendItem,
  IInviteBindGroupItem,
  IInviteRegistrationItem,
  IInviteStatsRes
} from "@/types/api/inviteCode"
import type { GroupInfo } from "@/types/api/group"
import type { IUserInfo } from "@/types/api/user"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  addInviteFriendsApi,
  addInviteGroupsApi,
  deleteInviteFriendApi,
  deleteInviteGroupApi,
  getInviteConfigListApi,
  getInviteFriendListApi,
  getInviteGroupListApi,
  getInviteRegistrationsApi,
  getInviteStatsApi,
  updateInviteFriendApi,
  updateInviteGroupApi
} from "@/api/inviteCode"
import { getGroupListApi } from "@/api/group"
import { getUserListApi } from "@/api/user"
import { computed, defineComponent, onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

export default defineComponent({
  name: "OnboardingInviteCodeDetail",
  setup() {
    const route = useRoute()
    const router = useRouter()
    const configId = Number(route.query.id) || 0

    const activeTab = ref("friends")
    const configCode = ref("")
    const configName = ref("")
    const configStatus = ref<number>(-1)

    // ---------- 自动好友 ----------
    const friendLoading = ref(false)
    const friendSaving = ref(false)
    const friendTogglingId = ref(0)
    const friendList = ref<IInviteBindFriendItem[]>([])
    const friendPickerVisible = ref(false)
    const friendEditVisible = ref(false)
    const friendEditForm = reactive({ id: 0, sort: 0, remark: "" })
    const addedUserIds = computed(() => new Set(friendList.value.map(item => item.userId)))

    const userLoading = ref(false)
    const userKeyword = ref("")
    const userList = ref<IUserInfo[]>([])
    const userPage = ref(1)
    const userPageSize = 10
    const userTotal = ref(0)
    const selectedUserIds = ref<string[]>([])

    const loadFriends = async () => {
      friendLoading.value = true
      const res = await getInviteFriendListApi(configId)
      friendLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      friendList.value = res.result?.list || []
    }

    const loadUsers = async () => {
      userLoading.value = true
      const res = await getUserListApi({
        page: userPage.value,
        pageSize: userPageSize,
        keyword: userKeyword.value.trim() || undefined,
        status: 1
      })
      userLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "搜索用户失败")
        return
      }
      userList.value = res.result?.list || []
      userTotal.value = res.result?.total || 0
    }

    const openFriendPicker = () => {
      userKeyword.value = ""
      userPage.value = 1
      selectedUserIds.value = []
      friendPickerVisible.value = true
      loadUsers()
    }

    const searchUsers = () => {
      userPage.value = 1
      loadUsers()
    }

    const onUserPage = (p: number) => {
      userPage.value = p
      loadUsers()
    }

    const onUserSelection = (rows: IUserInfo[]) => {
      selectedUserIds.value = rows.map(row => row.id)
    }

    const submitFriendAdd = async () => {
      if (!selectedUserIds.value.length) {
        ElMessage.warning("请先选择用户")
        return
      }
      friendSaving.value = true
      const res = await addInviteFriendsApi({ configId, userIds: selectedUserIds.value })
      friendSaving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "添加失败")
        return
      }
      ElMessage.success(`已添加 ${res.result?.added ?? selectedUserIds.value.length} 个好友`)
      friendPickerVisible.value = false
      loadFriends()
    }

    const openFriendEdit = (row: IInviteBindFriendItem) => {
      friendEditForm.id = row.id
      friendEditForm.sort = row.sort
      friendEditForm.remark = row.remark || ""
      friendEditVisible.value = true
    }

    const submitFriendEdit = async () => {
      friendSaving.value = true
      const res = await updateInviteFriendApi({
        id: friendEditForm.id,
        sort: friendEditForm.sort,
        remark: friendEditForm.remark
      })
      friendSaving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("已保存")
      friendEditVisible.value = false
      loadFriends()
    }

    const toggleFriend = async (row: IInviteBindFriendItem, next: number) => {
      friendTogglingId.value = row.id
      const res = await updateInviteFriendApi({ id: row.id, status: next })
      friendTogglingId.value = 0
      if (res.code !== 0) {
        ElMessage.error(res.msg || "更新失败")
        return
      }
      row.status = next
    }

    const deleteFriend = async (row: IInviteBindFriendItem) => {
      await ElMessageBox.confirm(
        `确认移除自动好友「${row.nickName || row.userId}」？之后注册的用户不会再自动加上他。`,
        "删除自动好友",
        { type: "warning" }
      )
      const res = await deleteInviteFriendApi(row.id)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      loadFriends()
    }

    // ---------- 自动群 ----------
    const groupLoading = ref(false)
    const groupSaving = ref(false)
    const groupTogglingId = ref(0)
    const groupList = ref<IInviteBindGroupItem[]>([])
    const groupPickerVisible = ref(false)
    const groupEditVisible = ref(false)
    const groupEditForm = reactive({ id: 0, sort: 0, remark: "" })
    const addedGroupIds = computed(() => new Set(groupList.value.map(item => item.groupId)))

    const groupPickLoading = ref(false)
    const groupKeyword = ref("")
    const groupPickList = ref<GroupInfo[]>([])
    const groupPage = ref(1)
    const groupPageSize = 10
    const groupTotal = ref(0)
    const selectedGroupIds = ref<string[]>([])

    const loadGroups = async () => {
      groupLoading.value = true
      const res = await getInviteGroupListApi(configId)
      groupLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      groupList.value = res.result?.list || []
    }

    const loadGroupPick = async () => {
      groupPickLoading.value = true
      const res = await getGroupListApi({
        page: groupPage.value,
        limit: groupPageSize,
        keywords: groupKeyword.value.trim() || undefined,
        status: 1
      })
      groupPickLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "搜索群组失败")
        return
      }
      groupPickList.value = res.result?.list || []
      groupTotal.value = res.result?.total || 0
    }

    const openGroupPicker = () => {
      groupKeyword.value = ""
      groupPage.value = 1
      selectedGroupIds.value = []
      groupPickerVisible.value = true
      loadGroupPick()
    }

    const searchGroups = () => {
      groupPage.value = 1
      loadGroupPick()
    }

    const onGroupPage = (p: number) => {
      groupPage.value = p
      loadGroupPick()
    }

    const onGroupSelection = (rows: GroupInfo[]) => {
      selectedGroupIds.value = rows.map(row => row.groupId)
    }

    const submitGroupAdd = async () => {
      if (!selectedGroupIds.value.length) {
        ElMessage.warning("请先选择群组")
        return
      }
      groupSaving.value = true
      const res = await addInviteGroupsApi({ configId, groupIds: selectedGroupIds.value })
      groupSaving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "添加失败")
        return
      }
      ElMessage.success(`已添加 ${res.result?.added ?? selectedGroupIds.value.length} 个群`)
      groupPickerVisible.value = false
      loadGroups()
    }

    const openGroupEdit = (row: IInviteBindGroupItem) => {
      groupEditForm.id = row.id
      groupEditForm.sort = row.sort
      groupEditForm.remark = row.remark || ""
      groupEditVisible.value = true
    }

    const submitGroupEdit = async () => {
      groupSaving.value = true
      const res = await updateInviteGroupApi({
        id: groupEditForm.id,
        sort: groupEditForm.sort,
        remark: groupEditForm.remark
      })
      groupSaving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("已保存")
      groupEditVisible.value = false
      loadGroups()
    }

    const toggleGroup = async (row: IInviteBindGroupItem, next: number) => {
      groupTogglingId.value = row.id
      const res = await updateInviteGroupApi({ id: row.id, status: next })
      groupTogglingId.value = 0
      if (res.code !== 0) {
        ElMessage.error(res.msg || "更新失败")
        return
      }
      row.status = next
    }

    const deleteGroup = async (row: IInviteBindGroupItem) => {
      await ElMessageBox.confirm(
        `确认移除自动群「${row.title || row.groupId}」？之后注册的用户不会再自动加入它。`,
        "删除自动群",
        { type: "warning" }
      )
      const res = await deleteInviteGroupApi(row.id)
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      loadGroups()
    }

    // ---------- 注册名单 ----------
    const regLoading = ref(false)
    const regList = ref<IInviteRegistrationItem[]>([])
    const regLevel = ref(0)
    const regPage = ref(1)
    const regPageSize = 10
    const regTotal = ref(0)

    const loadReg = async () => {
      regLoading.value = true
      const res = await getInviteRegistrationsApi({
        configId,
        level: regLevel.value,
        page: regPage.value,
        pageSize: regPageSize
      })
      regLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      regList.value = res.result?.list || []
      regTotal.value = res.result?.total || 0
    }

    const searchReg = () => {
      regPage.value = 1
      loadReg()
    }

    const onRegPage = (p: number) => {
      regPage.value = p
      loadReg()
    }

    // ---------- 统计 ----------
    const statsLoading = ref(false)
    const stats = reactive<IInviteStatsRes>({
      configId: 0,
      code: "",
      name: "",
      total: 0,
      friendCount: 0,
      groupCount: 0,
      levels: []
    })

    const loadStats = async () => {
      statsLoading.value = true
      const res = await getInviteStatsApi(configId)
      statsLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      Object.assign(stats, res.result || {})
      if (res.result) {
        configCode.value = res.result.code
        configName.value = res.result.name
      }
    }

    // 顶部状态：stats 只给了 code/name，状态从配置列表按 code 补齐
    const loadConfigStatus = async () => {
      const res = await getInviteConfigListApi({ keyword: configCode.value || undefined, pageSize: 50 })
      if (res.code !== 0)
        return
      const hit = (res.result?.list || []).find(item => item.id === configId)
      if (hit) {
        configStatus.value = hit.status
        if (!configCode.value)
          configCode.value = hit.code
        if (!configName.value)
          configName.value = hit.name
      }
    }

    const goBack = () => {
      router.push("/onboarding/invite-code")
    }

    onMounted(async () => {
      if (!configId) {
        ElMessage.error("缺少邀请码 id")
        return
      }
      await loadStats()
      loadConfigStatus()
      loadFriends()
      loadGroups()
      loadReg()
    })

    return {
      activeTab,
      configCode,
      configName,
      configStatus,
      // friends
      friendLoading,
      friendSaving,
      friendTogglingId,
      friendList,
      friendPickerVisible,
      friendEditVisible,
      friendEditForm,
      addedUserIds,
      userLoading,
      userKeyword,
      userList,
      userPage,
      userPageSize,
      userTotal,
      selectedUserIds,
      openFriendPicker,
      searchUsers,
      onUserPage,
      onUserSelection,
      submitFriendAdd,
      openFriendEdit,
      submitFriendEdit,
      toggleFriend,
      deleteFriend,
      // groups
      groupLoading,
      groupSaving,
      groupTogglingId,
      groupList,
      groupPickerVisible,
      groupEditVisible,
      groupEditForm,
      addedGroupIds,
      groupPickLoading,
      groupKeyword,
      groupPickList,
      groupPage,
      groupPageSize,
      groupTotal,
      selectedGroupIds,
      openGroupPicker,
      searchGroups,
      onGroupPage,
      onGroupSelection,
      submitGroupAdd,
      openGroupEdit,
      submitGroupEdit,
      toggleGroup,
      deleteGroup,
      // registrations
      regLoading,
      regList,
      regLevel,
      regPage,
      regPageSize,
      regTotal,
      searchReg,
      onRegPage,
      // stats
      statsLoading,
      stats,
      goBack
    }
  }
})
</script>

<style lang="less" scoped>
.invite-detail-page {
  padding: 8px;

  &__top {
    margin-bottom: 8px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
  }

  &__code {
    font-family: var(--el-font-family, monospace);
    font-size: 18px;
    font-weight: 600;
  }

  &__name {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  &__tabs {
    margin-top: 8px;
  }

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  &__hint {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__uname {
    font-weight: 500;
  }

  &__uid {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__pager {
    margin-top: 12px;
    justify-content: flex-end;
  }

  &__stat-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

  &__stat {
    flex: 1;
    padding: 16px;
    text-align: center;
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  &__stat-num {
    font-size: 26px;
    font-weight: 600;
  }

  &__stat-label {
    margin-top: 6px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__stat-table {
    max-width: 480px;
  }
}
</style>
