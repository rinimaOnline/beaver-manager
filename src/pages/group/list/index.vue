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
  <div class="group-list-page">
    <div class="group-list-page__header">
      <div>
        <h2 class="group-list-page__title">群列表</h2>
        <p class="group-list-page__subtitle">
          管理全部群组。「展示人数」是给客户端看的文案，填了就顶替真实人数；
          真实人数、成员列表、入群上限都不受它影响。
        </p>
      </div>
      <el-button type="primary" @click="openCreate">建群</el-button>
    </div>

    <el-form :inline="true" class="group-list-page__filter" @submit.prevent="search">
      <el-form-item>
        <el-input
          v-model="keywords"
          placeholder="群名称 / 群 ID"
          clearable
          style="width: 260px"
          @keyup.enter="search"
          @clear="search"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="status" placeholder="群状态" clearable style="width: 140px" @change="search">
          <el-option label="正常" :value="1" />
          <el-option label="冻结" :value="2" />
          <el-option label="已解散" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="isOfficial" placeholder="是否官方" clearable style="width: 140px" @change="search">
          <el-option label="官方群" :value="true" />
          <el-option label="非官方" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="群组" min-width="240">
        <template #default="{ row }">
          <div class="group-list-page__group">
            <el-avatar :src="row.fileName" :size="36">{{ (row.title || row.groupId).slice(0, 1) }}</el-avatar>
            <div>
              <el-link type="primary" :underline="false" @click="goDetail(row)">
                {{ row.title || "未命名群" }}
              </el-link>
              <el-tag v-if="row.isOfficial" type="primary" size="small" effect="light" class="group-list-page__official">
                官方
              </el-tag>
              <div class="group-list-page__id">{{ row.groupId }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="真实人数" width="100" align="center">
        <template #default="{ row }">{{ row.memberCount }}</template>
      </el-table-column>
      <el-table-column label="展示人数" width="140" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.displayMemberText" type="warning" size="small">{{ row.displayMemberText }}</el-tag>
          <span v-else class="group-list-page__id">按真实人数</span>
        </template>
      </el-table-column>
      <el-table-column label="群主" width="120" align="center">
        <template #default="{ row }">{{ row.creatorId || "—" }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" size="small" type="success">正常</el-tag>
          <el-tag v-else-if="row.status === 2" size="small" type="warning">冻结</el-tag>
          <el-tag v-else size="small" type="info">已解散</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="210" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row)">详情</el-button>
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="goAutoChat(row)">自动发言</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有匹配的群组" />
      </template>
    </el-table>

    <el-pagination
      class="group-list-page__pager"
      background
      layout="total, prev, pager, next"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      @current-change="onPage"
    />

    <el-dialog v-model="editVisible" title="编辑群组" width="560px" destroy-on-close>
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="群名称">
          <el-input v-model="editForm.title" maxlength="32" show-word-limit />
        </el-form-item>
        <el-form-item label="群公告">
          <el-input v-model="editForm.notice" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="全员禁言">
          <el-switch v-model="editForm.muteAll" />
          <span class="group-list-page__hint">开启后自动发言任务也会被一起禁言</span>
        </el-form-item>
        <el-form-item label="官方群">
          <el-switch v-model="editForm.isOfficial" />
          <span class="group-list-page__hint">
            开启后客户端会在群名后挂「官方」徽标。只是身份标识，不影响退群、邀请等权限。
          </span>
        </el-form-item>
        <el-form-item label="展示人数">
          <el-input
            v-model="editForm.displayMemberText"
            maxlength="32"
            show-word-limit
            placeholder="留空按真实人数展示；填了就顶替，如「100万+」"
          />
          <div class="group-list-page__hint">
            当前真实人数 {{ editingMemberCount }} 人。这里只改客户端展示的那行字，
            成员列表和入群人数上限仍按真实人数算。
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="createVisible" title="建群" width="560px" destroy-on-close>
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="群名称" required>
          <el-input v-model="createForm.title" maxlength="32" show-word-limit placeholder="必填" />
        </el-form-item>
        <el-form-item label="群主" required>
          <el-input v-model="createForm.creatorId" placeholder="用户ID，官方群一般挂在官方客服号下" />
          <div class="group-list-page__hint">
            必须是已存在的用户。建完他就是群主，后续在客户端里改群资料、拉人都用这个号。
          </div>
        </el-form-item>
        <el-form-item label="群公告">
          <el-input v-model="createForm.notice" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="初始成员">
          <el-input
            v-model="createForm.memberIds"
            type="textarea"
            :rows="2"
            placeholder="用户ID，多个用逗号或换行分隔；留空就只有群主一个人"
          />
          <div class="group-list-page__hint">
            这里加的人收不到实时推送，要等他们下一轮同步才看得到群。
            所以只适合放官方号、运营虚拟号，真人让他们自己走邀请链接进。
          </div>
        </el-form-item>
        <el-form-item label="官方群">
          <el-switch v-model="createForm.isOfficial" />
          <span class="group-list-page__hint">开启后客户端会在群名后挂「官方」徽标。</span>
        </el-form-item>
        <el-form-item label="展示人数">
          <el-input
            v-model="createForm.displayMemberText"
            maxlength="32"
            show-word-limit
            placeholder="留空按真实人数展示；填了就顶替，如「100万+」"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { GroupInfo } from "@/types/api/group"
