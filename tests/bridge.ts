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

    it("get public key", async () => {
        const publicKey = await ed.getPublicKey(bridge.options.ed25519PrivateKey);
        const pubKeyFromContract = await bridge.methods.getPublicKey()
        assert.ok(pubKeyFromContract.eq(new BN(publicKey)))
    });

    it("is initialized", async () => {
        const isInitialized = await bridge.methods.isInitialized()
        assert.ok(isInitialized.eq(new BN(1)))
    })
});