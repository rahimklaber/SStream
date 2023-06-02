extern crate std;
use std::println;

use soroban_sdk::{Address, Env};
use soroban_sdk::testutils::{Address as _, Ledger, LedgerInfo};
use crate::types::Stream;
use crate::{Contract, ContractClient};
use soroban_sdk::token::Client as tokenClient;

#[test]
#[should_panic]
fn claim_should_fail_when_stream_not_exist(){
    let env: Env = Default::default();

    env.mock_all_auths();


    let user_1 = Address::random(&env);

    let token_contract_id = env.register_stellar_asset_contract(user_1.clone());

    let stream_contract_id = env.register_contract(None, Contract);
    let stream_client = ContractClient::new(&env, &stream_contract_id);

    stream_client.withdraw_stream(&0);

}

#[test]
#[should_panic]
fn cancell_should_fail_when_stream_not_exist(){
    let env: Env = Default::default();

    env.mock_all_auths();


    let user_1 = Address::random(&env);

    let token_contract_id = env.register_stellar_asset_contract(user_1.clone());

    let stream_contract_id = env.register_contract(None, Contract);
    let stream_client = ContractClient::new(&env, &stream_contract_id);

    stream_client.cancel_stream(&0);
}

#[test]
#[should_panic]
fn cancell_should_fail_if_stream_not_cancellable(){
    let env: Env = Default::default();

    env.mock_all_auths();


    let user_1 = Address::random(&env);
    let user_2 = Address::random(&env);

    let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
    let token_client = tokenClient::new(&env, &token_contract_id);


    let stream_contract_id = env.register_contract(None, Contract);
    let stream_client = ContractClient::new(&env, &stream_contract_id);


    token_client.mint(
        &user_1,
        &100,
    );


    let stream_id = stream_client.create_stream(&Stream{
        from: user_1.clone(),
        to: user_2.clone(),
        amount: 100,
        start_time: 0,
        end_time: 10,
        amount_per_second: 10,
        token_id: token_contract_id.clone(),
        able_stop: false,
    });

    stream_client.cancel_stream(&stream_id);
}

#[test]
fn basic_test(){
    let env: Env = Default::default();

    env.mock_all_auths();


    let user_1 = Address::random(&env);
    let user_2 = Address::random(&env);

    let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
    let token_client = tokenClient::new(&env, &token_contract_id);


    let stream_contract_id = env.register_contract(None, Contract);
    let stream_client = ContractClient::new(&env, &stream_contract_id);


    token_client.mint(
        &user_1,
        &100,
    );


    let stream_id = stream_client.create_stream(&Stream{
        from: user_1.clone(),
        to: user_2.clone(),
        amount: 100,
        start_time: 0,
        end_time: 10,
        amount_per_second: 10,
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

    stream_client.withdraw_stream(&stream_id);

    assert_eq!(50, token_client.balance(&user_2),"user2 should have a balance of 50 after claiming from the stream");    

    stream_client.withdraw_stream(&stream_id);

    assert_eq!(50, token_client.balance(&user_2),"a user cant withdraw the same money multiple times. so no double spending");    
}