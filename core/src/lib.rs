#![no_std]
use soroban_sdk::{
    Address, assert_with_error, BytesN, contract, contractimpl, Env,
    IntoVal, panic_with_error, Symbol, Val, vec,
};
use soroban_sdk::token::Client as tokenClient;
use soroban_sdk::xdr::ToXdr;

use datakey::{
    DataKey, get_and_inc_stream_id, get_stream, get_stream_data, update_amount_withdrawn,
};
use types::{CreateParams, Recipient, Stream, StreamData};

use crate::datakey::{set_stream_data_cancelled, update_additional_amount};
use crate::error::Error;
use crate::events::{publish_cancel, publish_stream_created, publish_top_up, publish_withdraw};
use crate::types::StreamWithData;
use crate::utils::create_stream_string;

mod datakey;
mod error;
mod events;
mod types;

pub trait StreamContractTrait {
    fn init(env: Env, wasm_hash: BytesN<32>);
    //create stream
    fn create_stream(env: Env, stream: CreateParams) -> u64;
    //add more tokens to a stream;
    // fn increase_stream(env: Env, streamd_id: u64);
    // withdraw from streaam, return amount withdrawn
    fn withdraw_stream(env: Env, stream_id: u64) -> i128;
    //cancell/stop stream, returns amount reclaimed by creator.
    fn cancel_stream(env: Env, stream_id: u64) -> i128;
    // fn s_stream(env: Env, stream_id : u64);

    fn get_stream(env: Env, stream_id: u64) -> StreamWithData;

    fn top_up(env: Env, stream_id: u64, amount: i128);
}
#[contract]
pub struct Contract;

#[contractimpl]
impl StreamContractTrait for Contract {
    fn init(env: Env, wasm_hash: BytesN<32>) {
        if env.storage().instance().has(&DataKey::TokenWasmHash) {
            panic!()
        }

        env.storage()
            .instance()
            .set(&DataKey::TokenWasmHash, &wasm_hash)
    }
    // create the stream by sending withdrawable funds to this contract
    // returns the id of the created stream
    fn create_stream(env: Env, create_params: CreateParams) -> u64 {
        create_params.from.require_auth();
        tokenClient::new(&env, &create_params.token_id).transfer(
            &create_params.from,
            &env.current_contract_address(),
            &create_params.amount,
        );

        //validate ...
        assert_with_error!(
            &env,
            create_params.amount_per_second > 0,
            Error::StreamValidationFailed
        );
        assert_with_error!(
            &env,
            create_params.amount > 0,
            Error::StreamValidationFailed
        );
        assert_with_error!(
            &env,
            create_params.start_time < create_params.end_time,
            Error::StreamValidationFailed
        );

        let stream_id = get_and_inc_stream_id(&env);

        let recipient = if create_params.transferable {
            let token_address = env
                .deployer()
                .with_current_contract(env.crypto().sha256(&create_params.clone().to_xdr(&env)))
                .deploy(
                    env.storage()
                        .instance()
                        .get::<_, BytesN<32>>(&DataKey::TokenWasmHash)
                        .unwrap(),
                );

            let name = create_stream_string(&env, "Stream #", stream_id);
            let symbol = create_stream_string(&env, "STREAM#", stream_id);

            env.invoke_contract::<Val>(
                &token_address,
                &Symbol::new(&env, "initialize"),
                vec![
                    &env,
                    create_params.to.into_val(&env),
                    0u32.into_val(&env),
                    name.into_val(&env),
                    symbol.into_val(&env),
                ],
            );

            Recipient::Token(token_address)
        } else {
            Recipient::Address(create_params.to.clone())
        };

        let stream = Stream {
            from: create_params.from,
            recipient,
            amount: create_params.amount,
            start_time: create_params.start_time,
            end_time: create_params.end_time,
            amount_per_second: create_params.amount_per_second,
            token_id: create_params.token_id,
            able_stop: create_params.able_stop,
        };

        // store stream
        env.storage()
            .persistent()
            .set(&DataKey::Stream(stream_id), &stream);

        // store mutable stream data
        env.storage().persistent().set(
            &DataKey::StreamData(stream_id),
            &StreamData {
                aditional_amount: 0,
                a_withdraw: 0,
                cancelled: false,
            },
        );

        publish_stream_created(&env, &stream, &create_params.to, stream_id);
        //return stream id
        stream_id
    }

