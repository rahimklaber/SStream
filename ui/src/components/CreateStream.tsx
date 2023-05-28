import {createStore} from "solid-js/store";
import {Stream} from "../contract/types";
import {Address} from "soroban-client";
import {accountId} from "./Connect";
import {tokenId} from "../contract/config";
import {createStream} from "../contract/wrapper";

export default function CreateStream(){
    const [fields, setFields] = createStore({
        recipient: "",
        amount: BigInt(0),
        amount_per_second: 0,
        end_time: 0
    });

    return (

        <div>
            <div>
                <div>
                    Recipient
                </div>
                <input onInput={(e) => setFields("recipient", e.target.value) } type="text"/>
            </div>
            <div>
                <div>
                    Amount
                </div>
                <input onInput={(e) => setFields("amount", BigInt(e.target.value)) } type="number"/>
            </div>
            <div>
                <div>
                    Amount per second
                </div>
                <input onInput={(e) => setFields("amount_per_second", parseInt(e.target.value)) } type="number"/>
            </div>
            <div>
                <div>
                    End time: {fields.end_time}
                </div>
                <input onInput={(e) =>  setFields("end_time", Math.round(Date.parse(e.target.value)/1000)) } type="datetime-local"/>
            </div>
            <button class={"m-1"} onclick={
                async ()=> {
                    const stream = new Stream(
                        {
                            amount_per_second: fields.amount_per_second,
                            amount: fields.amount,
                            end_time: fields.end_time,
                            start_time: Math.floor(Date.now() / 1000),
                            from: Address.fromString(accountId()),
                            able_stop: true,
                            token_id: tokenId,
                            to: Address.fromString(fields.recipient)
                        }
                    )
                    await createStream(stream,accountId())
                    console.log(stream);
                }
            }>
                Create
            </button>
        </div>

    )
}
