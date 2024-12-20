import LoadingImg from "@/assets/icons/loading-button.svg";
import nodataImg from "@/assets/icons/nodata.svg";
import MaxImg from "@/assets/images/richoldman.png";
import { SPL_DECIMAL, STAKE_CURRENCY_MINT, TIMER } from "@/config";
import { Web3SolanaProgramInteraction } from "@/program/web3";
import { Web3SolanaLockingToken } from "@/program/web3Locking";
import { formatNumberKMB, numberWithCommas } from "@/utils/format";
import { toBN } from "@/utils/util";
import { useWallet } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { ChangeEvent, useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { twMerge } from "tailwind-merge";
import { useLocation } from "wouter";
import { successAlert } from "../others/ToastGroup";
import { LOCK_TIME_OPTIONS } from "./constants";
import useGetListLockedByUser from "./hooks/useGetListLockedByUser";
import LockingItem from "./LockingItem";

dayjs.extend(utc);
dayjs.extend(tz);

export enum STEP_TOKEN {
  INFO,
  BEHAVIOR,
}

const web3Solana = new Web3SolanaProgramInteraction();

const web3Locking = new Web3SolanaLockingToken();

export default function Staking() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshList, setIsRefreshList] = useState(false);
  const [selectedLockTime, setSelectedLockTime] = useState(
    LOCK_TIME_OPTIONS[0]
  );
  const [tokenBal, setTokenBal] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const wallet = useWallet();
  const {
    loading: loadingList,
    lockingList,
    totalLocked,
  } = useGetListLockedByUser(isRefreshList);
  const AMOUNT_LIST = [
    {
      label: "25%",
      value: tokenBal / 4,
    },
    {
      label: "50%",
      value: tokenBal / 2,
    },
    {
      label: "75%",
      value: (tokenBal / 4) * 3,
    },
    {
      label: "100%",
      value: tokenBal,
    },
  ];

  const isInsufficient = toBN(stakeAmount).isGreaterThan(tokenBal);

  const genMsgTextBtn = () => {
    if (!stakeAmount || !Number(stakeAmount)) {
      return "Lock amount required";
    }
    if (isInsufficient) {
      return "Insufficient amount";
    }

    return "Lock";
  };

  const getBalance = async () => {
    if (!wallet.publicKey) {
      return;
    }

    try {
      const [tokenBal] = await Promise.all([
        web3Solana.getTokenBalance(
          wallet.publicKey.toString(),
          STAKE_CURRENCY_MINT
        ),
        // web3Solana.getSolanaBalance(wallet.publicKey),
      ]);
      setTokenBal(tokenBal ? tokenBal : 0);
      // setSolBalance(solBal ? solBal : 0);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getBalance();
  }, [wallet.publicKey]);

  const [, setLocation] = useLocation();

  const handleToRouter = (path: string) => {
    setLocation(path);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(parseFloat(value))) {
      setStakeAmount(value);
    } else if (value === "") {
      setStakeAmount(""); // Allow empty string to clear the input
    }
  };

  const Loading = () => (
    <div className="flex h-screen items-start justify-center bg-tizz-background">
      <ReactLoading height={20} width={50} type={"bars"} color={"#36d7b7"} />
    </div>
  );

  return (
    <div className="w-full m-auto my-24 mt-4 md:mt-10">
      <div
        // onClick={() => handleToRouter("/")}
        className="w-fit"
      >
        <div className="uppercase cursor-pointer text-[#84869A] text-2xl flex flex-row items-center gap-2">
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
          >
            <path
              d="M10.5171 11.9999L18.3546 3.83901C18.5515 3.63745 18.5468 3.30464 18.3452 3.09839L16.9437 1.66401C16.7421 1.45776 16.414 1.45307 16.2171 1.65464L6.64521 11.6203C6.54209 11.7234 6.49521 11.864 6.50459 11.9999C6.4999 12.1406 6.54678 12.2765 6.64521 12.3796L16.2171 22.3499C16.414 22.5515 16.7421 22.5468 16.9437 22.3406L18.3452 20.9062C18.5468 20.6999 18.5515 20.3671 18.3546 20.1656L10.5171 11.9999Z"
              fill="#585A6B"
            />
          </svg> */}
          Strongbox Vaults
        </div>
      </div>
      <div className="w-full text-[14px] text-[#9192A0] mb-3 md:mb-12 mt-4">
        Lock your $MAX today to gain advantages of coming projects and so much
        more!
      </div>
      <div className="flex justify-between items-start flex-col-reverse md:flex-row">
        <div className="w-full flex flex-col">
          <div className="text-[#E8E9EE] text-[18px] font-medium mb-4 md:mb-6">
            Your locking
          </div>
          {loadingList ? (
            <Loading />
          ) : lockingList.length <= 0 ? (
            <div className="flex h-screen max-h-[212px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#30344A] bg-[#13141D] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-[#1A1C28] bg-[#080A14]">
                <img src={nodataImg} alt="nodata" />
              </div>
              <p className="mt-4 text-[16px] font-medium uppercase text-[#E8E9EE]">
                No locking
              </p>
              <p className="mt-2 text-[14px] font-medium text-[#585A6B]">
                Your locking history will appear here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="scrollable-table-container border border-[#1A1C28] rounded-lg !max-h-[440px]">
                <table className="w-full h-full scroll-table">
                  <thead className="w-full text-white">
                    <tr className="text-lg">
                      <th className="pl-4 py-2 md:pl-6 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase text-left">
                        MAX locked
                      </th>
                      <th className="px-1 py-2 md:px-2 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase">
                        STATE
                      </th>
                      <th className="px-1 py-2 md:px-2 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase">
                        duration
                      </th>
                      <th className="px-1 py-2 md:px-2 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase">
                        Unlock date
                      </th>
                      <th className="pr-4 py-2 md:pr-6 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="min-w-[320px]">
                    {lockingList
                      .sort((a, b) =>
                        toBN(b.unstakedAtTime || 0)
                          .minus(a.unstakedAtTime || 0)
                          .toNumber()
                      )
                      .filter((lockItem) =>
                        toBN(lockItem.stakeAmount).isGreaterThan(0)
                      )
                      .map((item, index) => {
                        return (
                          <LockingItem
                            keyId={index}
                            item={item}
                            onSuccess={() => {
                              setIsRefreshList(!isRefreshList);
                              getBalance();
                            }}
                          ></LockingItem>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col w-full md:max-w-[490px] mb-6">
          <div className="w-full flex flex-col border border-[#1A1C28] bg-[#13141D] rounded-lg p-3 md:p-8 mt-4 md:mt-0 md:ml-4">
            <div className="text-[18px] text-[#E8E9EE] font-medium mb-4 md:mb-6">
              Let's lock now
            </div>
            <div>
              <div className="uppercase text-[#84869A] text-[12px] font-medium mb-3">
                Lock amount
              </div>
              <div className="px-4 w-full flex flex-row items-center bg-transparent border-[1px] border-[#30344A] rounded">
                <div className="py-2">
                  <input
                    type="number"
                    id="stakeAmount"
                    value={stakeAmount}
                    onChange={handleInputChange}
                    pattern="\d*"
                    className="w-full outline-none capitalize bg-transparent text-[#E8E9EE] placeholder:text-[#585A6B] text-[24px]"
                    placeholder="0.0"
                    required
                  />

                  <span className="text-[10px] text-[#E8E9EE] font-medium">
                    Balance: {numberWithCommas(Number(tokenBal))} MAX
                  </span>
                </div>

                <div className="flex w-fit text-[#E8E9EE] text-[14px] rounded-[32px] bg-[#080A14] py-1 px-4 justify-center items-center h-8">
                  MAX
                  <img
                    src={MaxImg}
                    alt="coinIcon"
                    className="ml-1 w-5 h-5 rounded-full border border-[#30344A] object-cover"
                  />
                </div>
              </div>
              <div className="flex w-full flex-row gap-3 py-2">
                {AMOUNT_LIST.map((amount: any, idx: number) => {
                  return (
                    <div
                      key={`amount-list-percent-${idx}---`}
                      className="cursor-pointer rounded border-[1px] border-[#30344A] bg-[#080A14] px-2 py-1 text-center text-[12px] font-medium text-[#9192A0] hover:brightness-125"
                      onClick={() => setStakeAmount(amount.value.toString())}
                    >
                      {amount.label}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 md:mt-4">
              <label
                htmlFor="name"
                className="text-[12px] uppercase font-medium text-[#84869A] flex items-center cursor-pointer"
              >
                locking duration
              </label>
              <div className="flex justify-between gap-3 mt-3">
                {LOCK_TIME_OPTIONS.map((item, idx) => {
                  return (
                    <div
                      className={twMerge(
                        "cursor-pointer flex flex-1 items-center justify-center h-10 bg-[#080A14] border border-[#30344A] rounded hover:brightness-125 text-[#9192A0] text-[12px] md:text-[14px] font-medium",
                        selectedLockTime.label === item.label &&
                          "border-[#E8E9EE] text-[#E8E9EE] rounded-lg "
                      )}
                      key={`key-lock-time-${idx}---`}
                      onClick={() => setSelectedLockTime(item)}
                    >
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="my-4 md:my-6 flex justify-between items-center">
              <div className="text-[#84869A]">Unlock on</div>
              <div>
                {dayjs()
                  .add(selectedLockTime.value, selectedLockTime.type)
                  .format("MMM DD YYYY HH:mm")}
              </div>
            </div>

            <button
              disabled={
                isLoading ||
                !stakeAmount ||
                !Number(stakeAmount) ||
                isInsufficient
              }
              onClick={async () => {
                console.log("Stake!!");
                try {
                  setIsLoading(true);
                  const duration =
                    selectedLockTime.value * TIMER.MONTH_TO_SECONDS;
                  const amount = toBN(
                    toBN(stakeAmount || 0)
                      .multipliedBy(10 ** SPL_DECIMAL)
                      .toFixed(0, 1)
                  ).toNumber();
                  const res = await web3Locking.stake(duration, amount, wallet);
                  if (res) {
                    successAlert("Lock successfully!");
                    getBalance();
                    setIsRefreshList(!isRefreshList);
                  }
                } catch (error) {
                  console.log("error lock", error);
                  successAlert("Lock failed!");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="mt-4 disabled:opacity-75 disabled:cursor-not-allowed uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
            >
              <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14] flex items-center justify-center">
                {isLoading && <img src={LoadingImg} />}&nbsp;Lock
                {/* {genMsgTextBtn()} */}
              </div>
            </button>
          </div>
          <div className="w-full flex justify-between gap-2 border border-[#1A1C28] bg-[#13141D] rounded-lg p-3 md:p-8 mt-4 md:ml-4">
            <div>
              <div className="text-[#585A6B]">Total MAX locked</div>
              <div className="text-[#FCFCFC] font-medium text-[20px] mt-2">
                {formatNumberKMB(
                  toBN(totalLocked)
                    .div(10 ** SPL_DECIMAL)
                    .toNumber(),
                  false
                )}{" "}
                MAX
              </div>
            </div>
            <div>
              {/* <div className="text-[#585A6B] text-right">Unique lockers</div>
              <div className="text-[#FCFCFC] font-medium text-[20px] mt-2 text-right">
                {numberWithCommas(120)}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const LIST_LOCKING_ITEMS = [
  {
    id: 1,
    status: 0,
  },
  {
    id: 1,
    status: 1,
  },
  {
    id: 1,
    status: 0,
  },
  {
    id: 1,
    status: 0,
  },
  {
    id: 1,
    status: 0,
  },
  {
    id: 1,
    status: 0,
  },
  {
    id: 1,
    status: 0,
  },
];
