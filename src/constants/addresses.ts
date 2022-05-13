import { ChainId } from 'vue-dapp'

export const ADDRESSES = {
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
    vkRegistry: '0x15ea6FD8D4781A5599eD070633EC58fcB2Ee995b',
    pollFactory: '0x42FF3e0a1D0C0d604535f8e023E44ce550695A59',
    messageAqFactory: '0x512A3561959Fdc4596073977609b266251d5ad73',
    maci: '0x3aAeF1cb1F502DdDD9818d71c22d54F5267aA6C7',
    ppt: '0xD52636964839A0A8d765D2e561C5f5Dcd76782f8',
    qv: '0x80B32c5c926eB73B5D17ec141ccDA38645C2FA9E',
  },
  [ChainId.Goerli]: {},
  [ChainId.Arbitrum]: {},
  [ChainId.Rinkarby]: {},
}
