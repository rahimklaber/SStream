import { createStore } from "solid-js/store";
import { Stream } from "../contract/types";
import { Address, xdr } from "soroban-client";
import { accountId, isConnected } from "./Connect";
import { tokenId } from "../contract/config";
import { createStream } from "../contract/wrapper";
import { Card } from "solid-bootstrap";
import { waitForTx } from "../contract/rpcHelpers";
import { Show, createSignal } from "solid-js";
import { fromXdr } from "../contract/xdrHelpers";

export default function CreateStream() {
    const [fields, setFields] = createStore({
        recipient: "",
        amount: BigInt(0),
        amount_per_second: 0,
        end_time: 0,
        cancellable: false
    });

    const [loading, setLoading] = createSignal(false)
    const [txResult, setTxResult] = createSignal(null)
    const [done, setDone] = createSignal(false)
    return (

        <Card class="w-25 m-auto mt-5">
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
                {JSON.stringify(txResult())}
            </Show>
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
                    <input onInput={(e) => setFields("amount", BigInt(e.target.value))} type="number" />
                </div>
                <label>
                    Amount per second
                </label>
                <div class="input-group mb-1">
                    <input onInput={(e) => setFields("amount_per_second", parseInt(e.target.value))} type="number" />
                </div>
                {/* <label>
                    End time
                </label>
                <div class="input-group mb-1">
                    <input onInput={(e) => setFields("end_time", Math.round(Date.parse(e.target.value) / 1000))} type="datetime-local" />
                </div> */}


                <div>
                    <label>
                        Cancellable
                    </label>
                    <input class="mx-1" onInput={(e) => setFields("cancellable", !fields.cancellable)} type="checkbox" />
                </div>
                    <button disabled = {!isConnected()} class={"m-1"} onclick={
                        async () => {
                            console.log(accountId())
                            let start_time = Math.floor(Date.now() / 1000)
                            let time_to_complete = Math.ceil(Number(fields.amount / BigInt(fields.amount_per_second)))
                            let end_time = start_time + time_to_complete
                            const stream = new Stream(
                                {
                                    amount_per_second: fields.amount_per_second,
                                    amount: fields.amount,
                                    end_time: end_time,
                                    start_time: Math.floor(Date.now() / 1000),
                                    from: Address.fromString(accountId()),
                                    able_stop: true,
                                    token_id: tokenId,
                                    to: Address.fromString(fields.recipient)
                                }
                            )
                            window.stream = stream
                            console.log(stream);
                            setLoading(true)
                            let submitResult = await createStream(stream, accountId())
                            let success = await waitForTx(submitResult.hash)
                            if(success != null){
                                let responseXdr = xdr.TransactionResult.fromXDR(success.resultXdr, "base64")
                                let scval = responseXdr.result().results()[0].tr().invokeHostFunctionResult().success()[0]
                                console.log(fromXdr(scval))
                                setTxResult(fromXdr(scval))
                            }else{
                                setTxResult("failed")
                            }
                            setLoading(false)
                            setDone(true)
                            setTimeout(() => {
                                setDone(false)
                            }, 5000);
                        }
                    }>
                        Create
                    </button>
            </Card.Body>
        </Card>

    )
}
