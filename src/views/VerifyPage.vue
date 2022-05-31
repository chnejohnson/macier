<template>
  <div class="text-center">
    <p class="title2">Verify Tally Result</p>
    <p class="mt3">Poll: {{ pollState.poll }}</p>
    <p>MACI: {{ pollState.maci }}</p>
  </div>

  <p class="mt4 mb2 text-center title3">PollProcessorAndTallyer Address</p>
  <div class="w-flex justify-center">
    <w-input
      style="max-width: 600px"
      v-model="pptAddress"
      label-color="grey-light3"
      bg-color="grey-dark2"
      color="grey-light3"
      label="PollProcessorAndTallyer Address"
      round
      outline
    ></w-input>
  </div>

  <p class="mt4 text-center title2">Tally Result</p>
  <w-textarea
    v-model="tallyResult"
    no-autogrow
    resizable
    bg-color="grey-dark2"
    label-color="grey-light3"
    color="grey-light3"
    outline
    rows="8"
  >
    > Tally result
  </w-textarea>

  <div v-if="tallyState.provider" class="text-center my6">
    <p>Provider: {{ tallyState.provider }}</p>
    <p>MACI: {{ tallyState.maci }}</p>
    <p>Poll ID: {{ tallyState.pollId }}</p>
    <p>Total Spent Voice Credits: {{ tallyState.totalSpentVoiceCredits }}</p>
  </div>

  <w-table :headers="votingTable.headers" :items="votingTable.items" no-headers style="max-height: 250px">
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
            <div class="ml3 mr3">
              {{ item[header.key] }}
            </div>
          </div>

          <div v-if="i === 2" class="w-flex align-center justify-space-between">
            <div class="w-flex align-center grow">
              <div style="width: 50px">
                {{ item[header.key] }}
              </div>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </w-table>

  <div class="text-center mt6">
    <w-button lg round class="pa5" bg-color="primary-light1" @click="verify">Verify</w-button>
  </div>
  <w-alert v-if="isVerified" success> Verified, gr8! </w-alert>
  <w-alert v-if="isInvalid" error> Invalid tally result </w-alert>

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
import { defineComponent, ref, reactive, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AccQueueQuinaryMaci__factory,
  Poll__factory,
  Poll,
  PollProcessorAndTallyer,
  PollProcessorAndTallyer__factory,
} from 'qv-contracts/build/typechain'
import { ADDRESSES } from '@/constants/addresses'
import { ChainId, useEthers, useWallet } from 'vue-dapp'
import useWeb3 from '@/composables/web3'
import { PubKey } from 'maci-domainobjs'
import { IncrementalQuinTree, hashLeftRight, hash2, hash3, hash5 } from 'maci-crypto'

interface TallyResult {
  provider: string
  maci: string
  pollId: number
  newTallyCommitment: string
  results: {
    tally: string[]
    salt: string
  }
  totalSpentVoiceCredits: {
    spent: string
    salt: string
  }
  perVOSpentVoiceCredits: {
    tally: string[]
    salt: string
  }
}

