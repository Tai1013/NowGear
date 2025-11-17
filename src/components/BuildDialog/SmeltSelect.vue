<script setup lang="ts">
defineOptions({ name: 'SmeltSelect' })
import type { MonsterSkill } from '@/types'
import { ref, computed, watch } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElButton, ElImage, ElInput } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useDataStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'

interface SmeltOption {
  id: string
  isCategory: boolean
  name: string
}

const props = defineProps<{
  modelValue: MonsterSkill
  disabled?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'open'])

const { smeltData } = storeToRefs(useDataStore())
const { getSkillName } = useDataStore()

const singleTableRef = ref<InstanceType<typeof ElTable>>()
const isDialogVisible = ref(false)
const searchWeaponKeyword = ref('')

// 內部煉成數據
const innerSlotData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
// 煉成下拉選項
const smeltsOptions = computed(() => {
  const normalized: SmeltOption[] = []
  Object.keys(smeltData.value).forEach((smeltId) => {
    normalized.push({
      id: smeltId,
      isCategory: true,
      name: smeltData.value[smeltId].name,
    })
    smeltData.value[smeltId].skills.forEach((skill) => {
      normalized.push({
        id: skill.id,
        isCategory: false,
        name: getSkillName(skill.id)
      })
    })
  })
  const filterNormalized = normalized.filter((row) => {
    if (!searchWeaponKeyword.value || searchWeaponKeyword.value.trim() === '') return true
    const keyword = searchWeaponKeyword.value.toLowerCase().trim()
    // 搜尋技能名稱
    if (row.name?.toLowerCase().includes(keyword)) return true
    return false
  })
  return filterNormalized
})
// 是否顯示漂流石按鈕
const isShowButton = computed(() => {
  return !innerSlotData.value.id
})

// 取得當前技能是哪個分類
const getSmeltCategory = (id: string) => {
  return Object.keys(smeltData.value).find((smeltId) => {
    return smeltData.value[smeltId].skills.some((skill) => skill.id === id)
  }) || ''
}
// 表格行類別
const tableRowClassName = ({ row }: { row: SmeltOption }) => {
  if (row.isCategory) return 'smelt-category-row'
  return 'cursor'
}
// 開啟彈窗
const openDialogHandler = () => {
  isDialogVisible.value = true
  emit('open')
}
// 選擇煉成，如果 row 與 modelValue 相同，則清空選擇，否則設定新的選擇
const handleCurrentChange = (row: SmeltOption) => {
  if (row.isCategory) return
  if (row.id === innerSlotData.value.id) {
    innerSlotData.value = { id: '' }
  } else {
    innerSlotData.value = { id: row.id, level: 1 }
  }
  isDialogVisible.value = false
}

watch(() => isDialogVisible.value, (visible) => {
  if (!visible) searchWeaponKeyword.value = ''
  else {
    // 設定初始選中行
    setTimeout(() => {
      if (innerSlotData.value.id) {
        const row = smeltsOptions.value.find((row) => row.id === innerSlotData.value.id)
        singleTableRef.value?.setCurrentRow(row)
      }
    }, 100)
  }
})
</script>

<template>
  <div
    class="smelt-select-container"
    @click="!disabled && openDialogHandler()"
  >
    <template v-if="isShowButton">
      <ElButton
        class="smelt-button"
        size="small"
        :icon="Plus"
        type="info"
        dark
        plain 
      >
        煉成
      </ElButton>
    </template>
    <template v-else>
      <i
        :style="{ '--smelt-color': getSmeltCategory(innerSlotData.id) }"
        class="armor-slot"
      />
      <SkillTags :skills="[innerSlotData]" disabled />
    </template>
     <ElDialog
      v-model="isDialogVisible"
      title="選擇煉成"
      width="350px"
      center
      align-center
      append-to-body
      :show-close="false"
    >
      <ElInput v-model="searchWeaponKeyword" placeholder="搜尋技能" clearable />
      <ElTable
        ref="singleTableRef"
        :data="smeltsOptions"
        :show-header="false"
        height="450px"
        highlight-current-row
        :row-class-name="tableRowClassName"
        @row-click="handleCurrentChange"
      >
        <ElTableColumn #default="{ row } : { row: SmeltOption }">
          <template v-if="row.isCategory">
            <div class="smelt-category">
              <ElImage
                class="smelt-image"
                :src="convertFilePath(`@/assets/images/driftstone/${row.id}.png`)"
                fit="contain"
              />
              {{ row.name }}
            </div>
          </template>
          <template v-else>
            <SkillTags :skills="[row]" disabled />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.smelt-select-container {
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
  cursor: pointer;
}

.armor-slot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: var(--el-border);
  /* fallback：原色 */
  background-color: var(--smelt-color, transparent);
  /* 優先使用 color-mix 將顏色與白色混合以降低飽和度 / 鮮明度（調整 70%/30% 改變效果） */
  background-color: color-mix(in srgb, var(--smelt-color) 70%, white 30%);
  /* 若瀏覽器不支援 color-mix，使用 saturate 作額外退飽和處理（可調整百分比） */
  filter: saturate(60%);
}

.smelt-button {
  --el-button-size: 22px;
  padding: 0 4px;
}

.el-table :deep(.smelt-category-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
  pointer-events: none;
}

.smelt-category {
  display: flex;
  align-items: center;
  gap: 12px;

  > .smelt-image {
    width: 25px;
    height: 25px;
  }
}
</style>