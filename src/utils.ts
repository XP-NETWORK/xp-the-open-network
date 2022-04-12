import TonWeb, { Cell } from "tonweb";
import { BitString } from "tonweb/dist/types/boc/bit-string";

const Address = TonWeb.Address;

const readIntFromBitString = (bs: BitString, cursor: number, bits: number) => {
    let n = BigInt(0);
    for (let i = 0; i < bits; i++) {
        n *= BigInt(2);
        n += BigInt(bs.get(cursor + i));
    }
    return n;
}

export const parseAddress = (cell: Cell) => {
    let n = readIntFromBitString(cell.bits, 3, 8);
    if (n > BigInt(127)) {
        n = n - BigInt(256);
    }
    const hashPart = readIntFromBitString(cell.bits, 3 + 8, 256);
    if (n.toString(10) + ":" + hashPart.toString(16) === '0:0') return null;
    const s = n.toString(10) + ":" + hashPart.toString(16).padStart(64, '0');
    return new Address(s);
};
