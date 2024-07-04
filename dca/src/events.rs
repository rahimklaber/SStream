use crate::types::DcaConfig;
use core::ops::Add;
use soroban_sdk::{contracttype, symbol_short, Address, Env, Val};

pub fn publish_deposit(env: &Env, config: &DcaConfig, stream_id: u64) {
    env.events().publish(
        (symbol_short!("DEPOSIT"), &config.recipient, stream_id),
        config.clone(),
    )
}

pub fn publish_withdraw(env: &Env, recipient: &Address, token_id: &Address, amount: i128) {
    env.events()
        .publish((symbol_short!("WITHDRAW"), recipient, token_id), amount);
}

pub fn publish_keeper(env: &Env, stream_id: u64, keeper_address: &Address, amount_streamed: i128) {
    env.events().publish(
        (symbol_short!("KEEPER"), keeper_address, stream_id),
        amount_streamed,
    );
}
