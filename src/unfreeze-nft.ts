import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract } from './contracts';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);

const WalletClass = tonWeb.wallet.all['v3R2'];
const Address = TonWeb.Address
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

    const privateKey = Buffer.from(process.env.ED25519_SK || "", "hex");
    const strAddress = fs.readFileSync(__dirname + "/../build/bridge_address").toString().split(' ')[1]
    let bridge = new BridgeContract(provider, { address: strAddress, ed25519PrivateKey: privateKey })
    const bridgeAddress = await bridge.getAddress()

    const nftItemAddress = new TonWeb.utils.Address('EQDhZBNuiJoWgq-0xEc0A46-nIcEKAQbS-0MkWU_I2LEp3Ty');
    const nftItem = new NftItem(provider, {
        address: nftItemAddress
    })

    // parameters to transfer wrapped nft from bridge to target address
    const actionId = 1
    const targetAddress = new Address("EQAxZV60jjRcLtENLjNv-4I4SjS1HBBdI1ilvzbUuXaHK3Pk")

    const seqno = (await wallet.methods.seqno().call()) || 0
    const amount = TonWeb.utils.toNano(0.05)

    const payload = await bridge.createUnfreezeBody({
        actionId: actionId,
        amount: TonWeb.utils.toNano(0.01),
        itemAddress: await nftItem.getAddress(),
        to: targetAddress
    })

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