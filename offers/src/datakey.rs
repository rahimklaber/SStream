use soroban_sdk::{Address, contracttype, Env};
use crate::types::Offer;

#[derive(Clone)]
#[contracttype]
pub enum DataKey{
    Stream(u64),
    OfferId,
    Offer(u64)
}

pub fn store_stream_owner(env: &Env, stream_id: u64, owner: &Address){
    env
        .storage()
        .persistent()
        .set(&DataKey::Stream(stream_id), &owner);
}

pub fn remove_stream_owner(env: &Env, stream_id: u64) {
    env
    .storage()
    .persistent()
    .remove(&DataKey::Stream(stream_id))
}

pub fn get_stream_owner(env: &Env, stream_id: u64) -> Address{
    env
        .storage()
        .persistent()
        .get(&DataKey::Stream(stream_id))
        .unwrap()
}

pub fn store_offer(env: &Env, offer_id: u64, offer: &Offer){
    env
        .storage()
        .persistent()
        .set(&DataKey::Offer(offer_id), offer)
}

pub fn get_offer(env: &Env, offer_id: u64) -> Offer{
    env
        .storage()
        .persistent()
        .get(&DataKey::Offer(offer_id))
        .unwrap()
}

pub fn get_and_inc_offer_id(env: &Env) -> u64{
   let offer_id = env
       .storage()
       .instance()
       .get(&DataKey::OfferId)
       .unwrap_or_else(|| 0);

    env
        .storage()
        .instance()
        .set(&DataKey::OfferId, &(offer_id + 1));

    offer_id
}
