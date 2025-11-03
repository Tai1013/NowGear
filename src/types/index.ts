export interface MonsterSkill {
  id: SkillType
  level: number
}
export interface MonsterWeapon {
  effect?: string
  skills?: MonsterSkill[]
}
export interface MonsterArmor {
  slots: number
  skills: MonsterSkill[]
}
export interface Monster {
  id: string
  name: string
  riftborne?: boolean
  weapon?: {
    default?: MonsterWeapon
    [key: string]: MonsterWeapon | undefined
  }
  armor?: {
    helm?: MonsterArmor
    mail?: MonsterArmor
    gloves?: MonsterArmor
    belt?: MonsterArmor
    greaves?: MonsterArmor
  }
}
export interface NormalizedMonster extends Monster {
  sortWeapons?: Weapon[]
}
export type SkillType = keyof typeof import('@/assets/data/skills.json') 
interface Skill {
  name: string
  desc?: string[]
  remark?: string[]
}
export interface SkillDetail extends Skill {
  maxLevel?: number
}
export interface Weapon {
  id: string
  name: string
}
