import axios, { AxiosRequestConfig } from "axios";
import {
  ChartTable,
  coinInfo,
  holderInfo,
  msgInfo,
  recordInfo,
  replyInfo,
  tradeInfo,
  userInfo,
} from "./types";
import { BN } from "@coral-xyz/anchor";
import { ALL_CONFIGS } from "@/config";
import BigNumber from "bignumber.js";
import { PublicKey, PublicKeyInitData } from "@solana/web3.js";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const DISTILL_BE_URL =
  import.meta.env.VITE_DISTILL_BACKEND_URL ||
  "https://api-dev.distilled.ai/distill";

const headers: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
};

const config: AxiosRequestConfig = {
  headers,
};

export const test = async () => {
  const res = await fetch(`${BACKEND_URL}`);
  const data = await res.json();
  console.log(data);
};
export const getUser = async ({
  id,
}: {
  id?: string;
  address?: string;
}): Promise<userInfo> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/user/${id}`, config);
    // console.log("response:", response.data);
    return response.data;
  } catch (err) {
    console.log("err getting user: ", err);
    throw new Error(err);
  }
};

export const getUserByWalletAddress = async ({
  wallet,
}: {
  wallet: string;
}): Promise<userInfo> => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/user/wallet/${wallet}`,
      config
    );
    // console.log("response:", response.data);
    return response.data;
  } catch (err) {
    console.log("err getting user: ", err);
    throw new Error(err);
  }
};

export const updateUser = async (id: string, data: userInfo): Promise<any> => {
  try {
    console.log(`${BACKEND_URL}/user/update/${id}`);
    const response = await axios.post(
      `${BACKEND_URL}/user/update/${id}`,
      data,
      config
    );
    return response.data;
  } catch (err) {
    return { error: "error setting up the request" };
  }
};

export const walletConnect = async ({
  data,
}: {
  data: userInfo;
}): Promise<any> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/user/`, data);
    return response.data;
  } catch (err) {
    return { error: "error setting up the request" };
  }
};

export const confirmWallet = async ({
  data,
}: {
  data: userInfo;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/user/confirm`,
      data,
      config
    );
    return response.data;
  } catch (err) {
    return { error: "error setting up the request" };
  }
};

export const getCoinsInfo = async (
  params
): Promise<{ coins: coinInfo[]; total: number }> => {
  try {
    const res = await axios.get(`${BACKEND_URL}/coin`, { ...config, params });
    return res.data;
  } catch (error) {
    return {
      coins: [],
      total: 0,
    };
  }
};

export const getAgentsData = async (params): Promise<coinInfo[]> => {
  const res = await axios.get(`${DISTILL_BE_URL}/user/search`, {
    ...config,
    params: {
      filter: JSON.stringify({
        username: "",
        status: 1,
        role: 4,
        publish: 1,
        ...(params.filter || {}),
      }),
      limit: 50,
      offset: 0,
    },
  });
  return res.data;
};

export const getAgentsDataByUser = async (params): Promise<any[]> => {
  const res = await axios.get(`${DISTILL_BE_URL}/bot/public/list`, {
    ...config,
    params: {
      filter: JSON.stringify({
        ownerAddress: params.user,
      }),
      limit: 100,
      offset: 0,
    },
  });
  return res.data;
};

export const getCoinsInfoBy = async (id: string): Promise<coinInfo[]> => {
  const res = await axios.get<coinInfo[]>(
    `${BACKEND_URL}/coin/user/${id}`,
    config
  );
  return res.data.map((info) => ({
    ...info,
    tokenReserves: new BN(info.tokenReserves),
    lamportReserves: new BN(info.lamportReserves),
  }));
};

export const genTokenKeypair = async (): Promise<string> => {
  const res = await axios.get<{
    privateKey: string;
  }>(`${BACKEND_URL}/keypair`, config);
  return res.data.privateKey;
};

export const getCoinInfo = async (data: string): Promise<coinInfo> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/coin/${data}`, config);
    return {
      ...response.data,
      tokenReserves: new BN(response.data.tokenReserves),
      lamportReserves: new BN(response.data.lamportReserves),
    };
  } catch (err) {
    console.log("err get coin info: ", err);
    // throw new Error(err);
  }
};

export type RetryOptions = {
  retry?: number;
  timeout?: number;
  callback?: (retry: number) => void;
};

export const fetchRetry = async (
  url: RequestInfo | URL,
  options: RequestInit & RetryOptions = {}
) => {
  let retry = options.retry ?? 3;
  const { callback, timeout = 30000, ...init } = options;
  init.signal = AbortSignal.timeout(timeout);
  while (retry > 0) {
    try {
      return await fetch(url, init);
    } catch (e) {
      callback?.(retry);
      retry--;
      if (retry === 0) {
        throw e;
      }
    }
  }
};

export const getMessageByCoin = async (data: string): Promise<msgInfo[]> => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/feedback/coin/${data}`,
      config
    );
    return response.data;
  } catch (err) {
    console.log("err get message by coin: ", err);
  }
};

export const getCoinTrade = async (data: string): Promise<tradeInfo> => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/cointrade/${data}`,
      config
    );
    console.log("trade response::", response);
    return {
      ...response.data,
      record: response.data.record.map((r: recordInfo) => ({
        ...r,
        lamportAmount: new BN(r.lamportAmount),
        tokenAmount: new BN(r.tokenAmount),
      })),
    };
  } catch (err) {
    console.log("err get coin trade: ", err);
    // throw new Error(err);
  }
};

export const getKoth = async (): Promise<coinInfo> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/coin/king/koth`, config);
    return {
      ...response.data,
    };
  } catch (err) {
    console.log("err get coin king: ", err);
    // throw new Error(err);
  }
};

