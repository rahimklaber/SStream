#![no_std]
mod types;
mod datakey;
mod error;
use datakey::{get_and_inc_stream_id, DataKey, get_stream, get_stream_data, update_amount_withdrawn};
use soroban_sdk::{contractimpl, Address, BytesN, Env, panic_with_error};
use types::{Stream, StreamData};

use crate::error::Error;
use crate::types::StreamWithData;

mod token {
    soroban_sdk::contractimport!(file = "./soroban_token_spec.wasm");
}
pub trait StreamContractTrait{
    //create stream
    fn create_stream(env: Env, stream : Stream) -> u64;
    //add more tokens to a stream;
    // fn increase_stream(env: Env, streamd_id: u64);
    // withdraw from streaam
    fn withdraw_stream(env: Env, stream_id : u64);
    //cancell/stop stream
    fn cancel_stream(env: Env, stream_id: u64);
    // fn s_stream(env: Env, stream_id : u64);

    fn get_stream(env: Env, stream_id : u64) -> StreamWithData;
}

pub struct Contract;


#[contractimpl]
impl StreamContractTrait for Contract{
    // create the stream by sending withdrawable funds to this contract
    // returns the id of the created stream
    fn create_stream(env: Env, stream : Stream) -> u64 {

        // token::Client::new(&env, &stream.token_id)
        // .xfer(&stream.from, &env.current_contract_address(), &stream.amount);

    // todo validate stream params

        let stream_id = get_and_inc_stream_id(&env);


        // store stream
        env.storage()
        .set(&DataKey::Stream(stream_id),&stream);

    //todo 

        // store mutable stream data
        env.storage()
        .set(&DataKey::StreamData(stream_id), &StreamData{
            a_withdraw:0,
            cancelled: false 
        });

        //return stream id
        stream_id
    }

    fn withdraw_stream(env: Env, stream_id: u64){
        let stream = get_stream(&env, stream_id);
        let stream_data = get_stream_data(&env, stream_id);

        stream.to.require_auth();

        // check if stream has been cancelled
        if stream_data.cancelled{
            panic_with_error!(&env, Error::StreamCancelled);
        }

        // check if all tokens have been withdrawn
        if stream_data.a_withdraw == stream.amount{
            panic_with_error!(&env, Error::StreamDone);
        }



        // if we are over the end of the stream, then withdraw everything.
        if stream.end_time < env.ledger().timestamp(){
            token::Client::new(&env, &stream.token_id)
                .xfer(&env.current_contract_address(), &stream.to, &(&stream.amount - &stream_data.a_withdraw));

            update_amount_withdrawn(&env, stream_id, stream.amount);
            return
        }

        // stream duration
        let duration = stream.end_time - stream.start_time;

        let mut total_ticks = duration / stream.tick_time;
        // round up the total ticks
        if duration % stream.tick_time != 0{
            total_ticks += 1;
        }
        //todo check u64 and i128 math
        let amount_per_tick = stream.amount / i128::from(total_ticks);

        let time_elapsed = env.ledger().timestamp() - stream.start_time;
        // elsapsed ticks
        let elapsed_ticks = time_elapsed / stream.tick_time;

        // get the amount of funds that we can withdraw minus the amount we have allready withdrawn
        let amount_to_withdraw = amount_per_tick * i128::from(elapsed_ticks) - &stream_data.a_withdraw;

        // don't invoke the token contract if amount == 0
        if amount_to_withdraw == 0 {
            return;
        }

        token::Client::new(&env, &stream.token_id)
        .xfer(&env.current_contract_address(), &stream.to, &amount_to_withdraw);

        update_amount_withdrawn(&env, stream_id, &stream_data.a_withdraw + &amount_to_withdraw);
    }

    fn cancel_stream(env: Env, stream_id: u64) {
        todo!()
    }

    fn get_stream(env: Env, stream_id: u64) -> StreamWithData{
        StreamWithData{
            stream: get_stream(&env, stream_id),
            data: get_stream_data(&env, stream_id),
        }
    }

}


#[cfg(test)]
mod test;