import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { create } from 'zustand';

export type ConfigState = {
  bondingCurveConfig: {
    authority: PublicKey;
    pendingAuthority: PublicKey;
    teamWallet: PublicKey;
    migrator: PublicKey;
    communityPoolWallet: PublicKey;
    stakingPoolWallet: PublicKey;
    platformBuyFee: number;
    platformSellFee: number;
    platformMigrationFee: number;
    curveLimit: BN;
    lamportAmountConfig: BN;
    tokenSupplyConfig: BN;
    tokenDecimalsConfig: number;
    whitelistRoundPeriod: BN;
    waitingPeriod: BN;
    creatorFee: number;
    communityPoolFee: number;
    aiAgentFee: number;
    stakingFee: number;
    stakingProgram: PublicKey;
    maxTokenBuyInParty: BN;
    maxSolBuyInPublic: BN;
  };
  configSnapshot: {
    token: string;
    metadata: any;
  }[];
  listAllowAddress: string[];
  stakeConfig: {
    bump: number[];
    version: number;
    authority: PublicKey;
    stakeCurrencyMint: PublicKey;
    lockPeriod: number;
    lockExtendTime: number;
    softCap: BN;
    totalReward: BN;
  };
};

export type ConfigStateAction = {
  handleSetListAllowAddress: (
    listAllowAddress: ConfigState['listAllowAddress']
  ) => void;
  handleSetBondingCurveConfig: (
    bondingCurveConfig: ConfigState['bondingCurveConfig']
  ) => void;
  handleSetStakeConfig: (stakeConfig: ConfigState['stakeConfig']) => void;
  handleSetSnapshotConfig: (stakeConfig: ConfigState['configSnapshot']) => void;
  resetState: () => void;
};

const initialState: ConfigState = {
  bondingCurveConfig: null,
  listAllowAddress: [],
  stakeConfig: null,
  configSnapshot: [],
};

export type DepositStoreType = ConfigState & { actions: ConfigStateAction };

const useDetectionStore = create<DepositStoreType>()((set) => ({
  //States
  ...initialState,

  //Actions
  actions: {
    handleSetSnapshotConfig: (configSnapshot) => set({ configSnapshot }),
    handleSetStakeConfig: (stakeConfig) => set({ stakeConfig }),
    handleSetListAllowAddress: (listAllowAddress) => set({ listAllowAddress }),
    handleSetBondingCurveConfig: (bondingCurveConfig) =>
      set({ bondingCurveConfig }),
    resetState: () =>
      set((state) => {
        state.bondingCurveConfig = initialState.bondingCurveConfig;
        state.stakeConfig = initialState.stakeConfig;
        state.listAllowAddress = initialState.listAllowAddress;

        return state;
      }),
  },
}));

export default useDetectionStore;
