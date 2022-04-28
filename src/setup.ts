import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract } from './contracts';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
const WalletClass = tonWeb.wallet.all['v3R2'];

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
    const privateKey = Buffer.from(process.env.ED25519_SK || "", "hex");
    const bridge = new BridgeContract(provider, { address: strAddress, ed25519PrivateKey: privateKey })

    const bridgeAddress = await bridge.getAddress()
    console.log("bridge address =", bridgeAddress.toString(true, true, true))

    const seqno = (await wallet.methods.seqno().call()) || 0

    const payload = await bridge.createSetupBody()

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: bridgeAddress,
        amount: TonWeb.utils.toNano(0.01),
        seqno: seqno,
        payload: payload
    })

    console.log(await transfer.send())
})();