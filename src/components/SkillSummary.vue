<script setup lang="ts">
import type { MonsterSkill } from '@/types'
import { computed } from 'vue'
import { ElRow, ElCol } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'

interface SkillLevel extends MonsterSkill {
  name: string
  maxLevel: number
}

defineOptions({ name: 'SkillSummary' })
const props = defineProps<{
  skills?: MonsterSkill[]
}>()

const { skillsData, skillDialogId, skillDialogLevel } = storeToRefs(useBestiaryStore())

// 計算技能等級及上限
const skillLevels = computed(() => {
  const data: SkillLevel[] = []
  if (!props.skills) return data
  props.skills.forEach((skill) => {
    const index = data.findIndex((item) => item.id === skill.id)
    const name = skillsData.value[skill.id].name
    const desc = skillsData.value[skill.id].desc || []
    if (index === -1) {
      data.push({
        id: skill.id,
        level: skill.level,
        name,
        maxLevel: desc.length
      })
    } else {
      data[index].level += skill.level
    }
  })
  // 排序(level高到低)
  data.sort((a, b) => b.level - a.level)
  return data
})
const openSkillDialog = (skill: SkillLevel) => {
  skillDialogId.value = skill.id
  skillDialogLevel.value = skill.level
}
</script>

<template>
  <ElRow :gutter="8">
    <ElCol
      v-for="skill in skillLevels"
      :key="skill.id"
      :span="12"
      @click="openSkillDialog(skill)"
    >
      <div class="skill-name">{{ skill.name }}</div>
      <div class="skill-level">
        <span
          v-for="levelIndex in skill.maxLevel"
          :key="levelIndex"
          class="skill-level-item"
          :class="{
            'active': levelIndex <= skill.level,
            'full': skill.level === skill.maxLevel, // 滿格
            'over': skill.level > skill.maxLevel    // 滿格以上
          }"
        />
      </div>
    </ElCol>
  </ElRow>
</template>

<style lang="scss" scoped>
.el-col {
  padding: 4px;
  cursor: pointer;
}

.skill-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.skill-level {
  display: flex;
  align-items: center;
  gap: 4px;

  .skill-level-item {
    display: inline-block;
    width: 20px;
    height: 8px;
    background-color: #ccc;
    transform: skew(-30deg);

    &.active {
      background-color: var(--el-color-warning);
    }
    &.full {
      background-color: var(--el-color-success);
    }
    &.over {
      background-color: var(--el-color-error);
    }
  }
}
</style>