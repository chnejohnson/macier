<template>
  <w-menu custom hide-on-menu-click>
    <template #activator="{ on }">
      <w-button class="pa4 text-capitalize" color="grey-light4" text md v-on="on">
        {{ chainName }}
      </w-button>
    </template>
    <w-list
      class="text-capitalize"
      bg-color="grey-dark5"
      color="grey-light4"
      v-model="chainIdSelection"
      :items="networkList"
      item-class="px8"
    >
    </w-list>
  </w-menu>

  <div class="ml2">
    <div v-if="isActivated" class="w-flex align-center">
      <w-tooltip bg-color="black" color="grey-light3">
        <template #activator="{ on }">
          <w-icon v-if="!isMatchedNetwork" v-on="on" class="mr1" color="warning-light1" sm
            >fa fa-exclamation-triangle</w-icon
          >
        </template>
        <p class="pa2">App network doesn't match the network selected in wallet.</p>
      </w-tooltip>
      <p>{{ shortenAddress(address) }}</p>
    </div>
    <w-button v-else round @click="openBoard" class="pa5" bg-color="grey-dark2" color="grey-light4" lg>
      Connect Wallet
    </w-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { useBoard, useEthers, displayChainName, shortenAddress, useWallet, ChainId } from 'vue-dapp'
import useWeb3 from '@/composables/web3'

export default defineComponent({
  components: {},
  setup() {
    const { open: openBoard } = useBoard()
    const { address, balance, chainId, isActivated } = useEthers()
    const { wallet } = useWallet()
    const { appChainId, supportedChainIds, isMatchedNetwork, updateAppChainId } = useWeb3()

    const networkList = supportedChainIds.map((chainId: number) => {
      return {
        label: displayChainName(chainId),
        value: chainId,
      }
    })
    const chainName = computed(() => {
      return appChainId.value ? displayChainName(appChainId.value) : ''
    })

    const chainIdSelection = ref(appChainId.value)
    watch(chainIdSelection, () => {
      updateAppChainId(chainIdSelection.value)
      if (isActivated.value && wallet.connector!.name === 'metaMask' && chainIdSelection.value !== ChainId.Hardhat) {
        wallet.connector!.switchChain(chainIdSelection.value)
      }
    })

    return {
      chainName,
      chainIdSelection,
      networkList,
      address,
      balance,
      chainId,
      isActivated,
      isMatchedNetwork,
      openBoard,
      displayChainName,
      shortenAddress,
    }
  },
})
</script>
