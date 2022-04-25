import TonWeb, { Cell, ContractMethods, ContractOptions, Method } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";

const Contract = TonWeb.Contract;

declare type SeqnoMethod = (() => SeqnoMethodResult);

interface SeqnoMethodResult {
    call: () => Promise<number>;
}

interface BridgeOptions extends ContractOptions {
}
interface BridgeMethods extends ContractMethods {
    seqno: SeqnoMethod;
    getGroupKey: () => Promise<any>;
}

export class BridgeContract extends Contract<BridgeOptions, BridgeMethods> {
    constructor(provider: HttpProvider, options: BridgeOptions) {
        super(provider, options);

        this.methods.seqno = () => {
            return {
                call: async () => {
                    const address = await this.getAddress();
                    let n = null;
                    try {
                        n = (await provider.call2(address.toString(), 'seqno')).toNumber();
                    } catch (e) {
                    }
                    return n;
                }
            }
        }
        this.methods.getGroupKey = this.getGroupKey
    }

    getGroupKey = async () => {
        const address = await this.getAddress();
        const result = await this.provider.call2(address.toString(), 'get_group_key');
        return result
    }
}
