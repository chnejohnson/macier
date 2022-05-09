import { computed, ref } from 'vue'
import { useEthers, ChainId, CHAIN_NAMES, displayChainName } from 'vue-dapp'
console.log('run config.ts')

const isDev = process.env.NODE_ENV === 'development'
const infuraApiKey = process.env.VUE_APP_INFURA_API_KEY

type SupportedChainId = keyof typeof CHAIN_NAMES

// chain IDs supported by this app
const supportedChainIds = isDev ? [4, 5, 31337] : [4, 5] // rinkeby, goerli
const appChainId = ref<number | SupportedChainId>(isDev ? 31337 : 4)

isDev && console.log('appChainId: ', appChainId.value)

const { network, isActivated } = useEthers()

export default function useNetwork() {
  function changeAppChainId(chainId: number) {
    if (isDev) console.log('app chain id changed to ', chainId)
    appChainId.value = chainId
  }

  const rpcURL = computed(() => {
    return appChainId.value === 31337
      ? 'http://127.0.0.1:8545/'
      : `https://${displayChainName(appChainId.value)}.infura.io/v3/${infuraApiKey}`
  })

  // assume valid if we have no network information
  const isSupportedNetwork = computed(() => (network.value ? supportedChainIds.includes(network.value.chainId) : true))

  const unmatchedNetwork = computed(() => isActivated.value && network.value?.chainId !== appChainId.value)

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

  return {
    isDev,
    infuraApiKey,
    supportedChainIds,
    rpcURL,
    appChainId,
    isSupportedNetwork,
    unmatchedNetwork,
    supportedChainNames,
    supportedChainName,
    changeAppChainId,
  }
}
