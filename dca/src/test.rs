extern crate std;
use crate::FEE;
use std::println;

#[test]
fn test() {
    let fee_amount = 1000 * i128::from(FEE) / 100_00;

    println!("{}", fee_amount)
}
