import { expect } from 'chai'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract, NftCollectionContract, NftItemContract } from '../src/contracts';
import assert from 'assert';
import { beforeEach } from 'mocha';
import { BN } from 'bn.js';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
const Cell = TonWeb.boc.Cell;

describe('Bridge', function () {
    this.timeout(10000)

    let keyPair: tonMnemonic.KeyPair;
    let nftCollection: NftCollectionContract;
    let nftItem: NftItemContract;
    let bridge: BridgeContract;

    before(async () => {
        const bridgeCode = Cell.oneFromBoc(new Uint8Array(fs.readFileSync(__dirname + "/../build/boc/bridge.boc")))
        const bridgeAddress = fs.readFileSync(__dirname + "/../build/bridge_address").toString().split(' ')[1]
        bridge = new BridgeContract(provider, { address: bridgeAddress, code: bridgeCode })

        const nftCollectionCode = Cell.oneFromBoc(new Uint8Array(fs.readFileSync(__dirname + "/../build/boc/nft-collection.boc")))
        const nftCollectionAddress = fs.readFileSync(__dirname + "/../build/nft-collection_address").toString().split(' ')[1]
        nftCollection = new NftCollectionContract(provider, {
            address: nftCollectionAddress,
            code: nftCollectionCode,
            ownerAddress: await bridge.getAddress()
        })

        const nftItemCode = Cell.oneFromBoc(new Uint8Array(fs.readFileSync(__dirname + "/../build/boc/nft-item.boc")))
        const nftItemAddress = fs.readFileSync(__dirname + "/../build/nft-item_address").toString().split(' ')[1]
        nftItem = new NftItemContract(provider, { address: nftItemAddress, code: nftItemCode })

        const signerMnemonic = process.env.SIGNER_MN || ""
        keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))
    })

    it('validate nft', async () => {
        const nftCollectionAddress = await nftCollection.getAddress()
        const seqno = await bridge.methods.seqno().call();

        const transferMethod = bridge.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: nftCollectionAddress.toString(true, true, true),
            amount: TonWeb.utils.toNano(1),
            seqno,
            payload: undefined,
            sendMode: 3,
            stateInit: (await nftCollection.createStateInit()).stateInit
        })
        const sended = await transferMethod.send()
        console.log(sended)
    });

    it('withdraw nft', () => {
        // TODO: 
    });

    it('transfer nft to foreign', () => {
        // TODO: 
    });

    it('transfer nft to foreign', () => {
        // TODO: 
    });

    it('unfreeze nft from foreign', () => {
        // TODO: 
    });

    it('validate whitelist nft', () => {
        // TODO: 
    });

    it('get seqno', async () => {
        const seqno = await bridge.methods.seqno().call();
        assert.ok(seqno == 0)
    });

    it('get public key', async () => {
        const publicKey = await bridge.methods.getPublicKey();
        console.log(publicKey)
    });

    it('get subwallet id', async () => {
        const publicKey = await bridge.methods.getSubwalletId();
        console.log(publicKey)
    });

    it('get collection data', async () => {
        const collectionData = await nftCollection.methods.getCollectionData()
        console.log(collectionData)
    })

    it('get nft data', async () => {
        const nftData = await nftItem.methods.getNftData()
        console.log(nftData)
    })
});