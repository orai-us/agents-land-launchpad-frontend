import { PublicKey } from "@solana/web3.js"
import BN from "bn.js"

export interface LaunchArgs {
    decimals: number
    tokenSupply: BN
    virtualReserves: BN
    name: string
    symbol: string
    uri: string
}

export interface LaunchAccounts {
    creator: PublicKey,
    token: PublicKey,
    teamWallet: PublicKey,
}
export interface SwapAccounts {
    teamWallet: PublicKey,
    user: PublicKey,
    tokenMint: PublicKey,
}

export const SEED_CONFIG = "config";