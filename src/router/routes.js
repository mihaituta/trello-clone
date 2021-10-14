const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    meta: {requiresAuth: true},
    children: [
      {name: 'home', path: '/', component: () => import('pages/Index')},
      {name: 'board', path: '/board/:slug', component: () => import('pages/BoardPage')},
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/notAuth'),
    children: [
      {name: 'auth', path: '/auth', component: () => import('pages/Auth')},
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
