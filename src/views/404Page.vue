<template>
  <div class="text-center">
    <p>404</p>
    <w-button @click="routerGo(-1)" class="btn btn-primary my-5">Back</w-button>
    <w-button @click="routerPush('/')" class="btn btn-secondary my-5">Home</w-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
export default defineComponent({
  name: '404Page',
  setup() {
    const router = useRouter()
    return { routerPush: router.push, routerGo: router.go }
  },
})
</script>
