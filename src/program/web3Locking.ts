import {
  ALL_CONFIGS,
  STAKE_CONFIG_SEED,
  STAKE_DETAIL_SEED,
  STAKER_INFO_SEED,
  VAULT_SEED,
} from "@/config";
import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { Vault } from "./locking/locking";
import idl from "./locking/locking.json";
import { handleTransaction } from "./utils";
import { commitmentLevel, endpoint } from "./web3";

export const vaultProgramId = new PublicKey(idl.address);
export const vaultInterface = JSON.parse(JSON.stringify(idl));

const stakeCurrencyMint = ALL_CONFIGS.STAKE_CURRENCY_MINT;

export class Web3SolanaLockingToken {
  constructor(
    private readonly connection = new Connection(endpoint, {
      commitment: commitmentLevel,
      wsEndpoint: import.meta.env.VITE_SOLANA_WS,
    })
  ) {}

  async stake(lockPeriod: number, amount: number, wallet: WalletContextState) {
    try {
      if (!this.connection || !wallet.publicKey) {
        console.log("Warning: Wallet not connected");
        return;
      }
      const provider = anchor.getProvider();
      const program = new Program(vaultInterface, provider) as Program<Vault>;

      let [configPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKE_CONFIG_SEED),
          new PublicKey(stakeCurrencyMint).toBytes(),
        ],
        program.programId
      );
      let [vaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(VAULT_SEED),
          configPda.toBytes(),
          new BN(lockPeriod).toBuffer("le", 8),
        ],
        program.programId
      );
      let [stakerInfoPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKER_INFO_SEED),
          vaultPda.toBytes(),
          wallet.publicKey.toBytes(),
        ],
        program.programId
      );
      let currentId = 0;
      try {
        let stakerInfo = await program.account.stakerInfo.fetch(stakerInfoPda);
        currentId = stakerInfo.currentId.toNumber();
      } catch (error) {
        console.log("get number of locked items error", error);
      }

      let [userStakeDetailPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKE_DETAIL_SEED),
          stakerInfoPda.toBytes(),
          new BN(currentId + 1).toBuffer("le", 8),
        ],
        program.programId
      );

      const transaction = new Transaction();
      const cpIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000,
      });
      const cuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 });

      const stakeIx = await program.methods
        .stake(new BN(lockPeriod), new BN(amount))
        .accounts({
          signer: wallet.publicKey,
          stakeCurrencyMint: stakeCurrencyMint,
          stakeDetailPda: userStakeDetailPda,
        })
        .instruction();

      transaction.add(stakeIx);
      transaction.add(cpIx, cuIx);
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await this.connection.getLatestBlockhash()
      ).blockhash;

      if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const sTx = signedTx.serialize();
        const signature = await this.connection.sendRawTransaction(sTx, {
          preflightCommitment: "confirmed",
          skipPreflight: false,
        });
        const blockhash = await this.connection.getLatestBlockhash();

        const res = await this.connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          "confirmed" // FIXME: trick lord confirmed / finalized;
        );

        console.log("Successfully locking token.\n Signature: ", signature);
        return res;
      }
    } catch (error) {
      console.log("Error in locking token transaction", error, error.error);
      const { transaction = "", result } =
        (await handleTransaction({
          error,
          connection: this.connection,
        })) || {};

      if (result?.value?.confirmationStatus) {
        console.log("----confirm----", { transaction, result });
        return { transaction, result };
      }
    }
  }

  async getListLockedOfUser(lockPeriod: number, wallet: WalletContextState) {
    let vaultInfo = { totalStaked: new BN("0") };
    try {
      if (!this.connection) {
        console.log("Warning: Wallet not connected");
        return;
      }
      const provider = anchor.getProvider();
      const program = new Program(vaultInterface, provider) as Program<Vault>;

      let [configPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKE_CONFIG_SEED),
          new PublicKey(stakeCurrencyMint).toBytes(),
        ],
        program.programId
      );
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(VAULT_SEED),
          configPda.toBytes(),
          new BN(lockPeriod).toBuffer("le", 8),
        ],
        program.programId
      );

      vaultInfo = (await program.account.vault.fetch(vaultPda)) || {
        totalStaked: new BN("0"),
      };

      if (!wallet.publicKey) {
        return { listLockedItems: [], vaultInfo };
      }

      const [stakerInfoPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKER_INFO_SEED),
          vaultPda.toBytes(),
          wallet.publicKey.toBytes(),
        ],
        program.programId
      );

      let currentId = 0;
      try {
        const stakerInfo = await program.account.stakerInfo.fetch(
          stakerInfoPda
        );
        currentId = stakerInfo.currentId.toNumber();

        const listLockedItems = await Promise.all(
          [...new Array(currentId)].map(async (_item, key) => {
            const [userStakeDetailPda] = PublicKey.findProgramAddressSync(
              [
                Buffer.from(STAKE_DETAIL_SEED),
                stakerInfoPda.toBytes(),
                new BN(key + 1).toBuffer("le", 8),
              ],
              program.programId
            );

            const info = await program.account.stakeDetail.fetch(
              userStakeDetailPda
            );

            return { ...(info || {}), lockPeriod };
          })
        );

        return { listLockedItems, vaultInfo };
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.log("get list error", error);
      return { listLockedItems: [], vaultInfo };
    }
  }

  async unStake(
    lockPeriod: number,
    id: number,
    amount: number,
    wallet: WalletContextState
  ) {
    try {
      if (!this.connection || !wallet.publicKey) {
        console.log("Warning: Wallet not connected");
        return;
      }
      const provider = anchor.getProvider();
      const program = new Program(vaultInterface, provider) as Program<Vault>;

      let [configPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKE_CONFIG_SEED),
          new PublicKey(stakeCurrencyMint).toBytes(),
        ],
        program.programId
      );

      const transaction = new Transaction();
      const cpIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000,
      });
      const cuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 });

      const unStakeIx = await program.methods
        .destake(new BN(id), new BN(lockPeriod), new BN(amount))
        .accounts({
          signer: wallet.publicKey,
          stakeCurrencyMint: stakeCurrencyMint,
        })
        .instruction();

      transaction.add(unStakeIx);
      transaction.add(cpIx, cuIx);
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await this.connection.getLatestBlockhash()
      ).blockhash;

      if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const sTx = signedTx.serialize();
        const signature = await this.connection.sendRawTransaction(sTx, {
          preflightCommitment: "confirmed",
          skipPreflight: false,
        });
        const blockhash = await this.connection.getLatestBlockhash();

        const res = await this.connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          "confirmed" // FIXME: trick lord confirmed / finalized;
        );

        console.log("Successfully unlocking token.\n Signature: ", signature);
        return res;
      }
    } catch (error) {
      console.log("Error in locking token transaction", error, error.error);
      const { transaction = "", result } =
        (await handleTransaction({
          error,
          connection: this.connection,
        })) || {};

      if (result?.value?.confirmationStatus) {
        console.log("----confirm----", { transaction, result });
        return { transaction, result };
      }
    }
  }
}