export const postReply = async (data: replyInfo) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/feedback/`, data, config);
    return response.data;
  } catch (err) {
    return { error: "error setting up the request" };
  }
};

// ================== Get Holders ===========================
export const findHolders = async (mint: string) => {
  // Pagination logic
  let page = 1;
  // allOwners will store all the addresses that hold the token
  let allOwners: holderInfo[] = [];

  // TODO: FIXME: need to use helius rpc here: https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api/get-token-accounts
  const HELIUS_RPC =
    import.meta.env.VITE_SOLANA_RPC ||
    "https://devnet.helius-rpc.com/?api-key=44b7171f-7de7-4e68-9d08-eff1ef7529bd";
  while (true) {
    const response = await fetch(
      // import.meta.env.VITE_SOLANA_RPC ||
      HELIUS_RPC,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getTokenAccounts",
          id: "helius-test",
          params: {
            page: page,
            limit: 30,
            displayOptions: {},
            //mint address for the token we are interested in
            mint: mint,
          },
        }),
      }
    );
    const data = await response.json();
    // Pagination logic.
    if (!data.result || data.result.token_accounts.length === 0) {
      break;
    }

    // Adding unique owners to a list of token owners.
    data.result.token_accounts.forEach((account) => {
      allOwners.push({
        slice: account.owner.slice(0, 3) + `...` + account.owner.slice(-4),
        owner: account.owner,
        amount: account.amount,
      });
    });
    page++;
  }

  return allOwners;
};

export const getSolPriceInUSD = async () => {
  try {
    // Fetch the price data from CoinGecko
    const response = await axios.get(
      // "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      "https://price.market.orai.io/simple/price?ids=solana&vs_currencies=usd"
    );
    const solPriceInUSD = response.data.solana.usd;
    return solPriceInUSD;
  } catch (error) {
    console.error("Error fetching SOL price:", error);
    throw error;
  }
};

// ===========================Functions=====================================
const JWT = import.meta.env.VITE_PINATA_PRIVATE_KEY;

export const pinFileToIPFS = async (blob: File) => {
  try {
    const data = new FormData();
    data.append("file", blob);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: data,
    });
    const resData = await res.json();
    return resData;
  } catch (error) {
    console.log(error);
  }
};
export const uploadImagePinata = async (url: string) => {
  const res = await fetch(url);
  console.log(res.blob);
  const blob = await res.blob();

  const imageFile = new File([blob], "image.png", { type: "image/png" });
  console.log(imageFile);
  const resData = await pinFileToIPFS(imageFile);
  console.log(resData, "RESDATA>>>>");
  if (resData) {
    return `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;
  } else {
    return false;
  }
};

/**
 * Returns a shortened string by replacing characters in between with '...'.
 * @param str The input string.
 * @param from The position of the character to be kept as-is in the resulting string.
 * @param end The number of characters to be kept as-is at the end of the resulting string.
 * @returns The shortened string, or '-' if the input string is null or undefined.
 */
export const reduceString = (str: string, from: number, end: number) => {
  if (!str) {
    return "-";
  }

  return str && typeof str.substring === "function"
    ? str.substring(0, from) + "..." + str.substring(str.length - end)
    : "-";
};

export const toBig = (value: number, decimals: number): BN => {
  if (!value) return new BN(0);
  return new BN(value).mul(new BN(10 ** decimals));
};

export const fromBig = (value: BN, decimals: number = 6): number => {
  if (!value) return 0;
  if (!(value instanceof BN)) {
    value = new BN(value);
  }
  const divmodResult = value.divmod(new BN(10 ** decimals));
  const result =
    divmodResult.div.toString() +
    "." +
    divmodResult.mod.toString().padStart(decimals, "0");
  return parseFloat(result);
};

export const calculateTokenPrice = (
  tokenReserves: BN,
  lamportReserves: BN,
  tokenDecimals: number,
  solPriceinUSD?: number
): number => {
  if (!(tokenReserves instanceof BN)) {
    tokenReserves = new BN(tokenReserves);
  }
  if (!(lamportReserves instanceof BN)) {
    lamportReserves = new BN(lamportReserves);
  }
  const tokenReservesNum = fromBig(tokenReserves, tokenDecimals);
  const lamportReservesNum = fromBig(lamportReserves, 9);
  return ((solPriceinUSD || 1) * lamportReservesNum) / tokenReservesNum;
};

export function calculateKotHProgress(
  lamportReserves: BN,
  bondingCurveLimit: BN
) {
  if (!(lamportReserves instanceof BN)) {
    lamportReserves = new BN(lamportReserves);
  }
  if (!(bondingCurveLimit instanceof BN)) {
    bondingCurveLimit = new BN(bondingCurveLimit);
  }
  if (bondingCurveLimit.toNumber() === 0) return 0;
  const calcLamportReserves = lamportReserves.sub(
    new BN(ALL_CONFIGS.INIT_SOL_BONDING_CURVE)
  );
  const calcBondingCurveLimit = bondingCurveLimit.sub(
    new BN(ALL_CONFIGS.INIT_SOL_BONDING_CURVE)
  );
  let currentKotHProgress =
    (fromBig(calcLamportReserves, 9) /
      (fromBig(calcBondingCurveLimit, 9) / 2)) *
    100;

  if (currentKotHProgress > 100) currentKotHProgress = 100;
  return currentKotHProgress;
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const retrieveEnvVariable = (variableName: string) => {
  const variable = process.env[variableName] || "";
  if (!variable) {
    console.log(`${variableName} is not set`);
    // process.exit(1);
  }
  return variable;
};

export const toBN = (val: BigNumber.Value) => {
  return new BigNumber(val);
};

export const toPublicKey = (val: PublicKeyInitData) => {
  return new PublicKey(val);
};
