import {Address, xdr} from "soroban-client";
import {fromXdr} from "./xdrHelpers";

export interface IStream{
    from: Address
    to: Address
    amount: bigint,
    start_time: number,
    end_time: number,
    tick_time: number,
    token_id: Buffer,
    able_stop: boolean
}

export class Stream implements IStream{
    able_stop: boolean;
    amount: bigint;
    end_time: number;
    from: Address;
    start_time: number;
    tick_time: number;
    to: Address;
    token_id: Buffer;

    constructor(args: IStream) {
        this.able_stop = args.able_stop;
        this.amount = args.amount;
        this.end_time = args.end_time;
        this.from = args.from;
        this.start_time = args.start_time;
        this.tick_time = args.tick_time;
        this.to = args.to;
        this.token_id = args.token_id;
    }

    toXdr(){
        return xdr.ScVal.scvMap(
            [
                new xdr.ScMapEntry({key: xdr.ScVal.scvSymbol("able_stop"), val: xdr.ScVal.scvBool(this.able_stop)}),
                new xdr.ScMapEntry({key: xdr.ScVal.scvSymbol("amount"), val: xdr.ScVal.scvI128(new xdr.Int128Parts({lo: xdr.Uint64.fromString(this.amount.toString()), hi: xdr.Uint64.fromString("0")}))}), // todo
                new xdr.ScMapEntry({key: xdr.ScVal.scvSymbol("end_time"), val: xdr.ScVal.scvU64(xdr.Uint64.fromString(this.end_time.toString()))}),
                new xdr.ScMapEntry({key: xdr.ScVal.scvSymbol("from"), val: this.from.toScVal()}),
                new xdr.ScMapEntry({key: xdr.ScVal.scvSymbol("start_time"), val: xdr.ScVal.scvU64(xdr.Uint64.fromString(this.start_time.toString()))}),
                new xdr.ScMapEntry({key: xdr.ScVal.scvSymbol("tick_time"), val: xdr.ScVal.scvU64(xdr.Uint64.fromString(this.tick_time.toString()))}),
                new xdr.ScMapEntry({key: xdr.ScVal.scvSymbol("to"), val: this.to.toScVal()}),
                new xdr.ScMapEntry({key: xdr.ScVal.scvSymbol("token_id"), val: xdr.ScVal.scvBytes(this.token_id)}),

            ]
        )
    }

    static fromXdr(scVal: xdr.ScVal){
        let map = scVal.map()!!

        let args = {}
        map.forEach((entry) => {
            // @ts-ignore
            args[fromXdr(entry.key())] = fromXdr(entry.val())
        })


        // @ts-ignore
        return new Stream(args)
    }
}