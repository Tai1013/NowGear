<script setup lang="ts">
defineOptions({ name: 'ArmorSelect' })
import type { BuildArmorRow, ArmorType, MonsterSkill } from '@/types'
import { cloneDeep } from 'radashi'
import { ref, computed, watch } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElImage, ElSpace, ElInput } from 'element-plus'
import { useDataStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'
import SmeltSelect from './SmeltSelect.vue'

interface ArmorOption {
  monster: string
  monsterName: string
  skills: MonsterSkill[]
  slots: number
}

const props = defineProps<{
  modelValue: BuildArmorRow | undefined
  armor: ArmorType  // 防具部位
  disabled?: boolean
}>()
const emit = defineEmits(['update:modelValue'])

const { monstersData } = storeToRefs(useDataStore())
const { getSkillName } = useDataStore()

const singleTableRef = ref<InstanceType<typeof ElTable>>()
const isDialogVisible = ref(false)
const isStopClicked = ref(false)
const searchWeaponKeyword = ref('')

// 內部防具數據
const innterArmorData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
// 防具下拉選項
const armorOptions = computed((): ArmorOption[] => {
  const normalized = cloneDeep(monstersData.value)
    .filter((row) => {
      // 確保魔物有防具數據
      if (!row.armor) return false
      // 檢查是否有指定的防具部位
      const armorData = row.armor
      return props.armor in armorData && armorData[props.armor] !== undefined
    })
    .map((row) => {
      // 取得指定部位的防具數據
      const armorData = row.armor
      const armorPiece = armorData?.[props.armor]

      return {
        monster: row.id,
        monsterName: row.name,
        skills: armorPiece?.skills || [],
        slots: armorPiece?.slots || 0
      }
    })
    .filter((row) => {
      if (!searchWeaponKeyword.value || searchWeaponKeyword.value.trim() === '') return true
      const keyword = searchWeaponKeyword.value.toLowerCase().trim()
      // 搜尋魔物名稱
      if (row.monsterName.toLowerCase().includes(keyword)) return true
      // 搜尋技能名稱
      const someSkill = row.skills.some((skill) => getSkillName(skill.id).toLowerCase().includes(keyword))
      return someSkill
    })
  return normalized
})

// 開啟彈窗
const openDialogHandler = () => {
  if (isStopClicked.value) return
  isDialogVisible.value = true
}
// 阻止彈窗打開
const openClickStopHandler = () => {
  isStopClicked.value = true
  setTimeout(() => {
    isStopClicked.value = false
  }, 300)
}
// 表格行類別
const tableRowClassName = () => {
  if (!props.disabled) return 'cursor'
  return ''
}
// 選擇防具，如果 row 與 modelValue 相同，則清空選擇，否則設定新的選擇
const handleCurrentChange = (row: ArmorOption) => {
  // 如果選擇的魔物相同，則清空選擇
  if (row.monster === innterArmorData.value?.monster) {
    innterArmorData.value = undefined
  } else {
    // 否則設定新的選擇
    const { monster, monsterName, skills, slots } = row
    innterArmorData.value = {
      monster,
      monsterName,
      skills,
      slots: Array.from({ length: slots }, () => ({ id: '' }))
    }
  }
  isDialogVisible.value = false
}

watch(() => isDialogVisible.value, (visible) => {
  if (!visible) searchWeaponKeyword.value = ''
  else {
    // 設定初始選中行
    if (innterArmorData.value) {
      const row = armorOptions.value.find((row) => row.monster === innterArmorData.value?.monster)
      singleTableRef.value?.setCurrentRow(row)
    }
  }
})
</script>

<template>
  <div
    class="select-container"
    :class="{ 'cursor': !disabled }"
    @click="!disabled && openDialogHandler()"
  >
    <template v-if="innterArmorData">
      <div class="select-item">
        <div
          :style="{ '--monster-image-size': '25px' }"
          class="monster-image-container"
        >
          <ElImage
            class="monster-image"
            :src="convertFilePath(`@/assets/images/monster/${innterArmorData.monster}.png`)"
            fit="contain"
          />
        </div>
        <div>
          <SkillTags :skills="innterArmorData.skills" disabled />
          <div class="smelt-slots">
            <ElSpace :size="4" wrap>
              <SmeltSelect
                v-for="(slot, index) in innterArmorData.slots"
                :key="slot.id"
                v-model="innterArmorData.slots[index]"
                :disabled="disabled"
                @open="openClickStopHandler()"
              />
            </ElSpace>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="select-placeholder">
        選擇防具
      </div>
    </template>
    <ElDialog
      v-model="isDialogVisible"
      title="選擇防具"
      width="350px"
      center
      align-center
      append-to-body
      :show-close="false"
    >
      <ElInput v-model="searchWeaponKeyword" placeholder="搜尋魔物、技能" clearable />
      <ElTable
        ref="singleTableRef"
        :data="armorOptions"
        :show-header="false"
        height="450px"
        highlight-current-row
        :row-class-name="tableRowClassName"
        @row-click="handleCurrentChange"
      >
        <ElTableColumn #default="{ row } : { row: ArmorOption }" width="49">
          <div
            :style="{ '--monster-image-size': '25px' }"
            class="monster-image-container"
          >
            <ElImage
              class="monster-image"
              :src="convertFilePath(`@/assets/images/monster/${row.monster}.png`)"
              fit="contain"
            />
          </div>
        </ElTableColumn>
        <ElTableColumn #default="{ row } : { row: ArmorOption }">
          <SkillTags :skills="row.skills" disabled />
        </ElTableColumn>
        <ElTableColumn prop="slots" width="25" align="right" />
      </ElTable>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.smelt-slots {
  margin-top: 4px;
}
// :deep(.el-table__row) {
//   cursor: pointer;
// }

// .armor-select-container {
//   width: 100%;
//   min-height: var(--build-select-height);
//   cursor: pointer;

//   .armor-selectt-placeholder {
//     display: flex;
//     align-items: center;
//     color: var(--el-text-color-placeholder);
//     width: 100%;
//     height: var(--build-select-height);
//   }
// }

// .armor-select-item {
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   width: 100%;

//   > .el-space {
//     flex: auto;
//   }

//   .armor-content {
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//   }
// }

// .monster-image {
//   flex-shrink: 0;
//   width: var(--build-select-height);
//   height: var(--build-select-height);
// }
</style>