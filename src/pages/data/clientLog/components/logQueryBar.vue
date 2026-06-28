<template>
  <div class="log-query-bar">
    <div class="log-query-bar__top">
      <div class="log-query-bar__store">
        <span class="log-query-bar__store-label">Logstore</span>
        <span class="log-query-bar__store-name">{{ storeName }}</span>
        <span class="log-query-bar__store-id">{{ bucketId }}</span>
      </div>
      <div class="log-query-bar__time">
        <el-select :model-value="timePreset" style="width: 148px" @update:model-value="onTimePresetChange">
          <el-option v-for="item in timePresets" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-date-picker
          v-if="timePreset === 'custom'"
          :model-value="customTimeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始"
          end-placeholder="结束"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 340px"
          @update:model-value="onCustomRangeChange"
        />
      </div>
    </div>

    <div class="log-query-bar__search">
      <el-input
        :model-value="queryText"
        class="log-query-bar__search-input"
        placeholder="输入查询语句，例如 * 或 level: error AND userId: 100000"
        clearable
        @update:model-value="onQueryTextChange"
        @keydown.enter="emit('search')"
      />
      <el-button type="primary" class="log-query-bar__search-btn" :loading="loading" @click="emit('search')">
        查询 / 分析
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { logTimePresets } from "../utils/logUtils"

export default defineComponent({
  name: "LogQueryBar",
  props: {
    bucketId: {
      type: String,
      required: true
    },
    storeName: {
      type: String,
      default: "客户端日志"
    },
    queryText: {
      type: String,
      default: "*"
    },
    timePreset: {
      type: String,
      default: "15m"
    },
    customTimeRange: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:queryText", "update:timePreset", "update:customTimeRange", "search"],
  setup(props, { emit }) {
    const onQueryTextChange = (value: string) => emit("update:queryText", value)

    const onTimePresetChange = (value: string) => {
      emit("update:timePreset", value)
      if (value !== "custom") {
        emit("update:customTimeRange", [])
        emit("search")
      }
    }

    const onCustomRangeChange = (value: string[] | null) => {
      emit("update:customTimeRange", value || [])
    }

    return {
      timePresets: logTimePresets,
      emit,
      onQueryTextChange,
      onTimePresetChange,
      onCustomRangeChange
    }
  }
})
</script>

<style lang="less">
.log-query-bar {
  .log-query-bar__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 12px;
  }

  .log-query-bar__store {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;

    .log-query-bar__store-label {
      color: #909399;
    }

    .log-query-bar__store-name {
      font-weight: 600;
      color: #303133;
    }

    .log-query-bar__store-id {
      color: #909399;
      font-size: 12px;
      font-family: Consolas, monospace;
    }
  }

  .log-query-bar__time {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .log-query-bar__search {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;

    .log-query-bar__search-input {
      flex: 1;
    }

    .log-query-bar__search-btn {
      min-width: 108px;
    }
  }
}
</style>
