import { createStore } from "solid-js/store";
import { cancellStream, getStream, withdrawStream } from "../contract/wrapper";
import { createSignal, Show } from "solid-js";
import Connect, { accountId } from "../components/Connect";
import { IStreamAndData } from "../contract/types";
import { Button, Card } from "solid-bootstrap";
import "../css/index.css"
import { waitForTx } from "../contract/rpcHelpers";
import { xdr } from "soroban-client";
import { fromXdr } from "../contract/xdrHelpers";
import { getTokenSymbol } from "../contract/token";
import Decimal from 'decimal.js';
import { tokenContract } from "../contract/config";


export default function GetStream() {
    const [stream, setStream] = createSignal<IStreamAndData | null>(null)
    const [streamId, setStreamId] = createSignal(null)

    const [loading, setLoading] = createSignal(false)
    const [txResult, setTxResult] = createSignal(null)
    const [done, setDone] = createSignal(false)

    const [error, setError] = createSignal(null)

    async function retrieveStream(id: number) {
        console.log(id)
        getStream(accountId(), id)
            .then(async (result) => {
                result.token = { name: await getTokenSymbol(accountId(), tokenContract.contractId()) }
                return result
            })
            .then((res) => {
                setStream(res)
            })
            .catch((err) => setError(err))
    }

    async function claim() {
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
            let amountClaimed : bigint = fromXdr(scval)
            setTxResult(new Decimal(amountClaimed.toString()).div(10000000).toFixed(7))
        } else {
            setTxResult("submission failed")
        }
        setLoading(false)
        setDone(true)
    }

    async function cancell() {
        setLoading(true)
        let submitResult = await cancellStream(streamId()!, accountId())
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
            try {
                let amountReclaimed: bigint = fromXdr(scval)
                setTxResult(new Decimal(amountReclaimed.toString()).div(10000000).toFixed(7))
            } catch {
                setTxResult("")
            }
        } else {
            setTxResult("failed")
        }
        setLoading(false)
        setDone(true)
    }

    function calcAmountWithdrawable(data: IStreamAndData): bigint {
        if (data.data.cancelled) {
            return 0n
        }
        let start_time = data.stream.start_time
        let end_time = data.stream.end_time
        let cur_time = Math.floor(Date.now() / 1000)

        if (cur_time > end_time) {
            return data.stream.amount - data.data.a_withdraw
        }

        let time_elapsed = cur_time - start_time
        let max_withdrawable = BigInt(data.stream.amount_per_second) * BigInt(time_elapsed)
        return max_withdrawable - data.data.a_withdraw

    }

    return (
        <Card class={"m-auto min-w-25 w-fit"}>
            <Card.Title class="m-auto">
                Lookup Stream
            </Card.Title>
            <Card.Body class="m-auto">
                <input type={"text"} oninput={(e) => setStreamId(parseInt(e.target.value))} placeholder="Stream id"></input>
                <button disabled={streamId() == null || accountId() == null} onClick={() => {
                    setLoading(true)
                    setError(null)
                    retrieveStream(streamId())
                    setLoading(false)
                    setDone(false)
                }
                }>
                    Get details
                </button>
                <pre class={"m-2"}>
                    <Show
                        when={stream() != null && error() == null}
                        fallback={(
                            <div>
                                <code>
                                {error()}
                                </code>
                            </div>
                        )}
                    >
                        <div class={"d-flex flex-column"}>
                            <span>from : {stream().stream.from.toString()}</span>
                            <span>to : {stream().stream.to.toString()}</span>
                            <span>token: {stream().stream.token_id.toString()}</span>
                            <span>amount: {(new Decimal((stream().stream.amount.toString())).div(10000000)).toFixed(7)} {stream().token.name}</span>
                            <span>amount withdrawn: {new Decimal(stream().data.a_withdraw.toString()).div(10000000).toFixed(7)} {stream().token.name}</span>
                            <span>amount withdrawable: {(new Decimal(calcAmountWithdrawable(stream()).toString()).div(10000000)).toFixed(7)} {stream().token.name}</span>
                            <span>cancellable : {stream().stream.able_stop.toString()}</span>

                            <div>
                                <button onclick={claim}>
                                    claim
                                </button>
                                <button onclick={cancell}>
                                    cancell
                                </button>
                            </div>
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
                                withdraw amount: {txResult()} {stream().token.name}
                                
                            </Show>
                        </div>
                    </Show>

                </pre>
            </Card.Body>
        </Card>
    )
}