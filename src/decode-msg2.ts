import BN from 'bn.js';
import * as dotenv from 'dotenv'
import TonWeb from "tonweb";

dotenv.config()

const provider = new TonWeb.HttpProvider(process.env.TONCENTER_RPC_URL, { apiKey: process.env.TONCENTER_API_KEY })
const tonWeb = new TonWeb(provider);

const Cell = TonWeb.boc.Cell;

(async () => {
    const txns = await tonWeb.getTransactions("EQCQ0m0_ihQpQ-LTN-9Ol6bjk1mr3dNI9Ld0S_OnZ3_JvgLF")
    txns.map((txn: any) => {
        if (txn.out_msgs.length) { // outgoing message
            const msg = txn.out_msgs[0]
            const msgData = msg['msg_data']
            if (msgData['@type'] == 'msg.dataRaw') {
                const msgBody = msgData['body']
                const cell = Cell.oneFromBoc(new Uint8Array(Buffer.from(msgBody, 'base64')))
                if (cell.bits.length >= 32) {
                    const opcode = cell.bits.readUint(32)
                    if (opcode.eq(new BN('5fcc3d14', 16))) {
                        console.log(cell)
                        const queryId = cell.bits.readUint(64)
                        console.log("Query ID:", queryId)
                        const isAddressNone = cell.bits.readUint(2)
                        if (isAddressNone.eq(new BN(0))) {
                            console.log("Null address")
                        } else {
                            const anyCast = cell.bits.readUint(1)
                            console.log(anyCast)
                            const workchainId = cell.bits.readInt(8)
                            console.log("Workchain:", workchainId)
                            const hashpart = cell.bits.readBits(256)
                            console.log("Address hash:", hashpart) // hash of target address
                            // check if target address is burner or bridge
                            // if target is burner, then withdraw, else freeze
                        }
                        const nftMsg = cell.refs[0]
                        const chainNonce = nftMsg.bits.readUint(8)
                        console.log("Chain Nonce:", chainNonce)
                        // const toLength = nftMsg.bits.readUint(16)
                        // console.log("Length of TO:", toLength)
                        // const to = nftMsg.bits.readUint(toLength.toNumber())
                        // console.log("To:", to)
                        // read other bytes
                    }
                }
            } else {
                console.log("no raw message")
            }
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
            }
        }
    })
})().catch(e => console.log(e))