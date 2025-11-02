<script setup lang="ts">
import type { Weapon, MonsterWeapon, Monster, MonsterArmor } from '@/types'
import { ref, watch } from 'vue'
import { ElRow, ElCol, ElCard, ElSpace, ElButton, ElImage, ElTag, ElTable, ElTableColumn } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'

interface SelectedWeapon extends MonsterWeapon {
  checked: string
  list: Weapon[]
}

const { monstersData, weaponsData, skillsData } = storeToRefs(useBestiaryStore())

// 當前龍選擇的武器清單
const selectedWeapons = ref<Record<string, SelectedWeapon>>({})

// 切換武器，並取得選擇武器的資訊
const changeWeaponHandler = (monsterId: string, weaponId: string) => {
  const monsterWeapon = monstersData.value.find((monster) => monster.id === monsterId)?.weapon
  const selectedEffect = monsterWeapon?.[weaponId]?.effect || monsterWeapon?.default?.effect
  const selectedSkills = monsterWeapon?.[weaponId]?.skills || monsterWeapon?.default?.skills
  const selectedWeapon = selectedWeapons.value[monsterId]
  if (selectedWeapon?.checked === weaponId) {
    selectedWeapon.checked = 'default'
    selectedWeapon.effect = monsterWeapon?.default?.effect
    selectedWeapon.skills = monsterWeapon?.default?.skills
    return
  }
  selectedWeapon.checked = weaponId
  if (selectedEffect) selectedWeapon.effect = selectedEffect
  if (selectedSkills) selectedWeapon.skills = selectedSkills
}
// 轉換裝備清單
const convertArmorList = (armor: Monster['armor']) => {
  if (!armor) return []
  return Object.entries(armor).map(([id, data]) => ({ id, ...data }))
}
// 初始化選中的武器
const initSelectedWeapons = () => {
  monstersData.value.forEach((monsterData) => {
    if (monsterData.weapon) {
      const weaponList:Weapon[] = []
      weaponsData.value.forEach((weaponData) => {
        if (monsterData.weapon && weaponData.id in monsterData.weapon) {
          weaponList.push(weaponData)
        }
      })
      selectedWeapons.value = {
        ...selectedWeapons.value,
        [monsterData.id]: {
          checked: 'default',
          list: weaponList,
          effect: monsterData.weapon.default?.effect,
          skills: monsterData.weapon.default?.skills
        }
      }
    }
  })
}

watch(() => monstersData.value, () => {
  initSelectedWeapons()
}, { deep: true })
</script>

<template>
  <div class="monster-container">
    <ElRow :gutter="8">
      <ElCol
        v-for="monster in monstersData"
        :key="monster.id"
        :xs="24" :md="12" :lg="8" :xl="6"
      >
        <ElCard>
          <template #header>
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
              :class="{ riftborne: monster.riftborne }"
            >
              {{ monster.name }}
            </small>
          </template>
          <template #default>
            <div v-if="monster.weapon" class="weapon-container">
              <ElSpace wrap>
                <ElButton
                  v-for="weapon in selectedWeapons[monster.id]?.list"
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
              <ElSpace wrap :size="6">
                <ElTag
                  v-for="skill in selectedWeapons[monster.id]?.skills"
                  :key="skill.id"
                  :type="skill.id === 'weapon-special' ? 'info' : 'primary'"
                  disable-transitions
                >
                  {{ skillsData[skill.id].name }}
                  {{ skill.level }}
                </ElTag>
              </ElSpace>
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
                    <ElSpace wrap :size="6">
                      <ElTag
                        v-for="skill in (scope.row.skills as MonsterArmor['skills'])"
                        :key="skill.id"
                        disable-transitions
                      >
                        {{ skillsData[skill.id].name }}
                        {{ skill.level }}
                      </ElTag>
                    </ElSpace>
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

.el-card {
  --el-card-padding: 16px;
}
:deep(.el-card__header) {
  text-align: center;
}
:deep(.el-card__body) {
  >*:not(:last-child) {
    margin-bottom: 16px;
  }
}

.monster-image-container {
  position: relative;
  display: inline-flex;
  
  .monster-image {
    width: 40px;
    height: 40px;

    &.riftborne::before {
      content: '';
      mask: var(--monster-image) center / contain no-repeat;
      position: absolute;
      inset: 0;
      opacity: 0.75;
      background: linear-gradient(180deg, #0000 0%, #0000 50%, #ae66d3 85%, #ae66d3 100%);
    }
  }

  .monster-effect {
    position: absolute;
    bottom: 0;
    right: -5px;
    width: 20px;
    height: 20px;
    filter: drop-shadow(0 0 .05em #e6e6e6);
  }
}

.monster-name {
  margin-top: 8px;
  display: block;

  &.riftborne {
    color: #e0baf3;
  }
}

.weapon-container {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .el-space {
    justify-content: center;
  }

  .weapon-image {
    width: 25px;
    height: 25px;
  }
}

.armor-container {
  .armor-image {
    display: block;
    width: 30px;
    height: 30px;
  }

  .armor-slot {
    display: inline-block;
    margin-left: 4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #ccc;
  }
}
</style>
