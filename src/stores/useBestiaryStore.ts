import type { Monster, NormalizedMonster, SkillData, WeaponData, SmeltData, BuildData } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import dragonOrder from '@/assets/data/dragon-order.json'
import skills from '@/assets/data/skills.json'
import weapons from '@/assets/data/weapons.json'
import smelt from '@/assets/data/smelt.json'
import { useLoading } from '@/composables'

export const useBestiaryStore = defineStore('bestiaryStore',
  () => {
    const { isLoading, load, unload } = useLoading()

    const weaponsData = ref<WeaponData>(weapons)
    const skillsData = ref<SkillData>(skills)
    const smeltData = ref<SmeltData>(smelt)

    const monstersData = ref<NormalizedMonster[]>([])
    // 配裝彈窗是否顯示/配裝數據列表
    const isBuildDialogVisible = ref(false)
    const buildDataList = ref<BuildData[]>([])

    // 技能視窗ID
    const skillDialogId = ref<string>('')
    const skillDialogLevel = ref<number>()
    // 搜尋關鍵字
    const searchKeyword = ref('')
    // 編輯模式
    const isEditMode = ref(false)
    // 技能模式
    const isSkillMode = ref<'tag' | 'level'>('tag')

    // 載入所有龍的資料
    const loadMonsters = async (modules: Record<string, () => Promise<any>>) => {
      load()
      console.log('開始載入龍的資料...')
      for (const dragonId of dragonOrder) {
        const moduleKey = Object.keys(modules).find(key => key.endsWith(`/${dragonId}.json`))
        if (moduleKey && modules[moduleKey]) {
          try {
            const module = await modules[moduleKey]() as any
            const monsterData = module.default as Monster
            monstersData.value.push(monsterData)
            console.log(`成功載入 ${dragonId}:`, monsterData.name)
          } catch (error) {
            console.warn(`Failed to load ${dragonId}:`, error)
          }
        } else {
          console.warn(`Module not found for ${dragonId}`)
        }
      }
      console.log('載入完成')
      unload()
    }  
    // 標準化數據
    const normalizeMonstersData = () => {
      console.log('開始標準化龍的資料...')
      monstersData.value.forEach((monsterData) => {
        // 處理武器排序
        if (monsterData.weapon) {
          const sortWeapons = weaponsData.value.filter((weapon) => monsterData.weapon && weapon.id in monsterData.weapon)
          monsterData.sortWeapons = sortWeapons
        }
      })
      console.log('標準化完成')
    }
    // 初始化數據
    const initMonstersData = async () => {
      console.log('初始化數據')
      load()
      try {
        console.log('檢查是否有需要載入的資料')
        // 使用 Vite 的 glob 導入功能
        const modules = import.meta.glob('@/assets/data/monsters/*.json')
        const modulesLength = Object.keys(modules).length
        // 如果已經有資料（從 localStorage 恢復），且資料數量等於 modulesLength，就不需要重新載入
        if (monstersData.value.length === modulesLength) {
          console.log('從 localStorage 恢復資料，跳過載入')
          return
        }
        // 否則就載入資料
        if (modulesLength > 0) {
          await loadMonsters(modules)
          normalizeMonstersData()
        }
      } catch (error) {
        console.error('Error loading monsters:', error)
      } finally {
        unload()
      }
    }
    // 刷新數據
    const refreshMonstersData = async () => {
      monstersData.value = []
      await initMonstersData()
    }

    return {
      isLoadingMonsters: isLoading,
      monstersData,
      isBuildDialogVisible,
      isEditMode,
      isSkillMode,
      buildDataList,
      weaponsData,
      skillsData,
      smeltData,
      skillDialogId,
      skillDialogLevel,
      searchKeyword,
      initMonstersData,
      refreshMonstersData
    }
  },
  {
    persistedState: {
      includePaths: ['monstersData', 'buildDataList', 'isSkillMode']
    }
  }
)
