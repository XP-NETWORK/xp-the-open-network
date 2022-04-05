import * as dotenv from 'dotenv'
import TonWeb from "tonweb";

dotenv.config()

const tonWeb = new TonWeb(new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY }));
const Address = TonWeb.Address;

(async () => {
    const balance = await tonWeb.getBalance(new Address("EQALnbCowLoBEVmvSGGYKOIYySPbLKeUDTWWsl0AmqqzApek"))
    console.log(balance)
})();