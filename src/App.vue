<template>
  <w-app>
    <header><LayoutHeader /></header>
    <main v-if="appChainId === 31337 || isActivated" class="grow my8 mx10">
      <router-view></router-view>
    </main>
    <div v-else class="text-center ma12">Please connect an Ethereum wallet to proceed.</div>
    <footer><LayoutFooter /></footer>
  </w-app>

  <!--  VueDapp  -->
  <vdapp-board />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import { useEthers } from 'vue-dapp'
import useWeb3 from '@/composables/web3'

export default defineComponent({
  name: 'App',
  components: { LayoutHeader, LayoutFooter },
  setup() {
    const { isActivated } = useEthers()
    const { appChainId } = useWeb3()

    return {
      appChainId,
      isActivated,
    }
  },
})
</script>

<style>
.w-app {
  padding: 4px;
  background-color: #383838;
  color: #adadad;
}

a {
  color: rgb(223, 219, 219);
}

a:hover {
  color: rgb(198, 194, 194);
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
