<script setup lang="ts">
import { useDataStore, storeToRefs } from '@/stores'

const { isLoadingMonsters } = storeToRefs(useDataStore())
</script>

<template>
  <div v-loading.fullscreen.lock="isLoadingMonsters">
    <router-view />
  </div>
</template>
