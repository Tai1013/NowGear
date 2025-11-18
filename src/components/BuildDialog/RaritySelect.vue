<script setup lang="ts">
defineOptions({ name: 'RaritySelect' })
import type { RarityType, RarityData } from '@/types'
import { cloneDeep } from 'radashi'
import { ref, computed, watch } from 'vue'
import { ElButton, ElDialog, ElTag, ElTable, ElTableColumn, ElImage, ElSpace } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useDataStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'

interface DialogRarityData extends Omit<RarityData, 'level'> {
  level: (RarityType | '')[]
}

const props = defineProps<{
  modelValue: RarityData
  category: string | undefined
  disabled?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'open'])

const { weaponsData } = storeToRefs(useDataStore())

const isDialogVisible = ref(false)
// 待確認選擇風格數據
const dialogData = ref<DialogRarityData>({
  skill: '',
  level: []
})
// 風格列表
const rarityColumn = ref<{ id: RarityType, name: string }[]>([
  { id: 'atk', name: '攻擊力' },
  { id: 'ele', name: '屬性值' },
  { id: 'crit', name: '會心率' }
])
// 內部風格強化數據
const innerRarityData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
// 是否顯示風格按鈕
const isShowButton = computed(() => {
  return innerRarityData.value.level.length === 0 && !innerRarityData.value.skill
})
// 當前武器的風格強化列表
const rarityList = computed(() => {
  return weaponsData.value.find((weapon) => weapon.id === props.category)?.rarity || []
})
// 當前武器的風格等級列表
const rarityLevelList = computed(() => [
  { level: 10 },
  { level: 15 },
  { level: 20 }
])

const openDialogHandler = () => {
  isDialogVisible.value = true
  emit('open')
}
// 取得風格名稱
const getRarityName = (id: string) => {
  return rarityList.value.find((rarity) => rarity.id === id)?.name || ''
}
// 切換風格強化，如果 row 與 modelValue 相同，則清空選擇，否則設定新的選擇
const changeRarityHandler = (id: string) => {
  dialogData.value.skill = dialogData.value.skill === id ? '' : id
}
// 切換風格等級
const changeRarityLevel = (type: RarityType, index: number) => {
  if (dialogData.value.level.length == 0) dialogData.value.level = ['', '', '']
  if (dialogData.value.level[index] === type) {
    dialogData.value.level[index] = ''

    if (index + 1 < dialogData.value.level.length) {
      for (let i = index + 1; i < dialogData.value.level.length; i++) {
        if (dialogData.value.level[i] !== '') dialogData.value.level[i] = ''
      }
    }

  } else {
    dialogData.value.level[index] = type
  }
}
// 更新風格強化數據
const updateRarityHandler = () => {
  const cloneData = cloneDeep(dialogData.value)
  innerRarityData.value = {
    ...cloneData,
    level: cloneData.level.filter((item) => item !== '')
  }
  isDialogVisible.value = false
}

watch(() => isDialogVisible.value, (visible) => {
  if (visible) {
    dialogData.value = cloneDeep(innerRarityData.value)
  }
}, { immediate: true })
</script>

<template>
  <div
    class="rarity-select-container"
    @click="!disabled && openDialogHandler()"
  >
    <template v-if="isShowButton">
      <ElButton
        class="rarity-button"
        color="#626aef"
        size="small"
        :icon="Plus"
        dark
        plain 
      >
        風格強化
      </ElButton>
    </template>
    <template v-else>
      <ElSpace :size="6">
        <ElTag
          v-if="innerRarityData.skill"
          color="#626aef"
          effect="dark"
          size="small"
        >
          {{ getRarityName(innerRarityData.skill) }}
        </ElTag>
        <ElSpace v-if="innerRarityData.level.length > 0" :size="4">
          <ElImage
            v-for="(level, index) in innerRarityData.level"
            :key="index"
            class="rarity-level-image"
            :src="convertFilePath(`@/assets/images/stat/${level}.png`)"
            fit="contain"
            lazy
          />
        </ElSpace>
      </ElSpace>
    </template>
    <ElDialog
      v-model="isDialogVisible"
      title="選擇風格強化"
      width="350px"
      center
      align-center
      append-to-body
      :show-close="false"
      @close="updateRarityHandler"
    >
      <template #default>
        <div class="rarity-select-dialog">
          <div class="rarity-button-container">
            <ElButton
              v-for="(rarity) in rarityList"
              :key="rarity.id"
              color="#626aef"
              dark
              :plain="dialogData.skill !== rarity.id"
              @click="changeRarityHandler(rarity.id)"
            >
              {{ rarity.name }}
            </ElButton>
          </div>
          <ElTable :data="rarityLevelList">
            <ElTableColumn
              v-for="column in rarityColumn"
              :key="column.id"
              #default="scope"
              :label="column.name"
              align="center"
            >
              <ElButton
                color="#626aef"
                dark
                :plain="dialogData.level[scope.$index] !== column.id"
                :disabled="dialogData.level[scope.$index - 1] === ''"
                @click="changeRarityLevel(column.id, scope.$index)"
              >
                <ElImage
                  class="stat-image"
                  :src="convertFilePath(`@/assets/images/stat/${column.id}.png`)"
                  fit="contain"
                  lazy
                />
              </ElButton>
            </ElTableColumn>
          </ElTable>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.el-table :deep(.cell) {
  padding-left: inherit;
}

.rarity-button {
  --el-button-size: 22px;
  padding: 0 4px;
}

.stat-image {
  width: 20px;
  height: 20px;
}

.rarity-level-image {
  margin: 2px 0;
  width: 18px;
  height: 18px;

  :deep(.el-image__inner) {
    filter: drop-shadow(0 0 1px #ae66d3) drop-shadow(0 0 1px #e0baf3);
  }
}

.rarity-select-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .rarity-button-container {
    display: flex;

    .el-button {
      flex: 1;
    }
  }
}
</style>