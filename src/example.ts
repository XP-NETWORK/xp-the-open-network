import * as dotenv from 'dotenv'
import TonWeb from "tonweb";

const Address = TonWeb.Address;
const Contract = TonWeb.Contract;

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);

(async () => {
    const balance = await tonWeb.getBalance(new Address("EQALnbCowLoBEVmvSGGYKOIYySPbLKeUDTWWsl0AmqqzApek"))
    console.log(balance)

    let wallet = tonWeb.wallet.create({ address: 'kQDGZirHejoWz-2s95Ln0AekT9-l3dyhJ6aYGaP9SiHg0TCh' })
    const address = await wallet.getAddress()
    
    const seqno = await wallet.methods.seqno().call()
    console.log(seqno)
})();