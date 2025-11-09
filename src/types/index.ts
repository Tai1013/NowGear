// 武器資料
export interface Weapon {
  id: string
  name: string
}
export type WeaponData = Weapon[]

// 技能資料
export interface Skill {
  name: string
  desc: string[]
  remark?: string[]
}
export type SkillData = Record<string, Skill>

// 練成持有的技能
export interface SmeltSkill {
  id: string
  rarity?: boolean
}
// 練成資料
export interface Smelt {
  name: string
  monsters?: string[]
  skills: SmeltSkill[]
}
export type SmeltData = Record<string, Smelt>

// 魔物持有的技能
export interface MonsterSkill {
  id: string
  level: number
}
// 魔物持有的武器
export interface MonsterWeapon {
  effect?: string
  skills?: MonsterSkill[]
}
// 魔物持有的防具
export interface MonsterArmor {
  slots: number
  skills: MonsterSkill[]
}
// 魔物資料
export interface Monster {
  id: string
  name: string
  riftborne?: boolean
  weapon?: {
    default?: MonsterWeapon
    [key: string]: MonsterWeapon | undefined
  }
  armor?: {
    [key in ArmorType]?: MonsterArmor
  }
}
// 防具部位
export type ArmorType = 'helm' | 'mail' | 'gloves' | 'belt' | 'greaves'
export type ArmorSlot = {
  id: string
  smelt: string
  level?: number
}
// 標準化後的魔物資料
export interface NormalizedMonster extends Monster {
  sortWeapons?: Weapon[]
}

// 配裝彈窗模式
export type BuildDialogMode = 'add' | 'edit'
