/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'wave-ui' {
  export default WaveUI
}

declare module 'file-saver' {
  import saveAs from '@types/file-saver'
  export default saveAs
}
