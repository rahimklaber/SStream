use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    SourceTokenDoesNotMatchStreamToken = 1,
    StreamNotTransferable = 2,
}
