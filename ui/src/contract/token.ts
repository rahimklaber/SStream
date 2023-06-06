import { Networks, TransactionBuilder, xdr } from "soroban-client"
import { contract, sorobanClient, tokenContract } from "./config"
import { fromXdr } from "./xdrHelpers"

export async function getTokenSymbol(accountId: string){
    let account = await sorobanClient.getAccount(accountId)
    let transaction = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: Networks.FUTURENET
    })
        .addOperation(
            tokenContract.call("name")
        )
        .setTimeout(30)
        .build()


    let result = await sorobanClient.simulateTransaction(transaction)
    if (result.results) {
        let scval = xdr.ScVal.fromXDR(result.results[0].xdr, "base64")
        let decodedval = fromXdr(scval).toString("ascii")
        return decodedval == "native" ? "xlm" : decodedval
    }
    return null
}