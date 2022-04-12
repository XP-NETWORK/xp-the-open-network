import { expect } from 'chai'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import { NftSaleContract } from '../src/nft-sale';
import assert from 'assert';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
const Cell = TonWeb.boc.Cell;

describe('NFT Sale', function () {
    this.timeout(10000)

    const bufContractAddress = fs.readFileSync(__dirname + "/../build/nft-sale_address")
    const bufCode = fs.readFileSync(__dirname + "/../build/boc/nft-sale.boc")

    const code = Cell.oneFromBoc(new Uint8Array(bufCode))
    const addresses = bufContractAddress.toString().split(' ')
    const address = addresses[1]
    const contract = new NftSaleContract(provider, { address, code })

    it('get sale data', async () => {
        try {
            const data = await contract.methods.getData();
            console.log(data)
        } catch (e) {
            console.log(e)
        }
    });
});