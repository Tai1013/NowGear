<script setup lang="ts">
import type { BuildWeaponRow, MonsterSkill } from '@/types'
import { isEqual } from 'radashi'
import { ref, computed, watch } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElImage, ElInput } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'

defineOptions({ name: 'WeaponSelect' })
const props = defineProps<{
  modelValue: BuildWeaponRow | undefined
  category?: string
}>()
const emit = defineEmits(['update:modelValue'])

const { monstersData, skillsData } = storeToRefs(useBestiaryStore())

const singleTableRef = ref<InstanceType<typeof ElTable>>()
const isDialogVisible = ref(false)
const searchWeaponKeyword = ref('')
const weaponsList = ref<BuildWeaponRow[]>([])

// 內部武器數據
const innerWeaponData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
// 武器列表：根據 category 過濾龍並返回對應的技能和屬性
const setNormalized = () => {
  const normalized: BuildWeaponRow[] = monstersData.value
    .filter((monster) => {
      if (!monster.weapon) return false

      // category 為空：顯示所有有 weapon.default 技能的龍
      if (!props.category) {
        return monster.weapon.default?.skills && monster.weapon.default.skills.length > 0
      }

      // category 有值：只顯示有該武器的龍
      return props.category in monster.weapon
    })
    .map((monster) => {
      // 決定使用哪個技能和屬性數據
      let skills: MonsterSkill[] = []
      let effect: string = ''
      if (!props.category) {
        // category 為空：使用 default 技能和屬性
        skills = monster.weapon!.default?.skills || []
        effect = monster.weapon!.default?.effect || ''
      } else {
        // category 有值：優先使用該武器的技能和屬性，否則使用 default
        const categoryWeapon = monster.weapon![props.category]
        if (categoryWeapon?.skills && categoryWeapon.skills.length > 0) skills = categoryWeapon.skills
        else skills = monster.weapon!.default?.skills || []
        if (categoryWeapon?.effect) effect = categoryWeapon.effect
        else effect = monster.weapon!.default?.effect || ''      
      }

      return {
        monster: monster.id,  // 參考項目格式：使用 monster id
        monsterName: monster.name,  // 顯示名稱
        skills,
        effect  // 屬性
      }
    })
    .filter((weapon) => {
      if (!searchWeaponKeyword.value || searchWeaponKeyword.value.trim() === '') return true
      const keyword = searchWeaponKeyword.value.toLowerCase().trim()
      // 搜尋魔物名稱
      if (weapon.monsterName.toLowerCase().includes(keyword)) return true
      // 搜尋技能名稱
      if (weapon.skills.some((skill) => {
        const skillName = skillsData.value[skill.id]?.name || ''
        return skillName.toLowerCase().includes(keyword)
      })) return true
      return false
    })
  // 設定初始選中行
  setTimeout(() => {
    if (innerWeaponData.value) {
      const row = weaponsList.value.find((row) => row.monster === innerWeaponData.value?.monster)
      if (!isEqual(row, innerWeaponData.value)) innerWeaponData.value = row
      singleTableRef.value?.setCurrentRow(row)
    }
  }, 100)
  return normalized
}
// 開啟彈窗
const openDialogHandler = () => {
  isDialogVisible.value = true
}
// 選擇武器，如果 row 與 modelValue 相同，則清空選擇，否則設定新的選擇
const handleCurrentChange = (row: BuildWeaponRow) => {
  if (row.monster === innerWeaponData.value?.monster) {
    innerWeaponData.value = undefined
  } else {
    innerWeaponData.value = row
  }
  isDialogVisible.value = false
}

watch([() => props.category, () => searchWeaponKeyword.value], () => {
  weaponsList.value = setNormalized()
}, { immediate: true })
</script>

<template>
  <div
    class="weapon-select-container"
    @click="openDialogHandler"
  >
    <template v-if="innerWeaponData">
      <div class="weapon-select-item">
        <div class="monster-image-container">
          <ElImage
            class="monster-image"
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
        <SkillTags :skills="innerWeaponData.skills" disabled />
      </div>
    </template>
    <template v-else>
      <div class="weapon-select-placeholder">
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
        :data="weaponsList"
        :show-header="false"
        height="450px"
        highlight-current-row
        :row-key="row => row.monster"
        @row-click="handleCurrentChange"
      >
        <ElTableColumn prop="monster" width="60">
          <template #default="scope">
            <div class="monster-image-container">
              <ElImage
                class="monster-image"
                :src="convertFilePath(`@/assets/images/monster/${scope.row.monster}.png`)"
                fit="contain"
              />
              <ElImage
                v-if="scope.row.effect"
                class="monster-effect"
                :src="convertFilePath(`@/assets/images/eff/${scope.row.effect}.png`)"
                fit="contain"
              />
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="skills">
          <template #default="scope">
            <SkillTags :skills="scope.row.skills" disabled />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__row) {
  cursor: pointer;
}
.weapon-select-container {
  width: 100%;
  min-height: var(--build-select-height);
  cursor: pointer;

  .weapon-select-placeholder {
    display: flex;
    align-items: center;
    color: var(--el-text-color-placeholder);
    width: 100%;
    height: var(--build-select-height);
  }
}

.weapon-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.monster-image-container {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;

  .monster-image {
    width: var(--build-select-height);
    height: var(--build-select-height);
  }

  .monster-effect {
    position: absolute;
    bottom: 0;
    right: -5px;
    width: calc(var(--build-select-height) / 2);
    height: calc(var(--build-select-height) / 2);
    filter: drop-shadow(0 0 .05em #e6e6e6);
  }
}
</style>