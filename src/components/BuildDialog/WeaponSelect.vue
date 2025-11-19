<script setup lang="ts">
defineOptions({ name: 'WeaponSelect' })
import type { BuildWeaponRow, MonsterSkill } from '@/types'
import { cloneDeep } from 'radashi'
import { ref, computed, watch } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElImage, ElInput } from 'element-plus'
import { useDataStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'
import RaritySelect from './RaritySelect.vue'

interface WeaponOption {
  monster: string
  monsterName: string
  riftborne: boolean
  skills: MonsterSkill[]
  effect: string
}

const props = defineProps<{
  modelValue: BuildWeaponRow | undefined
  category?: string
  disabled?: boolean
}>()
const emit = defineEmits(['update:modelValue'])

const { monstersData } = storeToRefs(useDataStore())
const { getSkillName } = useDataStore()

const singleTableRef = ref<InstanceType<typeof ElTable>>()
const isDialogVisible = ref(false)
const isStopClicked = ref(false)
const searchWeaponKeyword = ref('')

// 內部武器數據
const innerWeaponData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
// 武器下拉選項
const weaponOptions = computed((): WeaponOption[] => {
  const normalized = cloneDeep(monstersData.value)
    .filter((row) => {
      if (!row.weapon) return false
      // category 為空：顯示所有有 weapon.default 技能的龍
      if (!props.category) return row.weapon.default?.skills && row.weapon.default.skills.length > 0
      // category 有值：只顯示有該武器的龍
      return props.category in row.weapon
    })
    .map((row) => {
      // 決定使用哪個技能和屬性數據
      const categoryWeapon = row.weapon?.[props.category!]
      const defaultSkills = row.weapon?.default?.skills || []
      const defaultEffect = row.weapon?.default?.effect || ''
      const skills = categoryWeapon?.skills || defaultSkills
      const effect = categoryWeapon?.effect || defaultEffect

      return {
        monster: row.id,
        monsterName: row.name,
        riftborne: row.riftborne || false,
        skills,
        effect
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
// 更新武器數據，用於 category 改變時更新技能和屬性
const updateWeaponData = computed(() => {
  const findMonsterWeapon = monstersData.value.find((row) => row.id === innerWeaponData.value?.monster)?.weapon
  if (!findMonsterWeapon) return undefined 
  const defaultSkills = findMonsterWeapon.default?.skills || []
  const defaultEffect = findMonsterWeapon.default?.effect || ''
  const skills = findMonsterWeapon[props.category!]?.skills || defaultSkills
  const effect = findMonsterWeapon[props.category!]?.effect || defaultEffect
  return { skills, effect }
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
// 選擇武器，如果 row 與 modelValue 相同，則清空選擇，否則設定新的選擇
const handleCurrentChange = (row: WeaponOption) => {
  if (row.monster === innerWeaponData.value?.monster) {
    innerWeaponData.value = undefined
  } else {
    const { riftborne } = row
    const updateRow: BuildWeaponRow = row
    if (riftborne) updateRow.rarity = { skill: '', level: [] }
    innerWeaponData.value = updateRow
  }
  isDialogVisible.value = false
}

watch(() => isDialogVisible.value, (visible) => {
  if (!visible) searchWeaponKeyword.value = ''
  else {
    // 設定初始選中行
    if (innerWeaponData.value) {
      const row = weaponOptions.value.find((row) => row.monster === innerWeaponData.value?.monster)
      singleTableRef.value?.setCurrentRow(row)
    }
  }
})
// category 改變時，更新武器數據
watch(() => props.category, () => {
  if (!innerWeaponData.value || !updateWeaponData.value) return
  // 如果有 riftborne，清空風格強化
  if (innerWeaponData.value.rarity) innerWeaponData.value.rarity.skill = ''
  // 更新技能和屬性
  innerWeaponData.value = {
    ...innerWeaponData.value,
    ...updateWeaponData.value
  }
})
</script>

<template>
  <div
    class="select-container"
    :class="{ 'cursor': !disabled }"
    @click="!disabled && openDialogHandler()"
  >
    <template v-if="innerWeaponData">
      <div class="select-item">
        <div
          :style="{
            '--monster-image-size': '25px',
            '--monster-image': `url('${convertFilePath(`@/assets/images/monster/${innerWeaponData.monster}.png`)}')`
          }"
          class="monster-image-container"
        >
          <ElImage
            class="monster-image"
            :class="{ 'riftborne': innerWeaponData.rarity }"
            :src="convertFilePath(`@/assets/images/monster/${innerWeaponData.monster}.png`)"
            fit="contain"
          />
          <ElImage
            v-if="innerWeaponData.effect"
            class="monster-effect"
            :src="convertFilePath(`@/assets/images/eff/${innerWeaponData.effect}.png`)"
            fit="contain"
          />
        </div>
        <div>
          <SkillTags :skills="innerWeaponData.skills" disabled />
          <RaritySelect
            v-if="innerWeaponData.rarity"
            v-model="innerWeaponData.rarity"
            :category="category"
            :effect="innerWeaponData.effect"
            :disabled="disabled"
            @open="openClickStopHandler()"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="select-placeholder">
        選擇武器
      </div>
    </template>
    <ElDialog
      v-model="isDialogVisible"
      title="選擇武器"
      width="350px"
      center
      align-center
      append-to-body
      :show-close="false"
    >
      <ElInput v-model="searchWeaponKeyword" placeholder="搜尋魔物、技能" clearable />
      <ElTable
        ref="singleTableRef"
        :data="weaponOptions"
        :show-header="false"
        height="450px"
        highlight-current-row
        :row-class-name="tableRowClassName"
        @row-click="handleCurrentChange"
      >
        <ElTableColumn #default="{ row } : { row: WeaponOption }" width="49">
          <div
            :style="{
              '--monster-image-size': '25px',
              '--monster-image': `url('${convertFilePath(`@/assets/images/monster/${row.monster}.png`)}')`
            }"
            class="monster-image-container"
          >
            <ElImage
              class="monster-image"
              :class="{ 'riftborne': row.riftborne }"
              :src="convertFilePath(`@/assets/images/monster/${row.monster}.png`)"
              fit="contain"
            />
            <ElImage
              v-if="row.effect"
              class="monster-effect"
              :src="convertFilePath(`@/assets/images/eff/${row.effect}.png`)"
              fit="contain"
            />
          </div>
        </ElTableColumn>
        <ElTableColumn #default="{ row } : { row: WeaponOption }">
          <SkillTags :skills="row.skills" disabled />
        </ElTableColumn>
      </ElTable>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.rarity-select-container {
  margin-top: 4px;
}
</style>