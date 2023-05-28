import {createSignal, Show} from "solid-js";
import {getPublicKey, signTransaction} from "@stellar/freighter-api";
import {Transaction} from "soroban-client";
import {network, sorobanClient} from "../contract/config";

export const [accountId, setAccountId] = createSignal<string | null>(null)
export async function sign(transaction: Transaction){
    return await signTransaction(
        transaction.toXDR()
        ,{
            networkPassphrase: network()
        }
    ).then((res) => new Transaction(res, network()))
}

export function isConnected(){
    return accountId() != null
}
export default function Connect(){
    return (
        <button class={"btn-primary"} onClick={() => {
            if (accountId() == null){
                getPublicKey().then((res) => setAccountId(res))
            }else{
                setAccountId(null)
            }
        }}>

            <Show
                when={accountId() != null}
                fallback={"Connect"}
            >
                {`${accountId()!.substring(0, 5)}...${accountId()!.substring(accountId()!.length - 5, accountId()!.length)}`}
            </Show>
        </button>
    )
}