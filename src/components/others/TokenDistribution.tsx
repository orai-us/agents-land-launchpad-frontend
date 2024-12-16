import { coinInfo, holderInfo, recordInfo } from "@/utils/types";
import { FC, useContext, useEffect, useState } from "react";
import {
  calculateKotHProgress,
  calculateTokenPrice,
  findHolders,
  fromBig,
  getKoth,
  getSolPriceInUSD,
  getUserByWalletAddress,
} from "@/utils/util";
import defaultUserImg from "@/assets/images/userAgentDefault.svg";

import { BN } from "@coral-xyz/anchor";
import { PROGRAM_ID, DISTILL_COMMUNITY_POOL_WALLET } from "@/config";
import { AgentsLandEventListener } from "@/program/logListeners/AgentsLandEventListener";
import { ResultType } from "@/program/logListeners/types";
import {
  endpoint,
  commitmentLevel,
  Web3SolanaProgramInteraction,
} from "@/program/web3";
import { Connection, PublicKey } from "@solana/web3.js";
import { formatNumberKMB } from "@/utils/format";
import { useWallet } from "@solana/wallet-adapter-react";

interface ModalProps {
  data: coinInfo;
}

const TokenDistribution: FC<ModalProps> = ({ data }) => {
  const [holders, setHolders] = useState<holderInfo[]>([]);
  const [kothProgress, setKotHProgress] = useState<number>(0);
  const [configBondingAddress, setConfigBondingAddress] = useState<string>();
  const wallet = useWallet();
  const [kothCoin, setKothCoin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const configBondingAddr =
        await new Web3SolanaProgramInteraction().getBondingAddressToken(wallet);
      if (configBondingAddr) {
        setConfigBondingAddress(configBondingAddr);
      }
    };
    fetchData();
  }, [wallet]);

  useEffect(() => {
    const fetchData = async () => {
      const kingCoin = await getKoth();
      const configBondingAddr =
        await new Web3SolanaProgramInteraction().getBondingAddressToken(wallet);
      if (configBondingAddr) {
        setConfigBondingAddress(configBondingAddr);
      }

      if (kingCoin) {
        setKothCoin(kingCoin);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (data) {
        const holderData = await findHolders(data.token);
        setHolders(holderData ? holderData : []);
        const currentKotHProgress = calculateKotHProgress(
          data.lamportReserves,
          data.bondingCurveLimit
        );
        setKotHProgress(currentKotHProgress);
      }
    };
    fetchData();
  }, [data]);

  // real-time koth progress
  useEffect(() => {
    if (!data) return;
    const connection = new Connection(endpoint, {
      commitment: commitmentLevel,
      wsEndpoint: import.meta.env.VITE_SOLANA_WS,
    });
    const listener = new AgentsLandEventListener(connection);
    listener.setProgramEventCallback(
      "swapEvent",
      async (result: ResultType) => {
        const currentKotHProgress = calculateKotHProgress(
          result.lamportReserves,
          data.bondingCurveLimit
        );
        setKotHProgress(currentKotHProgress);
      },
      []
    );

    const { program, listenerIds } = listener.listenProgramEvents(
      new PublicKey(PROGRAM_ID).toBase58()
    );

    return () => {
      if (!program) return;
      console.log("ready to remove listeners");
      Promise.all(listenerIds.map((id) => program.removeEventListener(id)));
    };
  }, [data]);
  console.log("first", holders);

  return (
    <div className="flex flex-col justify-between pt-4">
      {/* <button className="px-5 py-1.5 bg-custom-gradient rounded-full text-white font-semibold">
        Generate bubble map
      </button> */}
      <div className="w-full flex flex-col gap-2 border border-[#1A1C28] rounded-lg p-6">
        <p className="text-[#E8E9EE] text-[16px] uppercase">
          Peak of evolution progress ({kothProgress.toFixed(2)}%)
        </p>
        <div className="w-full my-2 px-[2px] py-[1px] rounded-[28px] bg-[#1A1C28] border border-solid border-[#30344A]">
          <div
            className="rounded-[999px] h-2 bg-hill "
            style={{ width: `${kothProgress}%` }}
          ></div>
        </div>

        <span className="text-[#585A6B] text-[14px]">
          Dethrone the current king at{" "}
          {formatNumberKMB(kothCoin?.marketcap || 0)} market cap
        </span>
      </div>
      <div className=" border border-[#1A1C28] rounded-lg p-6 mt-4 mb-14">
        <div className="uppercase text-[16px] text-[#E8E9EE]">
          Holder Distribution
        </div>
        <div className="w-full flex flex-row justify-between items-center text-sm pt-3">
          <p className="text-[12px] text-[#585A6B] leading-10 uppercase">
            Holder
          </p>
          <p className="text-[12px] text-[#585A6B] leading-10 uppercase">
            Percentage
          </p>
        </div>
        <div className="w-full h-full min-h-[180px] max-h-[350px] overflow-y-auto flex flex-col gap-2">
          {holders &&
            holders
              .sort((a, b) => b.amount - a.amount)
              .map((item: any, index: number) => {
                const imgSrc = item.creator?.avatar || defaultUserImg;
                const isCreator =
                  String(item.owner).toLowerCase() ===
                  String(data.creator["wallet"]).toLowerCase();
                const isBondingAddr =
                  String(item.owner).toLowerCase() ===
                  String(configBondingAddress).toLowerCase();
                const isAgent =
                  String(item.owner).toLowerCase() ===
                  String(data.metadata?.agentAddress).toLowerCase();
                const isCommunityPool =
                  String(item.owner).toLowerCase() ===
                  String(DISTILL_COMMUNITY_POOL_WALLET).toLowerCase();

                return (
                  <div
                    key={index}
                    className="w-full flex flex-row justify-between text-[14px] text-[#E8E9EE] pr-2 pb-4 border border-b border-[#1A1C28] border-t-0 border-x-0 hover:brightness-75"
                  >
                    <div className="flex flex-row gap-1 items-center">
                      <a
                        href={`https://solscan.io/account/${item.owner}`}
                        target="_blank"
                      >
                        {item.slice}
                        {isCreator && (
                          <span className="ml-1 text-[#585A6B] text-[12px]">
                            (Creator)
                          </span>
                        )}
                        {isBondingAddr && (
                          <span className="ml-1 text-[#585A6B] text-[12px]">
                            (Bonding Curve)
                          </span>
                        )}
                        {isCommunityPool && (
                          <span className="ml-1 text-[#585A6B] text-[12px]">
                            (Distilled AI Community)
                          </span>
                        )}
                        {isAgent && (
                          <span className="ml-1 text-[#585A6B] text-[12px]">
                            (Agent)
                          </span>
                        )}
                      </a>
                    </div>
                    <div className="flex flex-col">
                      {Math.floor(item.amount / 10_000_000_000) / 1000}%
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default TokenDistribution;
