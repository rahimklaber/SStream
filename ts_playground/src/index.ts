import {Account, Address, Contract, Keypair, Networks, Server, TransactionBuilder, xdr} from "soroban-client";
import {IStream, Stream} from "./types";
import {fromXdr} from "./xdrHelpers";
import {sleep} from "@antfu/utils";

let server = new Server(" https://rpc-futurenet.stellar.org")
const contractId = "60f3b5882643e2af016c6e2ef50b54130c12a65c2ba4ebace7dd1e3416a40db0"
const contract = new Contract(contractId)
//GBT2BOJTKZ5YA6BS2OR2GFFCXHP2YXGLSFYLZTPZC5UXWUX33AGGGVPA
const keypair = Keypair.fromSecret("SC2YJ45OHIKGMHBB77V2KKV2JYLVT5UMAD6GSXNI7WLTX5F2LHWYAEMO")
// const account = await server.getAccount(keypair.publicKey())


async function getStream(streamId: number){
    let transaction = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: Networks.FUTURENET
    })
        .addOperation(
            contract.call("get_stream", xdr.ScVal.scvU64(xdr.Uint64.fromString(streamId.toString())))
        )
        .setTimeout(30)
        .build()

    let result = await server.simulateTransaction(transaction)
    if (result.results) {
        let scval = xdr.ScVal.fromXDR(result.results[0].xdr, "base64")
        return fromXdr(scval)
    }
    return null
}

async function createStream(stream: Stream, from: Keypair){
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
    transaction = await server.prepareTransaction(transaction)

    transaction.sign(from)

    let result = await server.sendTransaction(transaction)
    console.log(result)

}
//GCXD4OKBA5ZPTRGXTRYVX7GWQ2SIHBHNFTI7ZBPKD5Z6SOCY5AWCST6R
let secondKeyPair = Keypair.fromSecret("SBW46VNPGIEA25TNVVID6AUCRL2KO27ANF2RUNO5Y5KF24TLH6TYATM5")

let stream = new Stream(
    {
        able_stop: true,
        amount: 1000000000n,
        start_time: Math.floor(Date.now() / 1000),
        end_time: Math.floor(Date.now() / 1000) + 100000000,
        from: Address.fromString(keypair.publicKey()),
        to: Address.fromString(secondKeyPair.publicKey()),
        amount_per_second: 10,
        token_id:  Buffer.alloc(32,"d93f5c7bb0ebc4a9c8f727c5cebc4e41194d38257e1d0d910356b43bfc528813", "hex")
    }
)

// console.log(`${stream.toXdr().map()}`)
// console.log(Stream.fromXdr(stream.toXdr()))
//
// await createStream(stream, keypair)
//
// await server.getTransaction("b8fb1258cf21cca02326e833312586448e8e0b3a0bf5b3af960898b16bc9d7e9")
//     .then((r) => console.log(r))




interface IStreamAndData{
    stream: IStream,
    data : {
        a_withdraw: bigint,
        cancelled: boolean
    }
}

// await createStream(stream, keypair)
// console.log(await getStream(0))
// while (true){
//     let streamFromRpc: IStreamAndData = await getStream(0)
//     let secondsFromStart = Math.floor(Date.now()/1000 - streamFromRpc.stream.start_time)
//     let hoursFromStart = secondsFromStart / 3600
//     let amountClaimable = BigInt(secondsFromStart * stream.amount_per_second) - streamFromRpc.data.a_withdraw
//     console.log(`hours from start: ${hoursFromStart}, claimable: ${amountClaimable}`)
//     await sleep(10000)
// }

console.log(Address.contract(Buffer.alloc(32, "d93f5c7bb0ebc4a9c8f727c5cebc4e41194d38257e1d0d910356b43bfc528813", "hex")).toString());