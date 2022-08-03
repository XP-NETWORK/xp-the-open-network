# Xp.network TON (The Open Network) Integration

Deployed by [toncli](https://github.com/disintar/toncli)

0. Install dependencies
```
yarn
```

1. Deploy smart contracts

```
toncli build
toncli deploy -n testnet -wc 0
```

2. Deploy collection

```
yarn deploy-collection <royalty> <royalty_address>
```

3. Setup contract

```
yarn setup
```

4. Whitelist NFT collection

```
yarn whitelist <nft collection address>
```

5. Mint NFT

```
yarn mint <nft collection address>
```

6. Withdraw NFT

```
yarn withdraw <nft id>
```

7. Freeze NFT

```
yarn freeze <nft id>
```

8. Unfreeze NFT

```
yarn unfreeze <nft item address>
```

9. Update group key

```
yarn update <new group key>
```

10. Withdraw fees

```
yarn withdraw-fee
```
