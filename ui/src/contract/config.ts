import {Address, Contract, Networks, Server} from "soroban-client";
import {createSignal} from "solid-js";
import {Buffer} from "buffer";
export const sorobanClient =  new Server(" https://rpc-futurenet.stellar.org")
export const contractId = "9db8880122c5fd2b74bb9bfe67de988c58b92ed049026d06a8c5a5c4253b8ba1"
export const contract = new Contract(contractId)

export const tokenId =  Address.contract(Buffer.alloc(32,"d93f5c7bb0ebc4a9c8f727c5cebc4e41194d38257e1d0d910356b43bfc528813", "hex"))
export const tokenContract = new Contract(tokenId.toBuffer().toString("hex"))
export const [network, setNetwork] = createSignal(Networks.FUTURENET)