<template>
  <w-app>
    <header><Header /></header>
    <main class="grow">
      <router-view></router-view>
    </main>
    <footer><Footer /></footer>
  </w-app>

  <!--  VueDapp  -->
  <vdapp-board />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Header from '@/components/LayoutHeader.vue'
import Footer from '@/components/LayoutFooter.vue'

export default defineComponent({
  name: 'App',
  components: { Header, Footer },
})
</script>

<style>
.w-app {
  padding: 4px;
  background-color: #42413b;
  color: rgb(216, 213, 213);
}
header,
footer,
main {
  /* border: 1px solid rgba(232, 226, 226, 0.765); */
}
header,
footer {
  min-height: 60px;
}

main {
}
</style>
