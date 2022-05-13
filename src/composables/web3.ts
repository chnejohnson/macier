import { computed, ref } from 'vue'
import { useEthers, CHAIN_NAMES, displayChainName } from 'vue-dapp'

type SupportedChainId = 31337 | 4 | 5

const isDev = process.env.NODE_ENV === 'development'
const infuraApiKey = process.env.VUE_APP_INFURA_API_KEY

// chain IDs supported in this app
const supportedChainIds = isDev ? [4, 5, 31337] : [4, 5] // rinkeby, goerli
const appChainId = ref<SupportedChainId>(isDev ? 4 : 4)

isDev && console.log('appChainId: ', appChainId.value)

const { isActivated, network } = useEthers()

export default function useWeb3() {
  const supportedChainNames = computed(() => {
    return supportedChainIds.map(id => displayChainName(id))
  })

  const supportedChainName = computed(() => {
    const names: string[] = []
    supportedChainIds.forEach(id => {
      names.push(displayChainName(id))
    })
    return names.join(', ')
  })

  const rpcURL = computed(() => {
    return appChainId.value === 31337
      ? 'http://127.0.0.1:8545/'
      : `https://${displayChainName(appChainId.value)}.infura.io/v3/${infuraApiKey}`
  })

  // wallet network is supported in the app
  const isSupportedNetwork = computed(() =>
    isActivated.value ? supportedChainIds.includes(network.value!.chainId) : false,
  )
  // app network matches the network selected in wallet
  const isMatchedNetwork = computed(() =>
    isActivated.value ? (appChainId.value === network.value!.chainId ? true : false) : false,
  )

  function updateAppChainId(chainId: number) {
    isDev && console.log(`appChainId updated: ${displayChainName(chainId)} ${chainId}`)
    if (supportedChainIds.includes(chainId)) {
      appChainId.value = chainId as SupportedChainId
    }
  }

  return {
    isDev,
    infuraApiKey,
    supportedChainIds,
    supportedChainNames,
    supportedChainName,
    rpcURL,
    appChainId,
    isSupportedNetwork,
    isMatchedNetwork,
    updateAppChainId,
  }
}
