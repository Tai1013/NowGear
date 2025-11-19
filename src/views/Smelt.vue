<script setup lang="ts">
import type { SmeltSkill } from '@/types'
import { computed } from 'vue'
import { ElRow, ElCol, ElCard, ElTable, ElTableColumn, ElImage } from 'element-plus'
import { useDataStore, useOperationStore, useConfigStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'

type MonsterData = {
  id: string
  name: string
}

const { searchKeyword } = storeToRefs(useOperationStore())
const { componentSize } = storeToRefs(useConfigStore())
const { smeltData } = storeToRefs(useDataStore())
const { getMonsterName, getSkillName } = useDataStore()

const normalizedSmeltData = computed(() => {
  const normalized = Object.entries(smeltData.value).map(([id, data]) => {
    const raritySkills: SmeltSkill[] = []
    const normalSkills: SmeltSkill[] = []
    data.skills.forEach((skill) => {
      if (skill.rarity) raritySkills.push(skill)
      else normalSkills.push(skill)
    })
    const dataList = []
    const monsters: MonsterData[] = []
    if (data.monsters) {
      data.monsters.forEach((monster) => {
        monsters.push({
          id: monster,
          name: getMonsterName(monster)
        })
      })
      dataList.push({
        type: 'monsters',
        name: '持有魔物',
        data: monsters
      })
    }
    if (raritySkills.length) dataList.push({
      type: 'raritySkills',
      name: '稀有技能',
      data: raritySkills
    })
    if (normalSkills.length) dataList.push({
      type: 'normalSkills',
      name: id === 'common' ? '共通技能' : '特有技能',
      data: normalSkills
    })
    return {
      ...data,
      id,
      monsters,
      dataList
    }
  })

  // 模糊查詢過濾
  if (!searchKeyword.value || searchKeyword.value.trim() === '') {
    return normalized
  }
  const keyword = searchKeyword.value.toLowerCase().trim()
  return normalized.filter((smelt) => {
    // 搜尋漂流石名稱
    if (smelt.name.toLowerCase().includes(keyword)) return true
    // 搜尋魔物名稱
    if (smelt.monsters) {
      const hasMatchingMonster = smelt.monsters.some((monster) => monster.name.toLowerCase().includes(keyword))
      if (hasMatchingMonster) return true
    }
    // 搜尋技能名稱
    if (smelt.skills) {
      const hasMatchingSkill = smelt.skills.some((skill) => getSkillName(skill.id).toLowerCase().includes(keyword))
      if (hasMatchingSkill) return true
    }
    return false
  })
})
</script>

<template>
  <div class="smelt-container">
    <ElRow :gutter="8">
      <ElCol
        v-for="smelt in normalizedSmeltData"
        :key="smelt.id"
        :xs="24" :sm="12" :lg="8" :xl="6"
      >
        <ElCard align="center">
          <template #header>
            <div class="smelt-header">
              <ElImage
                :src="convertFilePath(`@/assets/images/driftstone/${smelt.id}.png`)"
                fit="contain"
              />
              {{ smelt.name }}
            </div>
          </template>
          <template #default>
            <ElTable
              :data="smelt.dataList"
              :show-header="false"
            >
              <ElTableColumn prop="name" width="80" />
              <ElTableColumn prop="data">
                <template #default="scope">
                  <template v-if="scope.row.type === 'monsters'">
                    <div class="smelt-monsters">
                      <ElImage
                        v-for="monster in (scope.row.data as MonsterData[])"
                        :key="monster.id"
                        :style="{ '--monster-image-size': componentSize === 'small' ? '25px' : '30px' }"
                        class="monster-image"
                        :src="convertFilePath(`@/assets/images/monster/${monster.id}.png`)"
                        :alt="monster.name"
                        :title="monster.name"
                        fit="contain"
                      />
                    </div>
                  </template>
                  <template v-else>
                    <SkillTags :skills="scope.row.data" />
                  </template>
                </template>
              </ElTableColumn>
            </ElTable>
          </template>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<style lang="scss" scoped>
.el-row {
  margin: 4px !important;
}

.el-col {
  padding: 4px;
}

.smelt-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  > .el-image {
    width: 25px;
    height: 25px;
  }
}

.smelt-monsters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
