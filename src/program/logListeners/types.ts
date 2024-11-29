import { BN } from "@coral-xyz/anchor";
import { Logs } from "@solana/web3.js";

export interface SubscibeProgramLogs {
  /**
   *
   * @param programId Solana program Id in base58
   * @param logHandlers a map of callbacks to handle specific log cases
   * @returns subscription ID to cancel
   */
  subscribeProgramLogs(programId: string): number;
  setProgramLogsCallback(needle: string, callback: Function): void;
}

export interface ProcessProgramLogs {
  processProgramLogs(programId: string, txLogs: Logs): Promise<any>;
}

export interface ResultType {
  tx: string;
  mint: string;
  user: string;
  swapDirection: number;
  lamportAmount: BN;
  tokenAmount: BN;
  tokenReserves: BN;
  lamportReserves: BN;
}