<script setup lang="ts">
defineOptions({ name: 'BuildDialog' })
import type { BuildData, Weapon, ArmorType, MonsterSkill } from '@/types'
import { cloneDeep } from 'radashi'
import { ref, computed, watch } from 'vue'
import { ElDialog, ElInput, ElTable, ElTableColumn, ElSpace, ElButton, ElImage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useDataStore, useOperationStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { useStoreRef } from '@/composables'
import WeaponSelect from './WeaponSelect.vue'
import ArmorSelect from './ArmorSelect.vue'
import { SkillSummary } from '@/components'

const emit = defineEmits(['update'])

const { weaponsData, monstersData } = storeToRefs(useDataStore())
const { buildDialog } = storeToRefs(useOperationStore())

// 預設配裝數據
const defaultBuildData: BuildData = {
  name: '',
  category: '',
  weapon: undefined,
  helm: undefined,
  mail: undefined,
  gloves: undefined,
  belt: undefined,
  greaves: undefined
}
// 配裝數據
const buildData = ref<BuildData>(defaultBuildData)

const { isChanged, reset } = useStoreRef(buildData)

// 配裝模式標題
const buildDialogTitle = computed(() => {
  const mode = buildDialog.value.mode
  if (mode === 'add') return '新增配裝'
  if (mode === 'edit') return '編輯配裝'
  return '檢視配裝'
})
// 配裝項目: 武器分類、魔物武器、裝備頭、裝備身、裝備手、裝備腰、裝備腳
const buildColumns = computed(() => [
  { label: '武器分類', key: 'weapon' },
  { label: '魔物武器', key: buildData.value.category || 'weapon' },
  { label: '裝備頭', key: 'helm' },
  { label: '裝備身', key: 'mail' },
  { label: '裝備手', key: 'gloves' },
  { label: '裝備腰', key: 'belt' },
  { label: '裝備腳', key: 'greaves' }
])
// 取得配裝數據所有技能
const buildSkills = computed(() => {
  const skills: MonsterSkill[] = []
  Object.keys(buildData.value).forEach((key) => {
    if (key === 'category') return
    if (key === 'weapon') {
      if (buildData.value.weapon?.skills) {
        skills.push(...buildData.value.weapon.skills)
      }
      return
    }
    if (buildData.value[key as ArmorType]) {
      const armorSkills = buildData.value[key as ArmorType]?.skills
      const armorSlots = buildData.value[key as ArmorType]?.slots
      if (armorSkills) skills.push(...armorSkills)
      if (armorSlots) skills.push(...armorSlots)
    }
  })
  return skills.filter((slot) => slot.id && slot.level)
})

// 表格行類別
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  if (rowIndex === 0) return 'weapons-row'
  return ''
}
// 合併儲存格
const objectSpanMethod = ({ rowIndex }: { rowIndex: number }) => {
  if (rowIndex === 0) return [1, 2]
}
// 設定武器按鈕類型
const setWeaponType = (weapon: Weapon) => {
  if (buildData.value.category === weapon.id) return 'primary'
  return ''
}
// 設定武器按鈕禁用
const setWeaponDisabled = (weapon: Weapon) => {
  if (!buildData.value.weapon) return false
  // 判斷當前 buildData.weapon 的龍，是否有該武器
  const findMonster = monstersData.value.find((monsterData) => buildData.value.weapon && monsterData.id === buildData.value.weapon.monster)
  if (findMonster && findMonster.weapon) {
    if (weapon.id in findMonster.weapon) return false
    return true
  }
  return false
}
// 切換武器分類
const changeWeaponCategory = (weapon: Weapon) => {
  let changeCategory = weapon.id
  if (buildData.value.category === weapon.id) changeCategory = ''
  buildData.value.category = changeCategory
}
// 儲存配裝數據
const saveBuildHandler = () => {
  emit('update', {
    mode: buildDialog.value.mode,
    data: buildData.value
  })
  buildDialog.value.visible = false
}

