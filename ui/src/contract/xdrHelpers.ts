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
            return Address.account(scVal.address().accountId().value())
        case xdr.ScValType.scvBytes():
            return scVal.bytes()
        case xdr.ScValType.scvI128():
            return BigInt(scVal.i128().lo().low)
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