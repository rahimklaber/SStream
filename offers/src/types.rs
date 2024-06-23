use soroban_sdk::{Address, contracttype};

#[contracttype]
#[derive(Clone, Debug)]
pub struct Offer{
    pub rate: u32,
    pub stream_id: u64,
    pub amount_deposit: i128,
    pub buyer: Address
}