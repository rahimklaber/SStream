extern crate std;
use crate::FEE;
use std::println;
use soroban_sdk::{Env, IntoVal, Val};
use soroban_sdk::xdr::ToXdr;
use crate::datakey::DataKey;

#[test]
fn test() {
    let e = Env::default();
    let x: Val = DataKey::Config(1).into_val(&e);

    let x = x.to_xdr(&e).to_alloc_vec();

    println!("{}", base64::encode(x))
}