import { ElMessage } from "element-plus"
import { createGroupApi, getGroupListApi, updateGroupApi } from "@/api/group"
import { defineComponent, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"

export default defineComponent({
  name: "GroupList",
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const saving = ref(false)
    const list = ref<GroupInfo[]>([])
    const keywords = ref("")
    const status = ref<number | undefined>(undefined)
    const isOfficial = ref<boolean | undefined>(undefined)
    const page = ref(1)
    const pageSize = 10
    const total = ref(0)

    const editVisible = ref(false)
    const editingId = ref(0)
    const editingMemberCount = ref(0)
    const editForm = reactive({ title: "", notice: "", muteAll: false, displayMemberText: "", isOfficial: false })

    const createVisible = ref(false)
    const creating = ref(false)
    const createForm = reactive({
      title: "",
      creatorId: "",
      notice: "",
      memberIds: "",
      isOfficial: false,
      displayMemberText: ""
    })

    const load = async () => {
      loading.value = true
      const res = await getGroupListApi({
        page: page.value,
        limit: pageSize,
        keywords: keywords.value.trim() || undefined,
        status: status.value,
        isOfficial: isOfficial.value
      })
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      list.value = res.result?.list || []
      total.value = res.result?.total || 0
    }

    const search = () => {
      page.value = 1
      load()
    }

    const onPage = (p: number) => {
      page.value = p
      load()
    }

    const openEdit = (row: GroupInfo) => {
      editingId.value = row.id
      editingMemberCount.value = row.memberCount
      editForm.title = row.title || ""
      editForm.notice = row.notice || ""
      editForm.muteAll = row.muteAll || false
      editForm.displayMemberText = row.displayMemberText || ""
      editForm.isOfficial = row.isOfficial || false
      editVisible.value = true
    }

    const submitEdit = async () => {
      saving.value = true
      const res = await updateGroupApi(editingId.value, {
        title: editForm.title,
        notice: editForm.notice,
        muteAll: editForm.muteAll,
        displayMemberText: editForm.displayMemberText.trim(),
        isOfficial: editForm.isOfficial
      })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success("已保存")
      editVisible.value = false
      load()
    }

    const openCreate = () => {
      Object.assign(createForm, {
        title: "",
        creatorId: "",
        notice: "",
        memberIds: "",
        isOfficial: false,
        displayMemberText: ""
      })
      createVisible.value = true
    }

    const submitCreate = async () => {
      const title = createForm.title.trim()
      const creatorId = createForm.creatorId.trim()
      if (!title) {
        ElMessage.error("请填群名称")
        return
      }
      if (!creatorId) {
        ElMessage.error("请填群主用户ID")
        return
      }
      // 逗号（中英文）和换行都当分隔符，运营从别处粘一列 ID 过来能直接用
      const memberIds = createForm.memberIds
        .split(/[,，\s]+/)
        .map(id => id.trim())
        .filter(id => id && id !== creatorId)

      creating.value = true
      const res = await createGroupApi({
        title,
        creatorId,
        notice: createForm.notice.trim() || undefined,
        memberIds: memberIds.length ? memberIds : undefined,
        isOfficial: createForm.isOfficial,
        displayMemberText: createForm.displayMemberText.trim() || undefined
      })
      creating.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "建群失败")
        return
      }
      ElMessage.success("已创建")
      createVisible.value = false
      search()
    }

    // 详情页按数据库自增 id 定位（成员/更新接口收的都是它，不是 groupId）
    const goDetail = (row: GroupInfo) => {
      router.push(`/group/detail/${row.id}`)
    }

    // 带着群 ID 跳过去，自动发言页据此只列这个群的任务
    const goAutoChat = (row: GroupInfo) => {
      router.push({ path: "/group/autochat", query: { groupId: row.groupId } })
    }

    onMounted(load)

    return {
      loading,
      saving,
      list,
      keywords,
      status,
      isOfficial,
      createVisible,
      creating,
      createForm,
      openCreate,
      submitCreate,
      page,
      pageSize,
      total,
      editVisible,
      editForm,
      editingMemberCount,
      search,
      onPage,
      openEdit,
      submitEdit,
      goDetail,
      goAutoChat
    }
  }
})
</script>

<style scoped lang="less">
.group-list-page {
  padding: 20px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 600;
  }

  &__subtitle {
    margin: 0;
    max-width: 720px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  &__filter {
    margin-bottom: 12px;
  }

  &__group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__name {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  &__id {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__hint {
    margin-left: 10px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  &__official {
    margin-left: 6px;
  }

  &__pager {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
