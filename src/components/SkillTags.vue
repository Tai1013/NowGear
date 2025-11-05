<script setup lang="ts">
import type { MonsterSkill } from '@/types'
import { ElSpace, ElTag } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'

defineOptions({ name: 'SkillTags' })
defineProps<{
  skills?: MonsterSkill[]
  size?: number
}>()

const { skillsData, skillDialogId, searchKeyword } = storeToRefs(useBestiaryStore())

const setSkillTagType = (id: string) => {
  if (id === 'weapon-special') return 'info'

  // 判斷技能是否匹配搜尋關鍵字
  if (searchKeyword.value && searchKeyword.value.trim() !== '') {
    const keyword = searchKeyword.value.toLowerCase().trim()
    const skillName = skillsData.value[id]?.name || ''
    if (skillName.toLowerCase().includes(keyword)) {
      return 'warning'
    }
  }

  return 'primary'
}

const openSkillDialog = (id: string) => {
  if (id === 'weapon-special') return
  skillDialogId.value = id
}
</script>

<template>
  <ElSpace wrap :size="size">
    <ElTag
      v-for="skill in skills"
      :key="skill.id"
      :class="{ 'cursor': skill.id !== 'weapon-special' }"
      :type="setSkillTagType(skill.id)"
      disable-transitions
      @click="openSkillDialog(skill.id)"
    >
      {{ skillsData[skill.id].name }}
      {{ skill.level }}
    </ElTag>
  </ElSpace>
</template>

<style lang="scss" scoped>
.cursor {
  cursor: pointer;
}
</style>