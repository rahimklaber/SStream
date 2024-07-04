#![no_std]
mod datakey;
mod error;
mod events;
mod types;

use crate::datakey::{
    add_to_balance, get_balance, get_config, get_router_contract_id, set_balance, DataKey,
};
use crate::error::Error::{SourceTokenDoesNotMatchStreamToken, StreamNotTransferable};
use crate::events::{publish_deposit, publish_keeper, publish_withdraw};
use core::ops::Add;
use datakey::{get_stream_contract_id, store_config};
use soroban_sdk::token::TokenClient;
use soroban_sdk::xdr::ToXdr;
use soroban_sdk::{
    assert_with_error, contract, contractimpl, panic_with_error, Address, Env, Symbol, Vec,
};
use stream_contract::Recipient;
use types::DcaConfig;

mod stream_contract {
    use soroban_sdk::{contractfile, contractimport};

    contractimport!(
        file = "../core/target/wasm32-unknown-unknown/release/scf_streaming_payments.wasm"
    );
}

mod soroswap_router {
    use soroban_sdk::contractimport;

    contractimport!(file = "../soroswap_router.wasm");
}

const FEE: i128 = 50; //000.50
const PERCENT_DIV: i128 = 10_000;

pub trait DcaStreamContractTrait {
    fn init(env: Env, stream_contract: Address, router_contract: Address);
    fn deposit(env: Env, stream_id: u64, stream_owner: Address, config: DcaConfig);
    fn withdraw(env: Env, recipient: Address, token_id: Address) -> i128;
    fn keeper(
        env: Env,
        keeper_address: Address,
        stream_id: u64,
        amount_out_min: i128,
        path: Vec<Address>,
    ) -> i128;
}
#[contract]
pub struct Contract;

#[contractimpl]
impl DcaStreamContractTrait for Contract {
    fn init(env: Env, stream_contract: Address, router_contract: Address) {
        env.storage()
            .instance()
            .set(&DataKey::StreamContract, &stream_contract);

        env.storage()
            .instance()
            .set(&DataKey::RouterContract, &router_contract);
    }
    fn deposit(env: Env, stream_id: u64, stream_owner: Address, config: DcaConfig) {
        stream_owner.require_auth();

        let stream_address = get_stream_contract_id(&env);
        let stream_client = stream_contract::Client::new(&env, &stream_address);

        let stream = stream_client.get_stream(&stream_id);

        assert_with_error!(
            &env,
            stream.stream.token_id == config.source_token,
            SourceTokenDoesNotMatchStreamToken
        );

        let token_address = match stream.stream.recipient {
            Recipient::Token(addr) => addr,
            _ => panic_with_error!(&env, StreamNotTransferable),
        };

        let stream_token_client = TokenClient::new(&env, &token_address);

        stream_token_client.transfer(&stream_owner, &env.current_contract_address(), &1);

        store_config(&env, stream_id, &config);

        publish_deposit(&env, &config, stream_id);
    }

    fn withdraw(env: Env, recipient: Address, token_id: Address) -> i128 {
        recipient.require_auth();

        let balance = get_balance(&env, &recipient, &token_id);

        set_balance(&env, &recipient, &token_id, 0);

        TokenClient::new(&env, &token_id).transfer(
            &env.current_contract_address(),
            &recipient,
            &balance,
        );

        publish_withdraw(&env, &recipient, &token_id, balance);

        balance
    }

    fn keeper(
        env: Env,
        keeper_address: Address,
        stream_id: u64,
        amount_out_min: i128,
        mut path: Vec<Address>,
    ) -> i128 {
        let config = get_config(&env, stream_id);

        let stream_client = stream_contract::Client::new(&env, &get_stream_contract_id(&env));

        let streamed_amount = stream_client.withdraw_stream(&stream_id);

        let fee_amount = streamed_amount * FEE / PERCENT_DIV; // 0.5 %

        let swap_amount =
            (streamed_amount - fee_amount) * i128::from(config.percent_to_swap) / PERCENT_DIV;

        path.push_front(config.source_token.clone());
        path.push_back(config.destination_token.clone());

        let res = soroswap_router::Client::new(&env, &get_router_contract_id(&env))
            .swap_exact_tokens_for_tokens(
                &swap_amount,
                &amount_out_min,
                &path,
                &env.current_contract_address(),
                &(env.ledger().timestamp() + 1),
            );

        add_to_balance(&env, &keeper_address, &config.source_token, fee_amount);

        add_to_balance(
            &env,
            &config.recipient,
            &config.source_token,
            streamed_amount - fee_amount - swap_amount,
        );
        add_to_balance(
            &env,
            &config.recipient,
            &config.destination_token,
            res.last().unwrap(),
        );

        publish_keeper(&env, stream_id, &keeper_address, streamed_amount);

        fee_amount
    }
}

#[cfg(test)]
mod test;
