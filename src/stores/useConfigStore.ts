import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

export const useConfigStore = defineStore('configStore',
  () => {
    const { width } = useWindowSize()

    // 篩選清單
    const filterBuild = ref({
      weapons: [],
      effects: [],
      editMode: false,
      levelMode: false,
    })

    const componentSize = computed(() => width.value < 768 ? 'small' : '')
  
    return {
      componentSize,
      filterBuild
    }
  },
  {
    persistedState: {
      includePaths: ['filterBuild']
    }
  }
)
