<script setup lang="ts">
import type { BuildData, BuildWeaponRow, ArmorType, MonsterSkill } from '@/types'
import { cloneDeep } from 'radashi'
import { h, ref, computed, watch } from 'vue'
import { ElRow, ElCol, ElCheckboxGroup, ElCheckboxButton,  ElCard, ElButton, ElImage, ElSpace, ElSwitch, ElDivider, ElUpload, ElIcon } from 'element-plus'
import { Filter, Sort } from '@element-plus/icons-vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useDataStore, useConfigStore, useOperationStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { BuildDialog, SkillSummary, SkillTags, MonsterImage } from '@/components'
import RaritySelect from '@/components/BuildDialog/RaritySelect.vue'
import { useMessage } from '@/composables'

type BuildOrder = 'category' | 'weapon' | ArmorType

const { filterBuild, componentSize } = storeToRefs(useConfigStore())
const { weaponsData, monstersData, effectsData } = storeToRefs(useDataStore())
const { buildDialog, buildDataList } = storeToRefs(useOperationStore())
const { getSmeltCategory, computedSkillLevel } = useDataStore()
const { downloadBuildDataList, importBuildDataList } = useOperationStore()

const spacer = h(ElDivider, { direction: 'vertical' })
const { $messageBox } = useMessage()

// 裝備顯示順序
const buildOrder: BuildOrder[] = ['weapon', 'category', 'helm', 'mail', 'gloves', 'belt', 'greaves']
// 篩選器是否顯示
const filterVisible = ref(false)
const isStopClicked = ref(false)

const buildRowRef = ref<InstanceType<typeof ElRow>>()

const { option } = useSortable(buildRowRef, buildDataList, {
  animation: 200,
  handle: '.build-drag',
  disabled: !filterBuild.value.sortMode
})

// 篩選魔物清單
const filterMonsters = computed(() => {
  return monstersData.value
    .filter((monster) => monster.weapon)
    .map((monster) => ({ id: monster.id, name: monster.name }))
})
// 篩選屬性清單
const filterEffects = computed(() => {
  const noneEffect = { id: 'none', name: '無屬性' }
  return [...effectsData.value, noneEffect]
})
// 塞選後的配裝數據
const filteredBuildDataList = computed(() => {
  return buildDataList.value
    .filter((buildData) => {
      const { weapons, effects } = filterBuild.value
      // 如果 filterBuild.value.weapons 和 filterBuild.value.effects 為空，則不過濾
      if (weapons.length === 0 && effects.length === 0) return true
      let filterStatus = false
      if (weapons.length > 0) {
        if (buildData.weapon && weapons.includes(buildData.weapon.monster)) filterStatus = true
        if (weapons.includes(buildData.category)) filterStatus = true
      }
      if (effects.length > 0 && buildData.weapon) {
        if (effects.includes(buildData.weapon.effect)) filterStatus = true
        if (effects.includes('none') && !buildData.weapon.effect) filterStatus = true
        if (effects.includes('riftborne') && buildData.weapon.riftborne) filterStatus = true
      }
      return filterStatus
    })
})

