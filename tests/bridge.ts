import { createHash } from "crypto";
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as ed from "@noble/ed25519";
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { WalletV3ContractR2 } from 'tonweb/dist/types/contract/wallet/v3/wallet-v3-contract-r2';
import { BridgeContract } from '../src/contracts';
import assert from "assert";
import { BN } from "bn.js";

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
let WalletClass = tonWeb.wallet.all['v3R2'];

describe('Bridge', function () {
    const enc = new TextEncoder()

    let wallet: WalletV3ContractR2;
    let keyPair: tonMnemonic.KeyPair;
    let bridge: BridgeContract;
    let privateKey: Buffer;
    let publicKey: Uint8Array;

    before(async () => {
        const signerMnemonic = process.env.SIGNER_MN || ""
        keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const bridgeAddress = fs.readFileSync(__dirname + "/../build/bridge_address").toString().split(' ')[1]
        bridge = new BridgeContract(provider, { address: bridgeAddress })

        privateKey = Buffer.from(process.env.ED25519_SK || "", "hex");
        publicKey = await ed.getPublicKey(privateKey);
    })

    it("check signature in javascript", async () => {
        const msgHash = createHash("sha256")
            .update("test")
            .digest()

        const message = new Uint8Array(msgHash);

        const signature = await ed.sign(message, privateKey);
        const isValid = await ed.verify(signature, message, publicKey);

        assert.ok(isValid == true)
    })

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

    it("get public key", async () => {
        const pubKeyFromContract = await bridge.methods.getPublicKey()
        assert.ok(pubKeyFromContract.eq(new BN(publicKey)))
    });
});