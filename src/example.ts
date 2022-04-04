import * as dotenv from 'dotenv'
import TonWeb from "tonweb";

dotenv.config()

const tonWeb = new TonWeb(new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL));
const Address = TonWeb.Address;

(async () => {
    const balance = await tonWeb.getBalance(new Address("EQALnbCowLoBEVmvSGGYKOIYySPbLKeUDTWWsl0AmqqzApek"))
    console.log(balance)
})();