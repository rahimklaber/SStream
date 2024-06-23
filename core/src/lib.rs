#![no_std]
mod types;
mod datakey;
mod error;
mod events;

use datakey::{get_and_inc_stream_id, DataKey, get_stream, get_stream_data, update_amount_withdrawn};
use events::publish_transfer;
use soroban_sdk::token::Client as tokenClient;
use soroban_sdk::{assert_with_error, contract, contractimpl, panic_with_error, Address, Env};
use types::{Stream, StreamData};
use crate::datakey::{set_stream_data_cancelled, update_additional_amount};

use crate::error::Error;
use crate::events::{publish_cancel, publish_stream_created, publish_top_up, publish_withdraw};
use crate::types::StreamWithData;

pub trait StreamContractTrait{
    //create stream
    fn create_stream(env: Env, stream : Stream) -> u64;
    //add more tokens to a stream;
    // fn increase_stream(env: Env, streamd_id: u64);
    // withdraw from streaam, return amount withdrawn
    fn withdraw_stream(env: Env, stream_id : u64) -> i128;
    //cancell/stop stream, returns amount reclaimed by creator.
    fn cancel_stream(env: Env, stream_id: u64) -> i128;
    // fn s_stream(env: Env, stream_id : u64);

    fn get_stream(env: Env, stream_id : u64) -> StreamWithData;

    fn top_up(env: Env, stream_id: u64, amount: i128);

    fn transfer_s(env: Env, stream_id : u64, to: Address);
}
#[contract]
pub struct Contract;


#[contractimpl]
impl StreamContractTrait for Contract{
    // create the stream by sending withdrawable funds to this contract
    // returns the id of the created stream
    fn create_stream(env: Env, stream : Stream) -> u64 {
        stream.from.require_auth();
        tokenClient::new(&env, &stream.token_id)
        .transfer(&stream.from, &env.current_contract_address(), &stream.amount);

        //validate ...
        assert_with_error!(&env, stream.amount_per_second > 0, Error::StreamValidationFailed);
        assert_with_error!(&env, stream.amount > 0, Error::StreamValidationFailed);
        assert_with_error!(&env, stream.start_time < stream.end_time, Error::StreamValidationFailed);

        let stream_id = get_and_inc_stream_id(&env);


        // store stream
        env.storage()
        .persistent()
        .set(&DataKey::Stream(stream_id),&stream);

        // store mutable stream data
        env.storage()
        .persistent()
        .set(&DataKey::StreamData(stream_id), &StreamData{
            aditional_amount: 0,
            a_withdraw:0,
            cancelled: false 
        });

        publish_stream_created(&env, &stream, stream_id);
        //return stream id
        stream_id
    }

    fn withdraw_stream(env: Env, stream_id: u64) -> i128{
        let stream = get_stream(&env, stream_id);
        let stream_data = get_stream_data(&env, stream_id);
        let stream_amount = stream.amount + stream_data.aditional_amount;

        stream.to.require_auth();

        // check if stream has been cancelled
        if stream_data.cancelled{
            panic_with_error!(&env, Error::StreamCancelled);
        }

        // check if all tokens have been withdrawn
        if stream_data.a_withdraw == stream_amount{
            panic_with_error!(&env, Error::StreamDone);
        }

        let amount_to_withdraw = get_withdrawable_amount(&env, &stream, &stream_data);

        // don't invoke the token contract if amount == 0
        if amount_to_withdraw > 0{
            tokenClient::new(&env, &stream.token_id)
                .transfer(&env.current_contract_address(), &stream.to, &amount_to_withdraw);

            update_amount_withdrawn(&env, stream_id, stream_data.a_withdraw + amount_to_withdraw, stream_data.aditional_amount);
            publish_withdraw(&env, &stream, stream_id, amount_to_withdraw);
        }


        return amount_to_withdraw
    }

    fn cancel_stream(env: Env, stream_id: u64) -> i128 {
        let stream = get_stream(&env, stream_id);
        let stream_data = get_stream_data(&env, stream_id);
        let stream_amount = stream.amount + stream_data.aditional_amount;

        stream.from.require_auth();

        stream_assertions(&env, &stream_data, &stream);

        let amount_for_recipient = get_withdrawable_amount(&env, &stream, &stream_data);

        let token_client = tokenClient::new(&env, &stream.token_id);
        if amount_for_recipient > 0{
            token_client.transfer(&env.current_contract_address(), &stream.to, &amount_for_recipient);
        }

        let amount_for_creator = stream_amount - stream_data.a_withdraw - amount_for_recipient;
        if amount_for_creator > 0{
            token_client.transfer(&env.current_contract_address(), &stream.from, &amount_for_creator);
        }

        publish_cancel(&env, &stream, stream_id);

        set_stream_data_cancelled(&env, stream_id, stream_data.a_withdraw + amount_for_recipient, stream_data.aditional_amount);

        amount_for_creator
    }

    fn get_stream(env: Env, stream_id: u64) -> StreamWithData{
        StreamWithData{
            stream: get_stream(&env, stream_id),
            data: get_stream_data(&env, stream_id),
        }
    }

    fn top_up(env: Env, stream_id: u64, amount: i128){
        let stream = get_stream(&env, stream_id);
        let stream_data = get_stream_data(&env, stream_id);

        tokenClient::new(&env, &stream.token_id)
            .transfer(&stream.from, &env.current_contract_address(), &amount);

        update_additional_amount(&env, stream_id, stream_data.a_withdraw, stream_data.aditional_amount + amount);

        publish_top_up(&env, &stream, stream_id, amount)
    }

    fn transfer_s(env: Env, stream_id : u64, to: Address){
        let mut stream = get_stream(&env, stream_id);
        stream.to.require_auth();

        let old_recipient = stream.to;

        stream.to = to;

        env.storage()
        .persistent()
        .set(&DataKey::Stream(stream_id),&stream);

        publish_transfer(&env, &stream, stream_id, &old_recipient)
    }

}

fn get_withdrawable_amount(env: &Env, stream: &Stream, stream_data: &StreamData) -> i128 {
    let stream_amount = stream.amount + stream_data.aditional_amount;

    // if we are over the end of the stream, then withdraw everything.
    let timestamp = env.ledger().timestamp();
    let amount_to_withdraw = if stream.end_time < timestamp {
        stream_amount - stream_data.a_withdraw
    }else{
        let time_elapsed = timestamp - stream.start_time;

        // get the amount of funds that we can withdraw minus the amount we have already withdrawn
        core::cmp::min(i128::from(stream.amount_per_second * time_elapsed), stream_amount) - stream_data.a_withdraw
    };

    amount_to_withdraw
}

fn stream_assertions(env: &Env, stream_data: &StreamData, stream: &Stream){
    assert_with_error!(&env, stream_data.a_withdraw < stream.amount, Error::StreamDone);
    assert_with_error!(&env, !stream_data.cancelled, Error::StreamCancelled);
    assert_with_error!(&env, stream.able_stop, Error::StreamNotCancellable);
}

fn calc_percentage(percent: u32, total: i128) -> i128{
    total * i128::from(percent) / 100
}

#[cfg(test)]
mod test;