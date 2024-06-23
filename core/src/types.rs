use soroban_sdk::{contracttype, Address, Val};



#[contracttype]
#[derive(Clone, Debug)]
pub struct Stream {
    pub from: Address,
    pub to: Address,
    pub amount : i128,
    pub start_time: u64,
    pub end_time: u64,
    pub amount_per_second: u64, //i128?
    // token contract id
    pub token_id : Address,
    //whether the creator can cancell the stream.
    pub able_stop : bool
}

#[contracttype]
#[derive(Clone,Debug)]
pub struct StreamData{
    // how much has been withdrawn
    pub a_withdraw: i128,
    pub aditional_amount: i128,
    // wether the stream was cancelled
    pub cancelled: bool
}

#[contracttype]
#[derive(Clone,Debug)]
pub struct StreamWithData{
    pub stream: Stream,
    pub data: StreamData
}