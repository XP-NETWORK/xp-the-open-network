import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as ed from "@noble/ed25519";
import BN from "bn.js";
import { createHash } from "crypto";
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract } from './contracts';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
let WalletClass = tonWeb.wallet.all['v3R2'];

const enc = new TextEncoder();

(async () => {
    const signerMnemonic = process.env.SIGNER_MN || ""
    const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

    const wallet = new WalletClass(provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });
    const walletAddress = await wallet.getAddress()
    console.log("wallet address =", walletAddress.toString(true, true, true))

    const strAddress = fs.readFileSync(__dirname + "/../build/bridge_address").toString().split(' ')[1]
    let bridge = new BridgeContract(provider, { address: strAddress })

    const privateKey = Buffer.from(process.env.ED25519_SK || "", "hex");

    const ed25519gk = await ed.getPublicKey(privateKey);
    const message = "test"
    const msgHash = createHash("sha256")
        .update(message)
        .digest();
    const signature = await ed.sign(new Uint8Array(msgHash), privateKey);

    const bridgeAddress = await bridge.getAddress()
    const seqno = (await wallet.methods.seqno().call()) || 0
    const payload = new TonWeb.boc.Cell()
    payload.bits.writeUint(1, 32)
    payload.bits.writeUint(new BN(ed25519gk), 256)
    payload.bits.writeUint(new BN(signature), 512);

    const msgHashCell = new TonWeb.boc.Cell()
    msgHashCell.bits.writeBytes(msgHash)
    payload.refs[0] = msgHashCell;

    const messageCell = new TonWeb.boc.Cell()
    messageCell.bits.writeBytes(enc.encode(message))
    payload.refs[1] = messageCell;

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: bridgeAddress.toString(true, true, true),
        amount: TonWeb.utils.toNano(0.01),
        seqno: seqno,
        payload: payload
    })

    console.log(await transfer.send())
})();