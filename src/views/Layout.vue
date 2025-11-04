<script setup lang="ts">
import { onMounted } from 'vue'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { SkillDescDialog } from '@/components'

const { isLoadingMonsters, skillDialogId } = storeToRefs(useBestiaryStore())
const { initMonstersData, refreshMonstersData } = useBestiaryStore()

onMounted(() => {
  initMonstersData()
})
</script>

<template>
  <div v-loading.fullscreen.lock="isLoadingMonsters" class="layout">
    <router-link style="margin-right: 8px;" to="/">Home</router-link>
    <router-link style="margin-right: 8px;" to="/Monster">Monster</router-link>
    <button @click="refreshMonstersData">Refresh</button>
    <router-view />
    <SkillDescDialog v-model="skillDialogId" />
  </div>
</template>
