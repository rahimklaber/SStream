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
        .get(&DataKey::StreamId)
        .unwrap_or(Ok(0u64))
        .unwrap();

    env.storage().set(&DataKey::StreamId, &(prev + 1));
    prev
}

pub fn get_stream(env: &Env, stream_id: u64) -> Stream{
    let data: Option<Result<Stream, _>> = env.storage()
        .get(&DataKey::Stream(stream_id));
    
    match data{
        Some(Ok(stream)) => stream,
        _ => panic_with_error!(&env,Error::StreamNotExist),
    }
}

pub fn get_stream_data(env: &Env, stream_id: u64) -> StreamData{
    let data: Option<Result<StreamData, _>> = env.storage()
    .get(&DataKey::StreamData(stream_id));

    match data{
        Some(Ok(stream)) => stream,
        _ => panic_with_error!(&env,Error::StreamNotExist),
    }
}

pub fn set_stream_data_cancelled(env: &Env, stream_id: u64, total_amount_withdrawn: i128){
    env.storage()
    .set(&DataKey::StreamData(stream_id), &StreamData{
        a_withdraw: total_amount_withdrawn, //not sure if this should be the value withdrawn by the recipient. Technically, its not needed anymore, but it might be usefull.
        cancelled: true
    })
}

pub fn update_amount_withdrawn(env: &Env, stream_id: u64, total_amount_withdrawn: i128){
    env.storage()
    .set(&DataKey::StreamData(stream_id), &StreamData{
        a_withdraw: total_amount_withdrawn,
        cancelled: false
    });
}