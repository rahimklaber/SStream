use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    StreamNotExist = 1,
    NotAuthorized = 2,
    StreamCancelled = 3,
    StreamNotCancellable = 4,
    StreamDone = 5,
    StreamValidationFailed = 6,
}