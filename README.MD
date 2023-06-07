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

Third, fill in the form and click the `Create` button. Afterwards, approve the transaction in freighter.

![image](https://github.com/rahimklaber/SStream/assets/21971137/306c03c7-bf17-4766-9fa7-1e463c1cf8e3)

After a few seconds, the id of the stream will be shown. The id can then be used to lookup the stream.
![image](https://github.com/rahimklaber/SStream/assets/21971137/45428eac-7d6c-43de-b518-f27a7ed28951)


### Viewing a stream
First connect your wallet and click on `SStream` or `Lookup Stream`.

![image](https://github.com/rahimklaber/SStream/assets/21971137/d2e9d291-6227-4f11-8b50-4382d9920464)

To view a stream, its id needs to be known. In the future there will be a backend that indexes the streams and that can be used to look up streams for a given address.

Insert the stream id into the field and click the `Get details` button. After a few second the details of the stream should show up.
Two buttons will also appear that allows for claiming or cancelling a stream.
![image](https://github.com/rahimklaber/SStream/assets/21971137/a4fa74b1-4a71-4dd4-8b62-e645e0cf6648)


### Claiming a stream

### Cancelling a stream

