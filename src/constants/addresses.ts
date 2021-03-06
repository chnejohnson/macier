import { ChainId } from 'vue-dapp'

export const ADDRESSES = {
  [ChainId.Hardhat]: {
    poseidonT5: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    poseidonT3: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    poseidonT6: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    poseidonT4: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    vkRegistry: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    pollFactory: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    messageAqFactory: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    qv: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    maci: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    ppt: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
    poll: '0x61c36a8d610163660E21a8b7359e1Cac0C9133e1',
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
    poll: '0xf0F72bbC439A6830fA98b200e9f2E83273dD7280',
  },
  [ChainId.Goerli]: {
    poseidonT5: '0xc90d37Dc42a178D908AE97C9D53d22c6e4Eae812',
    poseidonT3: '0xa8d4452Ae282FC13521C6A4d91FE58bB49719EB4',
    poseidonT6: '0x9cDD2E83ebAD5d7B0cDd75bbaD169F0D21C3fE67',
    poseidonT4: '0xa9228cA5f3dFCE19a61b7Bf1540F21C9e9d95a2b',
    vkRegistry: '0xFF67d4c560F4DFD5376C23648eAe652aE6Cb4904',
    pollFactory: '0x406867673913e95f6Ab64bf5F5459f9Feb34F3Be',
    messageAqFactory: '0x91B02fdD2Da808C755148b9481D706876cd22214',
    qv: '0xA5076DA446BD71cb999fD4fEAe78d10C0D6F32d2',
    maci: '0xDBEf16F056a2a630568F2317e00Ea75A49b49763',
    ppt: '0xA85e36Ec90C8867A3F184E5B47bdF74818505496',
    poll: '0x94e6dCc56DFe979AF5D65F6F8A525732A4D30082',
  },
  [ChainId.Rinkarby]: {},
  [ChainId.Arbitrum]: {},
}
