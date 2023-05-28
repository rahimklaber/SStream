import {Address, Contract, Networks, Server} from "soroban-client";
import {createSignal} from "solid-js";
import {Buffer} from "buffer";
export const sorobanClient =  new Server(" https://rpc-futurenet.stellar.org")
export const contractId = "60f3b5882643e2af016c6e2ef50b54130c12a65c2ba4ebace7dd1e3416a40db0"
export const contract = new Contract(contractId)

export const tokenId =  Address.contract(Buffer.alloc(32,"d93f5c7bb0ebc4a9c8f727c5cebc4e41194d38257e1d0d910356b43bfc528813", "hex"))
export const [network, setNetwork] = createSignal(Networks.FUTURENET)