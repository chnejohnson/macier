<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  <button @click="publish">publish</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import { Command, Keypair, PrivKey } from "maci-domainobjs";

export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
  },
  setup() {
    const coordinatorPrivKey =
      "macisk.232d0cc27d0ebb93aa81cad1ca38198559c692d40e17b7620e17a36c0ec780c0";
    const userPrivKey =
      "macisk.2c4b2cf6277e3dd8c94ac7acd73b7393646f1e922468aa9d03837e055b5741b1";
    const stateIndex = 1;

    const publish = () => {
      console.log("publish");
      const coordinator = new Keypair(PrivKey.unserialize(coordinatorPrivKey));
      const userKeypair = new Keypair(PrivKey.unserialize(userPrivKey));

      const _stateIndex = BigInt(stateIndex);
      const _newPubKey = userKeypair.pubKey;
      const _voteOptionIndex = BigInt(1);
      const _newVoteWeight = BigInt(3);
      const _nonce = BigInt(1);
      const _pollId = BigInt(0);
      const _salt = BigInt(1);
      const command = new Command(
        _stateIndex,
        _newPubKey,
        _voteOptionIndex,
        _newVoteWeight,
        _nonce,
        _pollId,
        _salt
      );

      const signature = command.sign(userKeypair.privKey);
      const sharedKey = Keypair.genEcdhSharedKey(
        userKeypair.privKey,
        coordinator.pubKey
      );
      const message = command.encrypt(signature, sharedKey);
      const _message = message.asContractParam();
      const _encPubKey = userKeypair.pubKey.asContractParam();
      console.log(_message, _encPubKey);
    };

    return { publish };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
