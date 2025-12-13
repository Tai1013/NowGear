<script setup lang="ts">
import { computed } from 'vue'
import { ElImage } from 'element-plus'
import { convertFilePath } from '@/helper'

type MonsterData = {
  id: string
  name: string
  effect?: string
  riftborne?: boolean
}

defineOptions({ name: 'MonsterImage' })
const props = defineProps<{
  monster: MonsterData
  size?: number
}>()

const monsterImageSize = computed(() => {
  return props.size || 25
})

const monsterImagePath = computed(() => {
  return convertFilePath(`@/assets/images/monster/${props.monster.id}.png`)
})
</script>

<template>
  <div
    :style="{
      '--monster-image-size': monsterImageSize + 'px',
      '--monster-image': `url('${monsterImagePath}')`
    }"
    class="monster-image-container"
  >
    <ElImage
      class="monster-image"
      :class="{ 'riftborne': monster.riftborne }"
      :src="monsterImagePath"
      :alt="monster.name"
      :title="monster.name"
      fit="contain"
    />
    <ElImage
      v-if="monster.effect"
      class="monster-effect"
      :src="convertFilePath(`@/assets/images/eff/${monster.effect}.png`)"
      fit="contain"
    />
  </div>
</template>

<style lang="scss" scoped>
.monster-image-container {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.monster-image {
  width: var(--monster-image-size);
  height: var(--monster-image-size);

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
  width: calc(var(--monster-image-size) / 2);
  height: calc(var(--monster-image-size) / 2);
  filter: drop-shadow(0 0 .05em #e6e6e6);
}
</style>
