import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as ed from "@noble/ed25519";
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

    const strAddress = fs.readFileSync(__dirname + "/../build/bridge_address").toString().split(' ')[1]
    let bridge = new BridgeContract(provider, { address: strAddress })
    const bridgeAddress = await bridge.getAddress()
    console.log('bridge address=', bridgeAddress.toString(true, true, true));

    const privateKey = Buffer.from(process.env.ED25519_SK || "", "hex");

    const nftCollection = new NftCollection(provider, {
        ownerAddress: bridgeAddress,
        nftItemCodeHex: NftItem.codeHex
    })

    const nftCollectionAddress = await nftCollection.getAddress()
    console.log('collection address=', nftCollectionAddress.toString(true, true, true));

    const collectionData = await nftCollection.getCollectionData()

    // parameters to mint nft
    const actionId = 0
    const targetAddress = new Address("EQAxZV60jjRcLtENLjNv-4I4SjS1HBBdI1ilvzbUuXaHK3Pk")
    const nftId = collectionData.nextItemIndex;

    const seqno = (await wallet.methods.seqno().call()) || 0
    const amount = TonWeb.utils.toNano(0.01)

    const mintBody = nftCollection.createMintBody({
        itemIndex: nftId,
        amount: amount,
        itemOwnerAddress: targetAddress,
        itemContentUri: 'my_nft.json'
    })

    const msg = new TonWeb.boc.Cell()
    msg.bits.writeUint(actionId, 32)
    msg.bits.writeAddress(bridgeAddress)
    msg.bits.writeAddress(targetAddress)
    msg.bits.writeUint(nftId, 32)

    const msgHashArray = await msg.hash()
    const sigArray = await ed.sign(msgHashArray, privateKey);
    const publicKey = await ed.getPublicKey(privateKey);
    const isValid = await ed.verify(sigArray, msgHashArray, publicKey);
    console.log(isValid)
    const signature = new TonWeb.boc.Cell()
    signature.bits.writeBytes(sigArray)

    const payload = new TonWeb.boc.Cell()
    payload.bits.writeUint(1, 32);
    payload.refs[0] = mintBody
    payload.refs[1] = msg
    payload.refs[2] = signature

    if (isValid) {
        const transfer = wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: bridgeAddress,
            amount: amount,
            seqno: seqno,
            payload: payload,
            sendMode: 3
        })

        console.log(await transfer.send())
    }
})();