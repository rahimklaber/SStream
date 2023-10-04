use soroban_sdk::{contracttype, Address, BytesN, Vec, Symbol};

#[derive(Clone, Debug)]
#[contracttype]
struct SplitRecipientContract{
    pub address: Address,
    pub function: Symbol
}

#[derive(Clone, Debug)]
#[contracttype]
enum SplitRecipient{
    User(Address,u64),
    Contract(SplitRecipientContract,u64)
}

// #[derive(Clone, Debug)]
// #[contracttype]
// pub enum Recipient {
//     User(Address),
//     Split(Vec<SplitRecipient>)
// }

#[contracttype]
#[derive(Clone, Debug)]
pub struct Stream {
    pub from: Address,
    pub to: Address,
    pub recipient: Vec<SplitRecipient>, //size equal to zero means send to to.
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