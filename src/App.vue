<template>
  <w-app>
    <header><LayoutHeader /></header>
    <main class="grow my8 mx10">
      <router-view></router-view>
    </main>
    <!-- <div class="text-center ma12">Please connect an Ethereum wallet to proceed.</div> -->
    <footer><LayoutFooter /></footer>
  </w-app>

  <vd-board :connectors="connectors" dark />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import { MetaMaskConnector, WalletConnectConnector, CoinbaseWalletConnector, useEthers } from 'vue-dapp'
import useWeb3 from '@/composables/web3'

export default defineComponent({
  name: 'App',
  components: { LayoutHeader, LayoutFooter },
  setup() {
    const { isActivated } = useEthers()
    const { appChainId, infuraApiKey } = useWeb3()

    const connectors = [
      new MetaMaskConnector({
        appUrl: 'http://localhost:3000',
      }),
      new WalletConnectConnector({
        qrcode: true,
        rpc: {
          1: `https://mainnet.infura.io/v3/${infuraApiKey}`,
          4: `https://rinkeby.infura.io/v3/${infuraApiKey}`,
        },
      }),
      new CoinbaseWalletConnector({
        appName: 'Vue Dapp',
        jsonRpcUrl: `https://mainnet.infura.io/v3/${infuraApiKey}`,
      }),
    ]

    return {
      connectors,
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
