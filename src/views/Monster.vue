<script setup lang="ts">
import type { NormalizedMonster, MonsterSkill } from '@/types'
import { ref, watch, computed } from 'vue'
import { ElRow, ElCol, ElCard, ElSpace, ElRadioGroup, ElRadioButton, ElButton, ElImage, ElTable, ElTableColumn } from 'element-plus'
import { useDataStore, useOperationStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags, MonsterImage } from '@/components'

const { searchKeyword } = storeToRefs(useOperationStore())
const { isLoadingMonsters, monstersData, selectedWeapons } = storeToRefs(useDataStore())
const { getSkillName, initSelectedWeapons, changeWeaponHandler } = useDataStore()

// 魔物列表模式
const monsterListMode = ref<'all' | 'weapon' | 'armor' | 'riftborne'>('all')
const monsterListModeOptions = [
  { label: '全部', value: 'all' },
  { label: '武器', value: 'weapon' },
  { label: '防具', value: 'armor' },
  { label: '突變', value: 'riftborne' }
]

// 根據搜尋關鍵字過濾魔物列表
const filteredMonstersData = computed(() => {
  const filterMonsters = (monsters: NormalizedMonster[]) => {
    return monsters.filter((monster) => {
      if (monsterListMode.value === 'weapon') return !!monster.weapon
      if (monsterListMode.value === 'armor') return !!monster.armor
      if (monsterListMode.value === 'riftborne') return !!monster.riftborne
      return true
    })
  }

  const keyword = searchKeyword.value.toLowerCase().trim()
  // 模糊查詢過濾
  if (!searchKeyword.value || keyword === '') return filterMonsters(monstersData.value)
  // 搜尋技能名稱
  const hasMatchingSkill = (skills?: MonsterSkill[]) => {
    if (!skills) return false
    return skills.some((skill) => getSkillName(skill.id).toLowerCase().includes(keyword))
  }
  // 搜尋魔物名稱、武器技能、防具技能
  return filterMonsters(monstersData.value
    .filter((monster) => {
      const { name, weapon, armor } = monster
      return (
        name.toLowerCase().includes(keyword) ||
        (weapon && Object.values(weapon).some((item) => hasMatchingSkill(item?.skills))) ||
        (armor && Object.values(armor).some((item) => hasMatchingSkill(item?.skills)))
      )
    }))
})

// 轉換裝備清單
const convertArmorList = (armor: NormalizedMonster['armor']) => {
  if (!armor) return []
  return Object.entries(armor).map(([id, data]) => ({ id, ...data }))
}
// 設置魔物圖片
const setMonsterImage = (monster: NormalizedMonster) => {
  return {
    id: monster.id,
    name: monster.name,
    effect: selectedWeapons.value[monster.id]?.effect || monster.weapon?.default?.effect,
    riftborne: monster.riftborne
  }
}
// 設置魔物武器列表
const setMonsterWeapons = (sortWeapons: NormalizedMonster['sortWeapons'] = []) => {
  return sortWeapons.map((weapon) => ({ id: weapon.id, name: weapon.name }))
}

watch(() => isLoadingMonsters.value, (isLoading) => {
  if (!isLoading) initSelectedWeapons()
}, { immediate: true })
</script>

<template>
  <div class="monster-container">
    <ElRadioGroup v-model="monsterListMode">
      <ElRadioButton
        v-for="item in monsterListModeOptions"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <ElRow :gutter="8">
      <ElCol
        v-for="monster in filteredMonstersData"
        :key="monster.id"
        :xs="24" :sm="12" :lg="8" :xl="6"
      >
        <ElCard
          :header-class="setMonsterImage(monster).riftborne ? 'riftborne' : ''"
          align="center"
        >
          <template #header>
            <div class="monster-header">
              <MonsterImage :monster="setMonsterImage(monster)" :size="30" />
              <small>{{ monster.name }}</small>
            </div>
          </template>
          <template #default>
            <div v-if="monster.sortWeapons" class="weapon-container">
              <ElSpace wrap>
                <ElButton
                  v-for="weapon in setMonsterWeapons(monster.sortWeapons)"
                  :key="weapon.id"
                  :type="selectedWeapons[monster.id]?.checked === weapon.id ? 'primary' : ''"
                  circle
                  @click="changeWeaponHandler(monster.id, weapon.id)"
                >
                  <ElImage
                    class="weapon-image"
                    :src="convertFilePath(`@/assets/images/part/${weapon.id}.png`)"
                    :alt="weapon.name"
                    :title="weapon.name"
                    fit="contain"
                  />
                </ElButton>
              </ElSpace>
              <div v-if="selectedWeapons[monster.id]" class="weapon-skills">
                <SkillTags :skills="selectedWeapons[monster.id].skills" />
              </div>
            </div>
            <div v-if="monster.armor" class="armor-container">
              <ElTable
                :data="convertArmorList(monster.armor)"
                :show-header="false"
              >
                <ElTableColumn prop="id" width="54" #default="scope">
                  <ElImage
                    class="armor-image"
                    :src="convertFilePath(`@/assets/images/part/${scope.row.id}.png`)"
                    fit="contain"
                  />
                </ElTableColumn>
                <ElTableColumn prop="skills" show-overflow-tooltip #default="scope">
                  <SkillTags :skills="scope.row.skills" />
                </ElTableColumn>
                <ElTableColumn prop="slots" align="right" width="40" />
              </ElTable>
            </div>
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

.el-radio-group {
  position: sticky;
  top: 49px;
  z-index: 100;
  padding: 8px 8px 0;
  display: flex;

  > .el-radio-button {
    flex: 1;
    background-color: var(--el-bg-color);
  }

  :deep(.el-radio-button__inner) {
    width: 100%;
  }
}

:deep(.el-card__header).riftborne {
  position: relative;
  color: #e0baf3;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.125;
    background: linear-gradient(0deg, #0000 0%, #0000 50%, #ae66d3 85%, #ae66d3 100%);
  }
}

:deep(.el-card__body) {
  >*:not(:last-child) {
    margin-bottom: 12px;
  }
}

.monster-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.weapon-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .el-space {
    margin: 0 auto;
    max-width: 275px;
    justify-content: center;
  }

  .weapon-image {
    width: 25px;
    height: 25px;
    opacity: 0.5;
  }

  .weapon-skills {
    padding: 8px;
    min-height: 31px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #141414;
  }
}

.armor-container {
  .armor-image {
    display: block;
    width: 30px;
    height: 30px;
  }
}
</style>
