<script setup lang="ts">
defineOptions({ name: 'SkillSummary' })
import type { MonsterSkill } from '@/types'
import type { SkillData } from '@/components/SkillTags.vue'
import { computed } from 'vue'
import { ElRow, ElCol } from 'element-plus'
import { useConfigStore, useOperationStore, useDataStore, storeToRefs } from '@/stores'
import { SkillTags } from '@/components'

//將 SkillData 轉全必填
type SkillSummaryData = Required<Omit<SkillData, 'rarity'>>

const props = defineProps<{
  skills: MonsterSkill[],
  levelMode?: boolean
}>()

const { filterBuild } = storeToRefs(useConfigStore())
const { skillDialog } = storeToRefs(useOperationStore())
const { getSkillName, getSkillDesc } = useDataStore()

// 計算技能等級及上限
const skillLevels = computed(() => {
  const data: SkillSummaryData[] = []
  props.skills.forEach((skill) => {
    const index = data.findIndex((item) => item.id === skill.id)
    const maxLevel = getSkillDesc(skill.id).length
    if (index === -1) {
      data.push({
        id: skill.id,
        level: skill.level || 0,
        maxLevel
      })
    } else {
      data[index].level += skill.level || 0
    }
  })
  // 排序(level高到低)
  data.sort((a, b) => b.level - a.level)
  return data
})
// 打開技能視窗
const openSkillDialog = (skill: SkillData) => {
  skillDialog.value = skill
}
</script>

<template>
  <div class="skill-summary-container">
    <template v-if="levelMode || filterBuild.levelMode">
      <ElRow :gutter="8">
        <ElCol
          v-for="skill in skillLevels"
          :key="skill.id"
          :span="12"
          @click="openSkillDialog(skill)"
        >
          <div class="skill-name">{{ getSkillName(skill.id) }}</div>
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
    <template v-else>
      <SkillTags :skills="skillLevels" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.el-col {
  padding: 4px;
}

.skill-name {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 12px;
}

.skill-level {
  display: flex;
  align-items: center;
  gap: 4px;

  .skill-level-item {
    display: inline-block;
    width: 22px;
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