<script setup lang="ts">
import type { BuildDialogMode, BuildData } from '@/types'
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { BuildDialog } from '@/components'

const { isBuildDialogVisible, buildDataList } = storeToRefs(useBestiaryStore())

const buildDialogIndex = ref<number>()

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
    配裝區
    <div>
      <ElButton @click="openBuildDialogHandler()">測試打開</ElButton>
      <div>
        <div
          v-for="(buildData, index) in buildDataList"
          :key="index"
        >
          <ElButton @click="openBuildDialogHandler(index)">
            配裝{{ index + 1 }}
          </ElButton>
          <ElButton @click="deleteDataHandler(index)">
            刪除
          </ElButton>
        </div>
      </div>
    </div>
    <BuildDialog
      :data="buildDialogIndex !== undefined ? buildDataList[buildDialogIndex] : undefined"
      @update="updateDataHandler"
    />
  </div>
</template>
