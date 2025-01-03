import { SimpleSnapshotContractQueryClient as AgentsLandSnapshotContractQueryClient } from '@/sdk/oraiAgentSdk';
import { errorAlert } from '@/components/others/ToastGroup';
import {
  FUNGIBLE_STAKE_CONFIG_SEED,
  FUNGIBLE_VAULT_SEED,
  PARRY_STATUS,
  SEED_GLOBAL,
  SPL_DECIMAL,
} from '@/config';
import {
  rayBuyTx,
  raySellTx,
  simulateSwapOnRaydium,
} from '@/utils/raydiumSwap/raydiumSwap';
import { launchDataInfo, metadataInfo } from '@/utils/types';
import {
  calculateMarketCap,
  calculateTokenPrice,
  genTokenKeypair,
  toBN,
} from '@/utils/util';
import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { Metaplex } from '@metaplex-foundation/js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import base58 from 'bs58';
import { ALL_CONFIGS } from './../config';
import { Fungstake } from './fungstake/fungstake';
import idlStake from './fungstake/fungstake.json';
import { fetchJSONDataFromUrl } from './logListeners/utils';
import { Pumpfun } from './pumpfun';
import idl from './pumpfun.json';
import { SEED_BONDING_CURVE, SEED_CONFIG } from './seed';
import { handleTransaction } from './utils';
import { ConfigState } from '@/zustand-store/config/useConfigStore';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export const commitmentLevel = 'confirmed';
export const TOKEN_RESERVES = 1_000_000_000_000_000;
export const LAMPORT_RESERVES = 1_000_000_000;
export const FAKE_AGENT = 'oCQLttxhiCGMbTYQjiYNRcpu5M3LXX8RxURBP6xB9Zk';

export const endpoint = import.meta.env.VITE_SOLANA_RPC;
export const pumpProgramId = new PublicKey(idl.address);
export const stakeProgramId = new PublicKey(idlStake.address);
export const pumpProgramInterface = JSON.parse(JSON.stringify(idl));
export const stakeProgramInterface = JSON.parse(JSON.stringify(idlStake));

let globalLaunchpadConfig: anchor.IdlAccounts<Pumpfun>['config'];
export class Web3SolanaProgramInteraction {
  constructor() {}

