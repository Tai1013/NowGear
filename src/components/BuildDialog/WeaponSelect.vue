<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElImage } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { convertFilePath } from '@/helper'
import { SkillTags } from '@/components'

defineOptions({ name: 'WeaponSelect' })

const props = defineProps<{
  category?: string
}>()

const { monstersData } = storeToRefs(useBestiaryStore())

const isDialogVisible = ref(false)

// 武器列表：根據 category 過濾龍並返回對應的技能和屬性
const weaponsList = computed(() => {
  return monstersData.value
    .filter((monster) => {
      if (!monster.weapon) return false

      // category 為空：顯示所有有 weapon.default 技能的龍
      if (!props.category) {
        return monster.weapon.default?.skills && monster.weapon.default.skills.length > 0
      }

      // category 有值：只顯示有該武器的龍
      return props.category in monster.weapon
    })
    .map((monster) => {
      // 決定使用哪個技能和屬性數據
      let skills = []
      let effect = undefined

      if (!props.category) {
        // category 為空：使用 default 技能和屬性
        skills = monster.weapon!.default?.skills || []
        effect = monster.weapon!.default?.effect
      } else {
        // category 有值：優先使用該武器的技能和屬性，否則使用 default
        const categoryWeapon = monster.weapon![props.category]
        if (categoryWeapon?.skills && categoryWeapon.skills.length > 0) {
          skills = categoryWeapon.skills
          effect = categoryWeapon.effect || monster.weapon!.default?.effect
        } else {
          skills = monster.weapon!.default?.skills || []
          effect = monster.weapon!.default?.effect
        }
      }

      return {
        monster: monster.id,  // 參考項目格式：使用 monster id
        skills,
        effect  // 屬性
      }
    })
})
const openDialogHandler = () => {
  isDialogVisible.value = true
}
</script>

<template>
  <div
    class="weapon-select-container"
    @click="openDialogHandler"
  >
    <ElDialog
      v-model="isDialogVisible"
      title="選擇武器"
      width="95%"
      center
      align-center
      append-to-body
      :show-close="false"
      class="build-dialog"
    >
      <ElTable
        :data="weaponsList"
        :show-header="false"
        height="500px"
      >
        <ElTableColumn prop="monster" width="60">
          <template #default="scope">
            <div class="monster-image-container">
              <ElImage
                class="monster-image"
                :src="convertFilePath(`@/assets/images/monster/${scope.row.monster}.png`)"
                fit="contain"
              />
              <ElImage
                v-if="scope.row.effect"
                class="monster-effect"
                :src="convertFilePath(`@/assets/images/eff/${scope.row.effect}.png`)"
                fit="contain"
              />
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="skills">
          <template #default="scope">
            <SkillTags :skills="scope.row.skills" />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.weapon-select-container {
  width: 100%;
  min-height: var(--build-select-height);

  .weapon-select {
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--build-select-height);
  }
}

.monster-image-container {
  position: relative;
  display: inline-flex;

  .monster-image {
    width: var(--build-select-height);
    height: var(--build-select-height);
  }

  .monster-effect {
    position: absolute;
    bottom: 0;
    right: -5px;
    width: calc(var(--build-select-height) / 2);
    height: calc(var(--build-select-height) / 2);
    filter: drop-shadow(0 0 .05em #e6e6e6);
  }
}
</style>