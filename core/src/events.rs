use crate::types::Stream;
use soroban_sdk::{contracttype, symbol_short, Address, Env, Val};

// #[contracttype]
// pub enum Events {
//     StreamCreated,
// }

pub fn publish_stream_created(env: &Env, stream: &Stream, recipient: &Address, stream_id: u64) {
    env.events().publish(
        (symbol_short!("CREATED"), &stream.from, recipient, stream_id),
        Val::from_void(),
    )
}

pub fn publish_withdraw(
    env: &Env,
    stream: &Stream,
    recipient: &Address,
    stream_id: u64,
    amount: i128,
) {
    env.events()
        .publish((symbol_short!("WITHDRAW"), recipient, stream_id), amount)
}

pub fn publish_cancel(env: &Env, stream: &Stream, recipient: &Address, stream_id: u64) {
    env.events().publish(
        (symbol_short!("CANCEL"), &stream.from, recipient, stream_id),
        (),
    )
}

pub fn publish_top_up(env: &Env, stream: &Stream, stream_id: u64, amount: i128) {
    env.events()
        .publish((symbol_short!("TOP_UP"), &stream.from, stream_id), amount)
}