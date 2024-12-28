import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const RPC_MAPS = {
  Agents: import.meta.env.VITE_SOLANA_RPC,
  Helius: import.meta.env.VITE_SOLANA_RPC_HELIOUS,
  Custom: 'https://',
};

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
 * STRONGBOX VAULTS
 */
export const STRONG_BOX_VAULT_SEED = 'staking_vault';
export const STRONG_BOX_STAKE_CONFIG_SEED = 'staking_config';
export const STAKER_INFO_SEED = 'staker_info';
export const STAKE_DETAIL_SEED = 'stake_detail';

/**
 * FUNGIBLE LOCK
 */
export const FUNGIBLE_VAULT_SEED = 'staking_vault';
export const FUNGIBLE_STAKE_CONFIG_SEED = 'staking_config';
export const STAKE_FUNGIBLE_INFO_SEED = 'stake_info';

export const PARRY_STATUS = 'party_status';
export const BLACK_LIST_ADDRESS = [
  'oraigyiRnYoCgFiaLnpiaPvJjZbs5zzmWHp4sxBgZq3', // BlackRack
  'Au2AaBHBJ2b5E9eERrff58Byspu4Esg7CxJYrkNBeZa6', // TSM

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
// export const OFFICIAL_TIME = 1735059600000; // time go live 0h00 - 25/12/2024
// export const OFFICIAL_TIME = 1735059600; // time go live

export const CONFIGS: Record<
  string,
  {
    PROGRAM_ID: string;
    DISTILL_COMMUNITY_POOL_WALLET: string;
    STAKE_CURRENCY_MINT: string;
    STRONGBOX_VAULT_PROGRAM_ID: string;
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
    STAKE_SOFT_CAP: number;
    STAKING_PROGRAM_ID: string;
  }
> = {
  // localnet keys are in cli/local-scripts/
  localnet: {
    PROGRAM_ID: 'agentDiuyLRQEZgByNRnDErj1FcXyfyZysaQBDfwNNM',
    DISTILL_COMMUNITY_POOL_WALLET:
      'ADRbQMzWXQiXocmTj67HCHubyYWrEdLbZcjZKUChoSEc',
    STAKE_CURRENCY_MINT: '8NHfoL9NjSNwBRKCCrDBmbqByFoaZ1AcMJ6Dn17CWqWx',
    STRONGBOX_VAULT_PROGRAM_ID: '9grg8RG2prncny136yjDMy5BZcwhB4NvqGMGDFs7QtKy',
    BONDING_CURVE_LIMIT: 85 * LAMPORTS_PER_SOL,
    INIT_SOL_BONDING_CURVE: 3 * LAMPORTS_PER_SOL,
    TIMER: {
      MILLISECONDS: 1000,
      MONTH_TO_SECONDS: 60,
      HAFT_MILLISECOND: 500,
      MILLISECOND: 1000,
      SECOND: 60,
      MINUTE: 60,
      HOUR: 24,
      DAY_TO_SECONDS: 24 * 60 * 60,
    },
    SHOW_DECIMALS_PRICE: 9,
    OFFICIAL_TIME: 1735059600000,
    LOCK_FUNGIBLE_STAKE: 300,
    STAKE_SOFT_CAP: 5000000,
    STAKING_PROGRAM_ID: 'CmM3iSUBXGnURkHiG6DneSp8fkvkxy5L9oqfTUhMxV7u',
  },
  devnet: {
    PROGRAM_ID: 'agentDiuyLRQEZgByNRnDErj1FcXyfyZysaQBDfwNNM',
    DISTILL_COMMUNITY_POOL_WALLET:
      'CyokHgfzAWYaaFR2P37hfHz3H3RRF6u9A6RNhWraSyoN',
    STAKE_CURRENCY_MINT: '3Ff7yUkQsbMzViXu7aAxAYsgpy31wY8R8TteE39FDuw4',
    STRONGBOX_VAULT_PROGRAM_ID: '9grg8RG2prncny136yjDMy5BZcwhB4NvqGMGDFs7QtKy',
    BONDING_CURVE_LIMIT: 260 * LAMPORTS_PER_SOL,
    INIT_SOL_BONDING_CURVE: 60 * LAMPORTS_PER_SOL,
    TIMER: {
      MILLISECONDS: 1000,
      MONTH_TO_SECONDS: 60,
      HAFT_MILLISECOND: 500,
      MILLISECOND: 1000,
      SECOND: 60,
      MINUTE: 60,
      HOUR: 24,
      DAY_TO_SECONDS: 24 * 60 * 60,
    },
    SHOW_DECIMALS_PRICE: 9,
    OFFICIAL_TIME: 1735059600000,
    LOCK_FUNGIBLE_STAKE: 300,
    STAKE_SOFT_CAP: 5000000,
    STAKING_PROGRAM_ID: 'CmM3iSUBXGnURkHiG6DneSp8fkvkxy5L9oqfTUhMxV7u',
  },
  'mainnet-beta': {
    PROGRAM_ID: 'agentDiuyLRQEZgByNRnDErj1FcXyfyZysaQBDfwNNM',
    DISTILL_COMMUNITY_POOL_WALLET:
      'HJbs8zNyiMQP46S1MrcVsyPQs9hDnf5bcmscU1rPxi3d',
    STAKE_CURRENCY_MINT: 'oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h',
    STRONGBOX_VAULT_PROGRAM_ID: 'Fke77idjs2D92Ha6uGJKfe94z62nDgjY3mHGsm9kskiH',
    BONDING_CURVE_LIMIT: 260 * LAMPORTS_PER_SOL,
    INIT_SOL_BONDING_CURVE: 60 * LAMPORTS_PER_SOL,
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
    STAKE_SOFT_CAP: 5000000,
    STAKING_PROGRAM_ID: 'CmM3iSUBXGnURkHiG6DneSp8fkvkxy5L9oqfTUhMxV7u',
  },
  'mainnet-beta-test': {
    PROGRAM_ID: 'agentDiuyLRQEZgByNRnDErj1FcXyfyZysaQBDfwNNM',
    DISTILL_COMMUNITY_POOL_WALLET:
      'HJbs8zNyiMQP46S1MrcVsyPQs9hDnf5bcmscU1rPxi3d',
    STAKE_CURRENCY_MINT: 'oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h',
    STRONGBOX_VAULT_PROGRAM_ID: 'Fke77idjs2D92Ha6uGJKfe94z62nDgjY3mHGsm9kskiH',
    BONDING_CURVE_LIMIT: 260 * LAMPORTS_PER_SOL,
    INIT_SOL_BONDING_CURVE: 60 * LAMPORTS_PER_SOL,
    TIMER: {
      MILLISECONDS: 1000,
      MONTH_TO_SECONDS: 30 * 24 * 60 * 60,
      HAFT_MILLISECOND: 500,
      MILLISECOND: 1000,
      SECOND: 60,
      MINUTE: 60,
      HOUR: 24,
      DAY_TO_SECONDS: 5 * 60,
    },
    SHOW_DECIMALS_PRICE: 12,
    OFFICIAL_TIME: 1735059600000,
    LOCK_FUNGIBLE_STAKE: 86400 * 14,
    STAKE_SOFT_CAP: 5000000,
    STAKING_PROGRAM_ID: 'CmM3iSUBXGnURkHiG6DneSp8fkvkxy5L9oqfTUhMxV7u',
  },
};

export const ALL_CONFIGS = CONFIGS[SOLANA_ENV] || CONFIGS['mainnet-beta-test'];

export const PROGRAM_ID = ALL_CONFIGS.PROGRAM_ID ?? '';
