import TonWeb, { Cell, ContractMethods, ContractOptions, Method } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";
import { AddressType } from "tonweb/dist/types/utils/address";
import BN from 'bn.js'
import nacl from "tweetnacl";

const Contract = TonWeb.Contract;
const Address = TonWeb.Address;

declare type TransferMethod = ((params: TransferMethodParams) => Method);

interface TransferMethodParams {
    secretKey: Uint8Array;
    toAddress: AddressType;
    amount: (BN | number);
    seqno: number;
    payload?: (string | Uint8Array | Cell);
    sendMode?: number;
    stateInit?: Cell;
}

declare type SeqnoMethod = (() => SeqnoMethodResult);

interface SeqnoMethodResult {
    call: () => Promise<number>;
}

interface BridgeOptions extends ContractOptions {
    publicKey?: Uint8Array;
}
interface BridgeMethods extends ContractMethods {
    transfer: TransferMethod;
    seqno: SeqnoMethod;

    helloWorld: () => Promise<any>;
}

export class BridgeContract extends Contract<BridgeOptions, BridgeMethods> {
    constructor(provider: HttpProvider, options: BridgeOptions) {
        if (!options.publicKey && !options.address) throw new Error('WalletContract required publicKey or address in options')
        super(provider, options);

        this.methods.transfer = (params) => Contract.createMethod(provider, this.createTransferMessage(params.secretKey, params.toAddress, params.amount, params.seqno, params.payload, params.sendMode, !Boolean(params.secretKey), params.stateInit));
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

        this.methods.helloWorld = this.helloWorld;
    }

    deploy = (secretKey: Uint8Array) => Contract.createMethod(this.provider, this.createInitExternalMessage(secretKey));

    createInitExternalMessage = async (secretKey: Uint8Array) => {
        if (!this.options.publicKey) {
            const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey)
            this.options.publicKey = keyPair.publicKey;
        }
        const { stateInit, address, code, data } = await this.createStateInit();

        const signingMessage = this.createSigningMessage();
        const signature = nacl.sign.detached(await signingMessage.hash(), secretKey);

        const body = new Cell();
        body.bits.writeBytes(signature);
        body.writeCell(signingMessage);

        const header = Contract.createExternalMessageHeader(address);
        const externalMessage = Contract.createCommonMsgInfo(header, stateInit, body);

        return {
            address: address,
            message: externalMessage,

            body,
            signingMessage,
            stateInit,
            code,
            data,
        };
    }

    protected createExternalMessage = async (
        signingMessage: Cell,
        secretKey: Uint8Array,
        seqno: number,
        dummySignature = false
    ) => {
        const signature = dummySignature ? new Uint8Array(64) : nacl.sign.detached(await signingMessage.hash(), secretKey);

        const body = new TonWeb.boc.Cell();
        body.bits.writeBytes(signature);
        body.writeCell(signingMessage);

        let stateInit = undefined, code = undefined, data = undefined;

        if (seqno === 0) {
            if (!this.options.publicKey) {
                const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey)
                this.options.publicKey = keyPair.publicKey;
            }
            const deploy = await this.createStateInit();
            stateInit = deploy.stateInit;
            code = deploy.code;
            data = deploy.data;
        }

        const selfAddress = await this.getAddress();
        const header = Contract.createExternalMessageHeader(selfAddress);
        const resultMessage = Contract.createCommonMsgInfo(header, stateInit, body);

        return {
            address: selfAddress,
            message: resultMessage, // old wallet_send_generate_external_message

            body: body,
            signature: signature,
            signingMessage: signingMessage,

            stateInit,
            code,
            data,
        };
    }

    protected createSigningMessage = (seqno?: number) => {
        seqno = seqno || 0;
        const cell = new TonWeb.boc.Cell();
        cell.bits.writeUint(seqno, 32);
        return cell;
    }

    createTransferMessage = async (
        secretKey: Uint8Array,
        address: AddressType,
        amount: string | number | Uint8Array | BN | number[] | Buffer,
        seqno: any,
        payload: string | Uint8Array | Cell | undefined = "",
        sendMode = 3,
        dummySignature?: boolean,
        stateInit?: Cell | undefined
    ) => {
        let payloadCell = new TonWeb.boc.Cell();
        if (payload) {
            if (payload instanceof TonWeb.boc.Cell) { // is Cell
                if (payload.refs) {
                    payloadCell = payload;
                }
            } else if (typeof payload === 'string') {
                if (payload.length > 0) {
                    payloadCell.bits.writeUint(0, 32);
                    payloadCell.bits.writeString(payload);
                }
            } else {
                payloadCell.bits.writeBytes(payload)
            }
        }

        const orderHeader = Contract.createInternalMessageHeader(new Address(address), new BN(amount));
        const order = Contract.createCommonMsgInfo(orderHeader, stateInit, payloadCell);
        const signingMessage = this.createSigningMessage(seqno);
        signingMessage.bits.writeUint8(sendMode);
        signingMessage.refs.push(order);

        return this.createExternalMessage(signingMessage, secretKey, seqno, dummySignature);
    }

    // Get Methods

    helloWorld = async () => {
        const myAddress = await this.getAddress()
        const result = await this.provider.call2(myAddress.toString(), 'hello_world');
        const dec = new TextDecoder()
        return dec.decode(Buffer.from(result.toArray()))
    }
}