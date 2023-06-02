import { createStore } from "solid-js/store";
import { getStream, withdrawStream } from "../contract/wrapper";
import { createSignal, Show } from "solid-js";
import Connect, { accountId } from "../components/Connect";
import { IStreamAndData } from "../contract/types";
import { Button, Card } from "solid-bootstrap";
import "../css/index.css"
import { waitForTx } from "../contract/rpcHelpers";
import { xdr } from "soroban-client";
import { fromXdr } from "../contract/xdrHelpers";
export default function GetStream() {
    const [stream, setStream] = createSignal<IStreamAndData | null>(null)
    const [streamId, setStreamId] = createSignal(null)

    const [loading, setLoading] = createSignal(false)
    const [txResult, setTxResult] = createSignal(null)
    const [done, setDone] = createSignal(false)

    async function retrieveStream(id: number) {
        console.log(id)
        getStream(accountId(), id)
            .then((result) => setStream(result))
    }

    function calcAmountWithdrawable(data: IStreamAndData) : bigint{
        let start_time = data.stream.start_time
        let end_time = data.stream.end_time
        let cur_time = Math.floor(Date.now() / 1000)
        
        if(cur_time > end_time){
            return data.stream.amount - data.data.a_withdraw
        }

        let time_elapsed = cur_time - start_time
        let max_withdrawable = BigInt(data.stream.amount_per_second) * BigInt(time_elapsed)
        return max_withdrawable - data.data.a_withdraw  

    }

    return (
        <Card class={"m-auto max-w-50 min-w-25 w-fit"}>
            <Card.Title class="m-auto">
                Lookup Stream
            </Card.Title>
            <Card.Body class="m-auto">
                <input type={"text"} oninput={(e) => setStreamId(parseInt(e.target.value))} placeholder="Stream id"></input>
                <button disabled={streamId() == null || accountId() == null} onClick={() => {
                    retrieveStream(streamId())
                    setLoading(false)
                    setDone(false)
                }
                }>
                    Get details
                </button>
                <pre class={"m-2"}>
                    <Show
                        when={stream() != null}
                        fallback={(
                            <div>
                            </div>
                        )}
                    >
                        <div class={"d-flex flex-column"}>
                            <span>from : {stream()?.stream.from.toString()}</span>
                            <span>to : {stream()?.stream.to.toString()}</span>
                            <span>amount: {stream()?.stream.amount.toString()}</span>
                            <span>amount withdrawable: {calcAmountWithdrawable(stream()).toString()}</span>
                            
                            <button class="w-fit" onclick={async () => {
                                setLoading(true)
                                let submitResult = await withdrawStream(streamId()!, accountId())
                                    .catch((error) => error)
                                if (!submitResult.status) {
                                    setTxResult(submitResult)
                                    setDone(true)
                                    setLoading(false)
                                    return
                                }
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
                            }}>
                                claim
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
                                withdraw amount: <code>
                                    {JSON.stringify(txResult(), (key, value) =>
                                        typeof value === 'bigint'
                                            ? value.toString()
                                            : value // return everything else unchanged
                                        , '\t').replace(/\\n/g, '\n')}
                                </code>
                            </Show>
                        </div>
                    </Show>

                </pre>
            </Card.Body>
        </Card>
    )
}