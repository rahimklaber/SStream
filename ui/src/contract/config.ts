import {Address, Contract, Networks, Server} from "soroban-client";
import {createSignal} from "solid-js";
import {Buffer} from "buffer";
export const sorobanClient =  new Server(" https://rpc-futurenet.stellar.org")
export const contractId = "372f2cdaceca4b6888087936aa9c32ba310a292b4952997c6042513f857f3de1"
export const contract = new Contract(contractId)

export const tokenId =  Address.contract(Buffer.alloc(32,"d93f5c7bb0ebc4a9c8f727c5cebc4e41194d38257e1d0d910356b43bfc528813", "hex"))
export const [network, setNetwork] = createSignal(Networks.FUTURENET)