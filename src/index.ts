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
const Address = TonWeb.Address
const NftCollection = TonWeb.token.nft.NftCollection;
const NftItem = TonWeb.token.nft.NftItem;

(async () => {


    const privateKey = Buffer.from(process.env.ED25519_SK || "", "hex");
    const strAddress = fs.readFileSync(__dirname + "/../build/bridge_address").toString().split(' ')[1]
    const bridge = new BridgeContract(provider, { address: strAddress, ed25519PrivateKey: privateKey })
    const bridgeAddress = await bridge.getAddress()
    console.log('bridge address=', bridgeAddress.toString(true, true, true));

    const args = process.argv.slice(2)

    if (args[0] == 'setup') {
        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

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
    } else if (args[0] == 'deploy-collection') {
        const nftCollection = new NftCollection(provider, {
            ownerAddress: bridgeAddress,
            nftItemCodeHex: NftItem.codeHex
        })

        const nftCollectionAddress = await nftCollection.getAddress()
        console.log('collection address=', nftCollectionAddress.toString(true, true, true));

        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const seqno = (await wallet.methods.seqno().call()) || 0;

        const transfer = wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: nftCollectionAddress.toString(true, true, true),
            amount: TonWeb.utils.toNano(0.05),
            seqno: seqno,
            payload: undefined,
            sendMode: 3,
            stateInit: (await nftCollection.createStateInit()).stateInit
        })

        console.log(await transfer.send())
    } else if (args[0] == 'mint') {
        const nftCollection = new NftCollection(provider, {
            ownerAddress: bridgeAddress,
            nftItemCodeHex: NftItem.codeHex
        })

        const nftCollectionAddress = await nftCollection.getAddress()
        console.log('collection address=', nftCollectionAddress.toString(true, true, true));

        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const collectionData = await nftCollection.getCollectionData()
        console.log(collectionData)

        // parameters to mint nft
        const actionId = 0
        const targetAddress = new Address("EQAxZV60jjRcLtENLjNv-4I4SjS1HBBdI1ilvzbUuXaHK3Pk")
        const nftId = collectionData.nextItemIndex;

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano(0.01)

        // amountToCollection should be higher than amountToItem
        const amountToCollection = TonWeb.utils.toNano(0.05)
        const amountToItem = TonWeb.utils.toNano(0.04)

        const payload = await bridge.createMintBody({
            actionId,
            mintWith: nftCollectionAddress,
            itemIndex: nftId,
            amountToCollection,
            amountToItem,
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
    } else if (args[0] == 'withdraw') {
        const nftCollection = new NftCollection(provider, {
            ownerAddress: bridgeAddress,
            nftItemCodeHex: NftItem.codeHex
        })

        const nftCollectionAddress = await nftCollection.getAddress()
        console.log('collection address=', nftCollectionAddress.toString(true, true, true));

        const nftId = parseInt(args[1])
        const nftItemAddress = await nftCollection.getNftItemAddressByIndex(nftId)
        console.log('nft item address=', nftItemAddress.toString(true, true, true));
        const nftItem = new NftItem(provider, { address: nftItemAddress });

        const signerMnemonic = process.env.SIGNER_MN2 || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        // parameters to transfer nft to foreign
        const actionId = 2
        const to = "address of foreign chain"
        const chainNonce = 0

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amountToItem = TonWeb.utils.toNano(0.05)
        const amountToBridge = TonWeb.utils.toNano(0.04)

        const transferBody = await bridge.createWithdrawBody()

        // const transfer = wallet.methods.transfer({
        //     secretKey: keyPair.secretKey,
        //     toAddress: nftItemAddress,
        //     amount: amountToItem,
        //     seqno: seqno,
        //     payload: transferBody,
        //     sendMode: 3
        // })

        // console.log(await transfer.send())

    } else if (args[0] == 'freeze') {
        const signerMnemonic = process.env.SIGNER_MN2 || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const nftCollection = new NftCollection(provider, {
            ownerAddress: walletAddress,
            nftItemCodeHex: NftItem.codeHex
        })

        const nftCollectionAddress = await nftCollection.getAddress()
        console.log('collection address=', nftCollectionAddress.toString(true, true, true));

        const nftId = parseInt(args[1])
        const nftItemAddress = await nftCollection.getNftItemAddressByIndex(nftId)
        console.log('nft item address=', nftItemAddress.toString(true, true, true));
        const nftItem = new NftItem(provider, { address: nftItemAddress });

        const data = await nftCollection.methods.getNftItemContent(nftItem)
        console.log(data)

        // parameters to transfer nft to foreign
        const actionId = 2
        const to = "address of foreign chain"
        const chainNonce = 0

        const forwardPayload = new Uint8Array([])

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano(0.05)

        const payload = await nftItem.createTransferBody({
            newOwnerAddress: bridgeAddress,
            responseAddress: walletAddress,
            forwardAmount: TonWeb.utils.toNano(0.04),
            forwardPayload
        })

        const transfer = wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: nftItemAddress,
            amount: amount,
            seqno: seqno,
            payload: payload,
            sendMode: 3
        })

        console.log(await transfer.send())
    } else {
        console.log("unknown argments")
    }
})();