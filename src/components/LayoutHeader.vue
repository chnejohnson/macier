<template>
  <w-toolbar bg-color="transparent">
    <router-link to="/">
      <p class="title1" style="cursor: pointer">MACIER</p>
    </router-link>

    <KeyForVoting />
    <div class="spacer"></div>
    <Web3Provider />
  </w-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import KeyForVoting from '@/components/KeyForVoting.vue'
import Web3Provider from '@/components/Web3Provider.vue'

export default defineComponent({
  components: {
    KeyForVoting,
    Web3Provider,
  },
})
</script>

<style scoped></style>
