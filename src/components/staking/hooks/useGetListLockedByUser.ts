import { Web3SolanaLockingToken } from "@/program/web3Locking";
import React, { useEffect, useState } from "react";
import { LOCK_TIME_OPTIONS } from "../constants";
import { ALL_CONFIGS } from "@/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { toBN } from "@/utils/util";

const web3Locking = new Web3SolanaLockingToken();

const useGetListLockedByUser = (refreshCheck) => {
  const [lockingList, setLockingList] = useState([]);
  const [totalLocked, setTotalLocked] = useState(0);
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();

  useEffect(() => {
    // if (!wallet.publicKey) return;
    (async () => {
      try {
        setLoading(true);
        const list = [];
        let totalVault = 0;

        await Promise.all(
          LOCK_TIME_OPTIONS.map(async (item) => {
            const period = item.value * ALL_CONFIGS.TIMER.MONTH_TO_SECONDS;
            const { listLockedItems, vaultInfo } =
              await web3Locking.getListLockedOfUser(period, wallet);

            totalVault = toBN(totalVault)
              .plus(vaultInfo.totalStaked?.toString() || 0)
              .toNumber();
            list.push(...listLockedItems);
            return listLockedItems;
          })
        );

        setLockingList(list);
        setTotalLocked(totalVault);
      } catch (error) {
        console.log("get list locking items error", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [wallet.publicKey, refreshCheck]);

  return {
    loading,
    lockingList,
    totalLocked,
  };
};

export default useGetListLockedByUser;
