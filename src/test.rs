extern crate std;
use std::println;

use soroban_sdk::{Address, Bytes, Env};
use soroban_sdk::testutils::{Address as _, Ledger, LedgerInfo};
use soroban_sdk::xdr::TypeVariant::ScMap;
use crate::types::Stream;
use crate::{Contract, StreamContractTrait, token, ContractClient};

#[test]
fn basic_test(){
    let env: Env = Default::default();


    let user_1 = Address::random(&env);
    let user_2 = Address::random(&env);

    let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
    let token_client = token::Client::new(&env, &token_contract_id);


    let stream_contract_id = env.register_contract(None, Contract);
    let stream_client = ContractClient::new(&env, &stream_contract_id);


    token_client.mint(
        &user_1,
        &user_1,
        &100,
    );


    let stream_id = stream_client.c_stream(&Stream{
        from: user_1.clone(),
        to: user_2.clone(),
        amount: 100,
        start_time: 0,
        end_time: 10,
        tick_time: 1,
        token_id: token_contract_id.clone(),
        able_stop: false,
    });

    let stream = stream_client.get_stream(&stream_id);
    println!("{:?}", stream);

    env.ledger().set(LedgerInfo {
        timestamp: 5,
        protocol_version: 1,
        sequence_number: 1,
        base_reserve: 1,
        network_id: Default::default()
    });

    stream_client.w_stream(&stream_id);

    assert_eq!(50, token_client.balance(&user_2),"user2 should have a balance of 50 after claiming from the stream");    

    stream_client.w_stream(&stream_id);

    assert_eq!(50, token_client.balance(&user_2),"a user cant withdraw the same money multiple times. so no double spending");    
}