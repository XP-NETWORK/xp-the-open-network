import TonWeb, { ContractMethods, ContractOptions } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";
import BN from "bn.js";
import { parseAddress } from "./utils";

const Contract = TonWeb.Contract;
const Address = TonWeb.Address;

interface NftSaleOptions extends ContractOptions {
    marketplaceAddress?: any;
    nftAddress?: any;
    fullPrice?: BN;
    marketplaceFee?: BN;
    royaltyAddress?: any;
    royaltyAmount?: BN;
}
interface NftSaleMethods extends ContractMethods {
    getData: () => Promise<NftSaleData>;
}
interface NftSaleData {
    marketplaceAddress?: any;
    nftAddress?: any;
    nftOwnerAddress?: any;
    fullPrice: any;
    marketplaceFee: any;
    royaltyAddress?: any;
    royaltyAmount: any;
}

export class NftSaleContract extends Contract<NftSaleOptions, NftSaleMethods> {
    constructor(provider: HttpProvider, options: NftSaleOptions) {
        super(provider, options);

        this.methods.getData = this.getData
    }

    getData = async () => {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_sale_data');

        const marketplaceAddress = parseAddress(result[0]);
        const nftAddress = parseAddress(result[1]);
        const nftOwnerAddress = parseAddress(result[2]);
        const fullPrice = result[3];
        const marketplaceFee = result[4];
        const royaltyAddress = parseAddress(result[5]);
        const royaltyAmount = result[6];

        return { marketplaceAddress, nftAddress, nftOwnerAddress, fullPrice, marketplaceFee, royaltyAddress, royaltyAmount };
    }
}