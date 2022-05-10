import { createApp } from 'vue'
import App from './App.vue'
import { VueDapp } from 'vue-dapp'
import WaveUI from 'wave-ui'
import 'wave-ui/dist/wave-ui.css'
import 'font-awesome/css/font-awesome.min.css'

import router from './router'

const app = createApp(App)

app.use(VueDapp)
app.use(router)

new WaveUI(app, {
  colors: {},
})

app.mount('#app')
