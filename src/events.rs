use soroban_sdk::{contracttype, Env, Symbol};
use crate::types::Stream;

#[contracttype]
pub enum Events{
    StreamCreated
}

pub fn publish_stream_created(env: &Env, stream: &Stream, stream_id: u64){
    env
        .events()
        .publish((Symbol::short("CREATED"), &stream.from, &stream.to, stream_id ), stream_id)
}

pub fn publish_withdraw(env: &Env, stream: &Stream, stream_id: u64, amount: i128){
    env
        .events()
        .publish((Symbol::short("WITHDRAW"), &stream.to, stream_id), amount)
}

pub fn publish_cancel(env: &Env, stream: &Stream, stream_id: u64){
    env
        .events()
        .publish((Symbol::short("CANCEL"), &stream.from, &stream.to, stream_id), ())
}