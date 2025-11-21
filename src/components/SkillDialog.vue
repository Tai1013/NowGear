<script setup lang="ts">
defineOptions({ name: 'SkillDialog' })

import { computed } from 'vue'
import { ElDialog, ElTable, ElTableColumn } from 'element-plus'
import { useOperationStore, useDataStore, storeToRefs } from '@/stores'

const { skillsData } = storeToRefs(useDataStore())
const { skillDialog } = storeToRefs(useOperationStore())
const { resetSkillDialog } = useOperationStore()

const dialogVisible = computed({
  get: () => !!skillDialog.value.id,
  set: () => resetSkillDialog()
})
const skillData = computed(() => {
  const data = skillsData.value[skillDialog.value.id] || { name: '', desc: [] }
  return {
    ...data,
    desc: data.desc.map((desc, index) => ({ level: index + 1, desc }))
  }
})

// 顯示已達到的等級
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  if (skillDialog.value.level && rowIndex <= skillDialog.value.level - 1) return 'active-row'
  return ''
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    class="skill-desc-dialog"
    :title="skillData.name"
    width="85%"
    center
    align-center
    :show-close="false"
  >
    <ElTable
      :data="skillData.desc"
      :show-header="false"
      :row-class-name="tableRowClassName"
    >
      <ElTableColumn prop="level" width="40" align="center" />
      <ElTableColumn prop="desc" />
    </ElTable>
    <ElTable
      v-if="skillData.remark"
      :data="skillData.remark"
      :show-header="false"
      cell-class-name="remark-cell"
    >
      <ElTableColumn width="40" />
      <ElTableColumn prop="remark" #default="{ row }">
        <span>{{ row }}</span>
      </ElTableColumn>
    </ElTable>
  </ElDialog>
</template>

<style lang="scss">
.skill-desc-dialog {
  max-width: 350px;
}
</style>
<style lang="scss" scoped>
:deep(.remark-cell) {
  color: var(--el-color-primary);
}
:deep(.active-row) {
  color: var(--el-color-warning);
}
</style>