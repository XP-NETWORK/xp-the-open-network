import { expect } from 'chai'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract } from '../src/contract';
import assert from 'assert';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
const Cell = TonWeb.boc.Cell;

describe('Bridge', () => {
    const bufContractAddress = fs.readFileSync(__dirname + "/../build/contract_address")
    const bufCode = fs.readFileSync(__dirname + "/../build/boc/contract.boc")

    const code = Cell.oneFromBoc(new Uint8Array(bufCode))
    const addresses = bufContractAddress.toString().split(' ')
    const address = addresses[1]
    const contract = new BridgeContract(provider, { address, code })
    const signerMnemonic = process.env.SIGNER_MN || ""

    let seqno: number;

    it('get hi from hello_world method', async () => {
        const hi = await contract.methods.helloWorld();
        assert.ok(hi == 'hi')
    });

    it('get seqno', async () => {
        seqno = await contract.methods.seqno().call();
        console.log(seqno)
    });

    it('transfer', async () => {
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const transfer = contract.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: address,
            amount: 0,
            seqno: seqno,
            payload: "Hello"
        })
        const transferSended = await transfer.send()
        const transferQuery = await transfer.getQuery()
        console.log(transferSended)
        console.log(transferQuery)
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