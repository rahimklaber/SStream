use soroban_sdk::{contracttype, Address, Env};

use crate::types::DcaConfig;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    StreamContract,
    RouterContract,
    // (owner, token)
    Balance(Address, Address),
    //stream_id
    Config(u64),
}

pub fn get_stream_contract_id(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::StreamContract)
        .unwrap()
}

pub fn get_router_contract_id(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::RouterContract)
        .unwrap()
}

pub fn get_balance(env: &Env, owner: &Address, token: &Address) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::Balance(owner.clone(), token.clone()))
        .unwrap_or(0)
}

pub fn set_balance(env: &Env, owner: &Address, token: &Address, amount: i128) {
    env.storage()
        .persistent()
        .set(&DataKey::Balance(owner.clone(), token.clone()), &amount)
}

pub fn add_to_balance(env: &Env, owner: &Address, token: &Address, add_amount: i128) {
    let balance = get_balance(env, owner, token);

    set_balance(env, owner, token, balance + add_amount)
}

pub fn store_config(env: &Env, stream_id: u64, config: &DcaConfig) {
    env.storage()
        .persistent()
        .set(&DataKey::Config(stream_id), config)
}

pub fn get_config(env: &Env, stream_id: u64) -> DcaConfig {
    env.storage()
        .persistent()
        .get(&DataKey::Config(stream_id))
        .unwrap()
}
