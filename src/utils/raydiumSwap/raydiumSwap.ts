import { getAssociatedTokenAddress, NATIVE_MINT } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getBuyTx,
  getSellTx,
  simulateBuyTx,
  simulateSellTx,
} from "./swapOnlyAmm";

export const rayBuyTx = async (
  solanaConnection: Connection,
  baseMint: PublicKey,
  buyAmount: number,
  wallet: WalletContextState,
  poolId: PublicKey,
  slippage: string
) => {
  let solBalance: number = 0;
  try {
    solBalance = await solanaConnection.getBalance(wallet.publicKey);
  } catch (error) {
    console.log("Error getting balance of wallet");
    return null;
  }
  if (solBalance == 0) {
    return null;
  }
  if (solBalance < buyAmount) {
    console.log("Balance is not enough.");
    return null;
  }

  try {
    const tx = await getBuyTx(
      solanaConnection,
      wallet,
      baseMint,
      NATIVE_MINT,
      buyAmount,
      poolId.toBase58(),
      slippage
    );

    if (tx == null) {
      console.log(`Error getting buy transaction`);
      return null;
    }
    return tx;
  } catch (error) {
    return null;
  }
};

export const raySellTx = async (
  solanaConnection: Connection,
  baseMint: PublicKey,
  amount: number,
  wallet: WalletContextState,
  poolId: PublicKey,
  slippage: string
) => {
  try {
    const tokenAta = await getAssociatedTokenAddress(
      baseMint,
      wallet.publicKey
    );
    const tokenBalInfo = await solanaConnection.getTokenAccountBalance(
      tokenAta
    );
    if (!tokenBalInfo) {
      console.log("Balance incorrect");
    }

    if (Number(amount) > Number(tokenBalInfo.value.amount)) {
      console.log("Balance is not enough.");
      return null;
    }

    try {
      const sellTx = await getSellTx(
        solanaConnection,
        wallet,
        baseMint,
        NATIVE_MINT,
        amount,
        poolId.toBase58(),
        slippage
      );

      if (sellTx == null) {
        console.log(`Error getting buy transaction`);
        return null;
      }
      return sellTx;
    } catch (error) {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const simulateBuySwapRaydium = async (
  solanaConnection: Connection,
  baseMint: PublicKey,
  buyAmount: number,
  wallet: WalletContextState,
  poolId: PublicKey
) => {
  let solBalance: number = 0;
  try {
    solBalance = await solanaConnection.getBalance(wallet.publicKey);
  } catch (error) {
    console.log("Error getting balance of wallet");
    return null;
  }
  if (solBalance == 0) {
    return null;
  }

  if (solBalance < buyAmount) {
    console.log("Balance is not enough.");
    return null;
  }

  try {
    const amountOut = await simulateBuyTx(
      solanaConnection,
      wallet,
      baseMint,
      NATIVE_MINT,
      buyAmount,
      poolId.toBase58()
    );

    return amountOut || 0;
  } catch (error) {
    return 0;
  }
};

export const simulateSellSwapRaydium = async (
  solanaConnection: Connection,
  baseMint: PublicKey,
  amount: number,
  wallet: WalletContextState,
  poolId: PublicKey
) => {
  try {
    const tokenAta = await getAssociatedTokenAddress(
      baseMint,
      wallet.publicKey
    );
    const tokenBalInfo = await solanaConnection.getTokenAccountBalance(
      tokenAta
    );
    if (!tokenBalInfo) {
      console.log("Balance incorrect");
    }

    if (Number(amount) > Number(tokenBalInfo.value.amount)) {
      console.log("Balance is not enough.");
      return null;
    }

    const amountOut = await simulateSellTx(
      solanaConnection,
      wallet,
      baseMint,
      NATIVE_MINT,
      amount,
      poolId.toBase58()
    );

    return amountOut || 0;
  } catch (error) {
    return null;
  }
};

export const simulateSwapOnRaydium = async (
  type: number,
  dataSwap: {
    solanaConnection: Connection;
    baseMint: PublicKey;
    amount: number;
    wallet: WalletContextState;
    poolId: PublicKey;
  }
) => {
  const { solanaConnection, wallet, baseMint, amount, poolId } = dataSwap;

  if (type === 0) {
    return await simulateBuySwapRaydium(
      solanaConnection,
      baseMint,
      amount,
      wallet,
      poolId
    );
  }
  return await simulateSellSwapRaydium(
    solanaConnection,
    baseMint,
    amount,
    wallet,
    poolId
  );
};
