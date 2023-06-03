import {Networks, TransactionBuilder, xdr} from "soroban-client";
import {IStreamAndData, Stream} from "./types";
import {contract, sorobanClient} from "./config";
import {fromXdr} from "./xdrHelpers";
import {sign} from "../components/Connect";

export async function getStream(accountId: string, streamId: number): Promise<IStreamAndData | null>{
    let account = await sorobanClient.getAccount(accountId)
    let transaction = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: Networks.FUTURENET
    })
        .addOperation(
            contract.call("get_stream", xdr.ScVal.scvU64(xdr.Uint64.fromString(streamId.toString())))
        )
        .setTimeout(30)
        .build()


    let result = await sorobanClient.simulateTransaction(transaction)
    if (result.results) {
        let scval = xdr.ScVal.fromXDR(result.results[0].xdr, "base64")
        return fromXdr(scval)
    }
    return null
}

export async function createStream(stream: Stream, accountID: string){
    let account = await sorobanClient.getAccount(accountID)
    let transaction = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: Networks.FUTURENET
    })
        .addOperation(
            contract.call("create_stream", stream.toXdr())
        )
        .setTimeout(30)
        .build()

    // @ts-ignore
    transaction = await sorobanClient.prepareTransaction(transaction)

    transaction = await sign(transaction)

    let result = await sorobanClient.sendTransaction(transaction)
    
    return result
}

export async function withdrawStream(streamId: number, accountID: string){
    let account = await sorobanClient.getAccount(accountID)
    let transaction = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: Networks.FUTURENET
    })
        .addOperation(
            contract.call("withdraw_stream", xdr.ScVal.scvU64(xdr.Uint64.fromString(streamId.toString())))
        )
        .setTimeout(30)
        .build()

    // @ts-ignore
    transaction = await sorobanClient.prepareTransaction(transaction)

    transaction = await sign(transaction)

    let result = await sorobanClient.sendTransaction(transaction)
    
    return result
}


export async function cancellStream(streamId: number, accountID: string){
    let account = await sorobanClient.getAccount(accountID)
    let transaction = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: Networks.FUTURENET
    })
        .addOperation(
            contract.call("cancel_stream", xdr.ScVal.scvU64(xdr.Uint64.fromString(streamId.toString())))
        )
        .setTimeout(30)
        .build()

    // @ts-ignore
    transaction = await sorobanClient.prepareTransaction(transaction)

    transaction = await sign(transaction)

    let result = await sorobanClient.sendTransaction(transaction)
    
    return result
}