import { coinInfo } from '@/utils/types';
import { PublicKey } from '@solana/web3.js';
import { create } from 'zustand';
import { BN, IdlAccounts } from '@coral-xyz/anchor';
import { Fungstake } from '@/program/fungstake/fungstake';

export type CoinInfoState = {
  coin: Partial<coinInfo>;
  tokenAddress: string;
  refreshStakeCheck: boolean;
  balanceStakeMint: string;
  totalVault: number;
  stakeEndTime: number;
  stakeConfig: IdlAccounts<Fungstake>['stakeConfig'];
  stakeInfo: IdlAccounts<Fungstake>['stakeInfo'];
  curveInfo: Partial<{
    tokenMint: PublicKey;
    creator: PublicKey;
    initLamport: BN;
    initToken: BN;
    reserveLamport: BN;
    reserveToken: BN;
    isCompleted: boolean;
    partyStart: BN;
    publicStart: BN;
  }>;
};

export type CoinStateAction = {
  handleSetStakeInfo: (stakeInfo: CoinInfoState['stakeInfo']) => void;
  handleSetStakeConfig: (stakeConfig: CoinInfoState['stakeConfig']) => void;
  handleSetTotalVault: (totalVault: CoinInfoState['totalVault']) => void;
  handleSetStakeEndTime: (stakeEndTime: CoinInfoState['stakeEndTime']) => void;
  handleSetCurveInfo: (coin: CoinInfoState['curveInfo']) => void;
  handleSetCoinInfo: (curveInfo: CoinInfoState['coin']) => void;
  handleSetRefreshCheck: (refresh: CoinInfoState['refreshStakeCheck']) => void;
  handleSetTokenAddress: (tokenAddress: CoinInfoState['tokenAddress']) => void;
  handleSetStakeMintBalance: (
    balance: CoinInfoState['balanceStakeMint']
  ) => void;
  // handleCoinStateWithKey: <K extends keyof CoinInfoState>(
  //   key: K,
  //   updateValue: CoinInfoState[K]
  // ) => void;
  resetState: () => void;
};

const initialState: CoinInfoState = {
  coin: {},
  curveInfo: {},
  tokenAddress: '',
  refreshStakeCheck: false,
  balanceStakeMint: '0',
  stakeInfo: null,
  totalVault: 0,
  stakeEndTime: 0,
  stakeConfig: null,
};

export type DepositStoreType = CoinInfoState & { actions: CoinStateAction };

const useDetectionStore = create<DepositStoreType>()((set) => ({
  //States
  ...initialState,

  //Actions
  actions: {
    handleSetStakeMintBalance: (balanceStakeMint) => set({ balanceStakeMint }),
    handleSetCoinInfo: (coin) => set({ coin }),
    handleSetCurveInfo: (curveInfo) => set({ curveInfo }),
    handleSetTokenAddress: (tokenAddress) => set({ tokenAddress }),
    handleSetRefreshCheck: (refreshStakeCheck) => set({ refreshStakeCheck }),
    handleSetStakeInfo: (stakeInfo) => set({ stakeInfo }),
    handleSetStakeConfig: (stakeConfig) => set({ stakeConfig }),
    handleSetTotalVault: (totalVault) => set({ totalVault }),
    handleSetStakeEndTime: (stakeEndTime) => set({ stakeEndTime }),

    resetState: () =>
      set((state) => {
        state.refreshStakeCheck = initialState.refreshStakeCheck;
        state.coin = initialState.coin;
        state.tokenAddress = initialState.tokenAddress;
        state.balanceStakeMint = initialState.balanceStakeMint;
        state.stakeInfo = initialState.stakeInfo;
        state.stakeConfig = initialState.stakeConfig;

        return state;
      }),

    // handleCoinStateWithKey: (k, updateValue) =>
    //   set({
    //     [k]: updateValue,
    //   }),
  },
}));

export default useDetectionStore;
