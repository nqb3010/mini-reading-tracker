import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/SearchView.vue'),
    },
    {
      path: '/shelf',
      component: () => import('../views/ShelfView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
