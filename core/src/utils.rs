use core::ptr::copy;
use numtoa::NumToA;
use soroban_sdk::{Env, String};

pub fn create_stream_string(env: &Env, str: &str, stream_id: u64) -> String {
    let mut num_buf = [0u8; 20];
    let num_str = stream_id.numtoa_str(10, &mut num_buf);

    let concat_len = num_str.len() + (&str).len();

    let mut concat_buf = [0u8; 40];

    unsafe {
        copy(str.as_ptr(), concat_buf.as_mut_ptr(), str.len());
        copy(num_str.as_ptr(), concat_buf.as_mut_ptr().add(str.len()), num_str.len());

        String::from_str(
            &env,
            core::str::from_utf8_unchecked(&concat_buf[..concat_len]),
        )
    }
}
