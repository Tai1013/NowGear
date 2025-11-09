<script setup lang="ts">
import { computed } from 'vue'
import { ElDialog, ElTable, ElTableColumn } from 'element-plus'
import { useBestiaryStore, storeToRefs } from '@/stores'

defineOptions({ name: 'SkillDescDialog' })
// const props = defineProps<{
//   modelValue: string
// }>()
const emit = defineEmits(['update:modelValue'])

const { skillDialogId, skillDialogLevel, skillsData } = storeToRefs(useBestiaryStore())

const visible = computed({
  get: () => !!skillDialogId.value,
  set: () => {
    skillDialogId.value = ''
    skillDialogLevel.value = undefined
  }
})
const currentSkill = computed(() => {
  if (!skillDialogId.value) return undefined
  const skill = skillsData.value[skillDialogId.value]
  return skill
})
const skillDescList = computed(() => {
  if (!currentSkill.value) return []
  return currentSkill.value.desc.map((desc, index) => ({ index: index + 1, desc }))
})
const skillRemarkList = computed(() => {
  if (!currentSkill.value || !currentSkill.value.remark) return []
  return currentSkill.value.remark.map((remark, index) => ({ index: index + 1, remark }))
})
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  console.log(rowIndex)
  if (skillDialogLevel.value && rowIndex <= skillDialogLevel.value - 1) return 'active-row'
  return ''
}
</script>

<template>
  <ElDialog
    v-if="currentSkill"
    v-model="visible"
    :title="currentSkill.name"
    width="85%"
    center
    align-center
    append-to-body
    :show-close="false"
    class="skill-desc-dialog"
  >
    <ElTable
      :data="skillDescList"
      :show-header="false"
      :row-class-name="tableRowClassName"
    >
      <ElTableColumn prop="index" width="40" align="center" />
      <ElTableColumn prop="desc" />
    </ElTable>
    <ElTable
      v-if="skillRemarkList.length"
      :data="skillRemarkList"
      :show-header="false"
      cell-class-name="remark-cell"
    >
      <ElTableColumn width="40" />
      <ElTableColumn prop="remark" />
    </ElTable>
  </ElDialog>
</template>

<style lang="scss">
.skill-desc-dialog {
  max-width: 450px;
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