import useConfigStore, { ConfigState } from './useConfigStore';

export const useConfigActions = () => useConfigStore((state) => state.actions);
export const useGetConfigState = <K extends keyof ConfigState>(
  key: K
): ConfigState[K] => useConfigStore((state) => state[key]);
