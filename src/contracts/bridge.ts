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
    getActionId: () => Promise<BN>;
}

interface MintBodyParams {
    itemIndex: number | BN;
    amountToCollection: number | BN;
    amountToItem: number | BN;
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

interface WithdrawParams {
    chainNonce: number;
    to: Uint8Array
}

interface FreezeParams {
    chainNonce: number;
    to: Uint8Array;
    amount?: number | BN;
}

interface UpdateParams {
    actionId: number | BN;
    newGroupKey: Uint8Array;
}

interface WithdrawFeeParams {
    actionId: number | BN;
}

interface WhitelistParams {
    actionId: number | BN;
    collection: Address;
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
                        console.log(e)
                    }
                    return n;
                }
            }
        }
        this.methods.getPublicKey = this.getPublicKey
        this.methods.isInitialized = this.isInitialized
        this.methods.getActionId = this.getActionId
    }

    serializeUri(uri: string): Uint8Array {
        return new TextEncoder().encode(encodeURI(uri));
    }

    async createSetupBody() {
        const publicKey = await ed.getPublicKey(this.options.ed25519PrivateKey);

        const body = new TonWeb.boc.Cell()
        body.bits.writeUint(0, 32)
        body.bits.writeUint(new BN(publicKey), 256)
        return body
    }

    async createMintBody(params: MintBodyParams) {
        const body = new Cell();
        body.bits.writeUint(1, 32); // OP validate_transfer_nft

        const msg = new Cell();
        msg.bits.writeUint(params.actionId, 32);
        msg.bits.writeUint(params.itemIndex, 64);
        msg.bits.writeCoins(params.amountToCollection);
        msg.bits.writeCoins(params.amountToItem);
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

    async createWithdrawBody(params: WithdrawParams) {
        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(new TonWeb.Address("kQD12nXLsUqUthWhFiZWsJvaV1NulF-R6piCJtns382mncPb")); // target address
        cell.bits.writeAddress(await this.getAddress()); // bridge as response address
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(new BN(0)); // forward amount
        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell

        const msg = new Cell()
        msg.bits.writeUint(params.chainNonce, 8);
        msg.bits.writeBytes(params.to);
        cell.refs[0] = msg;
        
        return cell;
    }

    async createUnfreezeBody(params: UnfreezeParams) {
        const body = new Cell();
        body.bits.writeUint(2, 32); // OP validate_unfreeze_nft

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

    async createFreezeBody(params: FreezeParams) {
        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(await this.getAddress()); // target address
        cell.bits.writeAddress(undefined); // undefined as response address
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(params.amount || new BN(0));
        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell

        cell.bits.writeUint(params.chainNonce, 8);
        cell.bits.writeBytes(params.to);

        return cell;
    }

    async createUpdateBody(params: UpdateParams) {
        const body = new Cell();
        body.bits.writeUint(6, 32);

        const msg = new Cell()
        msg.bits.writeUint(params.actionId, 32)
        msg.bits.writeUint(new BN(params.newGroupKey), 256)

        const msgHashArray = await msg.hash()
        const sigArray = await ed.sign(msgHashArray, this.options.ed25519PrivateKey)
        const publicKey = await ed.getPublicKey(this.options.ed25519PrivateKey)
        const isValid = await ed.verify(sigArray, msgHashArray, publicKey)
        if (!isValid) {
            throw new Error("invalid signature")
        }

        const signature = new TonWeb.boc.Cell()
        signature.bits.writeBytes(sigArray)

        body.refs[0] = msg
        body.refs[1] = signature
        return body;
    }

    async createWithdrawFeeBody(params: WithdrawFeeParams) {
        const body = new Cell();
        body.bits.writeUint(5, 32);

        const msg = new Cell()
        msg.bits.writeUint(params.actionId, 32)

        const msgHashArray = await msg.hash()
        const sigArray = await ed.sign(msgHashArray, this.options.ed25519PrivateKey)
        const publicKey = await ed.getPublicKey(this.options.ed25519PrivateKey)
        const isValid = await ed.verify(sigArray, msgHashArray, publicKey)
        if (!isValid) {
            throw new Error("invalid signature")
        }

        const signature = new TonWeb.boc.Cell()
        signature.bits.writeBytes(sigArray)

        body.refs[0] = msg
        body.refs[1] = signature
        return body;
    }

    async createWhitelistBody(params: WhitelistParams) {
        const body = new Cell();
        body.bits.writeUint(7, 32);

        const msg = new Cell()
        msg.bits.writeUint(params.actionId, 32)
        msg.bits.writeAddress(params.collection)

        const msgHashArray = await msg.hash()
        const sigArray = await ed.sign(msgHashArray, this.options.ed25519PrivateKey)
        const publicKey = await ed.getPublicKey(this.options.ed25519PrivateKey)
        const isValid = await ed.verify(sigArray, msgHashArray, publicKey)
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

    getActionId = async () => {
        const address = await this.getAddress();
        const result = await this.provider.call2(address.toString(), 'get_action_id');
        return result
    }

    getWhitelist = async () => {
        const address = await this.getAddress();
        const result = await this.provider.call2(address.toString(), 'get_whitelist');
        return result
    }
}
