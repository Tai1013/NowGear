// 武器資料
export interface Weapon {
  id: string
  name: string
  rarity?: {
    id: string
    name: string
  }[]
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
  skills: SmeltSkill[]
  monsters?: string[]
}
export type SmeltData = Record<string, Smelt>

// 屬性
export type EffectType = 'blast' | 'dragon' | 'fire' | 'ice' | 'paralysis' | 'poison' | 'riftborne' | 'sleep' | 'thunder' | 'water'
export interface Effect {
  id: string
  name: string
}
export type EffectData = Effect[]

// 防具部位
export type ArmorType = 'helm' | 'mail' | 'gloves' | 'belt' | 'greaves'
// 魔物持有的技能
export interface MonsterSkill {
  id: string
  level?: number
}
// 魔物持有的武器
export interface MonsterWeapon {
  skills: MonsterSkill[]
  effect?: EffectType
}
// 魔物持有的防具
export interface MonsterArmor {
  skills: MonsterSkill[]
  slots: number
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
// 標準化後的魔物資料
export interface NormalizedMonster extends Monster {
  sortWeapons?: Weapon[]
}

// 配裝資料
export interface BuildData extends Partial<Record<ArmorType, BuildArmorRow>> {
  key: string
  name: string
  category: string
  weapon?: BuildWeaponRow
}
// 風格強化 rarity
export type RarityType = 'atk' | 'ele' | 'crit'
export interface RarityData {
  skill: string
  level: RarityType[]
}
// 配裝武器
export type BuildWeaponRow = {
  monster: string
  monsterName: string
  effect: string
  skills: MonsterSkill[],
  riftborne?: boolean
  rarity?: RarityData
}
// 配裝數據
export type BuildArmorRow = {
  monster: string
  monsterName: string
  skills: MonsterSkill[]
  slots: MonsterSkill[]
}
