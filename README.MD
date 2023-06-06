# SStream

SStream is a streaming payments protocol for Soroban.


Currently, it has 3 main functionalities:
- Creating a stream - A user can create a stream by specifying the recipient, the amount streamed per second, the total amount, end date and whether the stream is cancellable or not.
- Claiming a stream - The recipient of the stream can claim the amount that is currently claimable.
- Cancelling - If a stream is cancellable, the creator can cancell the stream. This sends the currently claimable amount to the recipient and sends the rest to the creator.

## Web Interface

The web interface currently supports creating, claiming and cancelling a stream.

### Creatinga a stream

X


### Viewing a stream

### Claiming a stream

### Cancelling a stream

