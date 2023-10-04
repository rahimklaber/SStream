import * as SorobanClient from 'soroban-client';
import { ContractSpec, Address } from 'soroban-client';
import { Buffer } from "buffer";
import { invoke } from './invoke.js';
import type { ResponseTypes, Wallet, ClassOptions } from './method-options.js'

export * from './invoke.js'
export * from './method-options.js'

export type u32 = number;
export type i32 = number;
export type u64 = bigint;
export type i64 = bigint;
export type u128 = bigint;
export type i128 = bigint;
export type u256 = bigint;
export type i256 = bigint;
export type Option<T> = T | undefined;
export type Typepoint = bigint;
export type Duration = bigint;
export {Address};

/// Error interface containing the error message
export interface Error_ { message: string };

export interface Result<T, E extends Error_> {
    unwrap(): T,
    unwrapErr(): E,
    isOk(): boolean,
    isErr(): boolean,
};

export class Ok<T, E extends Error_ = Error_> implements Result<T, E> {
    constructor(readonly value: T) { }
    unwrapErr(): E {
        throw new Error('No error');
    }
    unwrap(): T {
        return this.value;
    }

    isOk(): boolean {
        return true;
    }

    isErr(): boolean {
        return !this.isOk()
    }
}

export class Err<E extends Error_ = Error_> implements Result<any, E> {
    constructor(readonly error: E) { }
    unwrapErr(): E {
        return this.error;
    }
    unwrap(): never {
        throw new Error(this.error.message);
    }

    isOk(): boolean {
        return false;
    }

    isErr(): boolean {
        return !this.isOk()
    }
}

if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}