export default defineComponent({
  components: {},
  setup() {
    const isLoading = ref(false)
    const votingTable = ref({
      headers: [
        { label: 'Option Index', key: 'optionIndex', align: 'center' },
        { label: 'Total Votes', key: 'votes', align: 'center' },
        { label: 'Total Spent Voice Credits', key: 'voiceCredits', align: 'center' },
      ],
      items: [] as { optionIndex: number; votes: any; voiceCredits: any }[],
    })
    const tallyResult = ref('')
    const tallyState = reactive({
      provider: '',
      maci: '',
      pollId: '',
      totalSpentVoiceCredits: '',
    })
    watch(tallyResult, () => {
      let res
      try {
        res = JSON.parse(tallyResult.value)
      } catch (e: any) {
        return
      }
      const votesResult = res.results.tally
      const voiceCreditsResult = res.perVOSpentVoiceCredits.tally
      let items = []
      for (let i = 0; i < votesResult.length; i++) {
        const item = {
          optionIndex: i,
          votes: votesResult[i],
          voiceCredits: voiceCreditsResult[i],
        }
        items.push(item)
      }

      votingTable.value.items = items
      tallyState.provider = res.provider
      tallyState.maci = res.maci
      tallyState.pollId = res.pollId
      tallyState.totalSpentVoiceCredits = res.totalSpentVoiceCredits.spent
    })
    const linkedLibraryAddresses = {
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5']: ADDRESSES[ChainId.Hardhat].poseidonT5,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3']: ADDRESSES[ChainId.Hardhat].poseidonT3,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6']: ADDRESSES[ChainId.Hardhat].poseidonT6,
      ['maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4']: ADDRESSES[ChainId.Hardhat].poseidonT4,
    }

    const { signer: signerRef } = useEthers()
    const { appChainId, getDefaultSigner, supportedChainIds } = useWeb3()

    let signer = getDefaultSigner()

    const { onChainChanged } = useWallet()
    onChainChanged(async () => {
      signer = getDefaultSigner()
      try {
        isLoading.value = true
        await loadPoll()
      } catch (e: any) {
        throw new Error(e)
      } finally {
        isLoading.value = false
      }
    })

    const defaultPpt = ADDRESSES[appChainId.value].ppt
    const pptAddress = ref(defaultPpt)
    watch(appChainId, async () => {
      pptAddress.value = ADDRESSES[appChainId.value].ppt
      try {
        isLoading.value = true
        await loadPoll()
      } catch (e: any) {
        throw new Error(e)
      } finally {
        isLoading.value = false
      }
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
    watch(pollState, () => {
      if (pollState.poll) {
        dialog.value.pollAddress = false
      }
    })
    const dialog = ref({
      pollAddress: false,
    })
    const pollAddress = ref('0x61c36a8d610163660E21a8b7359e1Cac0C9133e1')
    const route = useRoute()
    const router = useRouter()
    const pollAddr = route.params.pollAddress as string
    const network = route.params.network

    watch(appChainId, () => {
      signer = getDefaultSigner()
    })

    onMounted(async () => {
      // check network route param
      if (supportedChainIds.includes(Number(network))) {
        // @ts-ignore
        appChainId.value = Number(network)
        signer = getDefaultSigner()
      }
      if (!pollAddr) {
        dialog.value.pollAddress = true
      } else {
        pollAddress.value = pollAddr
        isLoading.value = true
        try {
          await loadPoll()
        } catch (e: any) {
          throw new Error(e)
        } finally {
          isLoading.value = false
        }
      }
    })

    async function loadPoll() {
      // @ts-ignore
      const poll = new Poll__factory({ ...linkedLibraryAddresses }, signer).attach(pollAddress.value)

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
      router.push({ path: `/verify/${pollAddress.value}` })
    }

    const isVerified = ref(false)
    const isInvalid = ref(false)
    const verify = async () => {
      isVerified.value = false
      isInvalid.value = false
      let poll
      try {
        // @ts-ignore
        poll = new Poll__factory({ ...linkedLibraryAddresses }, signer).attach(pollAddress.value)
      } catch (e) {
        throw new Error('poll contract not found')
      }
      if (!pptAddress.value) {
        throw new Error('ppt address not found')
      }
      // @ts-ignore
      const ppt = new PollProcessorAndTallyer__factory(signer).attach(pptAddress.value)
      const tally: TallyResult = JSON.parse(tallyResult.value) as TallyResult
      const _isVerified = await verifyTallyResult(tally, poll, ppt)
      if (_isVerified) {
        isVerified.value = true
      } else {
        isInvalid.value = true
      }
    }

    const genTallyResultCommitment = (results: BigInt[], salt: BigInt, depth: number): BigInt => {
      const tree = new IncrementalQuinTree(depth, BigInt(0), 5, hash5)
      for (const result of results) {
        tree.insert(result)
      }
      return hashLeftRight(tree.root, salt)
    }

    const verifyTallyResult = async (tallyResult: any, poll: Poll, ppt: PollProcessorAndTallyer): Promise<boolean> => {
      const onChainTallyCommitment = await (await ppt.tallyCommitment()).toBigInt()

      // Check the results commitment
      const validResultsCommitment =
        tallyResult.newTallyCommitment && tallyResult.newTallyCommitment.match(/0x[a-fA-F0-9]+/)

      if (!validResultsCommitment) {
        console.error('Error: Invalid results commitment format')
        return false
      }

      // Ensure that the lengths of tallyResult.results.tally and tallyResult.perVOSpentVoiceCredits.tally are correct
      const treeDepths = await poll.treeDepths()
      const voteOptionTreeDepth = Number(treeDepths.voteOptionTreeDepth)
      const numVoteOptions = 5 ** voteOptionTreeDepth
      if (tallyResult.results.tally.length !== numVoteOptions) {
        console.error('Error: wrong number of vote options')
        return false
      }
      if (tallyResult.perVOSpentVoiceCredits.tally.length !== numVoteOptions) {
        console.error('Error: wrong number of vote options')
        return false
      }

      // Compute newResultsCommitment
      const newResultsCommitment = genTallyResultCommitment(
        tallyResult.results.tally.map((x: any) => BigInt(x)),
        BigInt(tallyResult.results.salt),
        voteOptionTreeDepth,
      )

      // Compute newSpentVoiceCreditsCommitment
      const newSpentVoiceCreditsCommitment = hash2([
        BigInt(tallyResult.totalSpentVoiceCredits.spent),
        BigInt(tallyResult.totalSpentVoiceCredits.salt),
      ])

      // Compute newPerVOSpentVoiceCreditsCommitment
      const newPerVOSpentVoiceCreditsCommitment = genTallyResultCommitment(
        tallyResult.perVOSpentVoiceCredits.tally.map((x: any) => BigInt(x)),
        BigInt(tallyResult.perVOSpentVoiceCredits.salt),
        voteOptionTreeDepth,
      )

      // Compute newTallyCommitment
      const newTallyCommitment = hash3([
        newResultsCommitment,
        newSpentVoiceCreditsCommitment,
        newPerVOSpentVoiceCreditsCommitment,
      ])

      if (onChainTallyCommitment !== newTallyCommitment) {
        console.error('Error: the on-chain tally commitment does not match')
        return false
      }

      return true
    }

    return {
      isLoading,
      tallyResult,
      tallyState,
      pollState,
      pptAddress,
      dialog,
      pollAddress,
      votingTable,
      isVerified,
      isInvalid,
      loadPoll,
      verify,
    }
  },
})
</script>

<style scoped></style>
