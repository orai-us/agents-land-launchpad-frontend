import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionExpiredTimeoutError,
} from "@solana/web3.js";
import { Pumpfun } from "./pumpfun";
import idl from "./pumpfun.json";
import * as anchor from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { errorAlert } from "@/components/others/ToastGroup";
import { Program } from "@coral-xyz/anchor";
import { SEED_CONFIG } from "./seed";
import { launchDataInfo } from "@/utils/types";
import BigNumber from "bignumber.js";

export const commitmentLevel = "confirmed";
export const TOKEN_RESERVES = 1_000_000_000_000_000;
export const LAMPORT_RESERVES = 1_000_000_000;
export const INIT_BONDING_CURVE = 95;

export const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC;
export const pumpProgramId = new PublicKey(idl.address);
export const pumpProgramInterface = JSON.parse(JSON.stringify(idl));

export class Web3SolanaProgramInteraction {
  constructor(
    private readonly connection = new Connection(endpoint, {
      commitment: commitmentLevel,
      wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS,
    })
  ) {}

  // Send Fee to the Fee destination
  createToken = async (
    wallet: WalletContextState,
    coinData: launchDataInfo
  ) => {
    const provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: commitmentLevel,
      preflightCommitment: "confirmed",
    });
    anchor.setProvider(provider);
    const program = new Program(
      pumpProgramInterface as Pumpfun,
      provider
    ) as Program<Pumpfun>;

    console.log("========Fee Pay==============");

    // check the connection
    if (!wallet.publicKey || !this.connection) {
      errorAlert("Wallet Not Connected");
      console.log("Warning: Wallet not connected");
      return "WalletError";
    }

    try {
      console.log("coinData--->", coinData);
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_CONFIG)],
        program.programId
      );
      const configAccount = await program.account.config.fetch(configPda);

      const mintKp = Keypair.generate();

      const transaction = new Transaction();
      const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000,
      });
      const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 300_000,
      });
      const createIx = await program.methods
        .launch(coinData.name, coinData.symbol, coinData.uri)
        .accounts({
          creator: wallet.publicKey,
          token: mintKp.publicKey,
          teamWallet: configAccount.teamWallet,
        })
        .instruction();

      transaction.add(updateCpIx, updateCuIx, createIx);

      if (coinData.presale) {
        const swapIx = await program.methods
          .swap(
            new anchor.BN(coinData.presale * Math.pow(10, 9)),
            0,
            new anchor.BN(0)
          )
          .accounts({
            teamWallet: configAccount.teamWallet,
            user: wallet.publicKey,
            tokenMint: mintKp.publicKey,
          })
          .instruction();
        transaction.add(swapIx);
      }

      transaction.feePayer = wallet.publicKey;
      const blockhash = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;

      transaction.sign(mintKp);
      console.log("--------------------------------------");
      console.log(transaction);

      if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const sTx = signedTx.serialize();
        console.log(
          "---- simulate tx",
          await this.connection.simulateTransaction(signedTx)
        );
        const signature = await this.connection.sendRawTransaction(sTx, {
          preflightCommitment: "confirmed",
          skipPreflight: false,
        });
        const res = await this.connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          commitmentLevel
        );
        console.log("Successfully initialized.\n Signature: ", signature);
        return res;
      }
    } catch (error) {
      console.log("----", error);
      return false;
    }
  };

  // Swap transaction
  swapTx = async (
    mint: PublicKey,
    wallet: WalletContextState,
    amount: string,
    type: number
  ): Promise<any> => {
    console.log("========trade swap==============");

    // check the connection
    if (!wallet.publicKey || !this.connection) {
      console.log("Warning: Wallet not connected");
      return;
    }
    const provider = new anchor.AnchorProvider(this.connection, wallet, {
      preflightCommitment: "confirmed",
    });
    anchor.setProvider(provider);
    const program = new Program(
      pumpProgramInterface,
      provider
    ) as Program<Pumpfun>;
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    );

    const configAccount = await program.account.config.fetch(configPda);
    try {
      const transaction = new Transaction();
      const cpIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000,
      });
      const cuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 });

      const coinDecimal = type === 0 ? 9 : 6;
      const swapIx = await program.methods
        .swap(
          new anchor.BN(parseFloat(amount) * Math.pow(10, coinDecimal)),
          type,
          new anchor.BN(0)
        )
        .accounts({
          teamWallet: configAccount.teamWallet,
          user: wallet.publicKey,
          tokenMint: mint,
        })
        .instruction();
      transaction.add(swapIx);
      transaction.add(cpIx, cuIx);
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await this.connection.getLatestBlockhash()
      ).blockhash;

      if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const sTx = signedTx.serialize();
        console.log(
          "----",
          await this.connection.simulateTransaction(signedTx)
        );
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

        console.log("Successfully initialized.\n Signature: ", signature);
        return res;

        // const { result } = await this.handleTransaction({
        //   error: { signature } as any,
        // });

        // console.log("result", result);
        // if (result?.value?.confirmationStatus) {
        //   console.log("Successfully initialized.\n Signature: ", signature);
        //   return { signature, result };
        // }
      }
    } catch (error) {
      console.log("Error in swap transaction", error, error.error);
      const { transaction = "", result } = await this.handleTransaction({
        error,
      });

      if (result) {
        console.log("----confirm----", { transaction, result });
        return { transaction, result };
      }
    }
  };

  getTokenBalance = async (walletAddress: string, tokenMintAddress: string) => {
    const wallet = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(tokenMintAddress);

    // Fetch the token account details
    const response = await this.connection.getTokenAccountsByOwner(wallet, {
      mint: tokenMint,
    });

    if (response.value.length == 0) {
      console.log("No token account found for the specified mint address.");
      return;
    }

    // Get the balance
    const tokenAccountInfo = await this.connection.getTokenAccountBalance(
      response.value[0].pubkey
    );

    // Convert the balance from integer to decimal format

    console.log(`Token Balance: ${tokenAccountInfo.value.uiAmount}`);

    return tokenAccountInfo.value.uiAmount;
  };

  getSolanaBalance = async (publicKey: PublicKey) => {
    const balance = await this.connection.getBalance(publicKey);
    const balanceSolana = new BigNumber(balance)
      .dividedBy(LAMPORTS_PER_SOL)
      .toNumber();

    return balanceSolana;
  };

  getNumberOfOwnedToken = async (walletPublicKey: PublicKey) => {
    try {
      // // Convert the wallet address to PublicKey
      // const walletPublicKey = new PublicKey(walletAddress);

      // Fetch all token accounts owned by the wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ), // SPL Token Program ID
        }
      );

      // Process token accounts to list balances and mint addresses
      const tokens = tokenAccounts.value
        .map((tokenAccount) => {
          const info = tokenAccount.account.data.parsed.info;
          const mint = info.mint; // Mint address (unique for each token)
          const balance = info.tokenAmount.uiAmount; // Human-readable balance

          return { mint, balance };
        })
        .filter((token) => token.balance > 0); // Filter out zero-balance tokens

      // Count unique tokens and log the results
      const uniqueTokens = new Set(tokens.map((token) => token.mint));
      console.log(`You hold ${uniqueTokens.size} unique tokens:`);
      // tokens.forEach((token) => {
      //   console.log(`Token Mint: ${token.mint}, Balance: ${token.balance}`);
      // });

      return {
        uniqueTokenCount: uniqueTokens.size,
        tokenDetails: tokens,
      };
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return {
        uniqueTokenCount: 0,
        tokenDetails: [],
      };
    }
  };

  isTransactionExpiredTimeoutError(error: any) {
    return error instanceof TransactionExpiredTimeoutError;
  }

  handleTransaction = async ({
    error,
  }: {
    error: TransactionExpiredTimeoutError;
  }) => {
    try {
      if (this.isTransactionExpiredTimeoutError(error) || error["signature"]) {
        const result = await this.connection.getSignatureStatus(
          error.signature,
          {
            searchTransactionHistory: true,
          }
        );

        if (result?.value?.confirmationStatus) {
          console.log(result);

          return { transaction: error.signature, result };
        }
      }

      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
}
