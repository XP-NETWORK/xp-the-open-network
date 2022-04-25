import * as fs from 'fs'
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract } from './contracts';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
let WalletClass = tonWeb.wallet.all['v3R2'];
const NftCollection = TonWeb.token.nft.NftCollection;
const NftItem = TonWeb.token.nft.NftItem;

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
    const bridgeAddress = await bridge.getAddress()

    const nftCollection = new NftCollection(provider, {
        ownerAddress: bridgeAddress,
        nftItemCodeHex: NftItem.codeHex
    })

    const nftCollectionAddress = await nftCollection.getAddress()
    console.log('collection address=', nftCollectionAddress.toString(true, true, true));

    const seqno = (await wallet.methods.seqno().call()) || 0;

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: nftCollectionAddress.toString(true, true, true),
        amount: TonWeb.utils.toNano(1),
        seqno: seqno,
        payload: undefined,
        sendMode: 3,
        stateInit: (await nftCollection.createStateInit()).stateInit
    })

    console.log(await transfer.send())
})();