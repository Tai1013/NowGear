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
    <header class="layout-header">
      <nav class="nav-links">
        <router-link to="/" class="nav-link">配裝列表</router-link>
        <router-link to="/monster" class="nav-link">魔物列表</router-link>
      </nav>
      <button @click="refreshMonstersData" class="refresh-btn">數據刷新</button>
    </header>
    <main class="layout-content">
      <router-view />
    </main>
    <SkillDescDialog v-model="skillDialogId" />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-links {
  display: flex;
  gap: 16px;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: var(--el-text-color-regular);
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
  }

  &.router-link-active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}

.refresh-btn {
  padding: 8px 16px;
  background-color: var(--el-color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    background-color: var(--el-color-primary-light-3);
  }

  &:active {
    background-color: var(--el-color-primary-dark-2);
  }
}

.layout-content {
  flex: 1;
  padding: 16px;
}
</style>
