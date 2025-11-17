import type { WeaponData, SkillData, SmeltData, EffectData, Monster, NormalizedMonster } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import dragonOrder from '@/assets/data/dragon-order.json'
import weapons from '@/assets/data/weapons.json'
import skills from '@/assets/data/skills.json'
import smelt from '@/assets/data/smelt.json'
import effects from '@/assets/data/effects.json'
import { useMessage, useLoading } from '@/composables'

export const useDataStore = defineStore('dataStore',
  () => {
    const { $message } = useMessage()
    const { isLoading, load, unload } = useLoading()

    // 最終初始化日期
    const initDate = ref<string>('')
    // 最終上線更新日期
    const updateDate = ref<string>('2025-11-18')

    // 龍的資料
    const monstersData = ref<NormalizedMonster[]>([])
    // 武器資料
    const weaponsData = ref<WeaponData>(weapons)
    // 技能資料
    const skillsData = ref<SkillData>(skills)
    // 練成資料
    const smeltData = ref<SmeltData>(smelt)
    // 屬性資料
    const effectsData = ref<EffectData>(effects)

    // 取得龍的名字
    const getMonsterName = (id: string) => {
      return monstersData.value.find((monster) => monster.id === id)?.name || ''
    }
    // 取得技能的名稱
    const getSkillName = (id: string) => {
      return skillsData.value[id].name || ''
    }
    // 取得技能的描述
    const getSkillDesc = (id: string) => {
      return skillsData.value[id].desc || []
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
    // 載入所有龍的資料
    const loadMonsters = async (modules: Record<string, () => Promise<any>>) => {
      console.log('開始載入龍的資料...')
      load()
      // 重置 monstersData
      monstersData.value = []
      // 使用 dragonOrder 來控制載入順序
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
      unload()
    }
    // 初始化數據
    const initMonstersData = async () => {
      console.log('準備初始化數據')
      load()
      try {
        console.log('檢查是否有需要載入的資料')
        const isVersionSame = initDate.value === updateDate.value
        const modules = import.meta.glob('@/assets/data/monsters/*.json')
        const modulesLength = Object.keys(modules).length
        console.log('Version:', initDate.value, updateDate.value)
        // 如果版本相同，已經有資料（從 localStorage 恢復）且資料數量等於 modulesLength，就不需要重新載入
        if (isVersionSame && monstersData.value.length === modulesLength) {
          console.log('版本相同，且資料數量等於 modulesLength，跳過載入')
          return
        }
        // 否則就載入資料
        if (modulesLength > 0) {
          await loadMonsters(modules)
          normalizeMonstersData()
          initDate.value = updateDate.value
        }
      } catch (error) {
        $message.error('初始化數據失敗')
      } finally {
        unload()
      }
    }

    return {
      isLoadingMonsters: isLoading,
      initDate,
      monstersData,
      weaponsData,
      skillsData,
      smeltData,
      effectsData,

      getMonsterName,
      getSkillName,
      getSkillDesc,
      initMonstersData
    }
  },
  {
    persistedState: {
      includePaths: ['initDate', 'monstersData']
    }
  }
)
