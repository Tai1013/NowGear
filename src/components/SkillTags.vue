<script setup lang="ts">
import type { MonsterSkill, SkillType } from '@/types'
import { ElSpace, ElTag } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'

defineOptions({ name: 'SkillTags' })
defineProps<{
  skills?: MonsterSkill[]
  size?: number
}>()

const { skillsData, skillDialogId } = storeToRefs(useBestiaryStore())

const openSkillDialog = (id: SkillType) => {
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
      :type="skill.id === 'weapon-special' ? 'info' : 'primary'"
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