import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomePage from './views/HomePage.vue'
import VotingPage from './views/VotingPage.vue'
import VerifyPage from './views/VerifyPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/vote',
    name: 'VotingPage',
    component: VotingPage,
  },
  {
    path: '/vote/:pollAddress',
    name: 'VotingPageWithAddress',
    component: VotingPage,
  },
  {
    path: '/verify',
    name: 'VerifyPage',
    component: VerifyPage,
  },
  {
    path: '/verify/:pollAddress',
    name: 'VerifyPageWithAddress',
    component: VerifyPage,
  },
  {
    path: '/verify/:pollAddress/:network',
    name: 'VerifyPageWithAddressAndNetwork',
    component: VerifyPage,
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404Page',
    component: () => import('./views/404Page.vue'),
  },
]

const router = createRouter({
  // If app is not hosted at the domain root, make sure to pass the `base` input here: https://next.router.vuejs.org/api/#parameters
  history: createWebHistory('/macier/'), // https://stackoverflow.com/a/70766347
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