// 阻止彈窗打開
const openClickStopHandler = () => {
  isStopClicked.value = true
  setTimeout(() => {
    isStopClicked.value = false
  }, 300)
}
// 新增配裝，開啟視窗
const addBuildHandler = () => {
  buildDialog.value = { visible: true, mode: 'add' }
}
// 更新配裝數據
const updateDataHandler = ({ mode, data }: { mode: 'add' | 'edit' | 'preview', data: BuildData }) => {
  if (mode === 'add') {
    buildDataList.value.unshift(data)
  }
  if (mode === 'edit') {
    const index = buildDataList.value.findIndex((item) => item.key === data.key)
    buildDataList.value.splice(index, 1, data)
  }
}
// 取得配裝數據所有技能
const getBuildSkills = (buildData: BuildData) => {
  const skills: MonsterSkill[] = []
  const smeltSkills: MonsterSkill[] = []
  const innerBuildData = cloneDeep(buildData)
  Object.keys(innerBuildData).forEach((key) => {
    if (['category', 'name', 'ideal', 'key'].includes(key)) return
    if (key === 'weapon') {
      if (innerBuildData.weapon?.skills) skills.push(...innerBuildData.weapon.skills)
      return
  }
  if (innerBuildData[key as ArmorType]) {
    const armorData = innerBuildData[key as ArmorType]
    if (!armorData) return
      if (armorData.skills) skills.push(...armorData.skills)
      if (armorData.slots) {
        skills.push(...armorData.slots)
        smeltSkills.push(...armorData.slots)
      }
    }
  })

  return {
    skills: skills.filter((skill) => skill.id && skill.level),
    smeltSkills: computedSkillLevel(smeltSkills.filter((skill) => skill.id && skill.level))
  }
}
// 設置魔物圖片
const setMonsterImage = (weapon: BuildWeaponRow) => {
  return {
    id: weapon.monster,
    name: weapon.monsterName,
    effect: weapon.effect,
    riftborne: weapon.riftborne
  }
}
const openBuildHandler = (buildData: BuildData, mode: 'edit' | 'preview') => {
  if (isStopClicked.value) return
  buildDialog.value = { visible: true, mode, data: buildData }
}
const copyBuildHandler = (buildData: BuildData) => {
  openClickStopHandler()
  const cloneData = cloneDeep(buildData)
  cloneData.key = crypto.randomUUID()
  cloneData.name = cloneData.name + '(複製)'
  buildDataList.value.unshift(cloneData)
}
const deleteDataHandler = (index: number) => {
  openClickStopHandler()
  $messageBox.confirm('', '確定要刪除嗎？', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
  })
    .then(() => {
      if (index === -1) return buildDataList.value = []
      buildDataList.value.splice(index, 1)
    })
    .catch(() => {})
}

watch(() => filterBuild.value.sortMode, (sortMode) => {
  option('disabled', !sortMode)
})
</script>

