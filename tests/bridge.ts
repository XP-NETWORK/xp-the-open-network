import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as ed from "@noble/ed25519";
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { WalletV3ContractR2 } from 'tonweb/dist/types/contract/wallet/v3/wallet-v3-contract-r2';
import { BridgeContract } from '../src/contracts';
import assert from "assert";
import { BN } from "bn.js";
import { Address } from 'tonweb/dist/types/utils/address';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
const WalletClass = tonWeb.wallet.all['v3R2'];

describe('Bridge', function () {

    let wallet: WalletV3ContractR2;
    let keyPair: tonMnemonic.KeyPair;
    let bridge: BridgeContract;

    before(async () => {
        const signerMnemonic = process.env.SIGNER_MN || ""
        keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const privateKey = Buffer.from(process.env.ED25519_SK || "", "hex");
        const bridgeAddress = fs.readFileSync(__dirname + "/../build/bridge_address").toString().split(' ')[1]
        bridge = new BridgeContract(provider, { address: bridgeAddress, ed25519PrivateKey: privateKey })

        console.log("bridge address =", (await bridge.getAddress()).toString(true, true, true))
    })

    // it("get public key", async () => {
    //     const publicKey = await ed.getPublicKey(bridge.options.ed25519PrivateKey);
    //     const pubKeyFromContract = await bridge.methods.getPublicKey()
    //     assert.ok(pubKeyFromContract.eq(new BN(publicKey)))
    // });

    it("is initialized", async () => {
        const isInitialized = await bridge.methods.isInitialized()
        assert.ok(isInitialized.eq(new BN(1)))
    })

    it("mint", async () => {
        const mv = new Address("EQA8APbth0GjoB7kXn_-uhpo1JWNcWFnSA3qYbumW2oj6mwA")
        console.log("mintWith", mv);
        const nftCollection = new TonWeb.token.nft.NftCollection(provider, {
            address: mv,
        })
        console.log("nft collection", await nftCollection.getCollectionData());

        const nftCollectionAddress = await nftCollection.getAddress()
        console.log('collection address=', nftCollectionAddress.toString(true, true, true));

        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const collectionData = await nftCollection.getCollectionData()
        console.log("collectionData", collectionData);
        const balance = await tonWeb.getBalance(walletAddress);
        console.log("balance:", TonWeb.utils.fromNano(balance));
        console.log("balance 2:", balance);
        // parameters to mint nft
        const actionId = 989
        const targetAddress = new Address("EQD3CDGIjrvZyo5cY21fiOCnyNEKdEMTtXtU8c-4xisbluMF")
        const nftId = collectionData.nextItemIndex;
        console.log("nftId", nftId);

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.06')

        // amountToCollection should be higher than amountToItem
        const amountToCollection = TonWeb.utils.toNano('0.05')
        const amountToItem = TonWeb.utils.toNano('0.04')
        const payload = await bridge.createMintBody({
            actionId,
            mintWith: nftCollectionAddress,
            itemIndex: nftId,
            amountToCollection,
            amountToItem,
            to: targetAddress,
            contentUri: 'https://meta.polkamon.com/meta?id=10002366816'
        })

        console.log({payload})
        const transfer = wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: await bridge.getAddress(),
            amount: amount,
            seqno: seqno,
            payload: payload,
            sendMode: 3
        })

        console.log(await transfer.send())
    })
    it("get action id", async () => {
        const result = await bridge.methods.getActionId()
        console.log(result)
        // assert.ok(isInitialized.eq(new BN(1)))
    })

    it("get whitelist", async () => {
        const result = await bridge.methods.getWhitelist()
        console.log(result)
    })
});