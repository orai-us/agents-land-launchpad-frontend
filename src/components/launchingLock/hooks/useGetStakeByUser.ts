import { web3FungibleStake } from "@/program/web3FungStake";
import { toBN, toPublicKey } from "@/utils/util";
import {
  useCoinActions,
  useGetCoinInfoState,
} from "@/zustand-store/coin/selector";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

const web3Locking = new web3FungibleStake();

const useGetStakedByUser = (
  stakeCurrencyMint: string,
  rewardCurrencyMint: string,
  refreshCheck
) => {
  const stakeEndTime = useGetCoinInfoState("stakeEndTime");
  const stakeInfo = useGetCoinInfoState("stakeInfo");
  let stakeConfig = useGetCoinInfoState("stakeConfig");
  const totalLocked = useGetCoinInfoState("totalVault");
  const {
    handleSetStakeInfo,
    handleSetTotalVault,
    handleSetStakeEndTime,
    handleSetStakeConfig,
  } = useCoinActions();
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
          stakeCurrencyMint,
          rewardCurrencyMint,
          wallet
        );

        totalVault = toBN(totalVault)
          .plus(vaultInfo.totalStaked?.toString() || 0)
          .toNumber();

        // only fetch and update stake config if the stake currency changes
        if (!stakeConfig || stakeConfig.stakeCurrencyMint.toBase58() !== stakeCurrencyMint) {
          stakeConfig = await web3Locking.getStakeConfig(
            toPublicKey(stakeCurrencyMint)
          );
          handleSetStakeConfig(stakeConfig);
        }

        // setStakeInfo(stakerInfo);
        // setTotalLocked(totalVault);
        handleSetStakeEndTime(vaultInfo.stakeEndTime.toNumber());
        handleSetStakeInfo(stakerInfo);
        handleSetTotalVault(totalVault);
      } catch (error) {
        console.log("get list locking items error", error);
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