<template>
  <div class="build-container">
    <ElRow :gutter="8">
      <!-- 標頭 -->
      <ElCol :span="24">
        <div class="build-header">
          <ElButton
            class="build-filter-button"
            :icon="Filter"
            type="info"
            :plain="!filterVisible"
            @click="filterVisible = !filterVisible"
          />
          <ElButton class="w-100" type="primary" @click="addBuildHandler()">新增配裝</ElButton>
          <ElButton v-if="buildDataList.length > 0" type="danger" @click="deleteDataHandler(-1)">全部刪除</ElButton>
          <ElUpload :show-file-list="false" accept=".json" :before-upload="importBuildDataList">
            <ElButton type="success">匯入</ElButton>
          </ElUpload>
          <ElButton v-if="buildDataList.length > 0" type="warning" @click="downloadBuildDataList()">匯出</ElButton>
        </div>
      </ElCol>
      <!-- 篩選器 -->
      <ElCol :span="24">
        <div>
          <ElSpace wrap :spacer="spacer" :size="0">
            <small>技能</small>
            <ElSwitch v-model="filterBuild.showSkill" inactive-text="隱藏" active-text="顯示" :size="componentSize" />
            <ElSwitch v-model="filterBuild.levelMode" inactive-text="標籤" active-text="階級" :size="componentSize" />
          </ElSpace>
        </div>
        <div>
          <ElSpace wrap :spacer="spacer" :size="0">
            <small>操作</small>
            <ElSwitch v-model="filterBuild.editMode" inactive-text="檢視" active-text="編輯" :size="componentSize" />
            <ElSwitch v-model="filterBuild.sortMode" inactive-text="固定" active-text="拖曳" :size="componentSize" />
          </ElSpace>
        </div>
      </ElCol>
      <!-- 篩選器內容 -->
      <ElCol v-show="filterVisible" :span="24">
        <div class="build-filter">
          <ElButton class="w-100" @click="filterBuild.weapons = []; filterBuild.effects = []">清除篩選</ElButton>
          <ElDivider content-position="left">武器</ElDivider>
          <ElCheckboxGroup class="build-filter-container" v-model="filterBuild.weapons">
            <ElCheckboxButton v-for="weapon in weaponsData" :key="weapon.id" :value="weapon.id" size="small">
              <ElImage
                class="filter-image"
                :src="convertFilePath(`@/assets/images/part/${weapon.id}.png`)"
                fit="contain"
              />
            </ElCheckboxButton>
            <ElCheckboxButton v-for="monster in filterMonsters" :key="monster.id" :value="monster.id" size="small">
              <ElImage
                class="filter-image"
                :src="convertFilePath(`@/assets/images/monster/${monster.id}.png`)"
                fit="contain"
              />
            </ElCheckboxButton>
          </ElCheckboxGroup>
          <ElDivider content-position="left">屬性</ElDivider>
          <ElCheckboxGroup class="build-filter-container" v-model="filterBuild.effects">
            <ElCheckboxButton v-for="effect in filterEffects" :key="effect.id" :value="effect.id" size="small">
              <span v-if="effect.id === 'none'">{{ effect.name }}</span>
              <ElImage
                v-else
                class="filter-image"
                :src="convertFilePath(`@/assets/images/eff/${effect.id}.png`)"
                fit="contain"
              />
            </ElCheckboxButton>
          </ElCheckboxGroup>
        </div>
      </ElCol>
    </ElRow>
    <ElRow
      ref="buildRowRef"
      :gutter="8"
    >
      <ElCol
        v-for="(buildData, index) in filteredBuildDataList"
        :key="buildData.key"
        :xs="24" :lg="12" :xl="8"
      >
        <ElCard class="build-card" :class="{ sort: filterBuild.sortMode }">
          <template v-if="buildData.name || buildData.ideal" #header>
            <div class="build-card-header" @click="openBuildHandler(buildData, filterBuild.editMode ? 'edit' : 'preview')">
              <ElSpace :spacer="spacer" :size="0">
                <span v-if="buildData.name">{{ buildData.name }}</span>
                <span v-if="buildData.ideal" class="ideal-value">{{ buildData.ideal }}</span>
              </ElSpace>
            </div>
          </template>
          <template #default>
            <div class="build-card-container" @click="openBuildHandler(buildData, filterBuild.editMode ? 'edit' : 'preview')">
              <div class="build-content">
                <ElSpace class="build-images" :size="6">
                  <div
                    v-for="order in buildOrder"
                    :key="order"
                    class="build-image"
                  >
                    <template v-if="order === 'category'">
                      <ElImage
                        v-if="buildData.category"
                        :src="convertFilePath(`@/assets/images/part/${buildData.category}.png`)"
                        fit="contain"
                      />
                    </template>
                    <template v-else-if="order === 'weapon'">
                      <MonsterImage
                        v-if="buildData.weapon"
                        :monster="setMonsterImage(buildData.weapon)"
                      />
                      <!-- <div
                        v-if="buildData.weapon"
                        :style="{
                          '--monster-image-size': '25px',
                          '--monster-image': `url('${convertFilePath(`@/assets/images/monster/${buildData.weapon.monster}.png`)}')`
                        }"
                        class="monster-image-container"
                      >
                        <ElImage
                          class="monster-image"
                          :class="{ 'riftborne': buildData.weapon.riftborne }"
                          :src="convertFilePath(`@/assets/images/monster/${buildData.weapon.monster}.png`)"
                          fit="contain"
                          :alt="buildData.weapon.monsterName"
                          :title="buildData.weapon.monsterName"
                        />
                        <ElImage
                          v-if="buildData.weapon.effect"
                          class="monster-effect"
                          :src="convertFilePath(`@/assets/images/eff/${buildData.weapon.effect}.png`)"
                          fit="contain"
                        />
                      </div> -->
                    </template>
                    <template v-else>
                      <ElImage
                        v-if="buildData[order]"
                        :src="convertFilePath(`@/assets/images/monster/${buildData[order].monster}.png`)"
                        fit="contain"
                        :alt="buildData[order].monsterName"
                        :title="buildData[order].monsterName"
                      />
                    </template>
                  </div>
                </ElSpace>
                <div v-if="filterBuild.editMode">
                  <ElButton type="warning" size="small" @click="copyBuildHandler(buildData)">複製</ElButton>
                  <!-- <ElButton type="primary" size="small" @click="openBuildHandler(buildData, 'edit')">編輯</ElButton> -->
                  <ElButton type="danger" size="small" @click="deleteDataHandler(index)">刪除</ElButton>
                </div>
              </div>
              <ElSpace :spacer="spacer" :size="0">
                <RaritySelect
                  v-if="buildData.weapon && buildData.weapon.rarity"
                  v-model="buildData.weapon.rarity"
                  :category="buildData.category"
                  disabled
                />
                <ElSpace :size="4" wrap>
                  <ElSpace
                    v-for="smeltSlot in getBuildSkills(buildData).smeltSkills"
                    :key="smeltSlot.id"
                    :size="4"
                  >
                    <i
                      v-for="index in smeltSlot.level"
                      :key="index"
                      :style="{ '--smelt-color': getSmeltCategory(smeltSlot.id) }"
                      class="armor-slot"
                    />
                    <SkillTags :skills="[{ id: smeltSlot.id }]" disabled />
                  </ElSpace>
                </ElSpace>
              </ElSpace>
            </div>
            <template v-if="filterBuild.sortMode">
              <div class="build-drag">
                <ElIcon :size="15">
                  <Sort />
                </ElIcon>
              </div>
            </template>
          </template>
          <template v-if="filterBuild.showSkill" #footer>
            <SkillSummary :skills="getBuildSkills(buildData).skills" />
          </template>
        </ElCard>
      </ElCol>
      <ElCol v-if="filteredBuildDataList.length === 0 && buildDataList.length > 0" :span="24">
        <ElCard align="center" class="no-data-card">
          無符合篩選條件的配裝
        </ElCard>
      </ElCol>
    </ElRow>
    <BuildDialog @update="updateDataHandler" />
  </div>
