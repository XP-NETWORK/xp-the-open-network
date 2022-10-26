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
    const strAddress = process.env.BRIDGE_ADDRESS
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
            amount: TonWeb.utils.toNano('0.05'),
            seqno: seqno,
            payload: payload
        })

        console.log(await transfer.send())
    } else if (args[0] == 'deploy-collection') {
        const nftCollection = new NftCollection(provider, {
            ownerAddress: bridgeAddress,
            nftItemCodeHex: NftItem.codeHex,
            royalty: parseInt(args[1]),
            royaltyAddress: new Address(args[2])
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
            amount: TonWeb.utils.toNano('0.05'),
            seqno: seqno,
            payload: undefined,
            sendMode: 3,
            stateInit: (await nftCollection.createStateInit()).stateInit
        })

        console.log(await transfer.send())
    } else if (args[0] == 'mint') {
        const nftCollection = new NftCollection(provider, {
            address: new Address(args[1])
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

        // parameters to mint nft
        const actionId = 0
        const targetAddress = new Address(args[2])
        const nftId = collectionData.nextItemIndex;

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.06')

        // amountToCollection should be higher than amountToItem
        const amountToCollection = TonWeb.utils.toNano('0.05')
        const amountToItem = TonWeb.utils.toNano('0.04')

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
        const nftItemAddress = new Address(args[1])
        console.log('nft item address=', nftItemAddress.toString(true, true, true));
        // const nftItem = new NftItem(provider, { address: nftItemAddress });

        const signerMnemonic = process.env.SIGNER_MN2 || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        // parameters to transfer nft to foreign
        const to = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        const chainNonce = 7

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.08')

        const payload = await bridge.createWithdrawBody({
            to: enc.encode(to),
            chainNonce,
            mintWith: new Uint8Array([])
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

    } else if (args[0] == 'freeze') {
        const signerMnemonic = process.env.SIGNER_MN2 || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const nftItemAddress = new Address(args[1])
        console.log('nft item address=', nftItemAddress.toString(true, true, true));

        // parameters to transfer nft to foreign
        const to = "U22M6ENJLHAQEIL6TVCC3BJFM63JLFVH4ZFS3XYPA3XRUCW3NN5MKC5YVU"
        const chainNonce = 0
        const mintWith = "mintWith"

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.05')

        const payload = await bridge.createFreezeBody({
            amount: TonWeb.utils.toNano('0.04'),
            to: enc.encode(to),
            chainNonce,
            mintWith: enc.encode(mintWith)
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
    } else if (args[0] == 'unfreeze') {
        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const nftItemAddress = new Address(args[1])

        const actionId = 1
        const targetAddress = new Address("EQAxZV60jjRcLtENLjNv-4I4SjS1HBBdI1ilvzbUuXaHK3Pk")

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.06')

        const payload = await bridge.createUnfreezeBody({
            actionId: actionId,
            amount: TonWeb.utils.toNano('0.05'),
            itemAddress: nftItemAddress,
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
    } else if (args[0] == 'update') {
        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.01')
        const actionId = 2
        const newGroupKey = Buffer.from(args[1], "hex")

        const payload = await bridge.createUpdateBody({
            actionId,
            newGroupKey
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
    } else if (args[0] == 'withdrawfee') {
        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.01')
        const actionId = 2

        const payload = await bridge.createWithdrawFeeBody({
            actionId,
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
    } else if (args[0] == 'whitelist') {
        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const actionId = 10

        const payload = await bridge.createWhitelistBody({
            actionId,
            collection: new Address(args[1])
        })

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.01')
        const transfer = wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: bridgeAddress,
            amount: amount,
            seqno: seqno,
            payload: payload,
            sendMode: 3
        })

        console.log(await transfer.send())
    } else {
        console.log("unknown argments")
    }
})().catch(e => {
    console.log(e)
});
