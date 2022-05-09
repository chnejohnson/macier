<template>
  <w-input v-model="contractAddress" class="ma6" bg-color="grey" label="MACI or Poll address" round outline></w-input>
  <div class="ma6">
    <w-radios v-model="selection" :items="radioItems"> </w-radios>
  </div>

  <div class="w-flex justify-center">
    <w-button @click="searchContract" bg-color="grey" color="blue-grey-light5" xl round>Search</w-button>
  </div>
  <div class="text-center mt6">
    <p>MACI: {{ maciState.maci }}</p>
    <p>Signups: {{ maciState.numSignUps }}</p>
  </div>

  <div v-if="pollState.poll" class="text-center mt6">
    <p>Poll: {{ pollState.poll }}</p>
    <p>Messages: {{ pollState.numMessages }}</p>
    <p>isAfterDeadline: {{ pollState.isAfterDeadline }}</p>
    <p>coordinatorPubKey: {{ pollState.coordinatorPubKey }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from 'vue'
import { ethers } from 'ethers'
import { MACI__factory, AccQueueQuinaryMaci__factory, Poll__factory } from 'qv-contracts/build/typechain'
import { POSEIDON_ADDRESS } from '@/constants/poseidon'
import { ChainId } from 'vue-dapp'
import { PubKey } from 'maci-domainobjs'

export default defineComponent({
  setup() {
    const contractAddress = ref('0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6')
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
    const selection = ref(0)
    const radioItems = ref([
      { label: 'MACI', value: 0 },
      { label: 'Poll', value: 1 },
    ])

    watch(selection, () => {
      if (selection.value === 0) {
        contractAddress.value = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
      } else if (selection.value === 1) {
        contractAddress.value = '0x61c36a8d610163660E21a8b7359e1Cac0C9133e1'
      }
    })

    const linkedLibraryAddresses = {
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5']: POSEIDON_ADDRESS[ChainId.Hardhat].poseidonT5,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3']: POSEIDON_ADDRESS[ChainId.Hardhat].poseidonT3,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6']: POSEIDON_ADDRESS[ChainId.Hardhat].poseidonT6,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4']: POSEIDON_ADDRESS[ChainId.Hardhat].poseidonT4,
    }

    const provider = new ethers.providers.JsonRpcProvider()
    const signer = provider.getSigner()

    const searchContract = async () => {
      console.log(contractAddress.value)
      if (!contractAddress.value) throw new Error('No provided address')

      if (selection.value === 0) {
        let maci
        try {
          maci = new MACI__factory({ ...linkedLibraryAddresses }, signer).attach(contractAddress.value)
        } catch (e) {
          throw new Error('contract not found')
        }
        const stateAqAddress = await maci.stateAq()
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
        let poll
        try {
          poll = new Poll__factory({ ...linkedLibraryAddresses }, signer).attach(contractAddress.value)
        } catch (e) {
          throw new Error('poll contract not found')
        }
        const extContracts = await poll.extContracts()
        const maci = new MACI__factory({ ...linkedLibraryAddresses }, signer).attach(extContracts.maci)
        const stateAqAddress = await maci.stateAq()
        const stateAq = new AccQueueQuinaryMaci__factory({ ...linkedLibraryAddresses }, signer).attach(stateAqAddress)

        maciState.maci = extContracts.maci
        maciState.numSignUps = (await maci.numSignUps()).toString()
        maciState.vkRegistry = await maci.vkRegistry()
        maciState.signUpGatekeeper = await maci.signUpGatekeeper()
        maciState.initialVoiceCreditProxy = await maci.initialVoiceCreditProxy()
        maciState.subTreesMerged = await stateAq.subTreesMerged()
        maciState.treeMerged = await stateAq.treeMerged()

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

    return {
      selection,
      radioItems,
      contractAddress,
      maciState,
      pollState,
      searchContract,
    }
  },
})
</script>

<style scoped></style>
