import { expect } from 'chai'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";

dotenv.config()

const tonWeb = new TonWeb(new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL));

describe('Bridge', () => {
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