</template>

<style lang="scss" scoped>
.el-row {
  margin: 4px !important;
}

.el-col {
  padding: 4px;
}

.build-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  .el-button + .el-button {
    margin-left: 0px;
  }

  .build-filter-button {
    padding: 8px;
  }
}

.build-filter {
  padding: 8px;
  width: calc(100% - 16px);
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);

  .el-divider--horizontal {
    margin: 12px 0;
  }
}

.build-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  :deep(.el-checkbox-button__inner) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;
    border: var(--el-border);
    border-radius: var(--el-border-radius-base);
    min-width: 32px;
    height: 32px;
  }

  .filter-image {
    width: 22px;
    height: 22px;
  }
}

.build-card {
  --el-card-padding: 8px;

  :deep(.el-card__header),
  :deep(.el-card__body) {
    cursor: pointer;
  }

  .build-card-header {
    .ideal-value {
      color: var(--el-text-color-placeholder);
    }
  }

  .build-image {
    width: 25px;
    height: 25px;
  }

  .build-card-container {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .build-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .el-button + .el-button {
        margin-left: 4px;
      }

      .el-button--small {
        --el-button-size: 22px;
        padding: 0 6px;
      }
    }
  }

  .armor-slot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: var(--el-border);
    /* fallback：原色 */
    background-color: var(--smelt-color, transparent);
    /* 優先使用 color-mix 將顏色與白色混合以降低飽和度 / 鮮明度（調整 70%/30% 改變效果） */
    background-color: color-mix(in srgb, var(--smelt-color) 70%, white 30%);
    /* 若瀏覽器不支援 color-mix，使用 saturate 作額外退飽和處理（可調整百分比） */
    filter: saturate(60%);
  }

  &.sort {
    position: relative;

    :deep(.el-card__header),
    :deep(.el-card__body),
    :deep(.el-card__footer) {
      padding-left: 30px;
    }

    .build-drag {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 20px;
      height: 100%;
      background-color: var(--el-card-bg-color);
      border-right: var(--el-border);
      cursor: move;
    }
  }
}

.no-data-card {
  color: var(--el-color-warning);
}
</style>