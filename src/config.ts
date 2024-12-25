import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const SOL_PRICE_KEY = 'SOL_PRICE_KEY';

export const SOLANA_ENV =
  import.meta.env.VITE_APP_SOLANA_ENV || 'mainnet-beta-test';

export const SPL_DECIMAL = 6;
export const SOL_DECIMAL = 9;
export const MAX_RETRY_QUERY_TOKEN = 3;
export const LIMIT_PAGINATION = 8;
export const SEED_GLOBAL = 'global';
export const TX_FEE = 0.25;

/**
 * LOCKING VAULTS
 */
export const VAULT_SEED = 'staking_vault';
export const STAKE_CONFIG_SEED = 'staking_config';
export const STAKER_INFO_SEED = 'staker_info';
export const STAKE_FUNGIBLE_INFO_SEED = 'stake_info';
export const STAKE_INFO_SEED = 'stake_info';
export const STAKE_DETAIL_SEED = 'stake_detail';

export const BLACK_LIST_ADDRESS = [
  'oraigyiRnYoCgFiaLnpiaPvJjZbs5zzmWHp4sxBgZq3', // BlackRack
  'Au2AaBHBJ2b5E9eERrff58Byspu4Esg7CxJYrkNBeZa6', // TSM
];
// export const OFFICIAL_TIME = 1735059600000; // time go live 0h00 - 25/12/2024
// export const OFFICIAL_TIME = 1735059600; // time go live

export const CONFIGS: Record<
  string,
  {
    PROGRAM_ID: string;
    DISTILL_COMMUNITY_POOL_WALLET: string;
    STAKE_CURRENCY_MINT: string;
    STAKE_POOL_PROGRAM_ID: string;
    BONDING_CURVE_LIMIT: number;
    INIT_SOL_BONDING_CURVE: number;
    TIMER: {
      MILLISECONDS: number;
      MONTH_TO_SECONDS: number;
      HAFT_MILLISECOND: number;
      MILLISECOND: number;
      SECOND: number;
      MINUTE: number;
      HOUR: number;
      DAY_TO_SECONDS: number;
    };
    SHOW_DECIMALS_PRICE: number;
    OFFICIAL_TIME: number;
    LOCK_FUNGIBLE_STAKE: number;
  }
> = {
  devnet: {
    PROGRAM_ID: 'agentDiuyLRQEZgByNRnDErj1FcXyfyZysaQBDfwNNM',
    DISTILL_COMMUNITY_POOL_WALLET:
      'CyokHgfzAWYaaFR2P37hfHz3H3RRF6u9A6RNhWraSyoN',
    STAKE_CURRENCY_MINT: '3Ff7yUkQsbMzViXu7aAxAYsgpy31wY8R8TteE39FDuw4',
    STAKE_POOL_PROGRAM_ID: '9grg8RG2prncny136yjDMy5BZcwhB4NvqGMGDFs7QtKy',
    BONDING_CURVE_LIMIT: 10 * LAMPORTS_PER_SOL,
    INIT_SOL_BONDING_CURVE: 3 * LAMPORTS_PER_SOL,
    TIMER: {
      MILLISECONDS: 1000,
      MONTH_TO_SECONDS: 60,
      HAFT_MILLISECOND: 500,
      MILLISECOND: 1000,
      SECOND: 60,
      MINUTE: 60,
      HOUR: 24,
      DAY_TO_SECONDS: 5 * 60,
    },
    SHOW_DECIMALS_PRICE: 9,
    OFFICIAL_TIME: 1735059600,
    LOCK_FUNGIBLE_STAKE: 300,
  },
  'mainnet-beta': {
    PROGRAM_ID: 'agentDiuyLRQEZgByNRnDErj1FcXyfyZysaQBDfwNNM',
    DISTILL_COMMUNITY_POOL_WALLET:
      'HJbs8zNyiMQP46S1MrcVsyPQs9hDnf5bcmscU1rPxi3d',
    STAKE_CURRENCY_MINT: 'oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h',
    STAKE_POOL_PROGRAM_ID: 'Fke77idjs2D92Ha6uGJKfe94z62nDgjY3mHGsm9kskiH',
    BONDING_CURVE_LIMIT: 150 * LAMPORTS_PER_SOL,
    INIT_SOL_BONDING_CURVE: 30 * LAMPORTS_PER_SOL,
    TIMER: {
      MILLISECONDS: 1000,
      MONTH_TO_SECONDS: 30 * 24 * 60 * 60,
      HAFT_MILLISECOND: 500,
      MILLISECOND: 1000,
      SECOND: 60,
      MINUTE: 60,
      HOUR: 24,
      DAY_TO_SECONDS: 24 * 60 * 60,
    },
    SHOW_DECIMALS_PRICE: 9,
    OFFICIAL_TIME: 1735059600000,
    LOCK_FUNGIBLE_STAKE: 14 * 86400,
  },
  'mainnet-beta-test': {
    PROGRAM_ID: 'agentDiuyLRQEZgByNRnDErj1FcXyfyZysaQBDfwNNM',
    DISTILL_COMMUNITY_POOL_WALLET:
      'HJbs8zNyiMQP46S1MrcVsyPQs9hDnf5bcmscU1rPxi3d',
    STAKE_CURRENCY_MINT: 'oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h',
    STAKE_POOL_PROGRAM_ID: 'Fke77idjs2D92Ha6uGJKfe94z62nDgjY3mHGsm9kskiH',
    BONDING_CURVE_LIMIT: 1.5 * LAMPORTS_PER_SOL,
    INIT_SOL_BONDING_CURVE: 0.3 * LAMPORTS_PER_SOL,
    TIMER: {
      MILLISECONDS: 1000,
      MONTH_TO_SECONDS: 30 * 24 * 60 * 60,
      HAFT_MILLISECOND: 500,
      MILLISECOND: 1000,
      SECOND: 60,
      MINUTE: 60,
      HOUR: 24,
      DAY_TO_SECONDS: 15 * 60,
    },
    SHOW_DECIMALS_PRICE: 12,
    OFFICIAL_TIME: 1735059600,
    LOCK_FUNGIBLE_STAKE: 86400 * 14,
  },
};

export const ALL_CONFIGS = CONFIGS[SOLANA_ENV] || CONFIGS['mainnet-beta-test'];

export const PROGRAM_ID = ALL_CONFIGS.PROGRAM_ID ?? '';
