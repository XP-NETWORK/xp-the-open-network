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
    this.timeout(10000)

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

        const bridgeAddress = fs.readFileSync(__dirname + "/../build/bridge_address").toString().split(' ')[1]
        bridge = new BridgeContract(provider, { address: bridgeAddress })
    })

    // it("check signature in frontend", async () => {
    //     const context = "CONTEXT STRING"
    //     const message = "this a test"
    //     const msgHash = createHash("SHA512")
    //         .update(context)
    //         .update(message)
    //         .digest();

    //     const signature = Buffer.from("33146dafbdf4f76daac6b193e1f23c336ed84face08dd84cbd3ab9d20ecf09c420950f3355e0ff00b728114f9327f657744bd4c5282ab7ad123f9e7bc1803802", 'hex')
    //     ed25519gk = Buffer.from("bedde4edab1e5132bb42c2b560a17ce47386f0414fa0f0ae453595d0863f1ac9", "hex")
    //     const verified = await ed.verify(signature, msgHash, ed25519gk)
    //     assert.ok(verified == true)
    // })

    it("set group key", async () => {
        const ed25519gk = Buffer.from("bedde4edab1e5132bb42c2b560a17ce47386f0414fa0f0ae453595d0863f1ac9", "hex")
        const context = "CONTEXT STRING"
        const message = "this a test"
        const msgHash = createHash("SHA512")
            .update(context)
            .update(message)
            .digest();

        const signature = Buffer.from("33146dafbdf4f76daac6b193e1f23c336ed84face08dd84cbd3ab9d20ecf09c420950f3355e0ff00b728114f9327f657744bd4c5282ab7ad123f9e7bc1803802", 'hex')

        const bridgeAddress = await bridge.getAddress()
        const seqno = (await wallet.methods.seqno().call()) || 0
        const payload = new TonWeb.boc.Cell()
        payload.bits.writeUint(1, 32)
        payload.bits.writeUint(new BN(ed25519gk), 256)
        payload.bits.writeUint(new BN(signature), 512);

        const msgHashCell = new TonWeb.boc.Cell()
        msgHashCell.bits.writeBytes(msgHash)
        payload.refs[0] = msgHashCell;

        const transferred = await wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: bridgeAddress.toString(true, true, true),
            amount: TonWeb.utils.toNano(0.01),
            seqno: seqno,
            payload: payload
        }).send()

        console.log(transferred)
    });

    // it('validate nft', async () => {
    //     const bridgeAddress = await bridge.getAddress()
    //     const seqno = (await wallet.methods.seqno().call()) || 0
    //     const transferred = await wallet.methods.transfer({
    //         secretKey: keyPair.secretKey,
    //         toAddress: bridgeAddress.toString(true, true, true),
    //         amount: TonWeb.utils.toNano(0.01),
    //         seqno: seqno,
    //     }).send()

    //     console.log(transferred)

    //     console.log(await bridge.methods.seqno().call())
    // });

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

    it("get group key", async () => {
        console.log(await bridge.methods.getGroupKey())
    });

    // it("get seqno", async () => {
    //     console.log(await bridge.methods.seqno().call())
    // });
});