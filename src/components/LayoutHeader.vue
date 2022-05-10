<template>
  <w-toolbar bg-color="transparent">
    <div class="title1">MACIER</div>
    <KeyForVoting />
    <div class="spacer"></div>

    <!-- todo: network depends on Metamask -->
    <w-menu custom hide-on-menu-click>
      <template #activator="{ on }">
        <w-button bg-color="grey-dark2" class="pa4" md round v-on="on">
          {{ !isSupportedNetwork ? 'unsupported network' : unmatchedNetwork ? 'unmatched network' : chainName }}
        </w-button>
      </template>
      <w-list bg-color="grey-dark2" v-model="itemSelection" :items="listItems" item-class="px8"> </w-list>
    </w-menu>

    <div class="ml3">
      <div v-if="isActivated">
        {{ shortenAddress(address) }}
      </div>
      <w-button v-else @click="openBoard" class="pa5" bg-color="grey-dark2" lg> Connect Wallet </w-button>
    </div>
  </w-toolbar>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import KeyForVoting from '@/components/KeyForVoting.vue'
import { useBoard, useEthers, displayChainName, shortenAddress } from 'vue-dapp'
import useNetwork from '@/composables/network'

export default defineComponent({
  components: {
    KeyForVoting,
  },
  setup() {
    const { open: openBoard } = useBoard()
    const { address, balance, chainId, isActivated } = useEthers()
    const { appChainId, supportedChainIds, changeAppChainId, isSupportedNetwork, unmatchedNetwork } = useNetwork()

    const chainName = computed(() => {
      return appChainId.value ? displayChainName(appChainId.value) : ''
    })
    const itemSelection = ref(appChainId.value)

    const showMenu = ref(false)
    const listItems = supportedChainIds.map((chainId: number) => {
      return {
        label: displayChainName(chainId),
        value: chainId,
      }
    })

    return {
      showMenu,
      chainName,
      itemSelection,
      listItems,
      address,
      balance,
      chainId,
      isActivated,
      isSupportedNetwork,
      unmatchedNetwork,
      openBoard,
      changeAppChainId,
      displayChainName,
      shortenAddress,
    }
  },
})
</script>

<style scoped></style>
