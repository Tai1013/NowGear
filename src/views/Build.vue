<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'

const { isBuildDialogVisible } = storeToRefs(useBestiaryStore())
</script>

<template>
  <div class="build-container">
    配裝區
    <div>
      <ElButton @click="isBuildDialogVisible = true">測試打開</ElButton>
    </div>
  </div>
</template>
