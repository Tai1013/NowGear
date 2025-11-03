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
    <router-link to="/">Home</router-link>
    <router-link to="/Monster">Monster</router-link>
    <router-view />
  </div>
</template>
