import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? "";
export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID ?? "";
export const SOL_DECIMAL = 9;
export const MAX_RETRY_QUERY_TOKEN = 3;

export const BONDING_CURVE_LIMIT = 85 * LAMPORTS_PER_SOL;
// export const BONDING_CURVE_LIMIT = 10 * LAMPORTS_PER_SOL; // FIXME: fix limit
export const LIMIT_PAGINATION = 8;

const endpoints = {
  tradingVariables: "",
  tradingHistory24: "",
  prices24Ago: "",
  pricingChart: "https://tizz-be-api-production.up.railway.app/charts",
  chartSocket: "http://",
  personalTradingHistoryTable:
    "https://backend-$$network_name$$$$collateral_type$$.gains.trade/personal-trading-history-table",
  userTradingVariables:
    "https://backend-$$network_name$$$$collateral_type$$.gains.trade/user-trading-variables",
  backendSocket: "wss://tizz-be-api-production.up.railway.app",
};
