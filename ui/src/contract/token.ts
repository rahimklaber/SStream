import { Contract, Networks, TransactionBuilder, xdr } from "soroban-client"
import { contract, sorobanClient, tokenContract } from "./config"
import { fromXdr } from "./xdrHelpers"

const tokenCache: { [hex: string]: string } = {}

export async function getTokenSymbol(accountId: string, tokenHex: string) {
    if (tokenCache[tokenHex]) {
        return tokenCache[tokenHex]
     }

    let contract = new Contract(tokenHex)

    let account = await sorobanClient.getAccount(accountId)
    let transaction = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: Networks.FUTURENET
    })
        .addOperation(
            contract.call("name")
        )
        .setTimeout(30)
        .build()


    let result = await sorobanClient.simulateTransaction(transaction)
    if (result.error) {
        throw result.error
    }
    let scval = xdr.ScVal.fromXDR(result.results[0].xdr, "base64")
    let decodedval = fromXdr(scval).toString("ascii")
    decodedval = decodedval == "native" ? "xlm" : decodedval
    tokenCache[tokenHex] = decodedval
    return decodedval
}