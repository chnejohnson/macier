# macier

## Tech stacks
- [wave ui](https://antoniandre.github.io/wave-ui/typography)
- [font awesome v4](https://fontawesome.com/v4/icons/)
- [vue-dapp](https://vue-dapp-docs.netlify.app/api/use-ethers.html)
- [ethers](https://docs.ethers.io/v5/api/providers/jsonrpc-provider/)

## Demo

### Test `sign up` and `publish messages` on Rinkeby testnet
- maci: 0x3aAeF1cb1F502DdDD9818d71c22d54F5267aA6C7
- poll: 0xf0F72bbC439A6830fA98b200e9f2E83273dD7280

### Test `verify` on Goerli testnet
- poll: 0x94e6dCc56DFe979AF5D65F6F8A525732A4D30082
- You can paste the following tally result on verifying page to verify it.

```json
{
    "provider": "http://localhost:8545",
    "maci": "0xDBEf16F056a2a630568F2317e00Ea75A49b49763",
    "pollId": 0,
    "newTallyCommitment": "0x14ae7b676b4019e432ee14e93bff0d78f480f5199082fb653c3238cfce5fcb6e",
    "results": {
        "tally": [
            "4",
            "1",
            "0",
            "3",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0"
        ],
        "salt": "0x280ef482b20d109fb74c93efe54dcd4d3b556b1d8f2c1b34eb42456d17b949a2"
    },
    "totalSpentVoiceCredits": {
        "spent": "26",
        "salt": "0x28f29125e0afbf9c0999d6340b53f4f1961fbdae6b59aaa06dd44dc3d4494619"
    },
    "perVOSpentVoiceCredits": {
        "tally": [
            "16",
            "1",
            "0",
            "9",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0"
        ],
        "salt": "0x1d5ae9e560cf4ba5591d73cc5d5c0c9e55c5505a0a81f37e101a6dc6336d2855"
    }
}
```