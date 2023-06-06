# SStream

SStream is a streaming payments protocol for Soroban.


Currently, it has 3 main functionalities:
- Creating a stream - A user can create a stream by specifying the recipient, the amount streamed per second, the total amount, end date and whether the stream is cancellable or not.
- Claiming a stream - The recipient of the stream can claim the amount that is currently claimable.
- Cancelling - If a stream is cancellable, the creator can cancell the stream. This sends the currently claimable amount to the recipient and sends the rest to the creator.

## Web Interface

The web interface currently supports creating, claiming and cancelling a stream.

The interface currently supports the Freighter wallet.

### Creating a stream
First, connect your wallet and click on `Create Stream`

![create_s_1](https://github.com/rahimklaber/SStream/assets/21971137/35798257-e774-4b9f-8682-4ff955b5a3e1)

Second, input the recipient, the amount, the amount per second and whether the stream should be cancellable or not. Currently, the UI doesn't allow choosing a token and XLM hardcoded in the UI.

![create_s_2](https://github.com/rahimklaber/SStream/assets/21971137/dc78211b-7434-475e-b98f-0d447f6695d9)

### Viewing a stream

### Claiming a stream

### Cancelling a stream

