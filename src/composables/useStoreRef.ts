import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { cloneDeep, isEqual } from 'radashi'

export const useStoreRef = <T extends Ref<T['value']>>(storeForm: T) => {
  const stateRef: Ref<T['value']> = ref(cloneDeep(storeForm.value as object))
  const isChanged = computed(() => !isEqual(storeForm.value, stateRef.value))

  const reset = () => {
    storeForm.value = cloneDeep(stateRef.value as object)
  }

  const update = (newForm: T) => {
    stateRef.value = cloneDeep(newForm.value as object)
  }

  return {
    stateRef,
    isChanged,
    reset,
    update
  }
}