watch(() => buildDialog.value.visible, (visible) => {
  if (visible) {
    buildData.value = cloneDeep(buildDialog.value.data || defaultBuildData)
  }
})  
</script>

<template>
  <ElDialog
    v-model="buildDialog.visible"
    width="95%"
    center
    append-to-body
    :show-close="false"
    class="build-dialog"
  >
    <template #header>
      <div class="build-dialog-header">
        <!-- 重置按鈕 -->
        <ElButton
          v-if="buildDialog.mode !== 'preview'"
          class="reset-button"
          :icon="Refresh"
          :type="isChanged ? 'warning' : 'info'"
          size="small"
          circle
          :disabled="!isChanged"
          @click="reset"
        />
        <div class="el-dialog__title">
          <span>{{ buildDialogTitle }}</span>
        </div>
        <ElButton
          v-if="buildDialog.mode !== 'preview'"
          type="primary"
          class="save-button"
          size="small"
          :disabled="!isChanged"
          @click="saveBuildHandler"
        >
          {{ buildDialog.mode === 'edit' ? '更新' : '新增' }}
        </ElButton>
      </div>
    </template>
    <template #default>
      <ElInput
        v-model="buildData.name"
        placeholder="自訂名稱"
        :disabled="buildDialog.mode === 'preview'"
        clearable
      />
      <ElTable
        :data="buildColumns"
        :show-header="false"
        :row-class-name="tableRowClassName"
        :span-method="objectSpanMethod"
      >
        <ElTableColumn #default="scope" width="52">
          <template v-if="scope.$index === 0">
            <ElSpace wrap :size="8" class="build-weapon-container">
              <ElButton
                v-for="weapon in weaponsData"
                :key="weapon.id"
                class="build-weapon-button"
                circle
                :type="setWeaponType(weapon)"
                :disabled="setWeaponDisabled(weapon)"
                @click="changeWeaponCategory(weapon)"
              >
                <ElImage
                  class="weapon-image"
                  :src="convertFilePath(`@/assets/images/part/${weapon.id}.png`)"
                  :alt="weapon.name"
                  :title="weapon.name"
                  fit="contain"
                />
              </ElButton>
            </ElSpace>
          </template>
          <template v-else>
            <div class="column-image">
              <ElImage
                :class="{ 'weapon-image': scope.row.key === 'weapon' }"
                :src="convertFilePath(`@/assets/images/part/${scope.row.key}.png`)"
                :alt="scope.row.label"
                :title="scope.row.label"
                fit="contain"
              />
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn #default="scope">
          <div class="build-cell">
            <template v-if="scope.$index === 1">
              <WeaponSelect
                v-model="buildData.weapon"
                :category="buildData.category"
                :disabled="buildDialog.mode === 'preview'"
              />
            </template>
            <template v-if="scope.$index > 1">
              <ArmorSelect
                v-model="buildData[scope.row.key as ArmorType]"
                :armor="scope.row.key"
                :disabled="buildDialog.mode === 'preview'"
              />
            </template>
          </div>
        </ElTableColumn>
      </ElTable>
      <SkillSummary :skills="buildSkills" level-mode />
    </template>
  </ElDialog>
</template>

<style lang="scss">
.build-dialog {
  max-width: 360px;
}
</style>
<style lang="scss" scoped>
.el-table :deep(.weapons-row) > td.el-table__cell {
  background-color: var(--el-color-primary-light-9) !important;

  .cell {
    text-align: center;
  }
}

.build-dialog-header {
  position: relative;

  .reset-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
  }

  .save-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
  }
}

.build-weapon-container {
  justify-content: center;

  .build-weapon-button {
    .weapon-image {
      width: 25px;
      height: 25px;
    }
  }
}

.column-image {
  position: relative;
  width: 30px;
  height: 30px;
  overflow: hidden;

  .weapon-image {
    transform: scale(1.2);
  }
}

.skill-summary-container {
  margin-top: 12px;
}
</style>