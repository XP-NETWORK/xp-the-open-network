import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);

const WalletClass = tonWeb.wallet.all['v3R2'];
const NftCollection = TonWeb.token.nft.NftCollection;
const NftItem = TonWeb.token.nft.NftItem;

(async () => {
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

    const deployNftCollection = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano(0.05),
                seqno: seqno,
                payload: undefined, // body
                sendMode: 3,
                stateInit: (await nftCollection.createStateInit()).stateInit
            }).send()
        )
    }

    const getNftCollectionInfo = async () => {
        const data = await nftCollection.getCollectionData()
        console.log(data)
    }

    const deployNftItem = async () => {
        const data = await nftCollection.getCollectionData()

        const seqno = (await wallet.methods.seqno().call()) || 0;
        const amount = TonWeb.utils.toNano(0.05);

        const nftId = data.nextItemIndex

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: amount,
                seqno: seqno,
                payload: nftCollection.createMintBody({
                    amount,
                    itemIndex: nftId,
                    itemOwnerAddress: walletAddress,
                    itemContentUri: 'my_nft.json'
                }),
                sendMode: 3,
            }).send()
        );

        const nftItemAddress = await nftCollection.getNftItemAddressByIndex(nftId)
        console.log('nft item address=', nftItemAddress.toString(true, true, true));
    }

    const getNftItemInfo = async () => {
        const nftId = 3
        const nftItemAddress = await nftCollection.getNftItemAddressByIndex(nftId)
        console.log('nft item address=', nftItemAddress.toString(true, true, true));
        const nftItem = new NftItem(provider, { address: nftItemAddress });
        const data = await nftCollection.methods.getNftItemContent(nftItem)
        console.log(data)
    }

    // await deployNftCollection()
    // await getNftCollectionInfo()
    // await deployNftItem()
    await getNftItemInfo()

})();