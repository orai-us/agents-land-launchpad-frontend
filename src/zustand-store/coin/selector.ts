import useCoinStore, { CoinInfoState } from './useCoinStore';

export const useCoinActions = () => useCoinStore((state) => state.actions);
export const useGetCoinInfoState = <K extends keyof CoinInfoState>(
  key: K
): CoinInfoState[K] => useCoinStore((state) => state[key]);
