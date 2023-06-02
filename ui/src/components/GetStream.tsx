import {createStore} from "solid-js/store";
import {getStream} from "../contract/wrapper";
import {createSignal, Show} from "solid-js";
import Connect, { accountId } from "../components/Connect";
import {IStreamAndData} from "../contract/types";
import { Card } from "solid-bootstrap";

export default function GetStream() {
    const [stream, setStream] = createSignal<IStreamAndData | null>(null)
    const [streamId, setStreamId] = createSignal()

    async function retrieveStream(id: number) {
        console.log(id)
        getStream(accountId(), id)
            .then((result) => setStream(result))
    }

    return (
        <Card class={"m-auto w-25 "}>
            <Card.Title class="m-auto">
                Lookup Stream
            </Card.Title>
            <Card.Body class="m-auto">
            <input type={"text"} oninput={(e) => setStreamId(parseInt(e.target.value))}></input>
            <button onClick={() => retrieveStream(streamId())}>
                Get details
            </button>
            <pre class={"m-2"}>
                <Show
                when={stream() != null}
                fallback={(
                    <div>
                        loading...??
                    </div>
                )}
                >
                    <div class={"d-flex flex-column"}>
                        <span>from : {stream()?.stream.from.toString()}</span>
                        <span>to : {stream()?.stream.to.toString()}</span>
                        <span>amount: {stream()?.stream.amount.toString()}</span>
                    </div>
                </Show>
           {/*<code>*/}
           {/*     {JSON.stringify(stream(), (key, value) =>*/}
           {/*             typeof value === 'bigint'*/}
           {/*                 ? value.toString()*/}
           {/*                 : value // return everything else unchanged*/}
           {/*         , 2)}*/}
           {/*</code>*/}
        </pre>
            </Card.Body>
        </Card>
    )
}