<script setup lang="ts">
import type { SmeltSkill } from '@/types'
import { computed } from 'vue'
import { ElRow, ElCol, ElCard, ElTable, ElTableColumn, ElImage } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'

const { smeltData, monstersData } = storeToRefs(useBestiaryStore())

const normalizedSmeltData = computed(() => {
  return Object.entries(smeltData.value).map(([id, data]) => {
    const raritySkills: SmeltSkill[] = []
    const normalSkills: SmeltSkill[] = []
    data.skills.forEach((skill) => {
      if (skill.rarity) raritySkills.push(skill)
      else normalSkills.push(skill)
    })
    const dataList = []
    if (data.monsters) dataList.push({
      type: 'monsters',
      name: '持有魔物',
      data: data.monsters
    })
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
      id,
      name: data.name,
      dataList
    }
  })
})

// 取得龍的名字
const getMonsterName = (id: string) => {
  return monstersData.value.find((monster) => monster.id === id)?.name || id
}
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
            {{ smelt.name }}
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
                        v-for="monster in (scope.row.data as string[])"
                        :key="monster"
                        class="monster-image"
                        :src="convertFilePath(`@/assets/images/monster/${monster}.png`)"
                        :alt="getMonsterName(monster)"
                        :title="getMonsterName(monster)"
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

.el-card {
  --el-card-padding: 16px;
}

.smelt-monsters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  .monster-image {
    width: 25px;
    height: 25px;
  }
}
</style>
