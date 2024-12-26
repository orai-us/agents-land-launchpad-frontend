import { web3FungibleStake } from '@/program/web3FungStake';
import { toBN, toPublicKey } from '@/utils/util';
import {
  useCoinActions,
  useGetCoinInfoState,
} from '@/zustand-store/coin/selector';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

const web3Locking = new web3FungibleStake();

const useGetStakedByUser = (rewardCurrencyMint, refreshCheck) => {
  const stakeEndTime = useGetCoinInfoState('stakeEndTime');
  const stakeInfo = useGetCoinInfoState('stakeInfo');
  const totalLocked = useGetCoinInfoState('totalVault');
  const { handleSetStakeInfo, handleSetTotalVault, handleSetStakeEndTime } =
    useCoinActions();
  // const [totalLocked, setTotalLocked] = useState(0);
  // const [stakeInfo, setStakeInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();

  useEffect(() => {
    if (!rewardCurrencyMint) return;
    (async () => {
      try {
        setLoading(true);
        let totalVault = 0;

        const { stakerInfo, vaultInfo } = await web3Locking.getStakeInfo(
          toPublicKey(rewardCurrencyMint),
          wallet
        );

        totalVault = toBN(totalVault)
          .plus(vaultInfo.totalStaked?.toString() || 0)
          .toNumber();

        // setStakeInfo(stakerInfo);
        // setTotalLocked(totalVault);
        handleSetStakeEndTime(vaultInfo.stakeEndTime.toNumber());
        handleSetStakeInfo(stakerInfo);
        handleSetTotalVault(totalVault);
      } catch (error) {
        console.log('get list locking items error', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [wallet.publicKey, refreshCheck, rewardCurrencyMint]);

  return {
    loading,
    stakeInfo,
    totalLocked,
    stakeEndTime,
  };
};

export default useGetStakedByUser;
