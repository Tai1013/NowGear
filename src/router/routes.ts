import { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/views/Login.vue') },
  {
    path: '/', name: 'layout', component: () => import('@/views/Layout.vue'),
  //   meta: { requiresAuth: true },
    children: [
      { path: '/', name: 'build', component: () => import('@/views/Build.vue') },
      { path: '/monster', name: 'monster', component: () => import('@/views/Monster.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]
