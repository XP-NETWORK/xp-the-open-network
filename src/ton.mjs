import tonMnemonic from "tonweb-mnemonic";
import TonWeb from "tonweb";


const mnemonic = 'raise misery online burden island client forum shallow learn secret solution avoid adult absorb prevent shield prize frog flag turkey march mango pig gift'; // 24-word passphrase
const walletVersion = 'v4R2'; // v3R2, v4R2, etc.. from tonscan.org
const nftAddresses = [
    'EQBpWsoa-JCW58BC5D9Og1h2HgQP_5mbfNUm-t1ZFG_2ILE4', // comma-separated NFT addresses in ''
];
const destinationAddress = 'kQAee5m2tk_-ipbrq40Geey7_yZmjZwAYZFjuKy9CbWvVykL'; // your new address


(async () => {
    const {NftItem} = TonWeb.token.nft;
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC'));
    const mnemonicParts = mnemonic.split(' ')
    const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonicParts);
    const WalletClass = tonweb.wallet.all[walletVersion];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });
    async function transfer(nftAddress) {
        const myAddress = new TonWeb.utils.Address(destinationAddress);
        const nftItem = new NftItem(tonweb.provider, {address: nftAddress});

        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno});
        await new Promise(resolve => setTimeout(resolve, 1000));

        const amount = TonWeb.utils.toNano("0.04");

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: await nftAddress,
                amount: amount,
                seqno: seqno,
                payload: await nftItem.createTransferBody({
                    newOwnerAddress: myAddress,
                    forwardAmount: TonWeb.utils.toNano("0.02"),
                    forwardPayload: new TextEncoder().encode('gift'),
                    responseAddress: myAddress
                }),
                sendMode: 3,
            }).send().catch(e => console.log(e))
        );
    }

    let i = 0;
    nftAddresses.forEach((e) => {
        setTimeout(() => transfer(e), i*24000)
        i++;
    })

})();