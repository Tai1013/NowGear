<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { ElInput, ElButton, ElMenu, ElMenuItem } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useBestiaryStore, storeToRefs } from '@/stores'
import { SkillDescDialog } from '@/components'

const { isLoadingMonsters, skillDialogId, searchKeyword } = storeToRefs(useBestiaryStore())
const { initMonstersData, refreshMonstersData } = useBestiaryStore()

// 響應式判斷是否為手機版
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  initMonstersData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div v-loading.fullscreen.lock="isLoadingMonsters" class="layout">
    <header class="layout-header">
      <nav class="nav-links">
        <router-link to="/" class="nav-link">配裝列表</router-link>
        <router-link to="/monster" class="nav-link">魔物列表</router-link>
      </nav>
      <div class="header-actions">
        <ElInput
          v-model="searchKeyword"
          placeholder="搜尋..."
          :prefix-icon="Search"
          :size="isMobile ? 'small' : 'default'"
          clearable
          class="search-input"
        />
        <ElButton
          type="primary"
          :size="isMobile ? 'small' : 'default'"
          :icon="Refresh"
          circle
          @click="refreshMonstersData"
        />
      </div>
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
  gap: 16px;
  padding: 12px 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  // 手機版響應式
  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 8px 12px;
    gap: 8px;
  }
}

.header-actions {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;

  // 手機版響應式
  @media (max-width: 768px) {
    width: 100%;
    order: 2;
    gap: 8px;
  }
}

.nav-links {
  display: flex;
  gap: 16px;

  // 手機版響應式
  @media (max-width: 768px) {
    gap: 8px;
    order: 1;
  }
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  height: 32px;
  text-decoration: none;
  color: var(--el-text-color-regular);
  font-size: var(--el-font-size-base);
  font-weight: 500;
  border-radius: var(--el-border-radius-base);
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
  }

  // 手機版響應式 - 匹配 ElButton small size
  @media (max-width: 768px) {
    height: 24px;
    padding: 0 11px;
    font-size: 12px;
  }
}

.search-input {
  flex: 1;
  min-width: 120px;

  // 手機版響應式
  @media (max-width: 768px) {
    min-width: 0;
  }
}

.layout-content {
  flex: 1;
  padding: 16px;
}
</style>
