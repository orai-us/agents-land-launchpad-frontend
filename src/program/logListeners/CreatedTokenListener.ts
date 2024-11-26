import {
  Connection,
  Logs,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";
import { SubscibeProgramLogs } from "./types";
import { findLogEntry, findInstructionByProgramId } from "./utils";
import { Metaplex } from "@metaplex-foundation/js";

export class CreatedTokenLogListener implements SubscibeProgramLogs {
  private metaplex: Metaplex;

  constructor(
    private readonly connection: Connection,
    private seenTransactions: string[] = []
  ) {
    this.metaplex = Metaplex.make(this.connection);
  }

  private LOG_ENTRY_NEEDLES = {
    SWAP: "Swap",
    LAUNCH: "Launch",
  };

  subscribeProgramLogs(
    programId: string,
    callbacks: Record<string, Function>
  ): number {
    const subId = this.connection.onLogs(
      new PublicKey(programId),
      async (txLogs: Logs) => {
        if (this.seenTransactions.includes(txLogs.signature)) {
          return;
        }

        try {
          for (const [needle, callback] of Object.entries(callbacks)) {
            if (!findLogEntry(needle, txLogs.logs)) continue;

            if (needle === this.LOG_ENTRY_NEEDLES.LAUNCH) {
              const data = await this.fetchAgentsLandLaunchInfo(
                programId,
                txLogs.signature
              );
              console.log("Launch info", data);
              callback(data);
            }
          }
        } catch (error) {
          await this.connection.removeOnLogsListener(subId);
          console.error("err Created Token Log Listener: ", error);
        }
      },
      "confirmed"
    );
    console.log("Listening to new Agents.land tokens...");
    return subId;
  }

  private async fetchAgentsLandLaunchInfo(
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
    return this.parseTokenLaunchInfo(programId, tx);
  }

  private async parseTokenLaunchInfo(
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
    console.dir(txData.meta?.innerInstructions, { depth: null });
    if (initInstruction.accounts.length < 5) {
      throw new Error("Instruction account length is too small");
    }
    const creator = initInstruction.accounts[2];
    const mintAddress = initInstruction.accounts[3];
    const bondingCurve = initInstruction.accounts[4];
    const token = await this.metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress }, { commitment: "confirmed" });
    return {
      creator,
      mintAddress,
      metadata: token,
      bondingCurve,
    };
  }
}
