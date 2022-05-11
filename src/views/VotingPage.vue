<template>
  <div class="mb6">
    <p class="text-center">MACI: {{ pollState.maci }}</p>
    <p class="text-center">Poll: {{ pollState.poll }}</p>
  </div>

  <div class="my4">
    <div class="w-flex justify-center">
      <w-input
        style="max-width: 600px"
        v-model="getVoiceCreditsAddress"
        label-color="grey-light3"
        bg-color="grey-dark2"
        color="grey-light3"
        label="ethereum address for getting voice credit balance"
        round
        outline
      ></w-input>
    </div>
    <div class="mt3 w-flex justify-center align-center title2">
      <div>Voice credit balance: {{ totalSpentVC }}/</div>
      <div>
        <w-input
          class="ml1 title2"
          type="number"
          style="max-width: 100px"
          min="0"
          v-model="voiceCreditBalance"
          label-color="grey-light3"
          bg-color="grey-dark2"
          color="grey-light3"
          label=""
          round
          outline
        ></w-input>
      </div>
    </div>
  </div>

  <w-table :headers="votingTable.headers" :items="votingTable.items">
    <template #item="{ item }">
      <tr>
        <td class="pa4" v-for="(header, i) in votingTable.headers" :key="i">
          <div v-if="i === 0">
            {{ item[header.key] }}
          </div>

          <div v-if="i === 1" class="w-flex">
            <!-- fewer button -->
            <w-button @click="fewerBtn(item.optionIndex)" bg-color="grey-dark3">-</w-button>
            <div class="ml3 mr3">
              {{ item[header.key] }}
            </div>
            <!-- more button -->
            <w-button @click="moreBtn(item.optionIndex)" bg-color="grey-dark3">+</w-button>
          </div>

          <div v-if="i === 2" class="w-flex">
            <div>
              {{ item[header.key] }}
            </div>
            <div class="spacer"></div>

            <div class="">
              {{
                (item[header.key] / voiceCreditBalance) * 100
                  ? ((item[header.key] / voiceCreditBalance) * 100).toFixed(2)
                  : 0
              }}
              %
            </div>
          </div>
        </td>
      </tr>
    </template>
  </w-table>

  <p class="mt12 mb4 text-center title2">Your MACI Private Key</p>
  <div class="w-flex justify-center">
    <w-input
      style="max-width: 600px"
      v-model="userPrivKey"
      label-color="grey-light3"
      bg-color="grey-dark2"
      color="grey-light3"
      label="MACI Private Key"
      round
      outline
    ></w-input>
  </div>
  <div class="text-center mt6">
    <w-button lg round class="pa6" bg-color="grey" @click="publish">Publish</w-button>
  </div>

  <w-dialog
    v-model="dialog.pollAddress"
    title-class="title2"
    bg-color="grey-dark2"
    title="Poll contract address"
    persistent
    :width="500"
  >
    <div class="w-flex justify-center">
      <w-input
        style="max-width: 600px"
        v-model="pollAddress"
        label-color="grey-light3"
        bg-color="grey-dark2"
        color="grey-light3"
        label="Poll address"
        round
        outline
      ></w-input>
    </div>

    <div class="text-center mt4">
      <w-button lg round class="pa4" bg-color="grey" @click="loadPoll">Load</w-button>
    </div>
  </w-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ethers } from 'ethers'
import {
  MACI__factory,
  AccQueueQuinaryMaci__factory,
  Poll__factory,
  InitialVoiceCreditProxy__factory,
} from 'qv-contracts/build/typechain'
import { POSEIDON_ADDRESS } from '@/constants/poseidon'
import { ChainId } from 'vue-dapp'
import { PubKey } from 'maci-domainobjs'

