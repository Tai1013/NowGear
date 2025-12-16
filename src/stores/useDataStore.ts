import type { WeaponData, SkillData, SmeltData, EffectData, Monster, NormalizedMonster, MonsterSkill, MonsterWeapon } from '@/types'
import { cloneDeep } from 'radashi'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import dragonOrder from '@/assets/data/dragon-order.json'
import weapons from '@/assets/data/weapons.json'
import skills from '@/assets/data/skills.json'
import smelt from '@/assets/data/smelt.json'
import effects from '@/assets/data/effects.json'
import { useMessage, useLoading } from '@/composables'

interface SelectedWeapon extends MonsterWeapon {
  checked: string
}

export const useDataStore = defineStore('dataStore',
  () => {
    const { $message } = useMessage()
    const { isLoading, load, unload } = useLoading()

    // 最終初始化日期
    const initDate = ref<string>('')
    // 最終上線更新日期
    const updateDate = ref<string>('2025-12-16')

    // 龍的資料
    const monstersData = ref<NormalizedMonster[]>([])
    // 選擇的武器
    const selectedWeapons = ref<Record<string, SelectedWeapon>>({})
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
    // 取得當前技能是哪個分類
    const getSmeltCategory = (id: string) => {
      return Object.keys(smeltData.value).find((smeltId) => {
        return smeltData.value[smeltId].skills.some((skill) => skill.id === id)
      }) || ''
    }
    // 計算技能等級及上限
    const computedSkillLevel = (skills: MonsterSkill[]) => {
      const computedSkills = cloneDeep(skills)
      return computedSkills
        .reduce((acc, skill) => {
          const index = acc.findIndex((item) => item.id === skill.id)
          if (index === -1) acc.push(skill)
          else {
            acc[index].level = acc[index].level || 0
            acc[index].level += skill.level || 0
          }
          return acc
        }, [] as MonsterSkill[])
        .sort((a, b) => b.level! - a.level!) as Required<MonsterSkill>[]
    }
    // 切換武器，並取得選擇武器的資訊
    const changeWeaponHandler = (monsterId: string, weaponId: string) => {
      const monsterWeapon = monstersData.value.find((monster) => monster.id === monsterId)?.weapon
      const defaultEffect = monsterWeapon?.default?.effect
      const defaultSkills = monsterWeapon?.default?.skills || []
      const effect = monsterWeapon?.[weaponId]?.effect || defaultEffect
      const skills = monsterWeapon?.[weaponId]?.skills || defaultSkills
      // 如果選擇的武器相同，則切換回預設武器
      if (selectedWeapons.value[monsterId].checked === weaponId) {
        selectedWeapons.value[monsterId] = { checked: 'default', skills: [] }
        if (defaultEffect) selectedWeapons.value[monsterId].effect = defaultEffect
        if (defaultSkills) selectedWeapons.value[monsterId].skills = defaultSkills
        return
      }
      // 否則設定新的選擇
      selectedWeapons.value[monsterId].checked = weaponId
      if (effect) selectedWeapons.value[monsterId].effect = effect
      if (skills) selectedWeapons.value[monsterId].skills = skills
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
    // 初始化選中的武器
    const initSelectedWeapons = () => {
      if (monstersData.value.length === 0) return
      // 如果 selectedWeapons 的數量等於 monstersData 的數量，就不需要初始化
      if (Object.keys(selectedWeapons.value).length === monstersData.value.length) {
        console.log('selectedWeapons 的數量等於 monstersData 的數量，跳過初始化')
        return
      }
      console.log('開始初始化選中的武器')
      selectedWeapons.value = monstersData.value.reduce((acc, monsterData) => {
        const reduceData: SelectedWeapon = { checked: 'default', skills: [] }
        const defaultEffect = monsterData.weapon?.default?.effect
        const defaultSkills = monsterData.weapon?.default?.skills || []
        if (defaultEffect) reduceData.effect = defaultEffect
        if (defaultSkills) reduceData.skills = defaultSkills
        return {
          ...acc,
          [monsterData.id]: reduceData
        }
      }, {})
      console.log('完成初始化選中的武器')
    }

    return {
      isLoadingMonsters: isLoading,
      initDate,
      monstersData,
      weaponsData,
      skillsData,
      smeltData,
      effectsData,
      selectedWeapons,
      
      getMonsterName,
      getSkillName,
      getSkillDesc,
      getSmeltCategory,
      changeWeaponHandler,
      computedSkillLevel,
      initMonstersData,
      initSelectedWeapons
    }
  },
  {
    persistedState: {
      includePaths: ['initDate', 'monstersData', 'selectedWeapons']
    }
  }
)