  private async getLaunchpadGlobalConfig() {
    if (!globalLaunchpadConfig) {
      const provider = anchor.getProvider();
      const program = new Program(
        pumpProgramInterface as Pumpfun,
        provider,
      ) as Program<Pumpfun>;

      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_CONFIG)],
        program.programId,
      );
      const configAccount = await program.account.config.fetch(configPda);
      globalLaunchpadConfig = configAccount;
    }
    return globalLaunchpadConfig;
  }

  // Send Fee to the Fee destination
  createToken = async (
    wallet: WalletContextState,
    coinData: launchDataInfo,
  ) => {
    const provider = anchor.getProvider();
    const program = new Program(
      pumpProgramInterface as Pumpfun,
      provider,
    ) as Program<Pumpfun>;

    const programStake = new Program(
      stakeProgramInterface as Fungstake,
      provider,
    ) as Program<Fungstake>;

    console.log('========Fee Pay==============');

    // check the connection
    if (!wallet.publicKey || !provider.connection) {
      errorAlert('Wallet Not Connected');
      console.log('Warning: Wallet not connected');
      return 'WalletError';
    }

    try {
      console.log('coinData--->', coinData);
      const configAccount = await this.getLaunchpadGlobalConfig();

      const envMode = import.meta.env.VITE_APP_SOLANA_ENV;
      let mintKp = Keypair.generate();
      if (envMode === 'mainnet-beta') {
        console.log('gen Orai prefix');
        const key = await genTokenKeypair();
        mintKp = Keypair.fromSecretKey(base58.decode(key));
      }
      console.log('tokenAddress:', mintKp.publicKey.toBase58());

      const aiAgentTokenAccount = this.getAssociatedTokenAccount(
        new PublicKey(coinData.metadata.agentAddress),
        mintKp.publicKey,
      );
      const creatorTokenAccount = this.getAssociatedTokenAccount(
        wallet.publicKey,
        mintKp.publicKey,
      );

      const stakingTokenAccount = this.getAssociatedTokenAccount(
        new PublicKey(ALL_CONFIGS.STRONGBOX_VAULT_PROGRAM_ID),
        mintKp.publicKey,
      );

      const communityPoolTokenAccount = this.getAssociatedTokenAccount(
        new PublicKey(ALL_CONFIGS.DISTILL_COMMUNITY_POOL_WALLET),
        mintKp.publicKey,
      );

      const transaction = new Transaction();
      const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000,
      });
      const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 500_000,
      });
      const createIx = await program.methods
        .launch(coinData.name, coinData.symbol, coinData.uri)
        .accounts({
          creator: wallet.publicKey,
          token: mintKp.publicKey,
          communityPoolWallet: configAccount.communityPoolWallet,
          aiAgentWallet: new PublicKey(coinData.metadata.agentAddress), // user // agent address from data coin // FIXME:
          stakingWallet: new PublicKey(ALL_CONFIGS.STRONGBOX_VAULT_PROGRAM_ID),
        })
        .remainingAccounts([
          {
            isWritable: true,
            isSigner: false,
            pubkey: aiAgentTokenAccount,
          },
          {
            isWritable: true,
            isSigner: false,
            pubkey: creatorTokenAccount,
          },
          {
            isWritable: true,
            isSigner: false,
            pubkey: stakingTokenAccount,
          },
          {
            isWritable: true,
            isSigner: false,
            pubkey: communityPoolTokenAccount,
          },
        ])
        .instruction();

      console.log('createIx', createIx);

      transaction.add(updateCpIx, updateCuIx, createIx);

      if (coinData.presale) {
        const swapIx = await program.methods
          .swap(
            new anchor.BN(coinData.presale * Math.pow(10, 9)),
            0,
            new anchor.BN(0),
          )
          .accounts({
            teamWallet: configAccount.teamWallet,
            user: wallet.publicKey,
            tokenMint: mintKp.publicKey,
          })
          .instruction();
        transaction.add(swapIx);
      }

      const ixInstructions = await programStake.methods
        .createVault()
        .accounts({
          signer: wallet.publicKey,
          stakeCurrencyMint: new PublicKey(ALL_CONFIGS.STAKE_CURRENCY_MINT),
          rewardCurrencyMint: mintKp.publicKey,
        })
        .instruction();

      transaction.add(ixInstructions);

      transaction.feePayer = wallet.publicKey;
      const blockhash = await provider.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;

      transaction.sign(mintKp);
      console.log('--------------------------------------');
      console.log(transaction);

      if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const sTx = signedTx.serialize();
        console.log(
          '---- simulate tx',
          await provider.connection.simulateTransaction(signedTx),
        );
        const signature = await provider.connection.sendRawTransaction(sTx, {
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        });
        const res = await provider.connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          'finalized',
        );
        console.log('Successfully initialized.\n Signature: ', signature);
        return {
          ...coinData,
          token: mintKp.publicKey,
          result: res,
        };
      }
    } catch (error) {
      console.log('--error--', error);
      return false;
    }
  };

  getMaxBondingCurveLimit = async (
    mint: PublicKey,
    wallet: WalletContextState,
  ): Promise<any> => {
    const provider = anchor.getProvider();
    // check the connection
    if (!provider.connection) {
      console.log('Warning: connection not connected');
      return;
    }
    const program = new Program(
      pumpProgramInterface,
      provider,
    ) as Program<Pumpfun>;

    try {
      const configAccount = await this.getLaunchpadGlobalConfig();

      const platformBuyFee = configAccount.platformBuyFee || 0;
      const curveLimit = configAccount.curveLimit.toNumber();
      const [bondingCurvePda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_BONDING_CURVE), mint.toBytes()],
        program.programId,
      );
      const curveAccount = await program.account.bondingCurve.fetch(
        bondingCurvePda,
      );

      const solReserve = curveAccount.reserveLamport.toNumber();
      const maxSolSwap = curveLimit - solReserve;

      const maxSolSwapIncludeFee = new BigNumber(maxSolSwap)
        .multipliedBy(new BigNumber(platformBuyFee).plus(100))
        .div(100)
        .toNumber();

      return { curveAccount, maxSolSwapIncludeFee };
    } catch (error) {
      console.log('Error in get config curve limit', error);
      return { curveAccount: {}, maxSolSwapIncludeFee: 0 };
    }
  };

  getBondingCurveOfToken = async (
    mint: PublicKey,
    wallet: WalletContextState,
  ): Promise<any> => {
    const provider = anchor.getProvider();
    // check the connection
    if (!provider.connection) {
      console.log('Warning: connection not connected');
      return;
    }
    const program = new Program(
      pumpProgramInterface,
      provider,
    ) as Program<Pumpfun>;

    try {
      const [bondingCurvePda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_BONDING_CURVE), mint.toBytes()],
        program.programId,
      );
      const curveInfo = await program.account.bondingCurve.fetch(
        bondingCurvePda,
      );

      console.log('curveInfo', curveInfo);

      return curveInfo;
    } catch (error) {
      console.log('Error in get config curve limit', error);
      return;
    }
  };

  getConfigData = async (wallet: WalletContextState): Promise<any> => {
    const provider = anchor.getProvider();
    // check the connection
    if (!provider.connection) {
      console.log('Warning: connection not connected');
      return;
    }
    const program = new Program(
      pumpProgramInterface,
      provider,
    ) as Program<Pumpfun>;

    try {
      const configAccount = await this.getLaunchpadGlobalConfig();

      const platformBuyFee = configAccount.platformBuyFee;
      return platformBuyFee;
    } catch (error) {
      console.log('Error in get config curve limit', error);
      return 0;
    }
  };

  // Swap transaction
  swapTx = async (
    mint: PublicKey,
    wallet: WalletContextState,
    amount: string,
    type: number,
    simulateReceive: string,
    slippage: string,
    isParty?: boolean,
  ): Promise<any> => {
    console.log('==============trade swap==============');

    let provider;
    try {
      provider = anchor.getProvider();
      // check the connection
      if (!wallet.publicKey || !provider.connection) {
        console.log('Warning: Wallet not connected');
        return;
      }
      const program = new Program(
        pumpProgramInterface,
        provider,
      ) as Program<Pumpfun>;

      const configAccount = await this.getLaunchpadGlobalConfig();

      const curveLimit = configAccount.curveLimit.toNumber();
      // check launch phase is 'Presale'
      const [bondingCurvePda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_BONDING_CURVE), mint.toBytes()],
        program.programId,
      );

      const curveAccount = await program.account.bondingCurve.fetch(
        bondingCurvePda,
      );

      const solReserve = curveAccount.reserveLamport.toNumber();

      const maxSolSwap = curveLimit - solReserve;
      console.log(maxSolSwap, amount);

      const transaction = new Transaction();
      const cpIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000,
      });
      const cuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 });

      const coinDecimal = type === 0 ? 9 : 6;
      const receiveDecimal = type !== 0 ? 9 : 6;
      const addFee = type === 0 ? slippage : Number(slippage) + 1; // fee
      const fmtAmount = new anchor.BN(
        parseFloat(amount) * Math.pow(10, coinDecimal),
      );

      // FIXME: uncomment to check limit curve
      // if (
      //   type === 0 &&
      //   new BigNumber(fmtAmount.toNumber()).isGreaterThan(maxSolSwap)
      // ) {
      //   console.log("Exceeded bonding curve limit");
      //   throw Error("Exceeded bonding curve limit");
      // }

      const minAmount = toBN(simulateReceive)
        .multipliedBy(Math.pow(10, receiveDecimal))
        .multipliedBy(toBN(1).minus(Number(addFee) / 100))
        .toNumber();

      let swapIx = await program.methods
        .swap(fmtAmount, type, new anchor.BN(minAmount || 0))
        .accounts({
          teamWallet: configAccount.teamWallet,
          user: wallet.publicKey,
          tokenMint: mint,
        })
        .instruction();

      if (isParty && type === 0) {
        let [stakeConfigPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from(FUNGIBLE_STAKE_CONFIG_SEED),
            new PublicKey(ALL_CONFIGS.STAKE_CURRENCY_MINT).toBytes(),
          ],
          new PublicKey(ALL_CONFIGS.STAKING_PROGRAM_ID),
        );

        let [vaultPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from(FUNGIBLE_VAULT_SEED),
            stakeConfigPda.toBytes(),
            mint.toBytes(),
          ],
          new PublicKey(ALL_CONFIGS.STAKING_PROGRAM_ID),
        );
        let [userStakePda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('stake_info'),
            vaultPda.toBytes(),
            wallet.publicKey.toBytes(),
          ],
          new PublicKey(ALL_CONFIGS.STAKING_PROGRAM_ID),
        );

        swapIx = await program.methods
          .buyParty(fmtAmount, new anchor.BN(minAmount || 0))
          .accounts({
            teamWallet: configAccount.teamWallet,
            user: wallet.publicKey,
            tokenMint: mint,
          })
          .remainingAccounts([
            {
              isWritable: true,
              isSigner: false,
              pubkey: stakeConfigPda,
            },
            {
              isWritable: true,
              isSigner: false,
              pubkey: new PublicKey(ALL_CONFIGS.STAKE_CURRENCY_MINT),
            },
            {
              isWritable: true,
              isSigner: false,
              pubkey: vaultPda,
            },
            {
              isWritable: true,
              isSigner: false,
              pubkey: userStakePda,
            },
          ])
          .instruction();
      }

      transaction.add(swapIx);
      transaction.add(cpIx, cuIx);
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;

      if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const sTx = signedTx.serialize();
        const signature = await provider.connection.sendRawTransaction(sTx, {
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        });
        const blockhash = await provider.connection.getLatestBlockhash();

        const res = await provider.connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          'confirmed', // FIXME: trick lord confirmed / finalized;
        );

        console.log('Successfully initialized.\n Signature: ', signature);
        return res;
      }
    } catch (error) {
      console.log('Error in swap transaction', error, error.error);

      if (!provider) {
        return;
      }
      const { transaction = '', result } =
        (await handleTransaction({
          error,
          connection: provider.connection,
        })) || {};

      if (result?.value?.confirmationStatus) {
        console.log('----confirm----', { transaction, result });
        return { transaction, result };
      }
    }
  };

  //Raydium Swap transaction
  raydiumSwapTx = async (
    mint: PublicKey,
    wallet: WalletContextState,
    amount: string,
    type: number,
    poolKey: string,
    slippage: string,
  ) => {
    let provider;
    try {
      provider = anchor.getProvider();
      // check the connection
      if (!wallet.publicKey || !provider.connection) {
        console.log('Warning: Wallet not connected');
        return;
      }

      const poolId = new PublicKey(poolKey);
      const coinDecimal = type === 0 ? 9 : 6;
      const fmtAmount = new anchor.BN(
        parseFloat(amount) * Math.pow(10, coinDecimal),
      ).toNumber();
      const transaction = new Transaction();

      let swapTx;
      if (type == 0) {
        swapTx = await rayBuyTx(
          provider.connection,
          mint,
          fmtAmount,
          wallet,
          poolId,
          slippage,
        );
      } else {
        swapTx = await raySellTx(
          provider.connection,
          mint,
          fmtAmount,
          wallet,
          poolId,
          slippage,
        );
      }
      if (swapTx == null) {
        console.log(`Error getting buy transaction`);
        return null;
      }

      // transaction.add(cpIx, cuIx);
      transaction.add(...swapTx.instructions);

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;

      if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const sTx = signedTx.serialize();
        // console.log(
        //   "----",
        //   await this.connection.simulateTransaction(signedTx)
        // );
        const signature = await provider.connection.sendRawTransaction(sTx, {
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        });
        const blockhash = await provider.connection.getLatestBlockhash();
        const res = await provider.connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          'confirmed',
        );
        console.log('Successfully initialized.\n Signature: ', signature);
        return res;
      }
    } catch (error) {
      console.log('Error in swap transaction', error, error.error);
      if (!provider) {
        return;
      }
      const { transaction = '', result } =
        (await handleTransaction({
          error,
          connection: provider.connection,
        })) || {};

      if (result?.value?.confirmationStatus) {
        console.log('----confirm----raydium', { transaction, result });
        return { transaction, result };
      }
    }
  };

  //Raydium Swap transaction
  simulateRaydiumSwapTx = async (
    mint: PublicKey,
    wallet: WalletContextState,
    amount: string,
    type: number,
    poolKey: string,
  ) => {
    try {
      const provider = anchor.getProvider();
      if (!poolKey) {
        console.log('Coin not listed');
        return;
      }

      // check the connection
      if (!wallet.publicKey || !provider.connection) {
        console.log('Warning: Wallet not connected');
        return;
      }
      const poolId = new PublicKey(poolKey);
      const res = await simulateSwapOnRaydium(type, {
        solanaConnection: provider.connection,
        baseMint: mint,
        amount: Number(amount),
        wallet,
        poolId,
      });

      if (res) {
        const { numerator, denominator } = res;

        // return new anchor.BN(denominator).eqn(0)
        //   ? 0
        //   : new anchor.BN(numerator).div(denominator).toNumber();

        // return numerator.toString();
        return res;
      }

      // return "0";
    } catch (error) {
      console.log('Error in simulate swap transaction', error);
    }
  };

  // Swap transaction
  simulateSwapTx = async (
    mint: PublicKey,
    wallet: WalletContextState,
    amount: string,
    type: number,
  ): Promise<string> => {
    console.log('========Simulate swap==============');

    const provider = anchor.getProvider();
    // check the connection
    if (!wallet.publicKey || !provider.connection) {
      console.log('Warning: Wallet not connected');
      return;
    }

    console.log('simulateSwapTx', provider);
    const program = new Program(
      pumpProgramInterface,
      provider,
    ) as Program<Pumpfun>;

    try {
      const tx = await program.methods
        .simulateSwap(new BN(amount), type)
        .accounts({
          tokenMint: mint,
        })
        .view();

      const actualAmountOut = new BN(tx).toString();
      return actualAmountOut;
    } catch (error) {
      console.log('Error in simulate swap transaction', error, error.error);
    }
  };

  getTokenBalance = async (walletAddress: string, tokenMintAddress: string) => {
    const wallet = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(tokenMintAddress);

    const provider = anchor.getProvider();
    // Fetch the token account details
    const response = this.getAssociatedTokenAccount(wallet, tokenMint);

    // Get the balance
    const tokenAccountInfo = await provider.connection.getTokenAccountBalance(
      response,
    );

    return tokenAccountInfo.value.uiAmount;
  };

  getSolanaBalance = async (publicKey: PublicKey) => {
    const provider = anchor.getProvider();
    const balance = await provider.connection.getBalance(publicKey);
    const balanceSolana = new BigNumber(balance)
      .dividedBy(LAMPORTS_PER_SOL)
      .toNumber();

    return balanceSolana;
  };

  getNumberOfOwnedToken = async (walletPublicKey: PublicKey) => {
    try {
      const provider = anchor.getProvider();
      // // Convert the wallet address to PublicKey
      // const walletPublicKey = new PublicKey(walletAddress);

      // Fetch all token accounts owned by the wallet
      const tokenAccounts =
        await provider.connection.getParsedTokenAccountsByOwner(
          walletPublicKey,
          {
            programId: new PublicKey(
              'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            ), // SPL Token Program ID
          },
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
      console.error('Error fetching token balances:', error);
      return {
        uniqueTokenCount: 0,
        tokenDetails: [],
      };
    }
  };
  getAssociatedTokenAccount = (
    ownerPubkey: PublicKey,
    mintPk: PublicKey,
  ): PublicKey => {
    let associatedTokenAccountPubkey = PublicKey.findProgramAddressSync(
      [
        ownerPubkey.toBytes(),
        TOKEN_PROGRAM_ID.toBytes(),
        mintPk.toBytes(), // mint address
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )[0];

    return associatedTokenAccountPubkey;
  };

  getConfigGlobal = async (wallet, token) => {
    try {
      const provider = anchor.getProvider();
      if (!provider.connection) {
        console.log('Warning: Connection not connected');
        return;
      }
      const program = new Program(
        pumpProgramInterface,
        provider,
      ) as Program<Pumpfun>;

      const [global_vault] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_GLOBAL)],
        program.programId,
      );
      const globalVaultTokenAccount = this.getAssociatedTokenAccount(
        global_vault,
        token,
      );
      const globalVaultBalance =
        await provider.connection.getTokenAccountBalance(
          globalVaultTokenAccount,
        );

      return globalVaultBalance;
    } catch (error) {
      console.log('getConfigGlobal error', error);
    }
  };

  getBondingAddressToken = async (wallet) => {
    try {
      const provider = anchor.getProvider();
      if (!provider.connection) {
        console.log('Warning: Connection not connected');
        return;
      }
      const program = new Program(
        pumpProgramInterface,
        provider,
      ) as Program<Pumpfun>;

      const [global_vault] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_GLOBAL)],
        program.programId,
      );

      return global_vault.toBase58();
    } catch (error) {
      console.log('error', error);
      return '';
    }
  };

  getSnapShotAgent = async () => {
    try {
      const oraiEndpoint = 'https://rpc.orai.io';
      const whitelistContractAddress =
        'orai14z64p3yp8rv99ewvycpeef7h4jlyqwmpyt63m86wyyh0dhjxhqescyclm0';
      const cwClient = await CosmWasmClient.connect(oraiEndpoint);
      const contract = new AgentsLandSnapshotContractQueryClient(
        cwClient,
        whitelistContractAddress,
      );

      // query list token metadata
      /// return:
      /// - token: token addr
      /// - metadata: base64 encode of token metadata
      const dataSnap = await contract.tokensMetadata();

      const res = (dataSnap || []).map((e) => {
        return {
          ...e,
          metadata: JSON.parse(Buffer.from(e.metadata, 'base64').toString()),
        };
      });

      return res || [];
    } catch (error) {
      console.log('error get snapshot', error);
      return [];
    }
  };

  // allowedAddresses: ConfigState['configSnapshot']
  getListTokenFromContract = async () => {
    try {
      const provider = anchor.getProvider();
      const allowedAddresses = await this.getSnapShotAgent();

      if (!provider.connection) {
        console.log('Warning: Connection not connected');
        return;
      }
      const metaplex = Metaplex.make(provider.connection);
      const program = new Program(
        pumpProgramInterface,
        provider,
      ) as Program<Pumpfun>;

      const tokens = await provider.connection.getParsedProgramAccounts(
        program.programId,
        {
          commitment: 'confirmed',
          filters: [
            {
              dataSize: 136,
            },
          ],
        },
      );
      const configAccount = await this.getLaunchpadGlobalConfig();

      const list = await Promise.all(
        tokens.map(async (item) => {
          const detail = program.coder.accounts.decode<
            anchor.IdlAccounts<Pumpfun>['bondingCurve']
          >('bondingCurve', item.account.data as Buffer);

          if (
            allowedAddresses.length > 0 &&
            !allowedAddresses
              .map((e) => e.token)
              .includes(detail.tokenMint.toBase58())
          ) {
            return;
          }

          const metadata = await metaplex
            .nfts()
            .findByMint(
              { mintAddress: detail.tokenMint },
              { commitment: 'confirmed' },
            );

          let metadataJson: metadataInfo = {} as any;
          if (metadata.uri) {
            const dataJson = (await fetchJSONDataFromUrl(metadata.uri)) || {};
            metadataJson = dataJson;
          }

          const solPrice = Number(localStorage.getItem('solPrice'));
          const newPrice = calculateTokenPrice(
            detail.reserveToken,
            detail.reserveLamport,
            configAccount.tokenDecimalsConfig || SPL_DECIMAL,
            solPrice,
          );
          const marketcap = calculateMarketCap(
            detail.reserveToken,
            configAccount.tokenDecimalsConfig || SPL_DECIMAL,
            newPrice,
          );

          const tokenDetail = {
            creator: detail.creator.toBase58(),
            decimals: configAccount.tokenDecimalsConfig || SPL_DECIMAL,
            name: metadata.name,
            ticker: metadata.symbol,
            description: metadataJson.description,
            token: detail.tokenMint.toBase58(),
            url: metadataJson.image,
            tokenReserves: detail.reserveToken,
            lamportReserves: detail.reserveLamport,
            marketcap,
            bondingCurveLimit:
              configAccount?.curveLimit || ALL_CONFIGS.BONDING_CURVE_LIMIT,
            metadata: {
              ...metadata,
              ...metadataJson,
              agentAddress: metadata.address.toBase58(),
            } as metadataInfo,
            listed: detail.isCompleted, // TODO: this value in contract is bonding curve isCompleted, but when data BE failed we only need to check isComplete is true and user can trade via raydium
            tradingTime: new Date(
              detail.partyStart.muln(ALL_CONFIGS.TIMER.MILLISECONDS).toNumber(),
            ),
            date: new Date(
              detail.curveCreationDate
                .muln(ALL_CONFIGS.TIMER.MILLISECONDS)
                .toNumber(),
            ),
          };

          return { ...detail, ...tokenDetail };
        }),
      );

      const listFmt = list.filter(Boolean);
      return {
        coins: listFmt,
        total: listFmt.length,
        fromRpc: true,
      };
    } catch (error) {
      console.log('getListTokenFromContract error', error);
      return {
        coins: [],
        total: 0,
      };
    }
  };

  getTokenDetailFromContract = async (
    wallet: WalletContextState,
    tokenMint: PublicKey,
  ) => {
    try {
      const provider = anchor.getProvider();
      if (!provider.connection) {
        console.log('Warning: Connection not connected');
        return;
      }
      const allowedAddresses = await this.getSnapShotAgent();
      const currentTokenData = allowedAddresses.find(
        (e) => e.token === tokenMint.toBase58(),
      );
      const raydiumPoolAddr =
        currentTokenData?.metadata?.['raydiumPoolAddr'] || '';
      const oraidexPoolAddr =
        currentTokenData?.metadata?.['oraidexPoolAddr'] || '';

      const metaplex = Metaplex.make(provider.connection);
      const program = new Program(
        pumpProgramInterface,
        provider,
      ) as Program<Pumpfun>;

      const metadata = await metaplex
        .nfts()
        .findByMint({ mintAddress: tokenMint }, { commitment: 'confirmed' });

      let metadataJson: metadataInfo = {} as any;
      if (metadata.uri) {
        const dataJson = (await fetchJSONDataFromUrl(metadata.uri)) || {};
        metadataJson = dataJson;
      }
      const [bondingCurvePda, _] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_BONDING_CURVE), tokenMint.toBytes()],
        program.programId,
      );

      const [configAccount, bondingCurve] = await Promise.all([
        this.getLaunchpadGlobalConfig(),
        program.account.bondingCurve.fetch(bondingCurvePda),
      ]);

      const solPrice = Number(localStorage.getItem('solPrice'));
      const newPrice = calculateTokenPrice(
        bondingCurve.reserveToken,
        bondingCurve.reserveLamport,
        SPL_DECIMAL,
        solPrice,
      );
      const marketcap = calculateMarketCap(
        bondingCurve.reserveToken,
        SPL_DECIMAL,
        newPrice,
      );

      const tokenDetail = {
        creator: bondingCurve.creator.toBase58(),
        decimals: SPL_DECIMAL,
        name: metadata.name,
        ticker: metadata.symbol,
        description: metadataJson.description,
        token: tokenMint.toBase58(),
        url: metadataJson.image,
        tokenReserves: bondingCurve.reserveToken.toNumber(),
        lamportReserves: bondingCurve.reserveLamport.toNumber(),
        raydiumPoolAddr,
        oraidexPoolAddr,
        bondingCurveLimit:
          configAccount?.curveLimit || ALL_CONFIGS.BONDING_CURVE_LIMIT,
        metadata: {
          ...metadata,
          ...metadataJson,
          agentAddress: metadata.address.toBase58(),
        } as metadataInfo,
        listed: raydiumPoolAddr || oraidexPoolAddr,
        tradingTime: new Date(
          toBN(bondingCurve.partyStart.toNumber())
            .multipliedBy(ALL_CONFIGS.TIMER.MILLISECONDS)
            .toNumber(),
        ),
        marketcap,
        date: new Date(
          bondingCurve.curveCreationDate
            .muln(ALL_CONFIGS.TIMER.MILLISECONDS)
            .toNumber(),
        ),
      };

      return tokenDetail;
    } catch (error) {
      console.log('getTokenDetailFromContract error', error);
      return;
    }
  };

  getConfigCurve = async () => {
    try {
      const provider = anchor.getProvider();
      if (!provider.connection) {
        console.log('Warning: Connection not connected');
        return;
      }
      if (!provider) {
        return;
      }

      const configAccount = await this.getLaunchpadGlobalConfig();

      return configAccount;
    } catch (error) {
      console.log('getConfigCurve error', error);

      errorAlert(
        'RPC call limit reached. Please wait or switch networks to continue!',
      );

      return;
    }
  };

  getAmountBoughtByUser = async (
    token: PublicKey,
    wallet: WalletContextState,
  ) => {
    try {
      const provider = anchor.getProvider();
      if (!provider.connection || !wallet.publicKey) {
        console.log('Warning: Wallet not connected');
        return;
      }
      if (!provider) {
        return;
      }
      const program = new Program(
        pumpProgramInterface,
        provider,
      ) as Program<Pumpfun>;
      const [bondingCurvePda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_BONDING_CURVE), token.toBytes()],
        program.programId,
      );

      const [userPartyPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(PARRY_STATUS),
          bondingCurvePda.toBytes(),
          wallet.publicKey.toBytes(),
        ],
        program.programId,
      );

      const userPartyInfo = await program.account.partyStatus.fetch(
        userPartyPda,
      );

      const amount = (userPartyInfo.totalAmount || '0').toString();

      return amount;
    } catch (error) {
      console.log('getTokenDetailFromContract error', error);
      return '0';
    }
  };
}
