import { coinInfo } from '@/utils/types';
import { create } from 'zustand';

export type CoinInfoState = {
  coin: Partial<coinInfo>;
  tokenAddress: string;
  refreshStakeCheck: boolean;
  balanceStakeMint: string;
  totalVault: number;
  stakeInfo: any;
};

export type CoinStateAction = {
  handleSetStakeInfo: (stakeInfo: CoinInfoState['stakeInfo']) => void;
  handleSetTotalVault: (totalVault: CoinInfoState['totalVault']) => void;
  handleSetCoinInfo: (coin: CoinInfoState['coin']) => void;
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
  tokenAddress: '',
  refreshStakeCheck: false,
  balanceStakeMint: '0',
  stakeInfo: null,
  totalVault: 0,
};

export type DepositStoreType = CoinInfoState & { actions: CoinStateAction };

const useDetectionStore = create<DepositStoreType>()((set) => ({
  //States
  ...initialState,

  //Actions
  actions: {
    handleSetStakeMintBalance: (balanceStakeMint) => set({ balanceStakeMint }),
    handleSetCoinInfo: (coin) => set({ coin }),
    handleSetTokenAddress: (tokenAddress) => set({ tokenAddress }),
    handleSetRefreshCheck: (refreshStakeCheck) => set({ refreshStakeCheck }),
    handleSetStakeInfo: (stakeInfo) => set({ stakeInfo }),
    handleSetTotalVault: (totalVault) => set({ totalVault }),

    resetState: () =>
      set((state) => {
        state.refreshStakeCheck = initialState.refreshStakeCheck;
        state.coin = initialState.coin;
        state.tokenAddress = initialState.tokenAddress;
        state.balanceStakeMint = initialState.balanceStakeMint;
        state.stakeInfo = initialState.stakeInfo;

        return state;
      }),

    // handleCoinStateWithKey: (k, updateValue) =>
    //   set({
    //     [k]: updateValue,
    //   }),
  },
}));

export default useDetectionStore;
