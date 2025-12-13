import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'
import { useOperationStore, storeToRefs } from '@/stores'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_APP_BASE),
  routes
})

router.beforeEach(async () => {
  const { searchKeyword } = storeToRefs(useOperationStore())
  searchKeyword.value = ''
})

export default router
