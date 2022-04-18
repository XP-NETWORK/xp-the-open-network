import { expect } from 'chai'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract } from '../src/contracts';
import assert from 'assert';
import { beforeEach } from 'mocha';
import { BN } from 'bn.js';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
const Cell = TonWeb.boc.Cell;
const NftCollection = TonWeb.token.nft.NftCollection;
const NftItem = TonWeb.token.nft.NftItem;

describe('Bridge', function () {
    this.timeout(10000)

    const bufContractAddress = fs.readFileSync(__dirname + "/../build/bridge_address")
    const bufCode = fs.readFileSync(__dirname + "/../build/boc/bridge.boc")

    const code = Cell.oneFromBoc(new Uint8Array(bufCode))
    const addresses = bufContractAddress.toString().split(' ')
    const address = addresses[1]
    const contract = new BridgeContract(provider, { address, code })
    const signerMnemonic = process.env.SIGNER_MN || ""

    let keyPair: tonMnemonic.KeyPair;
    let nftCollection: any;
    let nftCollectionAddress: any;

    beforeEach(async () => {
        keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const walletAddress = await contract.getAddress()
        nftCollection = new NftCollection(tonWeb.provider, {
            ownerAddress: walletAddress,
            royalty: 0.13,
            royaltyAddress: walletAddress,
            collectionContentUri: "https://example.com",
            nftItemContentBaseUri: "https://example.com",
            nftItemCodeHex: NftItem.codeHex
        })
        nftCollectionAddress = await nftCollection.getAddress()
    })

    it('get hi from hello_world method', async () => {
        const hi = await contract.methods.helloWorld();
        assert.ok(hi == 'hi')
    });

    it('get seqno', async () => {
        const seqno = await contract.methods.seqno().call();
        assert.ok(seqno == 0)
    });

    it('get hi from cell', async () => {
        const result = await contract.methods.getHiFromCell();
        const seqnoFromCell = new BN(result.data.bits.array)

        const enc = new TextEncoder()

        assert.ok((new BN(enc.encode("hi"))).eq(new BN(result.data.refs[0].bits.array)))
        assert.ok(seqnoFromCell.eq(new BN(0)))
        assert.ok(result.seqno.eq(new BN(0)))
    });

    it('validate nft', () => {
        // TODO: 
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
});