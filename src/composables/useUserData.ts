// import { ref, computed } from 'vue'
import { useBestiaryStore, storeToRefs } from '@/stores'

export const useUserData = () => {
  const { buildDataList } = storeToRefs(useBestiaryStore())

  // 把 buildDataList 的資料轉成 JSON 檔並觸發下載
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

  // 匯入資料
  const importBuildDataList = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const data = JSON.parse(event.target?.result as string)  
      buildDataList.value = data
    }
    reader.readAsText(file)

    return false // ❗ 阻止 ElUpload 自動上傳
  }


  return {
    downloadBuildDataList,
    importBuildDataList
  }
}
