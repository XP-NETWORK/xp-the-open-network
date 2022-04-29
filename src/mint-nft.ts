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
const NftCollection = TonWeb.token.nft.NftCollection;
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
    const bridge = new BridgeContract(provider, { address: strAddress, ed25519PrivateKey: privateKey })
    const bridgeAddress = await bridge.getAddress()
    console.log('bridge address=', bridgeAddress.toString(true, true, true));

    const nftCollection = new NftCollection(provider, {
        ownerAddress: bridgeAddress,
        nftItemCodeHex: NftItem.codeHex
    })

    const nftCollectionAddress = await nftCollection.getAddress()
    console.log('collection address=', nftCollectionAddress.toString(true, true, true));

    const collectionData = await nftCollection.getCollectionData()
    console.log(collectionData)

    // parameters to mint nft
    const actionId = 0
    const targetAddress = new Address("EQAxZV60jjRcLtENLjNv-4I4SjS1HBBdI1ilvzbUuXaHK3Pk")
    const nftId = collectionData.nextItemIndex;

    const seqno = (await wallet.methods.seqno().call()) || 0
    const amount = TonWeb.utils.toNano(0.05)

    const payload = await bridge.createMintBody({
        actionId,
        mintWith: nftCollectionAddress,
        itemIndex: nftId,
        amount: amount,
        to: targetAddress,
        contentUri: 'my_nft.json'
    })

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: bridgeAddress,
        amount: amount,
        seqno: seqno,
        payload: payload,
        sendMode: 3
    })

    console.log(await transfer.send())
})();