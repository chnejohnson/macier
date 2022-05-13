import { ChainId } from 'vue-dapp'

export const POSEIDON_ADDRESS = {
  [ChainId.Hardhat]: {
    poseidonT5: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    poseidonT3: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    poseidonT6: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    poseidonT4: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  },
  [ChainId.Rinkeby]: {
    poseidonT5: '0x2bb2F59B2F316e1Fd68616b83920A1fe15E32a81',
    poseidonT3: '0x7B80a9E97FCbB2D84F29079B7dfB438d8eD96D06',
    poseidonT6: '0x62Dec77d6D6D73768521EBd4FBDa7c62085E052e',
    poseidonT4: '0x3A23442e35e76E0927dfe0F4FCff8A231Ff8425D',
  },
  [ChainId.Goerli]: {},
  [ChainId.Arbitrum]: {},
  [ChainId.Rinkarby]: {},
}
