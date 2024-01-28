extern crate std;
use std::println;

use soroban_sdk::{Address, Env, vec};
use soroban_sdk::testutils::{Address as _, Ledger, LedgerInfo};
use crate::types::Stream;
use crate::{Contract, ContractClient, StreamContractTrait};
use soroban_sdk::token::Client as tokenClient;
use soroban_sdk::token::StellarAssetClient as tokenAdminClient;


// #[test]
// #[should_panic]
// fn claim_should_fail_when_stream_not_exist(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());

//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);

//     stream_client.withdraw_stream(&0);

// }

// #[test]
// #[should_panic]
// fn cancell_should_fail_when_stream_not_exist(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());

//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);

//     stream_client.cancel_stream(&0);
// }

// #[test]
// #[should_panic]
// fn cancell_should_fail_if_stream_not_cancellable(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);
//     let user_2 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
//     let token_client = tokenClient::new(&env, &token_contract_id);
//     let token_admin_client = tokenAdminClient::new(&env, &token_contract_id);

//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);
//     token_admin_client.mint(
//         &user_1,
//         &100,
//     );


//     let stream_id = stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 100,
//         start_time: 0,
//         end_time: 10,
//         amount_per_second: 10,
//         token_id: token_contract_id.clone(),
//         able_stop: false,
//     });

//     stream_client.cancel_stream(&stream_id);
// }

// #[test]
// fn cancell_should_work_if_cancellable(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);
//     let user_2 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
//     let token_client = tokenClient::new(&env, &token_contract_id);
//     let token_admin_client = tokenAdminClient::new(&env, &token_contract_id);


//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);


//     token_admin_client.mint(
//         &user_1,
//         &100,
//     );


//     let stream_id = stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 100,
//         start_time: 0,
//         end_time: 10,
//         amount_per_second: 10,
//         token_id: token_contract_id.clone(),
//         able_stop: true,
//     });

//     let amount = stream_client.cancel_stream(&stream_id);


//     //no time has passed, so I should getback all the tokens
//     assert_eq!(100, amount);
// }

// #[test]
// fn recipient_should_receive_when_cancelled(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);
//     let user_2 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
//     let token_client = tokenClient::new(&env, &token_contract_id);
//     let token_admin_client = tokenAdminClient::new(&env, &token_contract_id);


//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);


//     token_admin_client.mint(
//         &user_1,
//         &100,
//     );


//     let stream_id = stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 100,
//         start_time: 0,
//         end_time: 10,
//         amount_per_second: 10,
//         token_id: token_contract_id.clone(),
//         able_stop: true,
//     });


//     env.ledger().set(LedgerInfo {
//         timestamp: 5,
//         protocol_version: 1,
//         sequence_number: 1,
//         base_reserve: 1,
//         network_id: Default::default(),..Default::default()
//     });

//     stream_client.cancel_stream(&stream_id);


//     assert_eq!(50, token_client.balance(&user_2));
// }

// #[test]
// #[should_panic]
// fn create_should_fail_when_not_enough_balance(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);
//     let user_2 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
//     let token_client = tokenClient::new(&env, &token_contract_id);


//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);


//     stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 100,
//         start_time: 0,
//         end_time: 10,
//         amount_per_second: 10,
//         token_id: token_contract_id.clone(),
//         able_stop: true,
//     });

// }

// #[test]
// #[should_panic]
// fn create_should_fail_when_amount_persecond_smaller_than_1(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);
//     let user_2 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
//     let token_client = tokenClient::new(&env, &token_contract_id);
//     let token_admin_client = tokenAdminClient::new(&env, &token_contract_id);


//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);


//     token_admin_client.mint(
//         &user_1,
//         &100,
//     );


//     stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 100,
//         start_time: 0,
//         end_time: 10,
//         amount_per_second: 0,
//         token_id: token_contract_id.clone(),
//         able_stop: true,
//     });

// }

