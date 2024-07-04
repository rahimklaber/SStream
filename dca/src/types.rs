use soroban_sdk::{contracttype, Address};

#[derive(Clone)]
#[contracttype]
pub struct DcaConfig {
    // in hours
    pub keeper_schedule: u32,
    pub percent_to_swap: u32,
    pub max_slippage_percent: u32,
    pub recipient: Address,
    pub source_token: Address,
    pub destination_token: Address,
}
