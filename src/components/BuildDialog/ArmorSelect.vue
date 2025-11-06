<script setup lang="ts">
import type { MonsterArmor } from '@/types'
import { ref, computed } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElImage } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'

defineOptions({ name: 'ArmorSelect' })

const props = defineProps<{
  armor: 'helm' | 'mail' | 'gloves' | 'belt' | 'greaves'  // 防具部位
}>()

const { monstersData } = storeToRefs(useBestiaryStore())

const isDialogVisible = ref(false)

// 防具列表：根據 armor 過濾龍並返回對應的防具部位
const armorsList = computed(() => {
  return monstersData.value
    .filter((monster) => {
      // 確保魔物有防具數據
      if (!monster.armor) return false

      // 檢查是否有指定的防具部位
      const armorData = monster.armor as Record<string, MonsterArmor | undefined>
      return props.armor in armorData && armorData[props.armor] !== undefined
    })
    .map((monster) => {
      // 取得指定部位的防具數據
      const armorData = monster.armor as Record<string, MonsterArmor | undefined>
      const armorPiece = armorData[props.armor]

      return {
        monster: monster.id,  // 龍 ID
        skills: armorPiece?.skills || [],  // 技能陣列
        slots: armorPiece?.slots || 0  // 插槽數量
      }
    })
})

const openDialogHandler = () => {
  isDialogVisible.value = true
}
</script>

<template>
  <div
    class="armor-select-container"
    @click="openDialogHandler"
  >
    <ElDialog
      v-model="isDialogVisible"
      title="選擇防具"
      width="95%"
      center
      align-center
      append-to-body
      :show-close="false"
      class="build-dialog"
    >
      <ElTable
        :data="armorsList"
        :show-header="false"
        height="500px"
      >
        <ElTableColumn prop="monster" width="60">
          <template #default="scope">
            <ElImage
              class="monster-image"
              :src="convertFilePath(`@/assets/images/monster/${scope.row.monster}.png`)"
              fit="contain"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="skills">
          <template #default="scope">
            <SkillTags :skills="scope.row.skills" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="slots" width="60" align="right">
          <!-- <template #default="scope">
            {{ scope.row.slots }}
          </template> -->
        </ElTableColumn>
      </ElTable>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.armor-select-container {
  width: 100%;
  min-height: var(--build-select-height);

  .armor-select {
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--build-select-height);
  }
}

.monster-image {
  width: var(--build-select-height);
  height: var(--build-select-height);
}
</style>