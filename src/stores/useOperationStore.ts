import type { MonsterSkill, BuildData } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStoreRef } from '@/composables'

type BuildDialog = {
  visible: boolean
  mode: 'add' | 'edit' | 'preview'
  data?: BuildData
}

export const useOperationStore = defineStore('operationStore',
  () => {
    // 模糊查詢關鍵字
    const searchKeyword = ref('')
    // 技能視窗
    const skillDialog = ref<MonsterSkill>({ id: '', level: 0 })
    // 配裝視窗
    const buildDialog = ref<BuildDialog>({
      visible: false,
      mode: 'add',
      data: undefined
    })

    const { reset: resetSkillDialog } = useStoreRef(skillDialog)

    return {
      searchKeyword,
      skillDialog,
      buildDialog,

      resetSkillDialog
    }
  },
  {
    persistedState: {
      includePaths: []
    }
  }
)
