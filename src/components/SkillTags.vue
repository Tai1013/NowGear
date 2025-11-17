<script setup lang="ts">
defineOptions({ name: 'SkillTags' })

import type { SmeltSkill, MonsterSkill } from '@/types'
import type { TagProps } from 'element-plus'
import { ElSpace, ElTag } from 'element-plus'
import { useOperationStore, useDataStore, useConfigStore, storeToRefs } from '@/stores'

export interface SkillData extends SmeltSkill, MonsterSkill {
  maxLevel?: number
}

const props = defineProps<{
  skills: SkillData[]
  disabled?: boolean
}>()

const { skillsData } = storeToRefs(useDataStore())
const { componentSize } = storeToRefs(useConfigStore())
const { skillDialog, searchKeyword } = storeToRefs(useOperationStore())

// tag 是否禁用
const tagDisabled = (skill: SkillData) => {
  return skill.id === 'weapon-special' || props.disabled
}
// tag 等級
const tagLevel = (skill: SkillData) => {
  const { level, maxLevel } = skill
  if (!level) return ''
  if (maxLevel && level > maxLevel) return maxLevel
  return level
}
// tag 類型
const tagType = (skill: SkillData) => {
  let tagType: TagProps['type'] = 'primary'
  // 判斷是否為視武器而不同
  if (skill.id === 'weapon-special') tagType = 'info'
  // 判斷技能是否為稀有技能
  if (skill.rarity) tagType = 'danger'
  if (skill.maxLevel && skill.level) {
    // 判斷是否滿格
    if (skill.level === skill.maxLevel) tagType = 'success'
    // 判斷是否滿格以上
    if (skill.level > skill.maxLevel) tagType = 'danger'
  }
  // 判斷技能是否匹配搜尋關鍵字
  if (searchKeyword.value && searchKeyword.value.trim() !== '') {
    const keyword = searchKeyword.value.toLowerCase().trim()
    const skillName = skillsData.value[skill.id].name
    if (skillName.toLowerCase().includes(keyword)) tagType = 'warning'
  }
  return tagType
}
// 打開技能視窗
const openSkillDialog = (skill: SkillData) => {
  skillDialog.value = skill
}
</script>

<template>
  <ElSpace wrap :size="componentSize === 'small' ? 4 : 6">
    <ElTag
      v-for="skill in skills"
      :key="skill.id"
      :class="{ 'cursor': !tagDisabled(skill) }"
      :type="tagType(skill)"
      :size="componentSize"
      disable-transitions
      :disabled="tagDisabled(skill)"
      @click="!tagDisabled(skill) && openSkillDialog(skill)"
    >
      <span>{{ skillsData[skill.id].name }}</span>
      <span>{{ tagLevel(skill) }}</span>
    </ElTag>
  </ElSpace>
</template>

<style lang="scss" scoped>
:deep(.el-tag__content) {
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>