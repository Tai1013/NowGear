<script setup lang="ts">
import type { NormalizedMonster, MonsterWeapon, MonsterSkill } from '@/types'
import { ref, watch, computed } from 'vue'
import { ElRow, ElCol, ElCard, ElSpace, ElButton, ElImage, ElTable, ElTableColumn } from 'element-plus'
import { useDataStore, useOperationStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'

interface SelectedWeapon extends MonsterWeapon {
  checked: string
}

const { searchKeyword } = storeToRefs(useOperationStore())
const { isLoadingMonsters, monstersData } = storeToRefs(useDataStore())
const { getSkillName } = useDataStore()

// const { isLoadingMonsters, monstersData, skillsData, searchKeyword } = storeToRefs(useBestiaryStore())

// 當前龍選擇的武器清單
const selectedWeapons = ref<Record<string, SelectedWeapon>>({})

// 根據搜尋關鍵字過濾魔物列表
const filteredMonstersData = computed(() => {
  // 模糊查詢過濾
  if (!searchKeyword.value || searchKeyword.value.trim() === '') {
    return monstersData.value
  }

  const keyword = searchKeyword.value.toLowerCase().trim()
  return monstersData.value.filter((monster) => {
    // 搜尋魔物名稱
    if (monster.name.toLowerCase().includes(keyword)) return true
    // 搜尋技能名稱
    const hasMatchingSkill = (skills?: MonsterSkill[]) => {
      if (!skills) return false
      return skills.some((skill) => getSkillName(skill.id).toLowerCase().includes(keyword))
    }
    // 搜尋武器技能（搜尋所有武器）
    if (monster.weapon) {
      const weaponValues = Object.values(monster.weapon)
      if (weaponValues.some((weapon) => hasMatchingSkill(weapon?.skills))) return true
    }
    // 搜尋防具技能
    if (monster.armor) {
      const armorPieces = Object.values(monster.armor)
      if (armorPieces.some((armor) => hasMatchingSkill(armor?.skills))) return true
    }

    return false
  })
})

// 判斷魔物名稱是否匹配搜尋關鍵字
const isMonsterNameMatched = (monsterName: string) => {
  if (!searchKeyword.value || searchKeyword.value.trim() === '')  return false
  const keyword = searchKeyword.value.toLowerCase().trim()
  return monsterName.toLowerCase().includes(keyword)
}
// 轉換裝備清單
const convertArmorList = (armor: NormalizedMonster['armor']) => {
  if (!armor) return []
  return Object.entries(armor).map(([id, data]) => ({ id, ...data }))
}
// 切換武器，並取得選擇武器的資訊
const changeWeaponHandler = (monsterId: string, weaponId: string) => {
  const monsterWeapon = monstersData.value.find((monster) => monster.id === monsterId)?.weapon
  const defaultEffect = monsterWeapon?.default?.effect
  const defaultSkills = monsterWeapon?.default?.skills || []
  const effect = monsterWeapon?.[weaponId]?.effect || defaultEffect
  const skills = monsterWeapon?.[weaponId]?.skills || defaultSkills
  if (selectedWeapons.value[monsterId].checked === weaponId) {
    selectedWeapons.value[monsterId] = { checked: 'default', skills: [] }
    if (defaultEffect) selectedWeapons.value[monsterId].effect = defaultEffect
    if (defaultSkills) selectedWeapons.value[monsterId].skills = defaultSkills
    return
  }
  selectedWeapons.value[monsterId].checked = weaponId
  if (effect) selectedWeapons.value[monsterId].effect = effect
  if (skills) selectedWeapons.value[monsterId].skills = skills
}
// 初始化選中的武器
const initSelectedWeapons = () => {
  // 如果 selectedWeapons 的數量等於 monstersData 的數量，就不需要初始化
  if (Object.keys(selectedWeapons.value).length === monstersData.value.length) return
  selectedWeapons.value = monstersData.value.reduce((acc, monsterData) => {
    const reduceData: SelectedWeapon = { checked: 'default', skills: [] }
    const defaultEffect = monsterData.weapon?.default?.effect
    const defaultSkills = monsterData.weapon?.default?.skills
    if (defaultEffect) reduceData.effect = defaultEffect
    if (defaultSkills) reduceData.skills = defaultSkills
    return {
      ...acc,
      [monsterData.id]: reduceData
    }
  }, {})
}

watch(() => isLoadingMonsters.value, (isLoading) => {
  if (!isLoading) initSelectedWeapons()
}, { immediate: true })
</script>

<template>
  <div class="monster-container">
    <ElRow :gutter="8">
      <ElCol
        v-for="monster in filteredMonstersData"
        :key="monster.id"
        :xs="24" :sm="12" :lg="8" :xl="6"
      >
        <ElCard align="center">
          <template #header>
            <div class="monster-header">
              <div
                :style="{'--monster-image': `url('${convertFilePath(`@/assets/images/monster/${monster.id}.png`)}')`}"
                class="monster-image-container"
              >
                <ElImage
                  class="monster-image"
                  :class="{ riftborne: monster.riftborne }"
                  :src="convertFilePath(`@/assets/images/monster/${monster.id}.png`)"
                  :alt="monster.name"
                  :title="monster.name"
                  fit="contain"
                />
                <ElImage
                  v-if="selectedWeapons[monster.id]?.effect"
                  class="monster-effect"
                  :src="convertFilePath(`@/assets/images/eff/${selectedWeapons[monster.id].effect}.png`)"
                  fit="contain"
                />
              </div>
              <small
                class="monster-name"
                :class="{
                  riftborne: monster.riftborne,
                  'monster-name-matched': isMonsterNameMatched(monster.name)
                }"
              >
                {{ monster.name }}
              </small>
            </div>
          </template>
          <template #default>
            <div v-if="monster.sortWeapons" class="weapon-container">
              <ElSpace wrap>
                <ElButton
                  v-for="weapon in monster.sortWeapons"
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
              <div class="weapon-skills">
                <SkillTags :skills="selectedWeapons[monster.id]?.skills" />
              </div>
            </div>
            <div v-if="monster.armor" class="armor-container">
              <ElTable
                :data="convertArmorList(monster.armor)"
                :show-header="false"
              >
                <ElTableColumn prop="id" width="54">
                  <template #default="scope">
                    <ElImage
                      class="armor-image"
                      :src="convertFilePath(`@/assets/images/part/${scope.row.id}.png`)"
                      fit="contain"
                    />
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="skills" show-overflow-tooltip>
                  <template #default="scope">
                    <SkillTags :skills="scope.row.skills" />
                  </template>
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

.monster-name {
  &.riftborne {
    color: #e0baf3;
  }

  &.monster-name-matched {
    color: var(--el-color-warning);
  }
}

.weapon-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .el-space {
    justify-content: center;
  }

  .weapon-image {
    width: 25px;
    height: 25px;
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
