<template>
  <w-app>
    <header><LayoutHeader /></header>
    <main class="grow">
      <router-view></router-view>
    </main>
    <footer><LayoutFooter /></footer>
  </w-app>

  <!--  VueDapp  -->
  <vdapp-board />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import useNetwork from './composables/network'
import { useWallet } from 'vue-dapp'

export default defineComponent({
  name: 'App',
  components: { LayoutHeader, LayoutFooter },
  setup() {
    const { isSupportedNetwork, unmatchedNetwork, supportedChainName } = useNetwork()
    const { onAccountsChanged, onChainChanged } = useWallet()

    onAccountsChanged(() => {
      console.log({
        text: 'Account Changed',
        type: 'warn',
      })
    })

    onChainChanged(() => {
      console.log({
        text: 'Chain Changed',
        type: 'warn',
      })
    })

    return { isSupportedNetwork, unmatchedNetwork, supportedChainName }
  },
})
</script>

<style>
.w-app {
  padding: 4px;
  background-color: #42413b;
  color: rgb(216, 213, 213);
}
header,
footer,
main {
  /* border: 1px solid rgba(232, 226, 226, 0.765); */
}
header,
footer {
  min-height: 60px;
}

main {
}
</style>
