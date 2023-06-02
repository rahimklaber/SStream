import { SorobanRpc } from "soroban-client";
import { sorobanClient } from "./config";

export async function waitForTx(hash: string): Promise<SorobanRpc.GetTransactionResponse | null> {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(`waiting for ${hash}`)
        let response = await sorobanClient
            .getTransaction(hash)
        console.log(response.status)
        if (response.status == "SUCCESS") {
            return response
        }
        if (response.status == "FAILED") {
            return null
        }

    }
}