import { Address, xdr } from "soroban-client";
import { bigIntToI128, fromXdr } from "./xdrHelpers";

export interface IStream {
    from: Address
    to: Address
    amount: bigint,
    start_time: number,
    end_time: number,
    amount_per_second: number,
    token_id: Address,
    able_stop: boolean
}

export interface IStreamAndData {
    stream: IStream,
    data: {
        a_withdraw: bigint,
        cancelled: boolean
    }
}

export class Stream implements IStream {
    able_stop: boolean;
    amount: bigint;
    amount_per_second: number;
    end_time: number;
    from: Address;
    start_time: number;
    to: Address;
    token_id: Address;

    constructor(args: IStream) {
        this.able_stop = args.able_stop;
        this.amount = args.amount;
        this.end_time = args.end_time;
        this.from = args.from;
        this.start_time = args.start_time;
        this.amount_per_second = args.amount_per_second;
        this.to = args.to;
        this.token_id = args.token_id;
    }

    toXdr() {

        // let low = this.amount && 0xffffffffffffffffn


        let amount = bigIntToI128(this.amount)
        console.log(
            amount
        )
        return xdr.ScVal.scvMap(
            [
                new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("able_stop"), val: xdr.ScVal.scvBool(this.able_stop) }),
                new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("amount"), val: amount}), // todo
                new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("amount_per_second"), val: xdr.ScVal.scvU64(xdr.Uint64.fromString(this.amount_per_second.toString())) }),
                new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("end_time"), val: xdr.ScVal.scvU64(xdr.Uint64.fromString(this.end_time.toString())) }),
                new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("from"), val: this.from.toScVal() }),
                new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("start_time"), val: xdr.ScVal.scvU64(xdr.Uint64.fromString(this.start_time.toString())) }),
                new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("to"), val: this.to.toScVal() }),
                new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("token_id"), val: this.token_id.toScVal() }),

            ]
        )
    }

    static fromXdr(scVal: xdr.ScVal) {
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