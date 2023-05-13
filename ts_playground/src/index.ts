import {Account, Address, Contract, Keypair, Networks, Server, TransactionBuilder, xdr} from "soroban-client";
import {IStream, Stream} from "./types";
import {fromXdr} from "./xdrHelpers";

let server = new Server(" https://rpc-futurenet.stellar.org")
const contractId = "c01363d593be6c7314d4955a38bf5af9876ba89c716dc772c5ebd4d09ad2bc30"
const contract = new Contract(contractId)
//GBT2BOJTKZ5YA6BS2OR2GFFCXHP2YXGLSFYLZTPZC5UXWUX33AGGGVPA
const keypair = Keypair.fromSecret("SC2YJ45OHIKGMHBB77V2KKV2JYLVT5UMAD6GSXNI7WLTX5F2LHWYAEMO")
const account = await server.getAccount(keypair.publicKey())

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
    console.log(result)
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
            contract.call("c_stream", stream.toXdr())
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
        start_time: 1683322114,
        end_time: 1683401314,
        from: Address.fromString(keypair.publicKey()),
        to: Address.fromString(secondKeyPair.publicKey()),
        tick_time: 10,
        token_id:  Buffer.alloc(32,"d98fc10ef20b3291ceb69d3170fa7965e98c67ad81983ce6d326cfbe56dfd20a", "hex")
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


// console.log(await getStream(0))
// while (true){
//     let streamFromRpc: IStreamAndData = await getStream(0)
//     let secondsFromStart = Date.now()/1000 - streamFromRpc.stream.start_time
//     let hoursFromStart = secondsFromStart / 3600
//     let amountPerTick = Math.floor((streamFromRpc.stream.end_time - streamFromRpc.stream.start_time) / streamFromRpc.stream.tick_time)
//     let amountClaimable = BigInt(Math.floor(secondsFromStart / streamFromRpc.stream.tick_time) * amountPerTick) - streamFromRpc.data.a_withdraw
//     console.log(hoursFromStart)
//     console.log(amountClaimable)
//     console.log(streamFromRpc.stream.amount - amountClaimable)
//     await sleep(1000)
// }