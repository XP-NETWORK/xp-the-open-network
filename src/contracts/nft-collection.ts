import TonWeb, { Cell, ContractMethods, ContractOptions } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";
import { Address } from "tonweb/dist/types/utils/address";

const Contract = TonWeb.Contract

interface NftCollectionOptions extends ContractOptions {
    code: Cell,
    ownerAddress: Address
}

interface NftCollectionMethods extends ContractMethods {
    getCollectionData: () => Promise<any>;
}

export class NftCollectionContract extends Contract<NftCollectionOptions, NftCollectionMethods> {
    constructor(provider: HttpProvider, options: NftCollectionOptions) {
        super(provider, options);

        this.methods.getCollectionData = this.getCollectionData
    }

    getCollectionData = async () => {
        const myAddress = await this.getAddress()
        const result = await this.provider.call2(myAddress.toString(), 'get_collection_data');
        return result
    }

    // protected createDataCell(): Cell {
    //     const cell = new Cell();
    //     cell.bits.writeAddress(this.options.ownerAddress);
    //     cell.bits.writeUint(0, 64); // next_item_index
    //     cell.refs[0] = this.createContentCell(this.options);
    //     cell.refs[1] = this.options.code;
    //     cell.refs[2] = this.createRoyaltyCell(this.options);
    //     return cell;
    // }
}