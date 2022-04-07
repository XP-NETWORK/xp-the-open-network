import { expect } from 'chai'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import { BridgeContract } from '../src/contract';
import assert from 'assert';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);

describe('Bridge', () => {
    const buf = fs.readFileSync(__dirname + "/../build/contract_address")
    const addresses = buf.toString().split(' ')
    const address = addresses[1]
    const contract = new BridgeContract(provider, { address })

    it('get hi from hello_world method', async () => {
        const hi = await contract.methods.helloWorld();
        assert.ok(hi == 'hi')
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