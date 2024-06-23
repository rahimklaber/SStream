use soroban_sdk::{contracttype, symbol_short, Address, Env, Val};
use crate::types::Stream;

#[contracttype]
pub enum Events{
    StreamCreated
}

pub fn publish_stream_created(env: &Env, stream: &Stream, stream_id: u64){
    env
        .events()
        .publish((symbol_short!("CREATED"), &stream.from, &stream.to, stream_id ), Val::from_void())
}

pub fn publish_withdraw(env: &Env, stream: &Stream, stream_id: u64, amount: i128){
    env
        .events()
        .publish((symbol_short!("WITHDRAW"), &stream.to, stream_id), amount)
}

pub fn publish_cancel(env: &Env, stream: &Stream, stream_id: u64){
    env
        .events()
        .publish((symbol_short!("CANCEL"), &stream.from, &stream.to, stream_id), ())
}

pub fn publish_top_up(env: &Env, stream: &Stream, stream_id: u64, amount : i128){
    env
        .events()
        .publish((symbol_short!("TOP_UP"), &stream.from, &stream.to, stream_id), amount)
}

pub fn publish_transfer(env: &Env, new_stream: &Stream, stream_id: u64, old_recipient: &Address){
    env
        .events()
        .publish((symbol_short!("TRANSFER"), old_recipient, &new_stream.to, stream_id), Val::from_void())
}