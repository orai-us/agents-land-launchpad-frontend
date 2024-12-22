import assert from "assert";

import {
  ApiPoolInfoV4,
  LIQUIDITY_STATE_LAYOUT_V4,
  LOOKUP_TABLE_CACHE,
  Liquidity,
  LiquidityPoolKeys,
  MARKET_STATE_LAYOUT_V3,
  Market,
  Percent,
  SPL_ACCOUNT_LAYOUT,
  SPL_MINT_LAYOUT,
  Token,
  TokenAccount,
  TokenAmount,
  TxVersion,
  buildSimpleTransaction,
  jsonInfo2PoolKeys,
} from "@raydium-io/raydium-sdk";

import { Connection, PublicKey } from "@solana/web3.js";

import { TX_FEE } from "@/config";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";

type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>;
type TestTxInputInfo = {
  outputToken: Token;
  targetPool: string;
  inputTokenAmount: TokenAmount;
  slippage: Percent;
  walletTokenAccounts: WalletTokenAccounts;
  wallet: WalletContextState;
};
async function getWalletTokenAccount(
  connection: Connection,
  wallet: PublicKey
): Promise<TokenAccount[]> {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}

async function simulateSwapRay(connection: Connection, input: TestTxInputInfo) {
  try {
    const targetPoolInfo = await formatAmmKeysById(
      connection,
      input.targetPool
    );
    assert(targetPoolInfo, "cannot find the target pool");
    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys;

    const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
      poolKeys: poolKeys,
      poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
      amountIn: input.inputTokenAmount,
      currencyOut: input.outputToken,
      slippage: input.slippage,
    });

    return amountOut;
  } catch (error) {
    console.log("error --- simulate swap on ray", error);
    return;
  }
}

async function swapOnlyAmm(connection: Connection, input: TestTxInputInfo) {
  // -------- pre-action: get pool info --------
  const targetPoolInfo = await formatAmmKeysById(connection, input.targetPool);
  assert(targetPoolInfo, "cannot find the target pool");
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys;

  // -------- step 1: coumpute amount out --------
  const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
    poolKeys: poolKeys,
    poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
    amountIn: input.inputTokenAmount,
    currencyOut: input.outputToken,
    slippage: input.slippage,
  });

  // -------- step 2: create instructions by SDK function --------
  const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
    connection,
    poolKeys,
    userKeys: {
      tokenAccounts: input.walletTokenAccounts,
      owner: input.wallet.publicKey,
    },
    amountIn: input.inputTokenAmount,
    amountOut: minAmountOut,
    fixedSide: "in",
    makeTxVersion: TxVersion.V0,
    computeBudgetConfig: {
      microLamports: 10_00 * TX_FEE,
      units: 100_000,
    },
  });
  return innerTransactions;
}

export async function formatAmmKeysById(
  connection: Connection,
  id: string
): Promise<ApiPoolInfoV4> {
  const account = await connection.getAccountInfo(new PublicKey(id));
  if (account === null) throw Error(" get id info error ");
  const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);

  const marketId = info.marketId;
  const marketAccount = await connection.getAccountInfo(marketId);
  if (marketAccount === null) throw Error(" get market info error");
  const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);

  const lpMint = info.lpMint;
  const lpMintAccount = await connection.getAccountInfo(lpMint);
  if (lpMintAccount === null) throw Error(" get lp mint info error");
  const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data);

  return {
    id,
    baseMint: info.baseMint.toString(),
    quoteMint: info.quoteMint.toString(),
    lpMint: info.lpMint.toString(),
    baseDecimals: info.baseDecimal.toNumber(),
    quoteDecimals: info.quoteDecimal.toNumber(),
    lpDecimals: lpMintInfo.decimals,
    version: 4,
    programId: account.owner.toString(),
    authority: Liquidity.getAssociatedAuthority({
      programId: account.owner,
    }).publicKey.toString(),
    openOrders: info.openOrders.toString(),
    targetOrders: info.targetOrders.toString(),
    baseVault: info.baseVault.toString(),
    quoteVault: info.quoteVault.toString(),
    withdrawQueue: info.withdrawQueue.toString(),
    lpVault: info.lpVault.toString(),
    marketVersion: 3,
    marketProgramId: info.marketProgramId.toString(),
    marketId: info.marketId.toString(),
    marketAuthority: Market.getAssociatedAuthority({
      programId: info.marketProgramId,
      marketId: info.marketId,
    }).publicKey.toString(),
    marketBaseVault: marketInfo.baseVault.toString(),
    marketQuoteVault: marketInfo.quoteVault.toString(),
    marketBids: marketInfo.bids.toString(),
    marketAsks: marketInfo.asks.toString(),
    marketEventQueue: marketInfo.eventQueue.toString(),
    lookupTableAccount: PublicKey.default.toString(),
  };
}

export async function getBuyTx(
  solanaConnection: Connection,
  wallet: WalletContextState,
  baseMint: PublicKey,
  quoteMint: PublicKey,
  amount: number,
  targetPool: string,
  slippage: string
) {
  const baseInfo = await getMint(solanaConnection, baseMint);
  if (baseInfo == null) {
    return null;
  }

  const baseDecimal = baseInfo.decimals;

  const baseToken = new Token(TOKEN_PROGRAM_ID, baseMint, baseDecimal);
  const quoteToken = new Token(TOKEN_PROGRAM_ID, quoteMint, 9);

  const quoteTokenAmount = new TokenAmount(quoteToken, Math.floor(amount));
  const slippageCalc = new Percent(Number(slippage) * 100, 100 * 100);

  const walletTokenAccounts = await getWalletTokenAccount(
    solanaConnection,
    wallet.publicKey
  );

  const instructions = await swapOnlyAmm(solanaConnection, {
    outputToken: baseToken,
    targetPool,
    inputTokenAmount: quoteTokenAmount,
    slippage: slippageCalc,
    walletTokenAccounts,
    wallet: wallet,
  });

  const willSendTx = (
    await buildSimpleTransaction({
      connection: solanaConnection,
      makeTxVersion: TxVersion.LEGACY,
      payer: wallet.publicKey,
      innerTransactions: instructions,
      addLookupTableInfo: LOOKUP_TABLE_CACHE,
    })
  )[0];
  return willSendTx;
}

