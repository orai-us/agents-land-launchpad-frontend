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
export const STAKE_INFO_SEED = 'stake_info';
export const STAKE_DETAIL_SEED = 'stake_detail';

export const BLACK_LIST_ADDRESS = [
  'oraigyiRnYoCgFiaLnpiaPvJjZbs5zzmWHp4sxBgZq3', // BlackRack
  // gen test

  'BRqRVPwtyndv2vaWNFjDSv8fH7Rccnfeo8uw5RxSbjUt',
  '7XKfaPix942j4iuJcB57yNb9eUCJEk8arLzReBy8Wq83',
  'APwbeogTeENbdLZM4xsFZuwEGWn8zVRLVzuPziQfEMoS',
  '4YAUi3ZnjeHmNx1LUxsavxxAHvFExX8ep72hJtDNKkU2',
  'DbKiFv3JkZSCtmcMWnTo3NzCApUKaXkKaWq2441JNETi',
  '88FR4czxf7syvNsrEQZ9cLP2AFnxodFfGmXNsbdJQCBn',
  'HgZWwzuUwRKScwvdncp2aG5kkQKnWEQKQHsagRf8qCkn',
  'GvF2U3ZQmsVagRP4FrgD7ETjwTutBeSdCVQM9CzTG8XD',
  '6ypXJsniSKVrynxwLqtJkBdVhZj6m3yE4A6fNJbrRoa',
  '9UTMesxqi2cv7cXXkswrksnsFff65dB41B7ve6EWppJU',
  '3NdUk319N7aKSyVt8LsJvupeeuYn8ojhC9uwyJqmoeTe',
  '2s72rmFpx8B48jDzw2pDrdUgGra3YmFH6bWnubhgvkuU',
  'DzvehmQYSzd4bAmwkge9GoLSN6abxP8Xvie6YTbnu7EQ',
  'AR9hpPi7jn4QwZVUUDm1kC9GSpmL1pqV5ofpwzbpWaEH',
  '5u4BdDHAPKTgw2aaQxVYsojmJGsEUNWxsT9xJChBpcaL',
  'MNg5gaa36GXZTgbAemn2aMiRoDct54TkrfDX8Kz6UpC',
  '7exZSwq17Kg3aC4Q1QtQYVrvj6nu5XivcKEDnjtU3mVB',
  'FLbuiaNtsmhm28Aq5Pg2RYvZof7pFp9aYFF1mr6PJGs6',
  'HrVAhZEeVaJiBoDVQELDiugiavjJFXMfsEqTjievSccE',
  'Bxn23vGQzhG12Bk3xMPvRx8PdgFgggb4fs2CGsfkZrQd',
];

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
  },
};

export const ALL_CONFIGS = CONFIGS[SOLANA_ENV] || CONFIGS['mainnet-beta-test'];

export const PROGRAM_ID = ALL_CONFIGS.PROGRAM_ID ?? '';
