<template>
  <div class="w-flex justify-center">
    <p class="title1 mt12">404 not found</p>
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
