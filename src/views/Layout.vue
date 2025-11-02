<script setup lang="ts">
import { onMounted } from 'vue'
import { useBestiaryStore } from '@/stores'

const { loadMonsters } = useBestiaryStore()

onMounted(() => {
  loadMonsters()
})
</script>

<template>
  <div class="layout">
    Layout
    <router-view />
  </div>
</template>
