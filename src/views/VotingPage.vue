<template>
  <div>
    <p>voting</p>
    <w-button @click="publish">publish</w-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Command, Keypair, PrivKey } from 'maci-domainobjs'
import { useBoard, useEthers } from 'vue-dapp'

export default defineComponent({
  components: {},
  setup() {
    const tabs = [
      { title: 'Tab 1', content: 'Tab 1 content.' },
      { title: 'Tab 2', content: 'Tab 2 content.' },
      { title: 'Tab 3', content: 'Tab 3 content.' },
    ]
    const { open } = useBoard()
    const { address } = useEthers()

    const coordinatorPrivKey = 'macisk.232d0cc27d0ebb93aa81cad1ca38198559c692d40e17b7620e17a36c0ec780c0'
    const userPrivKey = 'macisk.2c4b2cf6277e3dd8c94ac7acd73b7393646f1e922468aa9d03837e055b5741b1'
    const stateIndex = 1

    const publish = () => {
      console.log('publish')
      const coordinator = new Keypair(PrivKey.unserialize(coordinatorPrivKey))
      const userKeypair = new Keypair(PrivKey.unserialize(userPrivKey))

      const _stateIndex = BigInt(stateIndex)
      const _newPubKey = userKeypair.pubKey
      const _voteOptionIndex = BigInt(1)
      const _newVoteWeight = BigInt(3)
      const _nonce = BigInt(1)
      const _pollId = BigInt(0)
      const _salt = BigInt(1)
      const command = new Command(_stateIndex, _newPubKey, _voteOptionIndex, _newVoteWeight, _nonce, _pollId, _salt)

      const signature = command.sign(userKeypair.privKey)
      const sharedKey = Keypair.genEcdhSharedKey(userKeypair.privKey, coordinator.pubKey)
      const message = command.encrypt(signature, sharedKey)
      const _message = message.asContractParam()
      const _encPubKey = userKeypair.pubKey.asContractParam()
      console.log(_message, _encPubKey)
    }

    return { publish, open, address, tabs }
  },
})
</script>

<style scoped></style>
