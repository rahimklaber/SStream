use soroban_sdk::{contracttype, Env, panic_with_error};

use crate::{types::{Stream, StreamData}, error::Error};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Stream(u64),
    StreamId,
    // extra data relating to withdrawing from the stream
    StreamData(u64),
}

pub fn get_and_inc_stream_id(env: &Env) -> u64 {
    let prev = env
        .storage()
        .persistent()
        .get(&DataKey::StreamId)
        .unwrap_or(0u64);

    env.storage()
    .persistent()
    .set(&DataKey::StreamId, &(prev + 1));
    prev
}

pub fn get_stream(env: &Env, stream_id: u64) -> Stream{
    env.storage()
        .persistent()
        .get(&DataKey::Stream(stream_id))
        .unwrap_or_else(||panic_with_error!(&env,Error::StreamNotExist))
    
    // match data{
    //     Some(Ok(stream)) => stream,
    //     _ => panic_with_error!(&env,Error::StreamNotExist),
    // }
}

pub fn store_stream(env: &Env, stream_id: u64, stream: Stream){
    env.storage()
        .persistent()
        .set(&DataKey::Stream(stream_id), &stream)
}

pub fn get_stream_data(env: &Env, stream_id: u64) -> StreamData{
    env.storage()
    .persistent()
    .get(&DataKey::StreamData(stream_id))
    .unwrap_or_else(||panic_with_error!(&env,Error::StreamNotExist))
}

pub fn set_stream_data_cancelled(env: &Env, stream_id: u64, total_amount_withdrawn: i128, additional_amount: i128){
    env.storage()
    .persistent()
    .set(&DataKey::StreamData(stream_id), &StreamData{
        aditional_amount: additional_amount,
        a_withdraw: total_amount_withdrawn, //not sure if this should be the value withdrawn by the recipient. Technically, its not needed anymore, but it might be usefull.
        cancelled: true
    })
}

pub fn update_amount_withdrawn(env: &Env, stream_id: u64, total_amount_withdrawn: i128, additional_amount: i128){
    env.storage()
    .persistent()
    .set(&DataKey::StreamData(stream_id), &StreamData{
        aditional_amount: additional_amount,
        a_withdraw: total_amount_withdrawn,
        cancelled: false
    });
}

pub fn update_additional_amount(env: &Env, stream_id: u64, total_amount_withdrawn: i128, additional_amount: i128){
    env.storage()
    .persistent()
        .set(&DataKey::StreamData(stream_id), &StreamData{
            aditional_amount: additional_amount,
            a_withdraw: total_amount_withdrawn,
            cancelled: false
        });
}