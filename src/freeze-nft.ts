import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract } from './contracts';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
const enc = new TextEncoder();

const WalletClass = tonWeb.wallet.all['v3R2'];
const NftItem = TonWeb.token.nft.NftItem;

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
    const bridgeAddress = await bridge.getAddress()

    const nftItemAddress = new TonWeb.utils.Address('EQDhZBNuiJoWgq-0xEc0A46-nIcEKAQbS-0MkWU_I2LEp3Ty');
    const nftItem = new NftItem(provider, {
        address: nftItemAddress
    })

    // parameters to transfer nft to foreign
    const actionId = 2
    const to = "address of foreign chain"
    const chainNonce = 0

    const seqno = (await wallet.methods.seqno().call()) || 0
    const amount = TonWeb.utils.toNano(0.05)

    const transferBody = await nftItem.createTransferBody({
        newOwnerAddress: bridgeAddress,
        responseAddress: walletAddress
    })

    const msg = new TonWeb.boc.Cell()
    msg.bits.writeUint(actionId, 32)
    msg.bits.writeUint(chainNonce, 32)
    msg.bits.writeBytes(enc.encode(to))

    const payload = new TonWeb.boc.Cell()
    payload.bits.writeUint(2, 32);
    payload.refs[0] = transferBody
    payload.refs[1] = msg

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: bridgeAddress.toString(true, true, true),
        amount: amount,
        seqno: seqno,
        payload: payload,
        sendMode: 3
    })

    console.log(await transfer.send())
})();