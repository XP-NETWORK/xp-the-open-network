import * as dotenv from 'dotenv'
import TonWeb from "tonweb";

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY });
const tonweb = new TonWeb(provider);

const onBlock = async (blockHeader: any) => {
    const workchain = blockHeader.id.workchain;
    const shardId = blockHeader.id.shard;
    const blockNumber = blockHeader.id.seqno;
    console.log('BLOCK ', blockHeader);

    const blockTransactions = await tonweb.provider.getBlockTransactions(workchain, shardId, blockNumber); // todo: (tolya-yanot) `incomplete` is not handled in response
    const shortTransactions = blockTransactions.transactions;
    for (const shortTx of shortTransactions) {
        console.log('TX at ' + shortTx.account);
    }
}

(async () => {
    const storage = new TonWeb.InMemoryBlockStorage(console.log);

    const blockSubscribe = new TonWeb.BlockSubscription(tonweb.provider, storage, onBlock);
    await blockSubscribe.start();
})();