const regex = /Error\(Contract, #(\d+)\)/;

function parseError(message: string): Err | undefined {
    const match = message.match(regex);
    if (!match) {
        return undefined;
    }
    if (Errors === undefined) {
        return undefined;
    }
    let i = parseInt(match[1], 10);
    let err = Errors[i];
    if (err) {
        return new Err(err);
    }
    return undefined;
}

export const networks = {
    futurenet: {
        networkPassphrase: "Test SDF Future Network ; October 2022",
        contractId: "CAI5CVWEYS35EVMFQ7ORODHO5O32R6WAR5WDHQSQ7B4L26A5I4WGFNIV",
    }
} as const

export interface SplitRecipientContract {
  address: Address;
  function: string;
}

export type SplitRecipient = {tag: "User", values: readonly [Address, u64]} | {tag: "Contract", values: readonly [SplitRecipientContract, u64]};

export interface Stream {
  able_stop: boolean;
  amount: i128;
  amount_per_second: u64;
  end_time: u64;
  from: Address;
  recipients: Array<SplitRecipient>;
  start_time: u64;
  to: Address;
  token_id: Address;
}

export interface StreamData {
  a_withdraw: i128;
  aditional_amount: i128;
  cancelled: boolean;
}

export interface StreamWithData {
  data: StreamData;
  stream: Stream;
}

export type DataKey = {tag: "Stream", values: readonly [u64]} | {tag: "StreamId", values: void} | {tag: "StreamData", values: readonly [u64]};

const Errors = {
1: {message:""},
  2: {message:""},
  3: {message:""},
  4: {message:""},
  5: {message:""},
  6: {message:""}
}
export type Events = {tag: "StreamCreated", values: void};


export class Contract {
            spec: ContractSpec;
    constructor(public readonly options: ClassOptions) {
        this.spec = new ContractSpec([
            "AAAAAQAAAAAAAAAAAAAAFlNwbGl0UmVjaXBpZW50Q29udHJhY3QAAAAAAAIAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAIZnVuY3Rpb24AAAAR",
        "AAAAAgAAAAAAAAAAAAAADlNwbGl0UmVjaXBpZW50AAAAAAACAAAAAQAAAAAAAAAEVXNlcgAAAAIAAAATAAAABgAAAAEAAAAAAAAACENvbnRyYWN0AAAAAgAAB9AAAAAWU3BsaXRSZWNpcGllbnRDb250cmFjdAAAAAAABg==",
        "AAAAAQAAAAAAAAAAAAAABlN0cmVhbQAAAAAACQAAAAAAAAAJYWJsZV9zdG9wAAAAAAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAABFhbW91bnRfcGVyX3NlY29uZAAAAAAAAAYAAAAAAAAACGVuZF90aW1lAAAABgAAAAAAAAAEZnJvbQAAABMAAAAAAAAACnJlY2lwaWVudHMAAAAAA+oAAAfQAAAADlNwbGl0UmVjaXBpZW50AAAAAAAAAAAACnN0YXJ0X3RpbWUAAAAAAAYAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAh0b2tlbl9pZAAAABM=",
        "AAAAAQAAAAAAAAAAAAAAClN0cmVhbURhdGEAAAAAAAMAAAAAAAAACmFfd2l0aGRyYXcAAAAAAAsAAAAAAAAAEGFkaXRpb25hbF9hbW91bnQAAAALAAAAAAAAAAljYW5jZWxsZWQAAAAAAAAB",
        "AAAAAQAAAAAAAAAAAAAADlN0cmVhbVdpdGhEYXRhAAAAAAACAAAAAAAAAARkYXRhAAAH0AAAAApTdHJlYW1EYXRhAAAAAAAAAAAABnN0cmVhbQAAAAAH0AAAAAZTdHJlYW0AAA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAABlN0cmVhbQAAAAAAAQAAAAYAAAAAAAAAAAAAAAhTdHJlYW1JZAAAAAEAAAAAAAAAClN0cmVhbURhdGEAAAAAAAEAAAAG",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAAAAAAAAOU3RyZWFtTm90RXhpc3QAAAAAAAEAAAAAAAAADU5vdEF1dGhvcml6ZWQAAAAAAAACAAAAAAAAAA9TdHJlYW1DYW5jZWxsZWQAAAAAAwAAAAAAAAAUU3RyZWFtTm90Q2FuY2VsbGFibGUAAAAEAAAAAAAAAApTdHJlYW1Eb25lAAAAAAAFAAAAAAAAABZTdHJlYW1WYWxpZGF0aW9uRmFpbGVkAAAAAAAG",
        "AAAAAgAAAAAAAAAAAAAABkV2ZW50cwAAAAAAAQAAAAAAAAAAAAAADVN0cmVhbUNyZWF0ZWQAAAA=",
        "AAAAAAAAAAAAAAANY3JlYXRlX3N0cmVhbQAAAAAAAAEAAAAAAAAABnN0cmVhbQAAAAAH0AAAAAZTdHJlYW0AAAAAAAEAAAAG",
        "AAAAAAAAAAAAAAAPd2l0aGRyYXdfc3RyZWFtAAAAAAEAAAAAAAAACXN0cmVhbV9pZAAAAAAAAAYAAAABAAAACw==",
        "AAAAAAAAAAAAAAANY2FuY2VsX3N0cmVhbQAAAAAAAAEAAAAAAAAACXN0cmVhbV9pZAAAAAAAAAYAAAABAAAACw==",
        "AAAAAAAAAAAAAAAKZ2V0X3N0cmVhbQAAAAAAAQAAAAAAAAAJc3RyZWFtX2lkAAAAAAAABgAAAAEAAAfQAAAADlN0cmVhbVdpdGhEYXRhAAA=",
        "AAAAAAAAAAAAAAAGdG9wX3VwAAAAAAACAAAAAAAAAAlzdHJlYW1faWQAAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
        "AAAAAAAAAAAAAAAPdHJhbnNmZXJfc3RyZWFtAAAAAAIAAAAAAAAACXN0cmVhbV9pZAAAAAAAAAYAAAAAAAAADW5ld19yZWNpcGllbnQAAAAAAAATAAAAAA=="
            ]);
    }
    async createStream<R extends ResponseTypes = undefined>({stream}: {stream: Stream}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number
        /**
         * What type of response to return.
         *
         *   - `undefined`, the default, parses the returned XDR as `u64`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
         *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
         *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
         */
        responseType?: R
        /**
         * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
         */
        secondsToWait?: number
    } = {}) {
                    return await invoke({
            method: 'create_stream',
            args: this.spec.funcArgsToScVals("create_stream", {stream}),
            ...options,
            ...this.options,
            parseResultXdr: (xdr): u64 => {
                return this.spec.funcResToNative("create_stream", xdr);
            },
        });
    }


    async withdrawStream<R extends ResponseTypes = undefined>({stream_id}: {stream_id: u64}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number
        /**
         * What type of response to return.
         *
         *   - `undefined`, the default, parses the returned XDR as `i128`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
         *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
         *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
         */
        responseType?: R
        /**
         * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
         */
        secondsToWait?: number
    } = {}) {
                    return await invoke({
            method: 'withdraw_stream',
            args: this.spec.funcArgsToScVals("withdraw_stream", {stream_id}),
            ...options,
            ...this.options,
            parseResultXdr: (xdr): i128 => {
                return this.spec.funcResToNative("withdraw_stream", xdr);
            },
        });
    }


    async cancelStream<R extends ResponseTypes = undefined>({stream_id}: {stream_id: u64}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number
        /**
         * What type of response to return.
         *
         *   - `undefined`, the default, parses the returned XDR as `i128`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
         *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
         *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
         */
        responseType?: R
        /**
         * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
         */
        secondsToWait?: number
    } = {}) {
                    return await invoke({
            method: 'cancel_stream',
            args: this.spec.funcArgsToScVals("cancel_stream", {stream_id}),
            ...options,
            ...this.options,
            parseResultXdr: (xdr): i128 => {
                return this.spec.funcResToNative("cancel_stream", xdr);
            },
        });
    }


    async getStream<R extends ResponseTypes = undefined>({stream_id}: {stream_id: u64}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number
        /**
         * What type of response to return.
         *
         *   - `undefined`, the default, parses the returned XDR as `StreamWithData`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
         *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
         *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
         */
        responseType?: R
        /**
         * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
         */
        secondsToWait?: number
    } = {}) {
                    return await invoke({
            method: 'get_stream',
            args: this.spec.funcArgsToScVals("get_stream", {stream_id}),
            ...options,
            ...this.options,
            parseResultXdr: (xdr): StreamWithData => {
                return this.spec.funcResToNative("get_stream", xdr);
            },
        });
    }


    async topUp<R extends ResponseTypes = undefined>({stream_id, amount}: {stream_id: u64, amount: i128}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number
        /**
         * What type of response to return.
         *
         *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
         *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
         *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
         */
        responseType?: R
        /**
         * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
         */
        secondsToWait?: number
    } = {}) {
                    return await invoke({
            method: 'top_up',
            args: this.spec.funcArgsToScVals("top_up", {stream_id, amount}),
            ...options,
            ...this.options,
            parseResultXdr: () => {},
        });
    }


    async transferStream<R extends ResponseTypes = undefined>({stream_id, new_recipient}: {stream_id: u64, new_recipient: Address}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number
        /**
         * What type of response to return.
         *
         *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
         *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
         *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
         */
        responseType?: R
        /**
         * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
         */
        secondsToWait?: number
    } = {}) {
                    return await invoke({
            method: 'transfer_stream',
            args: this.spec.funcArgsToScVals("transfer_stream", {stream_id, new_recipient}),
            ...options,
            ...this.options,
            parseResultXdr: () => {},
        });
    }

}