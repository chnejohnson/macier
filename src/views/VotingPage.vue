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

  <w-table :headers="votingTable.headers" :items="votingTable.items" no-headers>
    <template #item="{ item, index }">
      <th v-for="(header, i) in votingTable.headers" :key="i">
        <div v-if="index === 1" class="text-bold text-left title4 pa2">
          {{ header.label }}
        </div>
      </th>

      <tr>
        <td class="pa4" v-for="(header, i) in votingTable.headers" :key="i">
          <div v-if="i === 0">
            {{ item[header.key] }}
          </div>

          <div v-if="i === 1" class="w-flex">
            <!-- fewer button -->
            <w-button @click="fewerVotes(item.optionIndex)" bg-color="grey-dark3">-</w-button>
            <div class="ml3 mr3">
              {{ item[header.key] }}
            </div>
            <!-- more button -->
            <w-button @click="moreVotes(item.optionIndex)" bg-color="grey-dark3">+</w-button>
          </div>

          <div v-if="i === 2" class="w-flex align-center justify-space-between">
            <div class="w-flex align-center grow">
              <div style="width: 50px">
                {{ item[header.key] }}
              </div>
              <div class="grow">
                <w-slider
                  @update:model-value="updateSpentVC(item.optionIndex)"
                  v-model="item.ratio"
                  color="primary-light3"
                >
                </w-slider>
              </div>
            </div>

            <div class="ml6" style="width: 50px">
              <p>{{ Math.floor(item.ratio) }} %</p>
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
    <w-button lg round class="pa5" bg-color="primary-light1" @click="publish">Publish</w-button>
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

  <w-overlay v-model="isLoading" :opacity="0.3">
    <w-spinner color="grey-light4" v-model="isLoading" />
  </w-overlay>
</template>

<script lang="ts">
import { computed, defineComponent, ref, reactive, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ethers, Signer } from 'ethers'
import {
  MACI__factory,
  AccQueueQuinaryMaci__factory,
  Poll__factory,
  InitialVoiceCreditProxy__factory,
} from 'qv-contracts/build/typechain'
import { ADDRESSES } from '@/constants/addresses'
import { PubKey } from 'maci-domainobjs'
import { useEthers } from 'vue-dapp'
import useWeb3 from '@/composables/web3'

