import type { MonsterSkill, BuildData } from '@/types'
import { cloneDeep } from 'radashi'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStoreRef, useMessage } from '@/composables'

type BuildDialog = {
  visible: boolean
  mode: 'add' | 'edit' | 'preview'
  data?: BuildData
}

export const useOperationStore = defineStore('operationStore',
  () => {
    const { $messageBox } = useMessage()

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
    // 配裝數據
    const buildDataList = ref<BuildData[]>([])

    // 匯出配裝數據
    const downloadBuildDataList = () => {
      const dataStr = JSON.stringify(buildDataList.value)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const downloadElement = document.createElement('a')
      downloadElement.setAttribute('href', dataUri)
      downloadElement.setAttribute('download', 'build-data-list.json')
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement)
    }
    // 匯入配裝數據
    const importBuildDataList = (file: File) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const data = JSON.parse(event.target?.result as string)  
        $messageBox.confirm('', '是否匯入配裝？', {
          confirmButtonText: '新增',
          cancelButtonText: '取消',
          center: true
        })
          .then(() => {
            const cloneData = cloneDeep(buildDataList.value)
            buildDataList.value = [...data, ...cloneData]
          })
          .catch(() => {})
      }
      reader.readAsText(file)

      return false // ❗ 阻止 ElUpload 自動上傳
    }
    const { reset: resetSkillDialog } = useStoreRef(skillDialog)

    return {
      searchKeyword,
      skillDialog,
      buildDialog,
      buildDataList,
      downloadBuildDataList,
      importBuildDataList,
      resetSkillDialog
    }
  },
  {
    persistedState: {
      includePaths: ['buildDataList']
    }
  }
)
