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
  <div class="autochat-page">
    <div class="autochat-page__header">
      <div>
        <h2 class="autochat-page__title">
          群自动发言
          <el-tag v-if="scopedGroupId" size="small" type="info">仅看 {{ scopedGroupId }}</el-tag>
        </h2>
        <p class="autochat-page__subtitle">
          任务会用自动建的虚拟账号，按配置的节奏把文案一条条发进群里。虚拟号是正常的用户账号，
          在群成员列表里和真人一样显示；它们不参与消息推送，不会额外占用推送资源。
        </p>
      </div>
      <div class="autochat-page__actions">
        <el-button v-if="scopedGroupId" @click="$router.push('/group/autochat')">查看全部任务</el-button>
        <el-button type="primary" @click="openCreate">新建任务</el-button>
      </div>
    </div>

    <el-alert
      class="autochat-page__tip"
      type="info"
      :closable="false"
      show-icon
      title="目标群如果开着全员禁言，虚拟号也会被一起禁言、任务发不出去，失败原因会显示在下面的「最近状态」里。"
    />

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="任务" min-width="200">
        <template #default="{ row }">
          <div class="autochat-page__name">{{ row.name }}</div>
          <div class="autochat-page__id">{{ row.groupTitle || "群已不存在" }}（{{ row.groupId }}）</div>
        </template>
      </el-table-column>
      <el-table-column label="节奏" width="170">
        <template #default="{ row }">
          <div>{{ row.minIntervalSec }}~{{ row.maxIntervalSec }} 秒 / 条</div>
          <div class="autochat-page__id">{{ activeWindowText(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="文案 / 虚拟号" width="140" align="center">
        <template #default="{ row }">
          <div>{{ row.scriptCount }} 条文案</div>
          <div class="autochat-page__id">{{ row.botReadyCount }}/{{ row.botCount }} 个号</div>
        </template>
      </el-table-column>
      <el-table-column label="已发" width="130" align="center">
        <template #default="{ row }">
          <div>今日 {{ row.sentToday }}{{ row.dailyLimit > 0 ? `/${row.dailyLimit}` : "" }}</div>
          <div class="autochat-page__id">累计 {{ row.sentTotal }}</div>
        </template>
      </el-table-column>
      <el-table-column label="最近状态" min-width="180">
        <template #default="{ row }">
          <el-tag v-if="row.lastError" size="small" type="danger">{{ row.lastError }}</el-tag>
          <span v-else-if="row.lastSentAt">{{ formatTime(row.lastSentAt) }}</span>
          <span v-else class="autochat-page__id">还没发过</span>
        </template>
      </el-table-column>
      <el-table-column label="启用" width="90" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status"
            :active-value="1"
            :inactive-value="0"
            :loading="togglingId === row.id"
            @change="(v: string | number | boolean) => toggleStatus(row, Number(v))"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="210" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="openScripts(row)">文案</el-button>
          <el-button link type="primary" @click="openBots(row)">虚拟号</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有自动发言任务" />
      </template>
    </el-table>

    <el-dialog v-model="taskVisible" :title="form.id ? '编辑任务' : '新建任务'" width="620px" destroy-on-close>
      <el-form :model="form" label-width="120px">
        <el-form-item label="目标群">
          <el-select
            v-model="form.groupId"
            filterable
            remote
            clearable
            :remote-method="searchGroups"
            :loading="groupLoading"
            placeholder="搜索群名称或群 ID"
            style="width: 100%"
          >
            <el-option
              v-for="group in groupOptions"
              :key="group.groupId"
              :label="`${group.title || '未命名群'}（${group.groupId}）`"
              :value="group.groupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务名">
          <el-input v-model="form.name" placeholder="例如：官方群日常氛围" maxlength="32" show-word-limit />
        </el-form-item>
        <el-form-item label="发送间隔">
          <el-input-number v-model="form.minIntervalSec" :min="5" :max="86400" />
          <span class="autochat-page__gap">~</span>
          <el-input-number v-model="form.maxIntervalSec" :min="5" :max="86400" />
          <span class="autochat-page__hint">秒，每条之间在这个区间里随机取</span>
        </el-form-item>
        <el-form-item label="活跃时段">
          <el-input-number v-model="form.activeStartHour" :min="0" :max="23" />
          <span class="autochat-page__gap">点 ~</span>
          <el-input-number v-model="form.activeEndHour" :min="0" :max="23" />
          <span class="autochat-page__hint">点，起止填一样表示全天；结束小于开始表示跨零点</span>
        </el-form-item>
        <el-form-item label="每天上限">
          <el-input-number v-model="form.dailyLimit" :min="0" :max="10000" />
          <span class="autochat-page__hint">0 表示不限</span>
        </el-form-item>
        <el-form-item label="文案顺序">
          <el-radio-group v-model="form.mode">
            <el-radio :value="1">顺序循环</el-radio>
            <el-radio :value="2">随机抽取</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="虚拟号数量">
          <el-input-number v-model="form.botCount" :min="1" :max="100" />
          <span class="autochat-page__hint">启用时不够会自动补建；调小不会注销已建的号</span>
        </el-form-item>
        <el-form-item label="虚拟号头像">
          <div class="autochat-page__avatars">
            <div v-if="selectedAvatars.length" class="autochat-page__avatar-grid">
              <div v-for="url in selectedAvatars" :key="url" class="autochat-page__avatar-chip">
                <img :src="url" class="autochat-page__avatar-img">
                <el-icon class="autochat-page__avatar-remove" @click="removeAvatar(url)"><Close /></el-icon>
              </div>
            </div>
            <div v-else class="autochat-page__hint">
              没选头像也能用：虚拟号会显示昵称首字的彩色头像，和普通用户一样。
            </div>
            <div class="autochat-page__avatar-ops">
              <el-button size="small" @click="pickerVisible = true">从头像库选</el-button>
              <el-button size="small" link @click="rawAvatarVisible = !rawAvatarVisible">
                {{ rawAvatarVisible ? "收起手填" : "手填 URL" }}
              </el-button>
            </div>
            <el-input
              v-if="rawAvatarVisible"
              v-model="form.botAvatars"
              type="textarea"
              :rows="3"
              placeholder="一行一个头像 URL，建号时轮流取用"
            />
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" maxlength="120" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitTask">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="pickerVisible" title="选择虚拟号头像" width="640px" destroy-on-close>
      <p class="autochat-page__subtitle">
        点选即可多选，建号时按顺序轮流取用。这些图都存在本项目的文件服务上，不依赖外部站点。
      </p>
      <el-tabs v-if="avatarLibrary.length">
        <el-tab-pane v-for="cat in avatarLibrary" :key="cat.key" :label="cat.title">
          <div class="autochat-page__library">
            <div
              v-for="item in cat.items"
              :key="item.url"
              class="autochat-page__library-item"
              :class="{ 'is-active': selectedAvatars.includes(item.url) }"
              :title="item.name"
              @click="toggleAvatar(item.url)"
            >
              <img :src="item.url" class="autochat-page__avatar-img">
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <el-empty v-else description="头像库还没配图，可先用手填 URL" />
      <template #footer>
        <span class="autochat-page__hint">已选 {{ selectedAvatars.length }} 个</span>
        <el-button type="primary" @click="pickerVisible = false">完成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scriptVisible" title="任务文案" width="680px" destroy-on-close>
      <p class="autochat-page__subtitle">
        一行一条，保存时整组覆盖。顺序模式下按这里的顺序发，发完一轮从头再来。
      </p>
      <el-input
        v-model="scriptText"
        type="textarea"
        :rows="16"
        placeholder="一行一条文案"
      />
      <template #footer>
        <span class="autochat-page__hint">共 {{ scriptLineCount }} 条</span>
        <el-button @click="scriptVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitScripts">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="botVisible" title="任务虚拟号" width="620px" destroy-on-close>
      <el-table v-loading="botLoading" :data="bots" border stripe max-height="420">
        <el-table-column label="账号" min-width="220">
          <template #default="{ row }">
            <div class="autochat-page__user">
              <el-avatar :src="row.avatar" :size="32">{{ (row.nickName || row.userId).slice(0, 1) }}</el-avatar>
              <div>
                <div class="autochat-page__name">{{ row.nickName || "未命名" }}</div>
                <div class="autochat-page__id">微聊号 {{ row.weliaoId || "—" }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.managed ? 'success' : 'info'">
              {{ row.managed ? "任务自建" : "手动指定" }}
            </el-tag>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="还没建号，任务启用后会自动补建" />
        </template>
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { GroupInfo } from "@/types/api/group"
import type { IAutoChatBot, IAutoChatTask } from "@/types/api/groupautochat"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  deleteAutoChatTaskApi,
  getAutoChatBotsApi,
  getAutoChatScriptsApi,
  getAutoChatTasksApi,
  saveAutoChatScriptsApi,
  saveAutoChatTaskApi
} from "@/api/groupautochat"
import { getGroupListApi } from "@/api/group"
import { avatarLibrary } from "@/config/avatarLibrary"
import { Close } from "@element-plus/icons-vue"
import { computed, defineComponent, onMounted, reactive, ref } from "vue"

/** 新建任务时的默认节奏：一到五分钟一条，白天发，五个号轮着来。 */
const defaultForm = {
  id: 0,
  groupId: "",
  name: "",
  mode: 1,
  minIntervalSec: 60,
  maxIntervalSec: 300,
  activeStartHour: 9,
  activeEndHour: 23,
  dailyLimit: 0,
  botCount: 5,
  botAvatars: "",
  remark: ""
}

export default defineComponent({
  name: "GroupAutoChat",
  components: { Close },
  setup() {
    const route = useRoute()
    const loading = ref(false)
    const saving = ref(false)
    const togglingId = ref(0)
    const list = ref<IAutoChatTask[]>([])

    const taskVisible = ref(false)
    const form = reactive({ ...defaultForm })

    const groupLoading = ref(false)
    const groupOptions = ref<GroupInfo[]>([])

    const scriptVisible = ref(false)
    const scriptTaskId = ref(0)
    const scriptText = ref("")

    const pickerVisible = ref(false)
    // 手填入口默认收起：绝大多数情况从头像库点选就够了
    const rawAvatarVisible = ref(false)

    // botAvatars 在服务端就是一行一个 URL，这里只是把它当数组用，存回去仍是纯文本
    const selectedAvatars = computed(() =>
      form.botAvatars.split("\n").map(v => v.trim()).filter(Boolean)
    )

    const writeAvatars = (list: string[]) => {
      form.botAvatars = list.join("\n")
    }

    const toggleAvatar = (url: string) => {
      const list = [...selectedAvatars.value]
      const idx = list.indexOf(url)
      if (idx >= 0) list.splice(idx, 1)
      else list.push(url)
      writeAvatars(list)
    }

    const removeAvatar = (url: string) => {
      writeAvatars(selectedAvatars.value.filter(v => v !== url))
    }

    const botVisible = ref(false)
    const botLoading = ref(false)
    const bots = ref<IAutoChatBot[]>([])

    const scriptLineCount = computed(
      () => scriptText.value.split("\n").filter(line => line.trim()).length
    )

    // 从群列表点「自动发言」过来时带着 groupId，只列这个群的任务；
    // 直接从菜单进来则列全部。
    const scopedGroupId = computed(() => (route.query.groupId as string) || "")

    const load = async () => {
      loading.value = true
      const res = await getAutoChatTasksApi(
        scopedGroupId.value ? { groupId: scopedGroupId.value } : undefined
      )
      loading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载失败")
        return
      }
      list.value = res.result?.list || []
    }

    const searchGroups = async (keyword: string) => {
      groupLoading.value = true
      const res = await getGroupListApi({
        page: 1,
        limit: 20,
        keywords: keyword?.trim() || undefined,
        status: 1
      })
      groupLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "搜索群组失败")
        return
      }
      groupOptions.value = res.result?.list || []
    }

    const openCreate = () => {
      Object.assign(form, defaultForm)
      groupOptions.value = []
      searchGroups("")
      // 从群列表进来的，默认就选中那个群，省得再搜一遍
      if (scopedGroupId.value) form.groupId = scopedGroupId.value
      taskVisible.value = true
    }

    const openEdit = (row: IAutoChatTask) => {
      Object.assign(form, {
        id: row.id,
        groupId: row.groupId,
        name: row.name,
        mode: row.mode,
        minIntervalSec: row.minIntervalSec,
        maxIntervalSec: row.maxIntervalSec,
        activeStartHour: row.activeStartHour,
        activeEndHour: row.activeEndHour,
        dailyLimit: row.dailyLimit,
        botCount: row.botCount,
        botAvatars: row.botAvatars || "",
        remark: row.remark || ""
      })
      // 下拉里至少要有当前这个群，否则编辑时会显示成空
      groupOptions.value = [
        { groupId: row.groupId, title: row.groupTitle } as GroupInfo
      ]
      taskVisible.value = true
    }

    const submitTask = async () => {
      if (!form.groupId) {
        ElMessage.warning("请先选择目标群")
        return
      }
      if (!form.name.trim()) {
        ElMessage.warning("请填写任务名")
        return
      }
      if (form.maxIntervalSec < form.minIntervalSec) {
        ElMessage.warning("最大间隔不能小于最小间隔")
        return
      }
      saving.value = true
      const res = await saveAutoChatTaskApi({ ...form, name: form.name.trim() })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success(form.id ? "已保存" : "已创建，并预置了一批默认文案")
      taskVisible.value = false
      load()
    }

    const toggleStatus = async (row: IAutoChatTask, status: number) => {
      if (status === 1 && row.scriptCount === 0) {
        ElMessage.warning("这个任务还没有文案，先去「文案」里加几条")
        return
      }
      togglingId.value = row.id
      const res = await saveAutoChatTaskApi({
        id: row.id,
        groupId: row.groupId,
        name: row.name,
        status,
        mode: row.mode,
        minIntervalSec: row.minIntervalSec,
        maxIntervalSec: row.maxIntervalSec,
        activeStartHour: row.activeStartHour,
        activeEndHour: row.activeEndHour,
        dailyLimit: row.dailyLimit,
        botCount: row.botCount,
        botAvatars: row.botAvatars,
        remark: row.remark
      })
      togglingId.value = 0
      if (res.code !== 0) {
        ElMessage.error(res.msg || "更新失败")
        return
      }
      row.status = status
      if (status === 1) {
        ElMessage.success("已启用，虚拟号会在后台准备好后开始发言")
      }
    }

    const handleDelete = async (row: IAutoChatTask) => {
      await ElMessageBox.confirm(
        `确认删除任务「${row.name}」？文案会一起删掉，已建的虚拟号会留在群里不动。`,
        "删除任务",
        { type: "warning" }
      )
      const res = await deleteAutoChatTaskApi({ id: row.id })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "删除失败")
        return
      }
      ElMessage.success("已删除")
      load()
    }

    const openScripts = async (row: IAutoChatTask) => {
      scriptTaskId.value = row.id
      scriptText.value = ""
      scriptVisible.value = true
      const res = await getAutoChatScriptsApi({ taskId: row.id })
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载文案失败")
        return
      }
      scriptText.value = (res.result?.list || []).map(item => item.content).join("\n")
    }

    const submitScripts = async () => {
      const lines = scriptText.value
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
      saving.value = true
      const res = await saveAutoChatScriptsApi({
        taskId: scriptTaskId.value,
        list: lines.map((content, index) => ({ sort: index + 1, content }))
      })
      saving.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "保存失败")
        return
      }
      ElMessage.success(`已保存 ${res.result?.saved ?? lines.length} 条文案`)
      scriptVisible.value = false
      load()
    }

    const openBots = async (row: IAutoChatTask) => {
      bots.value = []
      botVisible.value = true
      botLoading.value = true
      const res = await getAutoChatBotsApi({ taskId: row.id })
      botLoading.value = false
      if (res.code !== 0) {
        ElMessage.error(res.msg || "加载虚拟号失败")
        return
      }
      bots.value = res.result?.list || []
    }

    const activeWindowText = (row: IAutoChatTask) => {
      if (row.activeStartHour === row.activeEndHour) return "全天"
      return `${row.activeStartHour}:00 - ${row.activeEndHour}:00`
    }

    const formatTime = (unix: number) => {
      if (!unix) return "—"
      return new Date(unix * 1000).toLocaleString("zh-CN")
    }

    onMounted(load)

    return {
      avatarLibrary,
      pickerVisible,
      rawAvatarVisible,
      selectedAvatars,
      toggleAvatar,
      removeAvatar,
      scopedGroupId,
      loading,
      saving,
      togglingId,
      list,
      taskVisible,
      form,
      groupLoading,
      groupOptions,
      scriptVisible,
      scriptText,
      scriptLineCount,
      botVisible,
      botLoading,
      bots,
      searchGroups,
      openCreate,
      openEdit,
      submitTask,
      toggleStatus,
      handleDelete,
      openScripts,
      submitScripts,
      openBots,
      activeWindowText,
      formatTime
    }
  }
})
</script>

<style scoped lang="less">
.autochat-page {
  padding: 20px;

  &__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
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

  &__tip {
    margin-bottom: 16px;
  }

  &__user {
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

  &__gap {
    margin: 0 8px;
  }

  &__hint {
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__avatars {
    width: 100%;
  }

  &__avatar-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__avatar-chip {
    position: relative;
    width: 44px;
    height: 44px;
  }

  &__avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
    display: block;
  }

  &__avatar-remove {
    position: absolute;
    top: -6px;
    right: -6px;
    background: var(--el-color-danger);
    color: #fff;
    border-radius: 50%;
    padding: 2px;
    cursor: pointer;
    font-size: 12px;
  }

  &__avatar-ops {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__library {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 10px;
  }

  &__library-item {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 10px;
    padding: 2px;
    transition: border-color 0.15s;

    &:hover {
      border-color: var(--el-border-color);
    }

    &.is-active {
      border-color: var(--el-color-primary);
    }
  }
}
</style>