export default defineComponent({
  components: {},
  setup() {
    const isLoading = ref(false)
    const { address, signer: signerRef } = useEthers()
    const { appChainId, getDefaultSigner } = useWeb3()

    let signer = getDefaultSigner()

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
    const pollAddress = ref('')
    const getVoiceCreditsAddress = ref('')
    const route = useRoute()
    const router = useRouter()
    const pollAddr = route.params.pollAddress as string

    watch(appChainId, async () => {
      pollAddress.value = ADDRESSES[appChainId.value].ppt
      isLoading.value = true
      try {
        await loadPoll()
      } catch (e: any) {
        throw new Error(e)
      } finally {
        isLoading.value = false
      }
    })

    onMounted(async () => {
      if (!pollAddr) {
        dialog.value.pollAddress = true
      } else {
        pollAddress.value = pollAddr
        isLoading.value = true
        await loadPoll()
        isLoading.value = false
      }

      try {
        isLoading.value = true
        const addr = await signer.getAddress()
        getVoiceCreditsAddress.value = addr
        await getVoiceCredits()
      } catch (e: any) {
        throw new Error(e)
      } finally {
        isLoading.value = false
      }
    })

    watch(getVoiceCreditsAddress, async () => {
      try {
        isLoading.value = true
        await getVoiceCredits()
      } catch (e: any) {
        throw new Error(e)
      } finally {
        isLoading.value = false
      }
    })

    const getVoiceCredits = async () => {
      // TODO: trim string
      if (!getVoiceCreditsAddress.value) {
        voiceCreditBalance.value = 0
        throw new Error('address not found')
      }
      let maci
      // @ts-ignore
      maci = new MACI__factory({ ...linkedLibraryAddresses }, signer).attach(pollState.maci)
      // @ts-ignore
      const initialVCProxy = InitialVoiceCreditProxy__factory.connect(await maci.initialVoiceCreditProxy(), signer)
      const vcBalance = (await initialVCProxy.getVoiceCredits(getVoiceCreditsAddress.value, [])).toString()
      voiceCreditBalance.value = Number(vcBalance)
    }

    async function loadPoll() {
      let poll
      try {
        // @ts-ignore
        poll = new Poll__factory({ ...linkedLibraryAddresses }, signer).attach(pollAddress.value)
      } catch (e) {
        throw new Error('poll contract not found')
      }
      const extContracts = await poll.extContracts()

      // @ts-ignore
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
    const voiceCreditBalance = ref(99)
    const totalSpentVC = computed(() => {
      return votingTable.value.items.reduce((prev, cur) => {
        return prev + cur.voiceCredits
      }, 0)
    })

    watch(voiceCreditBalance, () => {
      updateAllRatio()
    })

    const updateAllRatio = () => {
      const items = votingTable.value.items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        item.ratio = Math.floor((item.voiceCredits / voiceCreditBalance.value) * 100)
      }
    }

    const votingTable = ref({
      headers: [
        { label: 'Option Index', key: 'optionIndex' },
        { label: 'Votes', key: 'votes' },
        { label: 'Spent Voice Credits', key: 'voiceCredits' },
      ],
      items: [
        { optionIndex: 0, votes: 0, voiceCredits: 0, ratio: 0 },
        { optionIndex: 1, votes: 0, voiceCredits: 0, ratio: 0 },
        { optionIndex: 2, votes: 0, voiceCredits: 0, ratio: 0 },
        { optionIndex: 3, votes: 0, voiceCredits: 0, ratio: 0 },
        { optionIndex: 4, votes: 0, voiceCredits: 0, ratio: 0 },
        { optionIndex: 5, votes: 0, voiceCredits: 0, ratio: 0 },
        { optionIndex: 6, votes: 0, voiceCredits: 0, ratio: 0 },
      ],
    })

    const moreVotes = (optionIndex: number) => {
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
      updateVotes(optionIndex, newVotes, newSpentVC)
    }

    const fewerVotes = (optionIndex: number) => {
      const curVotes = votingTable.value.items[optionIndex].votes
      if (curVotes === 0) {
        return
      }
      const newVotes = curVotes - 1
      const newSpentVC = newVotes ** 2

      updateVotes(optionIndex, newVotes, newSpentVC)
    }

    const updateSpentVC = async (optionIndex: number) => {
      const oldRatio = Math.floor(votingTable.value.items[optionIndex].ratio)
      await nextTick()
      const ratio = Math.floor(votingTable.value.items[optionIndex].ratio)
      const roughVC = Math.floor((voiceCreditBalance.value * ratio) / 100)
      const newVotes = Math.floor(Math.sqrt(roughVC))
      const newSpentVC = newVotes ** 2
      const newTotalSpentVC = votingTable.value.items.reduce((prev, cur) => {
        if (cur.optionIndex === optionIndex) return prev + newSpentVC
        return prev + cur.voiceCredits
      }, 0)
      if (newTotalSpentVC > voiceCreditBalance.value) {
        const maxRoughVC = voiceCreditBalance.value - (newTotalSpentVC - newSpentVC)
        if (maxRoughVC <= 0) {
          votingTable.value.items[optionIndex].ratio = oldRatio
          return
        }
        const maxVotes = Math.floor(Math.sqrt(maxRoughVC))
        const maxSpentVC = maxVotes ** 2

        updateVotes(optionIndex, maxVotes, maxSpentVC)
        return
      }
      updateVotes(optionIndex, newVotes, newSpentVC)
    }

    const updateVotes = (optionIndex: number, votes: number, spentVC: number) => {
      votingTable.value.items[optionIndex].votes = votes
      votingTable.value.items[optionIndex].voiceCredits = spentVC
      votingTable.value.items[optionIndex].ratio = Math.floor((spentVC / voiceCreditBalance.value) * 100)
    }

    const publish = () => {
      console.log('publish')
    }

    return {
      isLoading,
      dialog,
      pollAddress,
      getVoiceCreditsAddress,
      userPrivKey,
      votingTable,
      voiceCreditBalance,
      totalSpentVC,
      pollState,
      publish,
      moreVotes,
      fewerVotes,
      loadPoll,
      updateSpentVC,
    }
  },
})
</script>

<style scoped></style>
