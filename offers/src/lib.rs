#![no_std]

mod datakey;
mod types;

use datakey::remove_stream_owner;
use soroban_sdk::token::TokenClient;
use soroban_sdk::{Address, contract, contractimpl, Env, U256};
use stream_contract::{Stream, StreamWithData};
use crate::datakey::{DataKey, get_and_inc_offer_id, get_offer, get_stream_owner, store_offer, store_stream_owner};
use crate::types::Offer;

mod stream_contract {
    use soroban_sdk::{Address, contractimport, Env, String};

    contractimport!(
        file = "../core/target/wasm32-unknown-unknown/release/scf_streaming_payments.wasm"
    );

    pub fn create_client(env: &Env) -> Client {
        Client::new(env, &Address::from_string(&String::from_str(env, "CBW5UFLEC6GHJZTYMJOYF347RKOJFS4ERJ4D63MGXK6CTJDMP5N3BHVU")))
    }
}


pub trait OffersContractTrait {
    fn deposit(env: Env, stream_id: u64, owner: Address);
    fn withdraw(env: Env, stream_id: u64);
    // 100.000
    // 100_000
    // 1 rate == 0.001 100000
    fn create_offer(env: Env, stream_id: u64, rate: u32, buyer: Address) -> u64;

    fn get_offer(env: Env, offer_id: u64) -> Offer;

    fn accept_offer(env: Env, offer_id: u64) -> i128;
}

#[contract]
pub struct Contract;

#[contractimpl]
impl OffersContractTrait for Contract {
    fn deposit(env: Env, stream_id: u64, owner: Address) {
        let client = stream_contract::create_client(&env);

        client.transfer_s(&stream_id, &env.current_contract_address());

        store_stream_owner(&env, stream_id, &owner)
    }

    fn withdraw(env: Env, stream_id: u64){
        let client = stream_contract::create_client(&env);

        let owner = get_stream_owner(&env, stream_id);

        owner.require_auth();

        client.transfer_s(&stream_id, &owner);

        remove_stream_owner(&env, stream_id);
    }

    //TODO: We should create two types of offers. Ones for a specific stream, and one in general.
    fn create_offer(env: Env, stream_id: u64, rate: u32, buyer: Address) -> u64{
        let client = stream_contract::create_client(&env);

        get_stream_owner(&env, stream_id);

        buyer.require_auth();

        let stream = client.get_stream(&stream_id);

        let (amount_to_seller, _) = amount_to_transfer(&stream, rate);

        // transfer amount to this contract

        TokenClient::new(&env, &stream.stream.token_id).transfer(&buyer, &env.current_contract_address(), &amount_to_seller);

        let offer_id = get_and_inc_offer_id(&env);

        let offer = Offer{
            stream_id,
            rate,
            amount_deposit: amount_to_seller,
            buyer,
        };

        store_offer(&env, offer_id, &offer);

        offer_id
    }

    fn get_offer(env: Env, offer_id: u64) -> Offer {
        get_offer(&env, offer_id)
    }

    fn accept_offer(env: Env, offer_id: u64) -> i128 {
        let offer = get_offer(&env, offer_id);

        let owner = get_stream_owner(&env, offer.stream_id);

        owner.require_auth();

        let stream_client = stream_contract::create_client(&env);
        let stream = stream_client.get_stream(&offer.stream_id);

        let (amount_to_seller, amount_to_buyer) = amount_to_transfer(&stream, offer.rate);

        let token_client = TokenClient::new(&env, &stream.stream.token_id);

        token_client.transfer(&env.current_contract_address(), &owner, &amount_to_seller);
        token_client.transfer(&env.current_contract_address(), &offer.buyer, &amount_to_buyer);

        stream_client.transfer_s(&offer.stream_id, &offer.buyer);

        remove_stream_owner(&env, offer.stream_id);

        amount_to_seller
    }
}

fn amount_to_transfer(stream: &StreamWithData, rate: u32) -> (i128, i128){
    let amount_left = (stream.stream.amount + stream.data.aditional_amount) - stream.data.a_withdraw;

    let to_seller = amount_left * i128::from(rate) / 100000;
    let to_buyer = amount_left - to_seller;

    (to_seller, to_buyer)
}