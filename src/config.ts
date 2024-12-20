import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC ?? "";
export const PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID ?? "";
export const SOL_DECIMAL = 9;
export const MAX_RETRY_QUERY_TOKEN = 3;

// export const BONDING_CURVE_LIMIT = 85 * LAMPORTS_PER_SOL;
export const BONDING_CURVE_LIMIT = 10 * LAMPORTS_PER_SOL; // FIXME: fix limit
export const INIT_SOL_BONDING_CURVE = 3 * LAMPORTS_PER_SOL; // FIXME: fix limit
export const LIMIT_PAGINATION = 8;
export const DISTILL_COMMUNITY_POOL_WALLET =
  "CyokHgfzAWYaaFR2P37hfHz3H3RRF6u9A6RNhWraSyoN"; // FIXME: update later for community pool
export const SEED_GLOBAL = "global";
export const TX_FEE = 0.25;

/**
 * LOCKING
 */
export const SPL_DECIMAL = 6;
export const TIMER = {
  MILLISECONDS: 1000,
  // MONTH_TO_SECONDS: 30 * 24 * 60 * 60, // FIXME: update time
  MONTH_TO_SECONDS: 60, // FIXME: update time
};
export const VAULT_SEED = "staking_vault";
export const STAKE_CONFIG_SEED = "staking_config";
export const STAKER_INFO_SEED = "staker_info";
export const STAKE_INFO_SEED = "stake_info";
export const STAKE_DETAIL_SEED = "stake_detail";
export const STAKE_CURRENCY_MINT =
  "oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h";
// export const STAKE_CURRENCY_MINT =
//   "3Ff7yUkQsbMzViXu7aAxAYsgpy31wY8R8TteE39FDuw4";
