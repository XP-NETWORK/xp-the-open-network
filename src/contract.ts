import TonWeb, { ContractMethods, ContractOptions } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";

const Contract = TonWeb.Contract;

interface BridgeMethods extends ContractMethods {
    helloWorld: () => Promise<any>;
}

export class BridgeContract extends Contract<ContractOptions, BridgeMethods> {
    constructor(provider: HttpProvider, options: ContractOptions | undefined) {
        super(provider, options);

        this.methods.helloWorld = this.helloWorld;
    }

    helloWorld = async () => {
        const myAddress = await this.getAddress()
        const result = await this.provider.call2(myAddress.toString(), 'hello_world');
        const dec = new TextDecoder()
        return dec.decode(Buffer.from(result.toArray()))
    }
}