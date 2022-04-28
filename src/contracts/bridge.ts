import * as ed from "@noble/ed25519";
import BN from "bn.js";
import TonWeb, { ContractMethods, ContractOptions } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";
import { Address } from "tonweb/dist/types/utils/address";

const Contract = TonWeb.Contract;
const Cell = TonWeb.boc.Cell;

declare type SeqnoMethod = (() => SeqnoMethodResult);

interface SeqnoMethodResult {
    call: () => Promise<number>;
}

interface BridgeOptions extends ContractOptions {
    ed25519PrivateKey: Buffer
}
interface BridgeMethods extends ContractMethods {
    seqno: SeqnoMethod;
    getPublicKey: () => Promise<BN>;
    isInitialized: () => Promise<BN>;
}

interface MintBodyParams {
    itemIndex: number | BN;
    amount: number | BN;
    mintWith: Address;
    to: Address;
    contentUri: string;
    actionId: number | BN;
}

interface UnfreezeParams {
    actionId: number | BN;
    amount: number | BN;
    itemAddress: Address;
    to: Address;
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
        this.methods.getPublicKey = this.getPublicKey
        this.methods.isInitialized = this.isInitialized
    }

    serializeUri(uri: string): Uint8Array {
        return new TextEncoder().encode(encodeURI(uri));
    }

    async createSetupBody() {
        const publicKey = await ed.getPublicKey(this.options.ed25519PrivateKey);

        const body = new TonWeb.boc.Cell()
        body.bits.writeUint(0, 8)
        body.bits.writeUint(new BN(publicKey), 256)
        return body
    }

    async createMintBody(params: MintBodyParams) {
        const body = new Cell();
        body.bits.writeUint(1, 8); // OP validate_transfer_nft

        const msg = new Cell();
        msg.bits.writeUint(params.actionId, 32);
        msg.bits.writeUint(params.itemIndex, 64);
        msg.bits.writeCoins(params.amount);
        msg.bits.writeAddress(await this.getAddress())
        msg.bits.writeAddress(params.mintWith)

        const nftItemContent = new Cell();
        nftItemContent.bits.writeAddress(params.to);

        const uriContent = new Cell();
        uriContent.bits.writeBytes(this.serializeUri(params.contentUri));
        nftItemContent.refs[0] = uriContent;

        msg.refs[0] = nftItemContent;

        const msgHashArray = await msg.hash()
        const sigArray = await ed.sign(msgHashArray, this.options.ed25519PrivateKey)
        const publicKey = await ed.getPublicKey(this.options.ed25519PrivateKey);
        const isValid = await ed.verify(sigArray, msgHashArray, publicKey);
        if (!isValid) {
            throw new Error("invalid signature")
        }
        const signature = new TonWeb.boc.Cell()
        signature.bits.writeBytes(sigArray)

        body.refs[0] = msg
        body.refs[1] = signature
        return body;
    }

    async createUnfreezeBody(params: UnfreezeParams) {
        const body = new Cell();
        body.bits.writeUint(2, 8); // OP validate_unfreeze_nft

        const msg = new Cell();
        msg.bits.writeUint(params.actionId, 32);
        msg.bits.writeCoins(params.amount);
        msg.bits.writeAddress(await this.getAddress())
        msg.bits.writeAddress(params.itemAddress)
        msg.bits.writeAddress(params.to)

        const msgHash = await msg.hash()
        const sigArray = await ed.sign(msgHash, this.options.ed25519PrivateKey)
        const publicKey = await ed.getPublicKey(this.options.ed25519PrivateKey);
        const isValid = await ed.verify(sigArray, msgHash, publicKey);
        if (!isValid) {
            throw new Error("invalid signature")
        }
        const signature = new TonWeb.boc.Cell()
        signature.bits.writeBytes(sigArray)

        body.refs[0] = msg
        body.refs[1] = signature
        return body;
    }

    getPublicKey = async () => {
        const address = await this.getAddress();
        const result = await this.provider.call2(address.toString(), 'get_public_key');
        return result
    }

    isInitialized = async () => {
        const address = await this.getAddress();
        const result = await this.provider.call2(address.toString(), 'is_initialized');
        return result
    }
}
