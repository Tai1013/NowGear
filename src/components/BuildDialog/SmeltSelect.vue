<script setup lang="ts">
import type { ArmorSlot, MonsterSkill } from '@/types'
import { ref, computed } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElImage, ElInput } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'

interface SmeltSelectRow {
  key: string
  id: string
  isCategory: boolean
  name?: string
  skill?: MonsterSkill
}

defineOptions({ name: 'SmeltSelect' })
const props = defineProps<{
  modelValue: ArmorSlot
}>()
const emit = defineEmits(['update:modelValue', 'open'])

const { smeltData, skillsData } = storeToRefs(useBestiaryStore())

const singleTableRef = ref<InstanceType<typeof ElTable>>()
const isDialogVisible = ref(false)
const searchWeaponKeyword = ref('')

// 內部煉成數據
const innerSlotData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
// 練成列表
const smeltsList = computed(() => {
  const normalized: SmeltSelectRow[] = []
  Object.keys(smeltData.value).forEach((smeltId) => {
    normalized.push({
      key: `${smeltId}-category`,
      id: smeltId,
      isCategory: true,
      name: smeltData.value[smeltId].name,
    })
    smeltData.value[smeltId].skills.forEach((skill) => {
      normalized.push({
        key: `${smeltId}-${skill.id}`,
        id: smeltId,
        isCategory: false,
        skill: {
          id: skill.id,
          level: 1
        }
      })
    })
  })
  const filterNormalized = normalized.filter((row) => {
    if (!searchWeaponKeyword.value || searchWeaponKeyword.value.trim() === '') return true
    const keyword = searchWeaponKeyword.value.toLowerCase().trim()
    // 搜尋技能名稱
    if (row.skill) {
      const skillName = skillsData.value[row.skill.id]?.name || ''
      if (skillName.toLowerCase().includes(keyword)) return true
    }
    return false
  })
  // 設定初始選中行
  setTimeout(() => {
    const { smelt, id } = innerSlotData.value
    if (smelt && id) {
      const rowId = `${smelt}-${id}`
      singleTableRef.value?.setCurrentRow(smeltsList.value.find((row) => row.key === rowId))
    }
  }, 100)
  return filterNormalized
})
// 表格行類別
const tableRowClassName = ({ row }: { row: SmeltSelectRow }) => {
  if (row.isCategory) return 'smelt-category-row'
  return 'smelt-skill-row'
}
// 開啟彈窗
const openDialogHandler = () => {
  isDialogVisible.value = true
  emit('open')
}
// 選擇煉成，如果 row 與 modelValue 相同，則清空選擇，否則設定新的選擇
const handleCurrentChange = (row: SmeltSelectRow) => {
  const rowId = row.key
  const dataId = `${innerSlotData.value.smelt}-${innerSlotData.value.id}`
  if (row.skill === undefined || rowId === dataId) {
    innerSlotData.value = { id: '', smelt: '' }
  } else {
    innerSlotData.value = {
      id: row.skill.id,
      smelt: row.id,
      level: 1
    }
  }
  isDialogVisible.value = false
}
</script>

<template>
  <div
    class="smelt-select-container"
    @click="openDialogHandler"
  >
    <i
      :style="{ '--smelt-color': innerSlotData.smelt }"
      class="armor-slot"
    />
    <SkillTags v-if="innerSlotData.id" :skills="[innerSlotData]" disabled />
    <span v-else class="smelt-placeholder">選擇煉成</span>
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
        :data="smeltsList"
        :show-header="false"
        :row-class-name="tableRowClassName"
        height="500px"
        highlight-current-row
        :row-key="row => row.key"
        @row-click="handleCurrentChange"
      >
        <ElTableColumn>
          <template #default="scope">
            <template v-if="scope.row.isCategory">
              <div class="smelt-category">
                <ElImage
                  class="smelt-image"
                  :src="convertFilePath(`@/assets/images/driftstone/${scope.row.id}.png`)"
                  fit="contain"
                />
                {{ scope.row.name }}
              </div>
            </template>
            <template v-else>
              <SkillTags
                :skills="[scope.row.skill]"
                disabled
              />
            </template>
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
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: var(--el-border);
  /* fallback：原色 */
  background-color: var(--smelt-color, transparent);
  /* 優先使用 color-mix 將顏色與白色混合以降低飽和度 / 鮮明度（調整 70%/30% 改變效果） */
  background-color: color-mix(in srgb, var(--smelt-color) 70%, white 30%);
  /* 若瀏覽器不支援 color-mix，使用 saturate 作額外退飽和處理（可調整百分比） */
  filter: saturate(60%);
}

.el-table :deep(.smelt-category-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
  pointer-events: none;
}

.el-table :deep(.smelt-skill-row) {
  cursor: pointer;
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

.smelt-placeholder {
  color: var(--el-text-color-placeholder);
}
</style>