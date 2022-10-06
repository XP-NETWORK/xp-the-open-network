import BN from 'bn.js';
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";
import * as tonMnemonic from 'tonweb-mnemonic'
import { BridgeContract } from './contracts';

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);
const enc = new TextEncoder();

const Cell = TonWeb.boc.Cell;

(async () => {
    const txns = await tonWeb.getTransactions(process.env.BRIDGE_ADDRESS!)
    txns.map((txn: any) => {
        if (txn.out_msgs.length) { // outgoing message
            const msg = txn.out_msgs[0]
        } else { // incoming message
            const msg = txn.in_msg
            const msgData = msg['msg_data']
            if (msgData['@type'] == 'msg.dataRaw') {
                const msgBody = msgData['body']
                const cell = Cell.oneFromBoc(new Uint8Array(Buffer.from(msgBody, 'base64')))
                if (cell.bits.length >= 32) { // call bridge from BridgeContract class
                    const opcode = cell.bits.readUint(32)
                    if (opcode.eq(new BN(6))) {
                        console.log("change public key")
                    } else if (opcode.eq(new BN(7))) {
                        console.log("whitelist")
                    } else if (opcode.eq(new BN('3576854235'))) {
                        console.log('withdraw nft')
                        const queryId = cell.bits.readUint(64)
                        console.log("Query ID:", queryId)
                        console.log("Source:", msg["source"])
                    }
                } else { // call bridge from others
                    // console.log(cell)
                }
            } else { // can't build cell
                const msgBody = msgData['text']
            }
        }
    })
})().catch(e => console.log(e))