import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type ChartTable = {
  table: CandlePrice[];
  raw: RawChart[];
};

export type RawChart = {
  price: number;
  ts: number;
};

export type CandlePrice = {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
};

export type Chart = {
  time: number;
  opens: number[];
  highs: number[];
  lows: number[];
  closes: number[];
};

export interface userInfo {
  _id?: string;
  name: string;
  wallet: string;
  avatar?: string;
  isLedger?: Boolean;
  signature?: string;
}

export interface metadataInfo {
  name: string;
  symbol: string;
  image: string;
  description: string;
  agentPersonality: string;
  agentStyle: string;
  createdOn: string;
  twitter?: string;
  website?: string;
  telegram?: string;
  discord?: string;
  agentId: number;
  agentAddress: string;
  creatorAddress: string;
  createdAt: number;
}

export interface coinInfo {
  commit: any;
  _id?: string;
  name: string;
  creator: string | userInfo;
  ticker: string;
  url: string;
  tokenReserves: BN;
  lamportReserves: BN;
  bondingCurveLimit: BN;
  token: string;
  marketcap?: number;
  presale?: number;
  replies?: number;
  description?: string;
  twitter?: string;
  website?: string;
  telegram?: string;
  date?: Date;
  decimals: number;
  metadata?: metadataInfo;
  listed: boolean;
  oraidexPoolAddr?: string;
  raydiumPoolAddr?: string;
  bondingCurve?: boolean;
  tradingTime?: Date;
  partyTradingTime?: Date;
  publicTradingTime?: Date;
}
export interface createCoinInfo {
  name: string;
  ticker: string;
  url: string;
  description: string;
  presale: number;
  tokenSupply: number;
  virtualReserves: number;
  twitter?: string;
  website?: string;
  telegram?: string;
  discord?: string;
}

export interface launchDataInfo {
  name: string;
  symbol: string;
  uri: string;
  presale: number;
  decimals: number;
  metadata: metadataInfo;
}
export interface msgInfo {
  coinId: string | coinInfo;
  sender: string | userInfo;
  time: Date;
  img?: string;
  msg: string;
}

export interface tradeInfo {
  coinInfo: string | coinInfo;
  record: recordInfo[];
}

export interface holderInfo {
  slice: string;
  owner: string;
  amount: number;
}

export interface recordInfo {
  holder: userInfo;
  time: Date;
  tokenAmount: BN;
  lamportAmount: BN;
  swapDirection: 0 | 1;
  price: number;
  tx: string;
}
export interface CharTable {
  table: {
    time: number;
    low: number;
    high: number;
    open: number;
    close: number;
    volume: number;
  }[];
}
export interface Bar {
  time: number;
  low: number;
  high: number;
  open: number;
  close: number;
  volume: number;
}
export interface replyInfo {
  coinId: string;
  sender: string;
  msg: string;
  img?: string;
}
export interface PeriodParamsInfo {
  from: number;
  to: number;
  countBack: number;
  firstDataRequest: boolean;
}

export type SwapInfo = {
  creator: string;
  solAmountInLamports: BN;
  direction: 'Bought' | 'Sold';
  mintAddress: string;
  mintName: string;
  mintSymbol: string;
  mintUri: string;
};
export interface Data {
  privateKey: string;
  pubkey: string;
  solBalance: number | null;
  tokenBuyTx: string | null;
  tokenSellTx: string | null;
}

export interface StakeInfo {
  
}