export default defineComponent({
  components: {},
  setup() {
    const linkedLibraryAddresses = {
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5']: POSEIDON_ADDRESS[ChainId.Hardhat].poseidonT5,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3']: POSEIDON_ADDRESS[ChainId.Hardhat].poseidonT3,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6']: POSEIDON_ADDRESS[ChainId.Hardhat].poseidonT6,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4']: POSEIDON_ADDRESS[ChainId.Hardhat].poseidonT4,
    }

    const provider = new ethers.providers.JsonRpcProvider()
    const signer = provider.getSigner()

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
    watch(pollState, () => {
      if (pollState.poll) {
        dialog.value.pollAddress = false
      }
    })
    const dialog = ref({
      pollAddress: false,
    })
    const pollAddress = ref('0x61c36a8d610163660E21a8b7359e1Cac0C9133e1')
    const getVoiceCreditsAddress = ref('')
    const route = useRoute()
    const router = useRouter()
    const pollAddr = route.params.pollAddress as string
    if (!pollAddr) {
      dialog.value.pollAddress = true
    } else {
      pollAddress.value = pollAddr
      loadPoll()
    }

    watch(getVoiceCreditsAddress, async () => {
      if (!getVoiceCreditsAddress.value) {
        voiceCreditBalance.value = 0
        return
      }
      let maci
      try {
        maci = new MACI__factory({ ...linkedLibraryAddresses }, signer).attach(pollState.maci)
      } catch (e) {
        throw new Error('contract not found')
      }

      const initialVCProxy = InitialVoiceCreditProxy__factory.connect(await maci.initialVoiceCreditProxy(), signer)

      const vcBalance = (await initialVCProxy.getVoiceCredits(getVoiceCreditsAddress.value, [])).toString()
      voiceCreditBalance.value = Number(vcBalance)
    })

    async function loadPoll() {
      let poll
      try {
        poll = new Poll__factory({ ...linkedLibraryAddresses }, signer).attach(pollAddress.value)
      } catch (e) {
        throw new Error('poll contract not found')
      }
      const extContracts = await poll.extContracts()

      const messageAq = new AccQueueQuinaryMaci__factory({ ...linkedLibraryAddresses }, signer).attach(
        extContracts.messageAq,
      )

      pollState.poll = pollAddress.value
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
      router.push({ path: `/vote/${pollAddress.value}` })
    }

    const userPrivKey = ref('')
    const voiceCreditBalance = ref(0)
    const totalSpentVC = computed(() => {
      return votingTable.value.items.reduce((prev, cur) => {
        return prev + cur.voiceCredits
      }, 0)
    })
    const votingTable = ref({
      headers: [
        { label: 'Option Index', key: 'optionIndex' },
        { label: 'Votes', key: 'votes' },
        { label: 'Voice Credits', key: 'voiceCredits' },
      ],
      items: [
        { optionIndex: 0, votes: 0, voiceCredits: 0 },
        { optionIndex: 1, votes: 0, voiceCredits: 0 },
        { optionIndex: 2, votes: 0, voiceCredits: 0 },
        { optionIndex: 3, votes: 0, voiceCredits: 0 },
        { optionIndex: 4, votes: 0, voiceCredits: 0 },
        { optionIndex: 5, votes: 0, voiceCredits: 0 },
        { optionIndex: 6, votes: 0, voiceCredits: 0 },
      ],
    })

    const moreBtn = (optionIndex: number) => {
      const curVotes = votingTable.value.items[optionIndex].votes
      const newVotes = curVotes + 1
      const newSpentVC = newVotes ** 2
      const newTotalSpentVC = votingTable.value.items.reduce((prev, cur) => {
        if (cur.optionIndex === optionIndex) return prev + newSpentVC
        return prev + cur.voiceCredits
      }, 0)
      if (newTotalSpentVC > voiceCreditBalance.value) {
        return
      }
      votingTable.value.items[optionIndex].votes = newVotes
      votingTable.value.items[optionIndex].voiceCredits = newSpentVC
    }

    const fewerBtn = (optionIndex: number) => {
      const curVotes = votingTable.value.items[optionIndex].votes
      if (curVotes === 0) {
        return
      }
      const newVotes = curVotes - 1
      const newSpentVC = newVotes ** 2

      votingTable.value.items[optionIndex].votes = newVotes
      votingTable.value.items[optionIndex].voiceCredits = newSpentVC
    }

    const publish = () => {
      console.log('publish')
    }

    return {
      dialog,
      pollAddress,
      getVoiceCreditsAddress,
      userPrivKey,
      votingTable,
      voiceCreditBalance,
      totalSpentVC,
      pollState,
      publish,
      moreBtn,
      fewerBtn,
      loadPoll,
    }
  },
})
</script>

<style scoped></style>