// #[test]
// #[should_panic]
// fn create_should_fail_when_amount_smaller_than_1(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);
//     let user_2 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
//     let token_client = tokenClient::new(&env, &token_contract_id);
//     let token_admin_client = tokenAdminClient::new(&env, &token_contract_id);

//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);


//     token_admin_client.mint(
//         &user_1,
//         &100,
//     );


//     stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 0,
//         start_time: 0,
//         end_time: 10,
//         amount_per_second: 1,
//         token_id: token_contract_id.clone(),
//         able_stop: true,
//     });

// }

// #[test]
// #[should_panic]
// fn create_should_fail_when_starttime_bigger_than_endtime(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);
//     let user_2 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
//     let token_client = tokenClient::new(&env, &token_contract_id);
//     let token_admin_client = tokenAdminClient::new(&env, &token_contract_id);

//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);


//     token_admin_client.mint(
//         &user_1,
//         &100,
//     );


//     stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 111,
//         start_time: 11,
//         end_time: 10,
//         amount_per_second: 1,
//         token_id: token_contract_id.clone(),
//         able_stop: true,
//     });

// }

// #[test]
// fn should_not_be_able_to_claim_more_than_amount(){
//     let env: Env = Default::default();

//     env.mock_all_auths();


//     let user_1 = Address::random(&env);
//     let user_2 = Address::random(&env);

//     let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
//     let token_client = tokenClient::new(&env, &token_contract_id);
//     let token_admin_client = tokenAdminClient::new(&env, &token_contract_id);

//     let stream_contract_id = env.register_contract(None, Contract);
//     let stream_client = ContractClient::new(&env, &stream_contract_id);


//     token_admin_client.mint(
//         &user_1,
//         &100000000000,
//     );


//     stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 1000000,
//         start_time: 0,
//         end_time: 10,
//         amount_per_second: 1,
//         token_id: token_contract_id.clone(),
//         able_stop: true,
//     });

//     let stream_id = stream_client.create_stream(&Stream{
//         from: user_1.clone(),
//         to: user_2.clone(),
//         amount: 1,
//         start_time: 0,
//         end_time: 10,
//         amount_per_second: 1000,
//         token_id: token_contract_id.clone(),
//         able_stop: true,
//     });

//     env.ledger().set(LedgerInfo {
//         timestamp: 5,
//         protocol_version: 1,
//         sequence_number: 1,
//         base_reserve: 1,
//         network_id: Default::default(),..Default::default()
//     });


//     assert_eq!(1,stream_client.withdraw_stream(&stream_id));

// }

#[test]
fn basic_test(){
    let env: Env = Default::default();


    env.mock_all_auths();


    let user_1 = Address::random(&env);
    let user_2 = Address::random(&env);

    let token_contract_id = env.register_stellar_asset_contract(user_1.clone());
    let token_client = tokenClient::new(&env, &token_contract_id);
    let token_admin_client = tokenAdminClient::new(&env, &token_contract_id);

    let stream_contract_id = env.register_contract(None, Contract);
    let stream_client = ContractClient::new(&env, &stream_contract_id);


    token_admin_client.mint(
        &user_1,
        &150,
    );


    let stream_id = stream_client.create_stream(&Stream{
        from: user_1.clone(),
        to: user_2.clone(),
        amount: 100,
        recipients: vec![&env],
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
        network_id: Default::default(),..Default::default()
    });

    stream_client.withdraw_stream(&stream_id);

    assert_eq!(50, token_client.balance(&user_2),"user2 should have a balance of 50 after claiming from the stream");    

    stream_client.withdraw_stream(&stream_id);

    assert_eq!(50, token_client.balance(&user_2),"a user cant withdraw the same money multiple times. so no double spending");

    stream_client.top_up(&stream_id, &50);

    env.ledger().set(LedgerInfo {
        timestamp: 15,
        protocol_version: 1,
        sequence_number: 1,
        base_reserve: 1,
        network_id: Default::default(),..Default::default()
    });

    stream_client.withdraw_stream(&stream_id);

    assert_eq!(150, token_client.balance(&user_2),"user2 should have a balance of 50 after claiming from the stream");    
}