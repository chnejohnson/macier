<template>
  <w-input
    v-model="contractAddress"
    label-color="grey-light3"
    bg-color="grey-dark2"
    color="grey-light3"
    label="MACI or Poll address"
    round
    outline
  ></w-input>

  <div class="mt3">
    <w-radios color="grey-light3" label-color="grey-light3" v-model="selection" :items="radioItems"> </w-radios>
  </div>

  <div class="w-flex justify-center">
    <w-button @click="searchBtn" bg-color="grey-dark2" class="pa5" round lg> Search </w-button>
  </div>

  <div v-if="maciState.maci" class="text-center mt6">
    <p class="title2 mb2">MACI</p>
    <p>{{ shortenAddress(maciState.maci) }}</p>
    <p>Signups: {{ maciState.numSignUps }}</p>
    <w-button bg-color="primary-light1" class="mt3 pa4"> Sign Up </w-button>
  </div>

  <div v-if="pollState.poll" class="text-center mt6">
    <p class="title2 mb2">Poll</p>
    <p>{{ shortenAddress(pollState.poll) }}</p>
    <p>Messages: {{ pollState.numMessages }}</p>
    <w-button
      v-if="!pollState.isAfterDeadline"
      :route="`/vote/${pollState.poll}`"
      bg-color="primary-light1"
      class="mt3 pa4"
    >
      Vote
    </w-button>
    <w-button
      v-if="pollState.isAfterDeadline"
      :route="`/verify/${pollState.poll}`"
      bg-color="primary-light1"
      class="mt3 pa4"
    >
      Verify
    </w-button>
  </div>

  <w-overlay v-model="isLoading" :opacity="0.3">
    <w-spinner color="grey-light4" v-model="isLoading" />
  </w-overlay>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from 'vue'
import { MACI__factory, AccQueueQuinaryMaci__factory, Poll__factory } from 'qv-contracts/build/typechain'
import { ADDRESSES } from '@/constants/addresses'
import { ChainId, shortenAddress, useEthers, useWallet } from 'vue-dapp'
import { PubKey } from 'maci-domainobjs'
import useWeb3 from '@/composables/web3'
import { ethers, Signer } from 'ethers'

export default defineComponent({
  setup() {
    const { signer: signerRef } = useEthers()
    const { onChainChanged } = useWallet()
    const { appChainId } = useWeb3()

    let signer: Signer | null
    if (appChainId.value === 31337) {
      const provider = new ethers.providers.JsonRpcProvider()
      signer = provider.getSigner()
    } else {
      signer = signerRef.value
    }

    const defaultPoll = ADDRESSES[appChainId.value].poll
    const contractAddress = ref(defaultPoll)

    onChainChanged(() => {
      signer = signerRef.value
    })

    watch(appChainId, () => {
      contractAddress.value = ADDRESSES[appChainId.value].poll
    })

    const maciState = reactive({
      maci: '',
      numSignUps: '',
      vkRegistry: '',
      signUpGatekeeper: '',
      initialVoiceCreditProxy: '',
      subTreesMerged: false,
      treeMerged: false,
    })
    const pollState = reactive({
      poll: '',
      maci: '',
      numMessages: '',
      messageAq: '',
      isAfterDeadline: false,
      coordinatorPubKey: '',
      subTreesMerged: false,
      treeMerged: false,
    })
    const selection = ref(1)
    const radioItems = ref([
      { label: 'MACI', value: 0 },
      { label: 'Poll', value: 1 },
    ])

    const linkedLibraryAddresses = {
      // @ts-ignore
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5']: ADDRESSES[appChainId.value].poseidonT5,
      // @ts-ignore
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3']: ADDRESSES[appChainId.value].poseidonT3,
      // @ts-ignore
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6']: ADDRESSES[appChainId.value].poseidonT6,
      // @ts-ignore
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4']: ADDRESSES[appChainId.value].poseidonT4,
    }

    const isLoading = ref(false)
    const searchContract = async () => {
      isLoading.value = true
      console.log('contract:', contractAddress.value)
      if (!contractAddress.value) {
        throw new Error('address not found')
      }

      if (selection.value === 0) {
        // @ts-ignore
        const maci = new MACI__factory({ ...linkedLibraryAddresses }, signer).attach(contractAddress.value)

        const stateAqAddress = await maci.stateAq()

        // @ts-ignore
        const stateAq = new AccQueueQuinaryMaci__factory({ ...linkedLibraryAddresses }, signer).attach(stateAqAddress)

        maciState.maci = contractAddress.value
        maciState.numSignUps = (await maci.numSignUps()).toString()
        maciState.vkRegistry = await maci.vkRegistry()
        maciState.signUpGatekeeper = await maci.signUpGatekeeper()
        maciState.initialVoiceCreditProxy = await maci.initialVoiceCreditProxy()
        maciState.subTreesMerged = await stateAq.subTreesMerged()
        maciState.treeMerged = await stateAq.treeMerged()

        console.log('maciState', maciState)
      } else if (selection.value === 1) {
        // @ts-ignore
        const poll = new Poll__factory({ ...linkedLibraryAddresses }, signer).attach(contractAddress.value)

        const extContracts = await poll.extContracts()

        // @ts-ignore
        const maci = new MACI__factory({ ...linkedLibraryAddresses }, signer).attach(extContracts.maci)
        const stateAqAddress = await maci.stateAq()

        // @ts-ignore
        const stateAq = new AccQueueQuinaryMaci__factory({ ...linkedLibraryAddresses }, signer).attach(stateAqAddress)

        maciState.maci = extContracts.maci
        maciState.numSignUps = (await maci.numSignUps()).toString()
        maciState.vkRegistry = await maci.vkRegistry()
        maciState.signUpGatekeeper = await maci.signUpGatekeeper()
        maciState.initialVoiceCreditProxy = await maci.initialVoiceCreditProxy()
        maciState.subTreesMerged = await stateAq.subTreesMerged()
        maciState.treeMerged = await stateAq.treeMerged()
        // @ts-ignore

        const messageAq = new AccQueueQuinaryMaci__factory({ ...linkedLibraryAddresses }, signer).attach(
          extContracts.messageAq,
        )

        pollState.poll = contractAddress.value
        pollState.maci = extContracts.maci
        pollState.numMessages = (await poll.numSignUpsAndMessages()).map(x => x.toString())[1]
        pollState.isAfterDeadline = await poll.isAfterDeadline()
        const pubKeyOnChain = await poll.coordinatorPubKey()
        const coordinatorPubKey = new PubKey([pubKeyOnChain[0].toBigInt(), pubKeyOnChain[1].toBigInt()])
        pollState.coordinatorPubKey = coordinatorPubKey.serialize()
        pollState.messageAq = extContracts.messageAq
        pollState.subTreesMerged = await messageAq.subTreesMerged()
        pollState.treeMerged = await messageAq.treeMerged()

        console.log('pollState', pollState)
      }
    }

    const searchBtn = async () => {
      isLoading.value = true
      try {
        await searchContract()
      } catch (e: any) {
        throw new Error(e)
      } finally {
        isLoading.value = false
      }
    }

    const shortenKey = (key: string) => {
      return key.slice(0, 12) + '...' + key.slice(-3)
    }

    return {
      selection,
      radioItems,
      contractAddress,
      maciState,
      pollState,
      isLoading,
      searchBtn,
      shortenKey,
      shortenAddress,
    }
  },
})
</script>

<style scoped></style>
