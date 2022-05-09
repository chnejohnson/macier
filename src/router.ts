import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomePage from './views/HomePage.vue'
import SignUpPage from './views/SignUpPage.vue'
import VotingPage from './views/VotingPage.vue'

const urlParams = new URLSearchParams(window.location.search)

function updateChainId(chainId: number) {
  urlParams.set('chainId', chainId.toString())
  window.history.replaceState({}, '', `${location.pathname}?${urlParams}`)
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/signUp',
    name: 'SignUpPage',
    component: SignUpPage,
  },
  {
    path: '/vote',
    name: 'VotingPage',
    component: VotingPage,
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('./views/404Page.vue'),
  },
]

const router = createRouter({
  // If app is not hosted at the domain root, make sure to pass the `base` input here: https://next.router.vuejs.org/api/#parameters
  history: createWebHistory(),
  routes,
})

// router.afterEach((to, from) => {
//   const { appChainId, isDev } = useConfig()
//   if (to.query.chainId) {
//     appChainId.value = Number(to.query.chainId)
//   }
//   updateChainId(appChainId.value)
//   if (isDev) console.log('router.beforeEach: updateChainId')
// })

export default router
