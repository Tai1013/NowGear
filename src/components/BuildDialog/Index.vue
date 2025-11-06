<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElSpace, ElButton, ElImage } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import WeaponSelect from './WeaponSelect.vue'
import ArmorSelect from './ArmorSelect.vue'

defineOptions({ name: 'BuildDialog' })

const { isBuildDialogVisible, buildDialogMode, weaponsData } = storeToRefs(useBestiaryStore())

// 配裝數據
const buildData = ref({
  category: '',
  weapon: null,
  helm: null,
  mail: null,
  gloves: null,
  belt: null,
  greaves: null
})

// 配裝項目: 武器分類、魔物武器、裝備頭、裝備身、裝備手、裝備腰、裝備腳
const buildItems = computed(() => [
  { label: '武器分類', key: 'weapon' },
  { label: '魔物武器', key: currentWeaponCategory.value },
  { label: '裝備頭', key: 'helm' },
  { label: '裝備身', key: 'mail' },
  { label: '裝備手', key: 'gloves' },
  { label: '裝備腰', key: 'belt' },
  { label: '裝備腳', key: 'greaves' }
])
// 當前魔物武器分類
const currentWeaponCategory = computed((): string => {
  if (buildData.value.category) return buildData.value.category
  return 'weapon'
})
// 表格行類別
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  console.log(rowIndex)
  if (rowIndex === 0) return 'weapons-row'
  return ''
}
// 切換武器分類
const changeWeaponCategory = (category: string) => {
  let changeCategory = category
  if (buildData.value.category === category) changeCategory = ''
  buildData.value.category = changeCategory
}


</script>

<template>
  <ElDialog
    v-model="isBuildDialogVisible"
    :title="buildDialogMode === 'add' ? '新增配裝' : '編輯配裝'"
    width="95%"
    center
    append-to-body
    :show-close="false"
    class="build-dialog"
    >
    <!-- fullscreen -->
      <ElTable
        :data="buildItems"
        :show-header="false"
        :row-class-name="tableRowClassName"
      >
        <ElTableColumn #default="scope" width="42">
          <div class="build-item-image">
            <ElImage
              v-if="scope.row.key !== 'monsterWeapon'"
              :src="convertFilePath(`@/assets/images/part/${scope.row.key}.png`)"
              :alt="scope.row.label"
              :title="scope.row.label"
              fit="contain"
            />
          </div>
        </ElTableColumn>
        <ElTableColumn>
          <template #default="scope">
            <div class="build-cell">
              <template v-if="scope.$index === 0">
                <ElSpace wrap :size="6">
                  <ElButton
                    v-for="weapon in weaponsData"
                    :key="weapon.id"
                    :type="buildData.category === weapon.id ? 'primary' : ''"
                    circle
                    @click="changeWeaponCategory(weapon.id)"
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
              </template>
              <template v-else-if="scope.$index === 1">
                <WeaponSelect :category="buildData.category" />
              </template>
              <template v-else>
                <ArmorSelect :armor="scope.row.key" />
              </template>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    <!-- align-center -->
  </ElDialog>
</template>

<style lang="scss">
:root {
  --build-select-height: 30px;
}
.build-dialog {
  max-width: 360px;
}

</style>
<style lang="scss" scoped>
.el-table :deep(.cell) {
  padding: 0 6px;
}
.el-table :deep(.weapons-row) {
  --el-table-tr-bg-color: var(--el-color-primary-light-9)
}

.weapon-image {
  width: 25px;
  height: 25px;
}


.build-item-image {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: var(--build-select-height);
  height: var(--build-select-height);
}

.build-cell {
  // margin-left: -6px;
}
</style>