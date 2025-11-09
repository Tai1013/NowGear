<script setup lang="ts">
import type { MonsterArmor, ArmorType, ArmorSlot } from '@/types'
import { ref, computed } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElImage, ElSpace } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'
import SmeltSelect from './SmeltSelect.vue'

interface ArmorSelectRow extends MonsterArmor {
  monster: string
}
export interface ArmorRowResult extends Omit<MonsterArmor, 'slots'> {
  monster: string
  slots: ArmorSlot[]
}

defineOptions({ name: 'ArmorSelect' })
const props = defineProps<{
  modelValue: ArmorRowResult | undefined
  armor: ArmorType  // 防具部位
}>()
const emit = defineEmits(['update:modelValue'])

const { monstersData } = storeToRefs(useBestiaryStore())

const isDialogVisible = ref(false)
const isSlotsClicked = ref(false)

const innterArmorData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const armorsList = computed((): ArmorSelectRow[] => {
  return monstersData.value
    .filter((monster) => {
      // 確保魔物有防具數據
      if (!monster.armor) return false
      // 檢查是否有指定的防具部位
      const armorData = monster.armor
      return props.armor in armorData && armorData[props.armor] !== undefined
    })
    .map((monster) => {
      // 取得指定部位的防具數據
      const armorData = monster.armor
      const armorPiece = armorData?.[props.armor]

      return {
        monster: monster.id,
        skills: armorPiece?.skills || [],
        slots: armorPiece?.slots || 0
      }
    })
})

const openDialogHandler = () => {
  if (isSlotsClicked.value) return
  isDialogVisible.value = true
}
const openSlotsDialogHandler = () => {
  isSlotsClicked.value = true
  setTimeout(() => {
    isSlotsClicked.value = false
  }, 300)
}
const handleCurrentChange = (row: ArmorSelectRow) => {
  // 如果選擇的魔物相同，則清空選擇
  if (row.monster === props.modelValue?.monster) {
    innterArmorData.value = undefined
  }
  else {
    // 否則設定新的選擇
    const { monster, skills, slots } = row
    innterArmorData.value = {
      monster,
      skills,
      slots: Array.from({ length: slots }, () => ({ id: '', smelt: '' }))
    }
  }
  isDialogVisible.value = false
}
</script>

<template>
  <div
    class="armor-select-container"
    @click="openDialogHandler"
  >
    <template v-if="innterArmorData">
      <div class="armor-select-item">
        <ElImage
          class="monster-image"
          :src="convertFilePath(`@/assets/images/monster/${innterArmorData.monster}.png`)"
          fit="contain"
        />
        <SkillTags :skills="innterArmorData.skills" disabled />
        <ElSpace class="armor-slots" :size="4">
          <!-- 煉成彈窗 -->
          <SmeltSelect
            v-for="(slot, index) in innterArmorData.slots"
            :key="slot.id"
            v-model="innterArmorData.slots[index]"
            @open="openSlotsDialogHandler()"
          />
        </ElSpace>
      </div>
    </template>
    <template v-else>
      <div class="armor-selectt-placeholder">
        選擇防具
      </div>
    </template>
    <!-- 彈出視窗 -->
    <ElDialog
      v-model="isDialogVisible"
      title="選擇防具"
      width="95%"
      center
      align-center
      append-to-body
      :show-close="false"
      class="build-dialog"
    >
      <ElTable
        :data="armorsList"
        :show-header="false"
        height="500px"
        highlight-current-row
        :row-key="row => row.monster"
        @row-click="handleCurrentChange"
      >
        <ElTableColumn prop="monster" width="54">
          <template #default="scope">
            <ElImage
              class="monster-image"
              :src="convertFilePath(`@/assets/images/monster/${scope.row.monster}.png`)"
              fit="contain"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="skills">
          <template #default="scope">
            <SkillTags :skills="scope.row.skills" disabled />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="slots" width="36" align="right" />
      </ElTable>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__row) {
  cursor: pointer;
}

.armor-select-container {
  width: 100%;
  min-height: var(--build-select-height);
  cursor: pointer;

  .armor-selectt-placeholder {
    display: flex;
    align-items: center;
    color: var(--el-text-color-placeholder);
    width: 100%;
    height: var(--build-select-height);
  }
}

.armor-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  > .el-space:not(.armor-slots) {
    flex: auto;
  }
}

.monster-image {
  flex-shrink: 0;
  width: var(--build-select-height);
  height: var(--build-select-height);
}
</style>