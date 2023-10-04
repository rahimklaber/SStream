import {Address, Networks, Server, Contract as RawContract} from "soroban-client";
import {Contract} from "ts_bindings";
import {createSignal} from "solid-js";
import {Buffer} from "buffer";
export const sorobanClient =  new Server("https://rpc-futurenet.stellar.org")
export const contractId = "CAI5CVWEYS35EVMFQ7ORODHO5O32R6WAR5WDHQSQ7B4L26A5I4WGFNIV"


export const tokenId =  Address.contract(Buffer.alloc(32,"d93f5c7bb0ebc4a9c8f727c5cebc4e41194d38257e1d0d910356b43bfc528813", "hex"))
export const tokenContract = new RawContract(tokenId.toBuffer().toString("hex"))
export const [network, setNetwork] = createSignal(Networks.FUTURENET)

export const contract = new Contract({
    networkPassphrase: Networks.FUTURENET,
    contractId: contractId,
    rpcUrl: "https://rpc-futurenet.stellar.org"
})