    fn withdraw_stream(env: Env, stream_id: u64) -> i128 {
        let stream = get_stream(&env, stream_id);
        let stream_data = get_stream_data(&env, stream_id);
        let stream_amount = stream.amount + stream_data.aditional_amount;

        let recipient_address = get_recipient_address(&env, &stream.recipient);
        recipient_address.require_auth();

        // check if stream has been cancelled
        if stream_data.cancelled {
            panic_with_error!(&env, Error::StreamCancelled);
        }

        // check if all tokens have been withdrawn
        if stream_data.a_withdraw == stream_amount {
            panic_with_error!(&env, Error::StreamDone);
        }

        let amount_to_withdraw = get_withdrawable_amount(&env, &stream, &stream_data);

        // don't invoke the token contract if amount == 0
        if amount_to_withdraw > 0 {
            tokenClient::new(&env, &stream.token_id).transfer(
                &env.current_contract_address(),
                &recipient_address,
                &amount_to_withdraw,
            );

            update_amount_withdrawn(
                &env,
                stream_id,
                stream_data.a_withdraw + amount_to_withdraw,
                stream_data.aditional_amount,
            );
            publish_withdraw(
                &env,
                &stream,
                &recipient_address,
                stream_id,
                amount_to_withdraw,
            );
        }

        return amount_to_withdraw;
    }

    fn cancel_stream(env: Env, stream_id: u64) -> i128 {
        let stream = get_stream(&env, stream_id);
        let stream_data = get_stream_data(&env, stream_id);
        let stream_amount = stream.amount + stream_data.aditional_amount;

        stream.from.require_auth();

        stream_assertions(&env, &stream_data, &stream);

        let amount_for_recipient = get_withdrawable_amount(&env, &stream, &stream_data);

        let token_client = tokenClient::new(&env, &stream.token_id);
        let recipient_address = get_recipient_address(&env, &stream.recipient);
        if amount_for_recipient > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &recipient_address,
                &amount_for_recipient,
            );
        }

        let amount_for_creator = stream_amount - stream_data.a_withdraw - amount_for_recipient;
        if amount_for_creator > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &stream.from,
                &amount_for_creator,
            );
        }

        publish_cancel(&env, &stream, &recipient_address, stream_id);

        set_stream_data_cancelled(
            &env,
            stream_id,
            stream_data.a_withdraw + amount_for_recipient,
            stream_data.aditional_amount,
        );

        amount_for_creator
    }

    fn get_stream(env: Env, stream_id: u64) -> StreamWithData {
        StreamWithData {
            stream: get_stream(&env, stream_id),
            data: get_stream_data(&env, stream_id),
        }
    }

    fn top_up(env: Env, stream_id: u64, amount: i128) {
        let stream = get_stream(&env, stream_id);
        let stream_data = get_stream_data(&env, stream_id);

        tokenClient::new(&env, &stream.token_id).transfer(
            &stream.from,
            &env.current_contract_address(),
            &amount,
        );

        update_additional_amount(
            &env,
            stream_id,
            stream_data.a_withdraw,
            stream_data.aditional_amount + amount,
        );

        publish_top_up(&env, &stream, stream_id, amount)
    }
}

fn get_recipient_address(env: &Env, recipient: &Recipient) -> Address {
    match recipient {
        Recipient::Address(addr) => addr.clone(),
        Recipient::Token(token_addr) => {
            env.invoke_contract::<Address>(token_addr, &Symbol::new(&env, "read_admin"), vec![&env])
        }
    }
}

fn get_withdrawable_amount(env: &Env, stream: &Stream, stream_data: &StreamData) -> i128 {
    let stream_amount = stream.amount + stream_data.aditional_amount;

    // if we are over the end of the stream, then withdraw everything.
    let timestamp = env.ledger().timestamp();
    let amount_to_withdraw = if stream.end_time < timestamp {
        stream_amount - stream_data.a_withdraw
    } else {
        let time_elapsed = timestamp - stream.start_time;

        // get the amount of funds that we can withdraw minus the amount we have already withdrawn
        core::cmp::min(
            i128::from(stream.amount_per_second * time_elapsed),
            stream_amount,
        ) - stream_data.a_withdraw
    };

    amount_to_withdraw
}

fn stream_assertions(env: &Env, stream_data: &StreamData, stream: &Stream) {
    assert_with_error!(
        &env,
        stream_data.a_withdraw < stream.amount,
        Error::StreamDone
    );
    assert_with_error!(&env, !stream_data.cancelled, Error::StreamCancelled);
    assert_with_error!(&env, stream.able_stop, Error::StreamNotCancellable);
}

#[cfg(test)]
mod test;
mod utils;
