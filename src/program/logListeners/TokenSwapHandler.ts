import {
  Connection,
  Logs,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";
import { ProcessProgramLogs } from "./types";
import { findInstructionByProgramId } from "./utils";
import { Metaplex } from "@metaplex-foundation/js";

export class TokenSwapProgramHandler implements ProcessProgramLogs {
  private metaplex: Metaplex;

  constructor(
    private readonly connection: Connection,
    private readonly processProgramLogsCallBack: Function
  ) {
    this.metaplex = Metaplex.make(this.connection);
  }

  async processProgramLogs(programId: string, txLogs: Logs): Promise<any> {
    const data = await this.fetchTokenSwapInfo(programId, txLogs.signature);
    await this.processProgramLogsCallBack(data);
    return data;
  }

  private async fetchTokenSwapInfo(
    programId: string,
    txSignature: string
  ): Promise<any> {
    const tx = await this.connection.getParsedTransaction(txSignature, {
      commitment: "confirmed",
    });
    if (!tx) {
      throw new Error(
        "Failed to fetch transaction with signature " + txSignature
      );
    }
    return this.parseTokenSwapInfo(programId, tx);
  }

  private async parseTokenSwapInfo(
    programId: string,
    txData: ParsedTransactionWithMeta
  ) {
    const initInstruction = findInstructionByProgramId(
      txData.transaction.message.instructions,
      new PublicKey(programId)
    ) as PartiallyDecodedInstruction | null;
    if (!initInstruction) {
      throw new Error("Failed to find lp init instruction in lp init tx");
    }
    if (initInstruction.accounts.length < 5) {
      throw new Error("Instruction account length is too small");
    }
    // const creator = initInstruction.accounts[2];
    // const mintAddress = initInstruction.accounts[3];
    // const bondingCurve = initInstruction.accounts[4];
    // const token = await this.metaplex
    //   .nfts()
    //   .findByMint({ mintAddress: mintAddress }, { commitment: "confirmed" });
    // return {
    //   creator,
    //   mintAddress,
    //   metadata: token,
    //   bondingCurve,
    // };
  }
}
