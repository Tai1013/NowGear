<script setup lang="ts">
import { onMounted } from 'vue'
import { ElInput } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { SkillDescDialog, BuildDialog } from '@/components'

const { isLoadingMonsters, skillDialogId, searchKeyword } = storeToRefs(useBestiaryStore())
const { initMonstersData } = useBestiaryStore()

onMounted(() => {
  initMonstersData()
})
</script>

<template>
  <div v-loading.fullscreen.lock="isLoadingMonsters">
    <header class="layout-header">
      <nav class="nav-links">
        <router-link to="/" class="nav-link">配裝</router-link>
        <router-link to="/monster" class="nav-link">魔物</router-link>
        <router-link to="/smelt" class="nav-link">煉成</router-link>
      </nav>
      <ElInput
        v-model="searchKeyword"
        class="search-input"
        placeholder="搜尋..."
        :prefix-icon="Search"
        clearable
      />
      <!-- <ElButton
        type="primary"
        :icon="Refresh"
        circle
        @click="refreshMonstersData"
      /> -->
    </header>
    <main>
      <router-view />
    </main>
    <SkillDescDialog />
    <BuildDialog />
  </div>
</template>

<style lang="scss" scoped>
.layout-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 8px 15px;
  text-decoration: none;
  color: var(--el-text-color-regular);
  font-size: var(--el-font-size-base);
  font-weight: 500;
  border-radius: var(--el-border-radius-base);
  border: var(--el-border);
  transition: all 0.3s;
  white-space: nowrap;
  line-height: 1;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
  }

  &.router-link-exact-active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
  }
}

.search-input {
  flex: 1;
}
</style>
