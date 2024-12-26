import {
  ALL_CONFIGS,
  STAKE_CONFIG_SEED,
  STAKE_FUNGIBLE_INFO_SEED,
  VAULT_SEED,
} from '@/config';
import { toPublicKey } from '@/utils/util';
import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import { Fungstake } from './fungstake/fungstake';
import idl from './fungstake/fungstake.json';
import { handleTransaction } from './utils';
import { commitmentLevel, endpoint } from './web3';

export const stakeProgramId = new PublicKey(idl.address);
export const stakeInterface = JSON.parse(JSON.stringify(idl));

const stakeCurrencyMint = ALL_CONFIGS.STAKE_CURRENCY_MINT;

export class web3FungibleStake {
  constructor(
    private readonly connection = new Connection(endpoint, {
      commitment: commitmentLevel,
      wsEndpoint: import.meta.env.VITE_SOLANA_WS,
    })
  ) {}

  async stake(
    rewardCurrencyMint: PublicKey,
    amount: number,
    wallet: WalletContextState
  ) {
    try {
      if (!this.connection || !wallet.publicKey) {
        console.log('Warning: Wallet not connected');
        return;
      }
      const provider = new anchor.AnchorProvider(this.connection, wallet, {
        preflightCommitment: 'confirmed',
      });
      anchor.setProvider(provider);
      const program = new Program(
        stakeInterface,
        provider
      ) as Program<Fungstake>;

      const transaction = new Transaction();
      const cpIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000,
      });
      const cuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 });

      const stakeIx = await program.methods
        .stake(new BN(amount))
        .accounts({
          signer: wallet.publicKey,
          stakeCurrencyMint: stakeCurrencyMint,
          rewardCurrencyMint: new PublicKey(rewardCurrencyMint),
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
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        });
        const blockhash = await this.connection.getLatestBlockhash();

        const res = await this.connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          'confirmed' // FIXME: trick lord confirmed / finalized;
        );

        console.log('Successfully locking token.\n Signature: ', signature);
        return res;
      }
    } catch (error) {
      console.log('Error in locking token transaction', error, error.error);
      const { transaction = '', result } =
        (await handleTransaction({
          error,
          connection: this.connection,
        })) || {};

      if (result?.value?.confirmationStatus) {
        console.log('----confirm----', { transaction, result });
        return { transaction, result };
      }
    }
  }

  async unStake(
    rewardCurrencyMint: PublicKey,
    amount: number,
    wallet: WalletContextState
  ) {
    try {
      if (!this.connection || !wallet.publicKey) {
        console.log('Warning: Wallet not connected');
        return;
      }
      const provider = new anchor.AnchorProvider(this.connection, wallet, {
        preflightCommitment: 'confirmed',
      });
      anchor.setProvider(provider);
      const program = new Program(
        stakeInterface,
        provider
      ) as Program<Fungstake>;

      const transaction = new Transaction();
      const cpIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000,
      });
      const cuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 });

      const unStakeIx = await program.methods
        .destake(new BN(amount))
        .accounts({
          signer: wallet.publicKey,
          stakeCurrencyMint: stakeCurrencyMint,
          rewardCurrencyMint: new PublicKey(rewardCurrencyMint),
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
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        });
        const blockhash = await this.connection.getLatestBlockhash();

        const res = await this.connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          'confirmed' // FIXME: trick lord confirmed / finalized;
        );

        console.log('Successfully unlocking token.\n Signature: ', signature);
        return res;
      }
    } catch (error) {
      console.log('Error in locking token transaction', error, error.error);
      const { transaction = '', result } =
        (await handleTransaction({
          error,
          connection: this.connection,
        })) || {};

      if (result?.value?.confirmationStatus) {
        console.log('----confirm----', { transaction, result });
        return { transaction, result };
      }
    }
  }

  async getStakeInfo(
    rewardCurrencyMint: PublicKey,
    wallet: WalletContextState
  ) {
    let vaultInfo = { totalStaked: new BN('0') };
    try {
      if (!this.connection) {
        console.log('Warning: connection not connected');
        return;
      }
      const provider = new anchor.AnchorProvider(this.connection, wallet, {
        preflightCommitment: 'confirmed',
      });
      anchor.setProvider(provider);
      const program = new Program(
        stakeInterface,
        provider
      ) as Program<Fungstake>;

      let [configPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKE_CONFIG_SEED),
          toPublicKey(ALL_CONFIGS.STAKE_CURRENCY_MINT).toBytes(),
        ],
        program.programId
      );
      let [vaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(VAULT_SEED),
          configPda.toBytes(),
          new PublicKey(rewardCurrencyMint).toBytes(),
        ],
        program.programId
      );

      vaultInfo = (await program.account.vault.fetch(vaultPda)) || {
        totalStaked: new BN('0'),
      };

      if (!wallet.publicKey) {
        return { stakerInfo: null, vaultInfo };
      }

      let [stakerInfoPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKE_FUNGIBLE_INFO_SEED),
          vaultPda.toBytes(),
          wallet.publicKey.toBytes(),
        ],
        program.programId
      );
      const stakerInfo = await program.account.stakeInfo.fetch(stakerInfoPda);

      return {
        stakerInfo,
        vaultInfo,
      };
    } catch (error) {
      console.log('Error in get stake token transaction', error, error.error);

      return {
        stakerInfo: null,
        vaultInfo,
      };
    }
  }

  async getStakeConfig(wallet: WalletContextState) {
    try {
      if (!this.connection) {
        console.log('Warning: connection not connected');
        return;
      }
      const provider = new anchor.AnchorProvider(this.connection, wallet, {
        preflightCommitment: 'confirmed',
      });
      anchor.setProvider(provider);
      const program = new Program(
        stakeInterface,
        provider
      ) as Program<Fungstake>;

      let [configPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(STAKE_CONFIG_SEED),
          toPublicKey(ALL_CONFIGS.STAKE_CURRENCY_MINT).toBytes(),
        ],
        program.programId
      );
      const config = await program.account.stakeConfig.fetch(configPda);
      return config;
    } catch (error) {
      console.log('Error in get stake config transaction', error, error.error);

      return;
    }
  }
}
