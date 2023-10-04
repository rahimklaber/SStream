import { createStore } from "solid-js/store";
import {Stream} from "../../ts_bindings";
import { Address, xdr } from "soroban-client";
import { accountId, isConnected } from "./Connect";
import { tokenId } from "../contract/config";
import { createStream } from "../contract/wrapper";
import { Card } from "solid-bootstrap";
import { waitForTx } from "../contract/rpcHelpers";
import { Show, createSignal } from "solid-js";
import { fromXdr } from "../contract/xdrHelpers";
import Decimal from "decimal.js";

export default function CreateStream() {
    const [fields, setFields] = createStore({
        recipient: "",
        amount: new Decimal(0),
        amount_per_second: new Decimal(0),
        end_time: 0,
        cancellable: false
    });

    const [loading, setLoading] = createSignal(false)
    const [txResult, setTxResult] = createSignal(null)
    const [done, setDone] = createSignal(false)

    async function createStreamAction() {
        console.log(fields)
        let start_time = Math.floor(Date.now() / 1000)
        let time_to_complete = Math.ceil(fields.amount.div(fields.amount_per_second).toNumber())
        let end_time = start_time + time_to_complete
        const stream: Stream =
            {
                amount_per_second: fields.amount_per_second.mul(10000000),
                amount: BigInt(fields.amount.mul(10000000).toNumber()),
                end_time: end_time,
                start_time: Math.floor(Date.now() / 1000),
                from: Address.fromString(accountId()),
                able_stop: fields.cancellable,
                token_id: tokenId,
                to: Address.fromString(fields.recipient)
            }
        console.log(stream);
        setLoading(true)
        let submitResult = await createStream(stream, accountId())
        let success = await waitForTx(submitResult.hash)
        if (success != null) {
            let responseXdr = xdr.TransactionResult.fromXDR(success.resultXdr, "base64")
            let scval = responseXdr.result().results()[0].tr().invokeHostFunctionResult().success()[0]
            console.log(fromXdr(scval))
            setTxResult(fromXdr(scval))
        } else {
            setTxResult("failed")
        }
        setLoading(false)
        setDone(true)
    }


    return (

        <Card class="m-auto min-w-25  w-fit mt-5">

            <Card.Title class="m-auto">
                Create Stream
            </Card.Title>
            <Card.Body class="m-auto">
                <label>
                    Stream recipient
                </label>
                <div class="input-group mb-1">
                    <input onInput={(e) => setFields("recipient", e.target.value)} type="text" placeholder="Recipient" />
                </div>
                <div>
                    Stream amount
                </div>
                <div class="input-group mb-1">
                    <input onInput={(e) => setFields("amount", new Decimal(e.target.value))} type="number" />
                </div>
                <label>
                    Amount per second
                </label>
                <div class="input-group mb-1">
                    <input onInput={(e) => setFields("amount_per_second", new Decimal(e.target.value))} type="number" />
                </div>


                <div>
                    <label>
                        Cancellable
                    </label>
                    <input class="mx-1" onInput={(e) => setFields("cancellable", !fields.cancellable)} type="checkbox" />
                </div>
                <button disabled={!isConnected()} class={"m-1"} onclick={createStreamAction}>
                    Create
                </button>
                <Show
                    when={loading()}
                    fallback=""
                >
                    loading...
                </Show>
                <Show
                    when={done()}
                    fallback=""
                >
                    result: {JSON.stringify(txResult())}
                </Show>
            </Card.Body>
        </Card>

    )
}
