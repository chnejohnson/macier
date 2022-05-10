<template>
  <w-button @click="dialogShow = true" text lg color="grey-light4" class="ml2 pa5">Key for voting</w-button>
  <w-dialog v-model="dialogShow" :width="500" title-class="title2" bg-color="grey-dark2">
    <template #title> Key for voting </template>

    <template #default>
      <p>
        MACI keypair is used to sign up and submit votes. Never disclose this key. Anyone with your MACI private key can
        change your key and submit the votes she wants.
      </p>
      <div class="text-center">
        <w-button @click="generateKeypair" class="my4 pa4" bg-color="grey-dark" lg>Generate MACI Keypair</w-button>
      </div>

      <div v-if="keypair.pubKey && keypair.privKey" class="text-center">
        <p class="title3">New Public Key:</p>
        <div class="w-flex justify-center">
          <w-tooltip right>
            <template #activator="{ on }">
              <w-button bg-color="transparent" text @click="copy(keypair.pubKey)" v-on="on">
                {{ shortenKey(keypair.pubKey) }}
              </w-button>
            </template>
            copy
          </w-tooltip>
        </div>

        <p class="title3 mt3">New Private Key:</p>
        <div class="w-flex justify-center">
          <w-tooltip right>
            <template #activator="{ on }">
              <w-button bg-color="transparent" text @click="copy(keypair.privKey)" v-on="on">
                {{ shortenKey(keypair.privKey) }}
              </w-button>
            </template>
            copy
          </w-tooltip>
        </div>

        <div class="text-center">
          <w-button @click="download" class="my4 pa4" bg-color="primary-light1" lg>Download MACI Private Key</w-button>
        </div>
      </div>
    </template>
  </w-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue'
import { Keypair } from 'maci-domainobjs'
import useClipboard from 'vue-clipboard3'
import saveAs from 'file-saver'

export default defineComponent({
  setup() {
    const dialogShow = ref(false)
    const keypair = reactive({
      pubKey: '',
      privKey: '',
    })
    watch(dialogShow, () => {
      keypair.pubKey = ''
      keypair.privKey = ''
    })
    const generateKeypair = () => {
      const newKeypair = new Keypair()
      keypair.pubKey = newKeypair.pubKey.serialize()
      keypair.privKey = newKeypair.privKey.serialize()
    }
    const shortenKey = (key: string) => {
      return key.slice(0, 12) + '...' + key.slice(-3)
    }
    const { toClipboard } = useClipboard()

    const copy = async (key: string) => {
      try {
        await toClipboard(key)
        console.log('Copied to clipboard', key)
      } catch (e: any) {
        throw new Error(e)
      }
    }

    const download = () => {
      const content = keypair.privKey
      const filename = `maci-key.txt`
      const blob = new Blob([content], {
        type: 'text/plain;charset=utf-8',
      })

      saveAs(blob, filename)
    }
    return {
      dialogShow,
      keypair,
      generateKeypair,
      shortenKey,
      copy,
      download,
    }
  },
})
</script>

<style scoped></style>
