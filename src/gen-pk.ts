import * as ed from "@noble/ed25519";

const privateKey = ed.utils.randomPrivateKey()
console.log(Buffer.from(privateKey).toString("hex"))