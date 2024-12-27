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
  'G3iaPFSQxH8rB8ogRGXoSuxhW6qpTze5udHWngQt7BXu',
  '4MQ4vWgJR3PwS8XNFBvGVmDbssyNTB7yUR7mzw23g5bP',
  'B9eK2Y2z4bdZ5vfBvkuN8xowXCwCKNLLrTak8YAWQkdo',
  '3CFBLgmDLdAzkd6NTE8557LVFmBrHyQZHv6iEbwUvyGW',
  'DJNvTGXaSV2qqLB3qLw7JCFWJa8xTuDuGa8aCiBaj7PN',
  'Dazw2ehJpipSJsjT8R9Kvov4zVGGFv35BhN4SEtNmMq7',
  'Jbh6zL9EafMGWfHomk4nYD6Auj3uw1zwFBrBpB299JK',
  '8VKwcHGVP3JXz9dXAzq59SD7kJAR4usSUQ972r2nXDzv',
  'CL55GJiugfgADJdpBgaguNcwVmaYNUT4JyQfnzL9ict8',
  'fihjAxsu94pbdMhdYQWXgURcNkMtCUzDXWNRH7J72A8',
  '7UodeBTkL96QisbHxYB7oorPk6eo7ATVd8JW16ym6sG5',
  '3YZvXqLpiFrjNVo51jsAcZp4j32K6cvCf8mxw1JSbUgp',
  '3BJJajpY8LCihLrsgeKDGYS4D4ssvAnPtTzWZTmCYbJk',
  'BYBoJ7yzXrm6uNFCzrXzHdZ7UHKosA9Dj9nhbQJ81iSF',
  '4eaeyu4sy1Faq8xQfySCQJEJoUyBUbi4pbLC85NDd8yE',
  'DzPYZiQhDmDts9twWrHTpqVFAJmDZCP1d1x9bmg2Ku3n',
  'AwFk1XbTrc8aTi3gcYQkn3swiwTwpNN1HqiD7hugMM6b',
  '39rd5HLyG2KDqb26A9FN7MYZMAHHXuhjx6eeL3xeKAFJ',
  'DsPNzCM1cCaoHrCkYM5hEQePKY28akNogiuKmyL8WHNn',
  'GQU7FZ2ZpoJ5bhcXr3mgzGQ4VV3epi9f5nwZkvazXq1S',
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
