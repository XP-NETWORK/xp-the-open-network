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
    console.log({ privateKey });

    const strAddress = process.env.BRIDGE_ADDRESS
    const bridge = new BridgeContract(provider, { address: strAddress, ed25519PrivateKey: privateKey })
    const burner = new BridgeContract(provider, { address: process.env.BURNER_ADDRESS!, ed25519PrivateKey: privateKey })
    const bridgeAddress = await bridge.getAddress()

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
            seqno,
            payload
        })


        // const transfer_ = wallet.methods.transfer({
        //     secretKey: keyPair.secretKey,
        //     toAddress: new TonWeb.Address(process.env.BURNER_ADDRESS!),
        //     amount: TonWeb.utils.toNano('0.05'),
        //     seqno: seqno,
        //     payload: payload
        // })

        console.log(await transfer.send())
        // const res = await transfer_.send()
        // console.log(res)
    }
    else if (args[0] == 'check') {

        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address", walletAddress.toString(true, true, true));
        const publicKey = await bridge.getPublicKey();
        const publicKeyBurner = await burner.getPublicKey();
        //@ts-ignore
        // let whiteList: Cell = new TonWeb.boc.Cell(await bridge.getWhitelist());
        // console.log("whitelist",whiteList);

        // whiteList = TonWeb.boc.Cell.oneFromBoc(
        //     new Uint8Array(Buffer.from(whiteList.bits, 'base64'))
        // )
        console.log("whitelist")
        // const balance = await tonWeb.getBalance(walletAddress);
        console.log("public key bridge:", publicKey);
        console.log("publicKeyBurner", publicKeyBurner);

        // const actionID = await bridge.getActionId();
        // console.log("actionID", actionID)
        // console.log("actionID", actionID.toString(16))
        // console.log("actionID", actionID.toString(10))
    }
    else if (args[0] == 'deploy-collection') {
        try {
            const nftCollection = new NftCollection(provider, {
                ownerAddress: bridgeAddress,
                nftItemCodeHex: NftItem.codeHex,
                royalty: parseInt(args[1]),
                royaltyAddress: new Address(args[2]),
                collectionContentUri: 'https://meta.polkamon.com/meta?id=',
                nftItemContentBaseUri: ''
            })


            const nftCollectionAddress = await nftCollection.getAddress()
            console.log('collection address=', nftCollectionAddress.toString(true, true, true));

            const signerMnemonic = process.env.SIGNER_MN || ""
            const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))
            console.log("keyPair", keyPair);
            const wallet = new WalletClass(provider, {
                publicKey: keyPair.publicKey,
                wc: 0
            });
            const walletAddress = await wallet.getAddress()
            console.log("wallet address =", walletAddress.toString(true, true, true))
            console.log
            const seqno = (await wallet.methods.seqno().call()) || 0;
            const stateInit = (await nftCollection.createStateInit()).stateInit;

            // console.log("stateInit", stateInit);

            const transfer = wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('0.05'),
                seqno: seqno,
                payload: undefined,
                sendMode: 3,
                stateInit: stateInit
            })

            console.log(await transfer.send())

        } catch (error) {
            console.log("this is test error", error);

        }
    } else if (args[0] == 'mint') {
        const nftCollection = new TonWeb.token.nft.NftCollection(provider, {
            address: new Address(args[1]),
        })
        console.log("nft collection", await nftCollection.getCollectionData());

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
        console.log("collectionData", collectionData);
        const balance = await tonWeb.getBalance(walletAddress);
        console.log("balance:", TonWeb.utils.fromNano(balance));
        console.log("balance 2:", balance);
        // parameters to mint nft
        const actionId = 8989
        const targetAddress = new Address(args[2])
        const nftId = collectionData.nextItemIndex;
        console.log("nftId", nftId);

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
            contentUri: 'https://meta.polkamon.com/meta?id=10002366816'
        })

        console.error({
            payload: {
                actionId,
                mintWith: nftCollectionAddress,
                itemIndex: nftId,
                amountToCollection,
                amountToItem,
                to: targetAddress,
                contentUri: 'https://meta.polkamon.com/meta?id=10002366816'
            }
        });

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
            chainNonce
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
        const nftItem = new NftItem(provider, {
            address: nftItemAddress
        })

        const actionId = 1
        const targetAddress = new Address("EQAxZV60jjRcLtENLjNv-4I4SjS1HBBdI1ilvzbUuXaHK3Pk")

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.05')

        const payload = await bridge.createUnfreezeBody({
            actionId: actionId,
            amount: TonWeb.utils.toNano('0.05'),
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
    } else if (args[0] == 'update') {
        const signerMnemonic = process.env.SIGNER_MN || ""
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("wallet address =", walletAddress.toString(true, true, true))
        const balance = await tonWeb.getBalance(walletAddress);

        console.log("balance:", TonWeb.utils.fromNano(balance));

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.01')
        const actionId = 7
        const newGroupKey = Buffer.from(args[1], "hex")
        console.log("");

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
        console.log(signerMnemonic)
        const keyPair = await tonMnemonic.mnemonicToKeyPair(signerMnemonic.split(" "))

        const wallet = new WalletClass(provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        const walletAddress = await wallet.getAddress()
        console.log("balance", await tonWeb.getBalance(walletAddress));
        console.log("balance in nano", TonWeb.utils.toNano(await tonWeb.getBalance(walletAddress)).toString());
        console.log("wallet address =", walletAddress.toString(true, true, true))

        const actionId = 1036
        console.log("args", args[1]);
        const payload = await bridge.createWhitelistBody({
            actionId,
            collection: new Address(args[1])
        })

        const seqno = (await wallet.methods.seqno().call()) || 0
        const amount = TonWeb.utils.toNano('0.08')
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
