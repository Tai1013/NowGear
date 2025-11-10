<script setup lang="ts">
import type { BuildDialogMode, BuildData, MonsterSkill, ArmorType, ArmorSlot } from '@/types'
import { ref } from 'vue'
import { ElRow, ElCol, ElCard, ElButton, ElImage, ElSwitch, ElDivider } from 'element-plus'
import { View, Edit, Delete } from '@element-plus/icons-vue'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { BuildDialog, SkillSummary, SkillTags } from '@/components'

type BuildType = 'weapon' | 'helm' | 'mail' | 'gloves' | 'belt' | 'greaves'

const { isBuildDialogVisible, buildDataList, isEditMode, isSkillMode } = storeToRefs(useBestiaryStore())

// 裝備順序
const buildOrder: BuildType[] = ['weapon', 'helm', 'mail', 'gloves', 'belt', 'greaves']
const buildDialogIndex = ref<number>()

// 取得配裝數據所有技能
const getBuildSkills = (buildData: BuildData) => {
  const skills: MonsterSkill[] = []
  // 額外紀錄煉成的所有技能
  const smeltSkills: ArmorSlot[] = []
  Object.keys(buildData).forEach((key) => {
    if (key === 'category') return
    if (key === 'weapon') {
      if (buildData.weapon?.skills) {
        skills.push(...buildData.weapon.skills)
      }
      return
    }
    if (buildData[key as ArmorType]) {
      const armorSkills = buildData[key as ArmorType]?.skills
      const armorSlots = buildData[key as ArmorType]?.slots
      if (armorSkills) skills.push(...armorSkills)
      if (armorSlots) {
        const slotSkills = armorSlots.map((slot) => ({ id: slot.id, level: 1 }))
        const onlySmeltSkills = armorSlots.map((slot) => ({ id: slot.id, level: 1, smelt: slot.smelt }))
        skills.push(...slotSkills)
        smeltSkills.push(...onlySmeltSkills)
      }
    }
  })

  return {
    skills: skills.filter((slot) => slot.id && slot.level),
    smeltSkills: smeltSkills
      .filter((slot) => slot.id && slot.level && slot.smelt)
      .reduce((acc, slot) => {
        const index = acc.findIndex((item) => item.id === slot.id)
        if (index === -1) {
          acc.push(slot)
        } else {
          if (acc[index].level) acc[index].level += slot.level || 0
        }
        return acc
      }, [] as ArmorSlot[])
  }
}

const openBuildDialogHandler = (number?: number) => {
  isBuildDialogVisible.value = true
  buildDialogIndex.value = number
}
const updateDataHandler = ({ type, data }: { type: BuildDialogMode, data: BuildData }) => {
  if (type === 'add') {
    buildDataList.value.push(data)
  } else {
    if (buildDialogIndex.value !== undefined) {
      buildDataList.value[buildDialogIndex.value] = data
    }
  }
}
const deleteDataHandler = (index: number) => {
  buildDataList.value.splice(index, 1)
}
</script>

<template>
  <div class="build-container">
    <!-- <div class="build-search">
      搜尋區塊
    </div> -->
    <ElRow :gutter="8">
      <ElCol :span="24">
        <div class="build-header">
          <ElButton type="primary" @click="openBuildDialogHandler()">新增配裝</ElButton>
          <div class="build-header-switch">
            <ElSwitch v-model="isSkillMode" inactive-value="tag" active-value="level" inactive-text="標籤" active-text="階級" size="small" />
            <ElDivider direction="vertical" />
            <ElSwitch v-model="isEditMode" inactive-text="檢視" active-text="編輯" size="small" />
          </div>
        </div>
      </ElCol>
      <ElCol
        v-for="(buildData, index) in buildDataList"
        :key="`build-${index}`"
        :xs="24" :lg="12" :xl="8"
      >
        <ElCard class="build-card">
          <template v-if="buildData.name" #header>
            <div>{{ buildData.name }}</div>
          </template>
          <template #default>
            <div class="build-content">
              <div class="build-images">
                <div class="build-image">
                  <ElImage
                    v-if="buildData.category"
                    :src="convertFilePath(`@/assets/images/part/${buildData.category}.png`)"
                    fit="contain"
                  />
                </div>
                <div
                  v-for="key in buildOrder"
                  :key="key"
                  class="build-image"
                >
                  <ElImage
                    v-if="buildData[key]"
                    :src="convertFilePath(`@/assets/images/monster/${buildData[key].monster}.png`)"
                    fit="contain"
                    :alt="buildData[key].monsterName"
                    :title="buildData[key].monsterName"
                  />
                </div>
              </div>
              <div>
                <ElButton v-if="!isEditMode" :icon="View" type="primary" circle size="small" @click="openBuildDialogHandler(index)" />
                <ElButton v-if="isEditMode" :icon="Edit" type="primary" circle size="small" @click="openBuildDialogHandler(index)" />
                <ElButton v-if="isEditMode" :icon="Delete" type="danger" circle size="small" @click="deleteDataHandler(index)" />
              </div>
            </div>
            <div class="smelt-slots">
              <div
                v-for="smeltSlot in getBuildSkills(buildData).smeltSkills"
                :key="smeltSlot.id"
                class="smelt-slot"
              >
                <SkillTags v-if="smeltSlot.id" :skills="[smeltSlot]" no-count />
                <i
                  v-for="levelIndex in smeltSlot.level"
                  :key="levelIndex"
                  :style="{ '--smelt-color': smeltSlot.smelt }" class="armor-slot"
                />
              </div>
            </div>
          </template>
          <template #footer>
            <SkillSummary :skills="getBuildSkills(buildData).skills" :mode="isSkillMode" />
          </template>
        </ElCard>
      </ElCol>
    </ElRow>
    <BuildDialog
      :data="buildDialogIndex !== undefined ? buildDataList[buildDialogIndex] : undefined"
      @update="updateDataHandler"
    />
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

  .build-header-switch {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.build-card {
  --el-card-padding: 8px;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .build-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .el-button + .el-button {
    margin-left: 8px;
  }
}

.build-images {
  display: flex;
  align-items: center;
  gap: 8px;

  .build-image {
    width: 25px;
    height: 25px;
  }
}

.smelt-slots {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  .smelt-slot {
    display: flex;
    align-items: center;
    gap: 4px;
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
</style>