export async function simulateBuyTx(
  solanaConnection: Connection,
  wallet: WalletContextState,
  baseMint: PublicKey,
  quoteMint: PublicKey,
  amount: number,
  targetPool: string
) {
  const baseInfo = await getMint(solanaConnection, baseMint);
  if (baseInfo == null) {
    return null;
  }

  const baseDecimal = baseInfo.decimals;

  const baseToken = new Token(TOKEN_PROGRAM_ID, baseMint, baseDecimal);
  const quoteToken = new Token(TOKEN_PROGRAM_ID, quoteMint, 9);

  const quoteTokenAmount = new TokenAmount(quoteToken, Math.floor(amount));
  const slippage = new Percent(0, 100);
  const walletTokenAccounts = await getWalletTokenAccount(
    solanaConnection,
    wallet.publicKey
  );

  const amountOut = await simulateSwapRay(solanaConnection, {
    outputToken: baseToken,
    targetPool,
    inputTokenAmount: quoteTokenAmount,
    slippage,
    walletTokenAccounts,
    wallet: wallet,
  });

  return amountOut;
}

export async function getSellTx(
  solanaConnection: Connection,
  wallet: WalletContextState,
  baseMint: PublicKey,
  quoteMint: PublicKey,
  amount: number,
  targetPool: string,
  slippage: string
) {
  try {
    const tokenAta = await getAssociatedTokenAddress(
      baseMint,
      wallet.publicKey
    );
    const tokenBal = await solanaConnection.getTokenAccountBalance(tokenAta);
    if (!tokenBal || tokenBal.value.uiAmount == 0) return null;
    const balance = tokenBal.value.amount;
    tokenBal.value.decimals;
    const baseToken = new Token(
      TOKEN_PROGRAM_ID,
      baseMint,
      tokenBal.value.decimals
    );
    const quoteToken = new Token(TOKEN_PROGRAM_ID, quoteMint, 9);
    const baseTokenAmount = new TokenAmount(baseToken, Math.floor(amount));
    const slippageCalc = new Percent(Number(slippage) * 100, 100 * 100);
    const walletTokenAccounts = await getWalletTokenAccount(
      solanaConnection,
      wallet.publicKey
    );

    const instructions = await swapOnlyAmm(solanaConnection, {
      outputToken: quoteToken,
      targetPool,
      inputTokenAmount: baseTokenAmount,
      slippage: slippageCalc,
      walletTokenAccounts,
      wallet: wallet,
    });

    const willSendTx = (
      await buildSimpleTransaction({
        connection: solanaConnection,
        makeTxVersion: TxVersion.LEGACY,
        payer: wallet.publicKey,
        innerTransactions: instructions,
        addLookupTableInfo: LOOKUP_TABLE_CACHE,
      })
    )[0];

    console.log("instruction", instructions);
    return willSendTx;
  } catch (error) {
    console.log("Error in selling token");
    return null;
  }
}

export async function simulateSellTx(
  solanaConnection: Connection,
  wallet: WalletContextState,
  baseMint: PublicKey,
  quoteMint: PublicKey,
  amount: number,
  targetPool: string
) {
  try {
    const tokenAta = await getAssociatedTokenAddress(
      baseMint,
      wallet.publicKey
    );
    const tokenBal = await solanaConnection.getTokenAccountBalance(tokenAta);
    if (!tokenBal || tokenBal.value.uiAmount == 0) return null;
    const balance = tokenBal.value.amount;
    tokenBal.value.decimals;
    const baseToken = new Token(
      TOKEN_PROGRAM_ID,
      baseMint,
      tokenBal.value.decimals
    );
    const quoteToken = new Token(TOKEN_PROGRAM_ID, quoteMint, 9);
    const baseTokenAmount = new TokenAmount(baseToken, Math.floor(amount));
    const slippage = new Percent(0, 100);
    const walletTokenAccounts = await getWalletTokenAccount(
      solanaConnection,
      wallet.publicKey
    );

    const amountOut = await simulateSwapRay(solanaConnection, {
      outputToken: quoteToken,
      targetPool,
      inputTokenAmount: baseTokenAmount,
      slippage,
      walletTokenAccounts,
      wallet: wallet,
    });

    return amountOut;
  } catch (error) {
    console.log("Error in simulate selling token");
    return null;
  }
}

export const simulateTxOnRay = async (
  type: number,
  dataSwap: {
    solanaConnection: Connection;
    wallet: WalletContextState;
    baseMint: PublicKey;
    quoteMint: PublicKey;
    amount: number;
    targetPool: string;
  }
) => {
  const { solanaConnection, wallet, baseMint, quoteMint, amount, targetPool } =
    dataSwap;

  if (type === 0) {
    return await simulateBuyTx(
      solanaConnection,
      wallet,
      baseMint,
      quoteMint,
      amount,
      targetPool
    );
  }

  return await simulateSellTx(
    solanaConnection,
    wallet,
    baseMint,
    quoteMint,
    amount,
    targetPool
  );
};
