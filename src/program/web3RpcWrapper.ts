import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Pumpfun } from "./pumpfun";
import { BACKEND_URL } from "@/utils/util";

export class Web3RpcWrapper {
  constructor(private readonly program: Program<Pumpfun>) {}

  async fetchLaunchpadGlobalConfigPda(configPda: PublicKey) {
    try {
      const config: IdlAccounts<Pumpfun>["config"] = await fetch(
        `${BACKEND_URL}/programs/launchpad/global-config/${configPda.toBase58()}`
      ).then((data) => data.json());
      return config;
    } catch (error) {
      // fallback to RPC
      return await this.program.account.config.fetch(configPda);
    }
  }
}
