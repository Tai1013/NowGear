<script setup lang="ts">
import type { Weapon, ArmorType, MonsterSkill } from '@/types'
import type { WeaponRowResult } from './WeaponSelect.vue'
import type { ArmorRowResult } from './ArmorSelect.vue'
import { ref, computed, watch } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElSpace, ElButton, ElImage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { useStoreRef } from '@/composables'
import WeaponSelect from './WeaponSelect.vue'
import ArmorSelect from './ArmorSelect.vue'
import { SkillSummary } from '@/components'

interface BuildData extends Partial<Record<ArmorType, ArmorRowResult>> {
  category: string
  weapon?: WeaponRowResult
}

defineOptions({ name: 'BuildDialog' })

const { isBuildDialogVisible, buildDialogMode, monstersData, weaponsData } = storeToRefs(useBestiaryStore())

// 配裝數據
const buildData = ref<BuildData>({
  category: '',
  weapon: undefined,
  helm: undefined,
  mail: undefined,
  gloves: undefined,
  belt: undefined,
  greaves: undefined
})

const { isChanged, reset, update } = useStoreRef(buildData)

// 配裝項目: 武器分類、魔物武器、裝備頭、裝備身、裝備手、裝備腰、裝備腳
const buildItems = computed(() => [
  { label: '武器分類', key: 'weapon' },
  { label: '魔物武器', key: currentWeaponCategory.value },
  { label: '裝備頭', key: 'helm' },
  { label: '裝備身', key: 'mail' },
  { label: '裝備手', key: 'gloves' },
  { label: '裝備腰', key: 'belt' },
  { label: '裝備腳', key: 'greaves' }
])
// 當前魔物武器分類
const currentWeaponCategory = computed((): string => {
  if (buildData.value.category) return buildData.value.category
  return 'weapon'
})
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
      if (armorSlots) skills.push(...armorSlots.map((slot) => ({ id: slot.id, level: 1 })))
    }
  })
  return skills.filter((slot) => slot.id && slot.level)
})
// 表格行類別
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  if (rowIndex === 0) return 'weapons-row'
  return ''
}
const setWeaponType = (weapon: Weapon) => {
  if (buildData.value.category === weapon.id) return 'primary'
  return ''
}
const setWeaponDisabled = (id: string) => {
  if (!buildData.value.weapon) return false
  // 判斷當前 buildData.weapon 的龍 是否有該武器
  const findMonster = monstersData.value.find((monsterData) => buildData.value.weapon && monsterData.id === buildData.value.weapon.monster)
  if (findMonster && findMonster.weapon) {
    if (id in findMonster.weapon) return false
    return true
  }
  return false
}
// 切換武器分類
const changeWeaponCategory = (category: string) => {
  let changeCategory = category
  if (buildData.value.category === category) changeCategory = ''
  buildData.value.category = changeCategory
}

watch(() => isBuildDialogVisible.value, (visible) => {
  if (visible) update(buildData)
})
</script>

<template>
  <ElDialog
    v-model="isBuildDialogVisible"
    :title="buildDialogMode === 'add' ? '新增配裝' : '編輯配裝'"
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
            class="reset-button"
            type="warning"
            :icon="Refresh"
            size="small"
            circle
            :disabled="!isChanged"
            @click="reset"
          />
          <div class="el-dialog__title">
            {{ buildDialogMode === 'add' ? '新增配裝' : '編輯配裝' }}
          </div>
        </div>
      </template>
      <template #default>
        <ElTable
          :data="buildItems"
          :show-header="false"
          :row-class-name="tableRowClassName"
        >
          <ElTableColumn #default="scope" width="42">
            <div class="build-item-image">
              <ElImage
                v-if="scope.row.key !== 'monsterWeapon'"
                :src="convertFilePath(`@/assets/images/part/${scope.row.key}.png`)"
                :alt="scope.row.label"
                :title="scope.row.label"
                fit="contain"
              />
            </div>
          </ElTableColumn>
          <ElTableColumn>
            <template #default="scope">
              <div class="build-cell">
                <template v-if="scope.$index === 0">
                  <ElSpace wrap :size="6">
                    <ElButton
                      v-for="weapon in weaponsData"
                      :key="weapon.id"
                      class="build-weapon-button"
                      :type="setWeaponType(weapon)"
                      circle
                      :disabled="setWeaponDisabled(weapon.id)"
                      @click="changeWeaponCategory(weapon.id)"
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
                <template v-else-if="scope.$index === 1">
                  <WeaponSelect
                    v-model="buildData.weapon"
                    :category="buildData.category"
                  />
                </template>
                <template v-else>
                  <ArmorSelect
                    v-model="buildData[scope.row.key as ArmorType]"
                    :armor="scope.row.key"
                  />
                </template>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="build-data">
          <SkillSummary :skills="buildSkills" />
        </div>
      </template>
      <template #footer>
        <div>
          <ElButton type="primary" :disabled="!isChanged">新增</ElButton>
        </div>
      </template>
  </ElDialog>
</template>

<style lang="scss">
:root {
  --build-select-height: 30px;
}
.build-dialog {
  max-width: 360px;
}

</style>
<style lang="scss" scoped>
.el-table :deep(.cell) {
  padding: 0 6px;
}
.el-table :deep(.weapons-row) {
  --el-table-tr-bg-color: var(--el-color-primary-light-9)
}

.weapon-image {
  width: 25px;
  height: 25px;
}


.build-item-image {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: var(--build-select-height);
  height: var(--build-select-height);
}

.build-weapon-button:disabled {
  opacity: 0.2;
}

.build-dialog-header {
  position: relative;

  .reset-button {
    position: absolute;
    left: 0;
  }
}

.build-data {
  margin-top: 16px;
}
</style>