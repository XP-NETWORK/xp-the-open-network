import TonWeb, { ContractMethods, ContractOptions } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";

const Contract = TonWeb.Contract

interface NftItemOptions extends ContractOptions {

}

interface NftItemMethods extends ContractMethods {
    getNftData: () => Promise<any>;
}

export class NftItemContract extends Contract<NftItemOptions, NftItemMethods> {
    constructor(provider: HttpProvider, options: NftItemOptions) {
        super(provider, options);

        this.methods.getNftData = this.getNftData
    }

    getNftData = async () => {
        const myAddress = await this.getAddress()
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_data');
        return result
    }
}