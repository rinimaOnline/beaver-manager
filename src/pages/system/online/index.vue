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
              <el-avatar :size="36" :src="row.avatar || undefined">
                {{ row.nickName?.charAt(0) || row.userId?.charAt(0) || "U" }}
              </el-avatar>
              <div>
                <div class="system-online__nick">{{ row.nickName || "-" }}</div>
                <div class="system-online__sub">{{ row.email || "-" }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="在线终端" min-width="160">
          <template #default="{ row }">
            <div class="system-online__slot-list">
              <el-tag
                v-for="(slot, index) in row.slots"
                :key="`${slot.instanceId}-${slot.slot}-${index}`"
                size="small"
                class="system-online__slot-tag"
                :type="slotTagType(slot.slot)"
              >
                {{ slotLabel(slot.slot) }}
              </el-tag>
            </div>
            <span v-if="!row.slots?.length">-</span>
          </template>
        </el-table-column>
        <el-table-column label="WS 实例" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ formatInstances(row.slots) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDeviceDetail(row)">设备详情</el-button>
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

    <el-dialog
      v-model="deviceDialog.visible"
      :title="deviceDialog.title"
      width="900px"
      destroy-on-close
    >
      <el-table v-loading="deviceDialog.loading" :data="deviceDialog.list" border stripe>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isOnline ? 'success' : 'info'" size="small">
              {{ row.isOnline ? "在线" : "离线" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="终端" width="90">
          <template #default="{ row }">{{ deviceTypeLabel(row.deviceType) }}</template>
        </el-table-column>
        <el-table-column prop="deviceName" label="设备名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="deviceModel" label="设备型号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="deviceOs" label="系统" width="100" show-overflow-tooltip />
        <el-table-column prop="deviceOsVersion" label="系统版本" width="120" show-overflow-tooltip />
        <el-table-column prop="lastLoginIp" label="登录 IP" width="140" show-overflow-tooltip />
        <el-table-column prop="lastLoginTime" label="最近登录" width="170" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button @click="deviceDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { IOnlineStats, IOnlineUserItem, IUserOnlineDeviceItem } from "@/types/api/monitor"
import { ElMessage } from "element-plus"
import { getOnlineStatsApi, getOnlineUserListApi, getUserOnlineDevicesApi } from "@/api/monitor"

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
    const deviceDialog = reactive({
      visible: false,
      loading: false,
      title: "登录设备",
      list: [] as IUserOnlineDeviceItem[]
    })

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

    const deviceTypeLabel = (deviceType: string) => {
      if (deviceType === "mobile") return "移动端"
      if (deviceType === "desktop") return "PC 端"
      return deviceType || "-"
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
      fetchData()
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

    const openDeviceDetail = async (row: IOnlineUserItem) => {
      deviceDialog.visible = true
      deviceDialog.title = `登录设备 - ${row.nickName || row.userId}`
      deviceDialog.list = []
      deviceDialog.loading = true
      const res = await getUserOnlineDevicesApi(row.userId)
      deviceDialog.loading = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载设备列表失败")
        return
      }
      deviceDialog.list = res.result?.list || []
    }

    const goUserProfile = (userId: string) => {
      router.push(`/user/profile/${userId}`)
    }

    onMounted(() => {
      fetchData()
    })

    return {
      loading,
      userList,
      stats,
      searchForm,
      pagination,
      deviceDialog,
      slotLabel,
      slotTagType,
      deviceTypeLabel,
      formatInstances,
      handleSearch,
      handleReset,
      onPageChange,
      onSizeChange,
      openDeviceDetail,
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

  &__slot-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__slot-tag {
    margin-right: 0;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
