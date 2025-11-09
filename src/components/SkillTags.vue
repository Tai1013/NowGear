<script setup lang="ts">
import type { TagProps } from 'element-plus'
import type { MonsterSkill, SmeltSkill } from '@/types'
import { ElSpace, ElTag } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'

defineOptions({ name: 'SkillTags' })
const props = defineProps<{
  skills?: (MonsterSkill | SmeltSkill)[]
  size?: number
  disabled?: boolean
}>()

const { skillsData, skillDialogId, searchKeyword } = storeToRefs(useBestiaryStore())

const setSkillTagType = (skill: MonsterSkill | SmeltSkill) => {
  let tagType: TagProps['type'] = 'primary'
  // 判斷是否為視武器而不同
  if (skill.id === 'weapon-special') tagType = 'info'
  // 判斷技能是否為稀有技能
  if ((skill as SmeltSkill).rarity) tagType = 'danger'
  // 判斷技能是否匹配搜尋關鍵字
  if (searchKeyword.value && searchKeyword.value.trim() !== '') {
    const keyword = searchKeyword.value.toLowerCase().trim()
    const skillName = skillsData.value[skill.id]?.name || ''
    if (skillName.toLowerCase().includes(keyword)) {
      tagType = 'warning'
    }
  }
  return tagType
}

const openSkillDialog = (id: string) => {
  if (id === 'weapon-special' || props.disabled) return
  skillDialogId.value = id
}
</script>

<template>
  <ElSpace wrap :size="size">
    <ElTag
      v-for="skill in skills"
      :key="skill.id"
      :class="{ 'cursor': skill.id !== 'weapon-special', disabled }"
      :type="setSkillTagType(skill)"
      disable-transitions
      @click="openSkillDialog(skill.id)"
    >
      <span>{{ skillsData[skill.id].name }}</span>
      <span v-if="(skill as MonsterSkill).level">{{ (skill as MonsterSkill).level }}</span>
    </ElTag>
  </ElSpace>
</template>

<style lang="scss" scoped>
.cursor:not(.disabled) {
  cursor: pointer;
}
</style>