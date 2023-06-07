import {xdr ,Address } from "soroban-client";

export function fromXdr(scVal: xdr.ScVal): any{
    switch (scVal.switch()){
        case xdr.ScValType.scvBool():
            return scVal.b()
        case xdr.ScValType.scvSymbol():
            return scVal.sym()
        case xdr.ScValType.scvU64():
            return scVal.u64().low
        case xdr.ScValType.scvAddress():
            try {
                return Address.account(scVal.address().accountId().value())
            } catch (error) {
                return Address.contract(scVal.address().contractId())
            }
        case xdr.ScValType.scvBytes():
            return scVal.bytes()
        case xdr.ScValType.scvI128():
            let low = scVal.i128().lo()
            let high = scVal.i128().hi()
            return BigInt(low.low) | (BigInt(low.high) << BigInt(32)) 
        case xdr.ScValType.scvMap():
            return Object.fromEntries(
                scVal.map()!!.map((entry) => {
                    let key = entry.key().sym()
                    return [
                        key, fromXdr(entry.val())
                    ]
                })
            )
        default:
            throw `could not decode ${scVal}`

    }
}

// The functions below are taken from the example dapp
const bigintToBuf = (bn: bigint): Buffer => {
    let hex = BigInt(bn).toString(16).replace(/^-/, "");
    if (hex.length % 2) {
      hex = `0${hex}`;
    }
  
    const len = hex.length / 2;
    const u8 = new Uint8Array(len);
  
    let i = 0;
    let j = 0;
    while (i < len) {
      u8[i] = parseInt(hex.slice(j, j + 2), 16);
      i += 1;
      j += 2;
    }
  
    if (bn < BigInt(0)) {
      // Set the top bit
      u8[0] |= 0x80;
    }
  
    return Buffer.from(u8);
  };
  
  const bigNumberFromBytes = (
    signed: boolean,
    ...bytes: (string | number | bigint)[]
  ): BigInt => {
    let sign = 1;
    if (signed && bytes[0] === 0x80) {
      // top bit is set, negative number.
      sign = -1;
      bytes[0] &= 0x7f;
    }
    let b = BigInt(0);
    for (const byte of bytes) {
      b <<= BigInt(8);
      b |= BigInt(byte);
    }
    return b * BigInt(sign)
  };

export function bigIntToI128 (value: bigint): xdr.ScVal{
    const b: bigint = value;
    const buf = bigintToBuf(b);
    if (buf.length > 16) {
      throw new Error("BigNumber overflows i128");
    }
  
    if (b < 0) {
      // Clear the top bit
      buf[0] &= 0x7f;
    }
  
    // left-pad with zeros up to 16 bytes
    const padded = Buffer.alloc(16);
    buf.copy(padded, padded.length - buf.length);
    console.debug({ value: value.toString(), padded });
  
    if (b < 0) {
      // Set the top bit
      padded[0] |= 0x80;
    }
  
    const hi = new xdr.Int64(
      Number(bigNumberFromBytes(false, ...padded.slice(4, 8))),
      Number(bigNumberFromBytes(false, ...padded.slice(0, 4))),
    );
    const lo = new xdr.Uint64(
      Number(bigNumberFromBytes(false, ...padded.slice(12, 16))),
      Number(bigNumberFromBytes(false, ...padded.slice(8, 12))),
    );
  
    return xdr.ScVal.scvI128(
      new xdr.Int128Parts({ lo, hi }),
    );
  };
