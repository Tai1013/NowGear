<script setup lang="ts">
import type { BuildDialogMode, BuildData, MonsterSkill, ArmorType } from '@/types'
import { ref } from 'vue'
import { ElRow, ElCol, ElCard, ElButton, ElImage, ElSwitch, ElDivider } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { BuildDialog, SkillSummary } from '@/components'

type BuildType = 'weapon' | 'helm' | 'mail' | 'gloves' | 'belt' | 'greaves'

const { isBuildDialogVisible, buildDataList, isEditMode, isSkillMode } = storeToRefs(useBestiaryStore())

// 裝備順序
const buildOrder: BuildType[] = ['weapon', 'helm', 'mail', 'gloves', 'belt', 'greaves']
const buildDialogIndex = ref<number>()

// 取得配裝數據所有技能
const getBuildSkills = (buildData: BuildData) => {
  const skills: MonsterSkill[] = []
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
      if (armorSlots) skills.push(...armorSlots.map((slot) => ({ id: slot.id, level: 1 })))
    }
  })
  return skills.filter((slot) => slot.id && slot.level)
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
    <div class="build-search">
      搜尋區塊
    </div>
    <ElRow :gutter="8">
      <ElCol :span="24">
        <div class="build-header">
          <ElButton type="primary" @click="openBuildDialogHandler()">新增配裝</ElButton>
          <div class="build-header-switch">
            <ElSwitch v-model="isSkillMode" inactive-value="tag" active-value="level" inactive-text="標籤" active-text="階級" size="small" />
            <ElDivider direction="vertical" />
            <ElSwitch v-model="isEditMode" inactive-text="觀看" active-text="編輯" size="small" />
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
            <div v-if="isEditMode">
              <ElButton :icon="Edit" type="primary" circle size="small" @click="openBuildDialogHandler(index)" />
              <ElButton :icon="Delete" type="danger" circle size="small" @click="deleteDataHandler(index)" />
            </div>
          </template>
          <template #footer>
            <SkillSummary :skills="getBuildSkills(buildData)" :mode="isSkillMode" />
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
</style>