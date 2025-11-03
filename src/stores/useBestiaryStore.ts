import type { Monster } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import dragonOrder from '@/assets/data/dragon-order.json'
import skills from '@/assets/data/skills.json'
import weapons from '@/assets/data/weapons.json'
import { useLoading } from '@/composables'

export const useBestiaryStore = defineStore('bestiaryStore',
  () => {
    const { isLoading, load, unload } = useLoading()

    const monstersData = ref<Monster[]>([])
    const weaponsData = ref(weapons)
    const skillsData = ref(skills)

    // 載入所有龍的資料
    const loadMonsters = async () => {
      // 如果已經有資料（從 localStorage 恢復），就不需要重新載入
      if (monstersData.value.length > 0) {
        console.log('從 localStorage 恢復資料，跳過載入')
        return
      }

      monstersData.value = []
      load()
      try {
        console.log('開始載入龍的資料...')
        // 使用 Vite 的 glob 導入功能
        const modules = import.meta.glob('@/assets/data/monsters/*.json')

        for (const dragonId of dragonOrder) {
          const moduleKey = Object.keys(modules).find(key => key.endsWith(`/${dragonId}.json`))
          if (moduleKey && modules[moduleKey]) {
            try {
              const module = await modules[moduleKey]() as any
              const monsterData = module.default as Monster
              monstersData.value.push(monsterData)
              // console.log(`成功載入 ${dragonId}:`, monsterData.name)
            } catch (error) {
              console.warn(`Failed to load ${dragonId}:`, error)
            }
          } else {
            console.warn(`Module not found for ${dragonId}`)
          }
        }
      } catch (error) {
        console.error('Error loading monsters:', error)
      }
      unload()
    }

    return {
      monstersData,
      weaponsData,
      skillsData,
      isMonsterLoading: isLoading,
      loadMonsters
    }
  },
  {
    persistedState: {
      includePaths: ['monstersData']
    }
  }
)
