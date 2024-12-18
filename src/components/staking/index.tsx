import MaxImg from "@/assets/images/richoldman.png";
import { useSocket } from "@/contexts/SocketContext";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { Web3SolanaProgramInteraction } from "@/program/web3";
import { formatNumberKMB, numberWithCommas } from "@/utils/format";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Circles } from "react-loader-spinner";
import { useLocation } from "wouter";
import ZappingText from "../zapping";
import { MAX_TOKEN_ADDRESS } from "@/config";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export enum STEP_TOKEN {
  INFO,
  BEHAVIOR,
}

const web3Solana = new Web3SolanaProgramInteraction();

export default function Staking() {
  const { isLoading, setIsLoading } = useSocket();
  const [selectedLockTime, setSelectedLockTime] = useState(
    LOCK_TIME_OPTIONS[0]
  );
  const [selectGroup, setSelectedGroup] = useState(false);
  const refAgent = useRef();
  const [tokenBal, setTokenBal] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const AMOUNT_LIST = [
    {
      label: "10%",
      value: tokenBal / 10,
    },
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

  useOnClickOutside(refAgent, () => {
    setSelectedGroup(false);
  });

  const getBalance = async () => {
    if (!wallet.publicKey) {
      return;
    }

    try {
      const [tokenBal, solBal] = await Promise.all([
        web3Solana.getTokenBalance(
          wallet.publicKey.toString(),
          MAX_TOKEN_ADDRESS
        ),
        web3Solana.getSolanaBalance(wallet.publicKey),
      ]);
      setTokenBal(tokenBal ? tokenBal : 0);
      setSolBalance(solBal ? solBal : 0);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getBalance();
  }, []);

  const wallet = useWallet();
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

  return (
    <div className="w-full m-auto my-24 mt-4 md:mt-10">
      <div onClick={() => handleToRouter("/")}>
        <div className="uppercase cursor-pointer text-[#84869A] text-2xl flex flex-row items-center gap-2 pb-2">
          <svg
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
          </svg>
          max staking
        </div>
      </div>

      {isLoading && (
        <div className="w-full h-full fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-lg z-50">
          <div className="w-[350px] h-[220px] flex flex-col justify-center items-center relative p-6  bg-[#13141D] rounded-lg shadow-lg">
            <button
              onClick={() => setIsLoading(!isLoading)}
              className="absolute top-6 right-6  hover:brightness-125 text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="w-[350px] h-[200px] flex flex-col gap-4 justify-center items-center">
              <Circles
                height="80"
                width="80"
                color="#E4775D"
                ariaLabel="circles-loading"
                visible={true}
              />

              <div className="right-6 text-1xl p-2">
                <ZappingText text={"Transaction processing"} dot={5} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full text-[14px] text-[#9192A0] mb-4 mt-4">
        Stake your $MAX today to gain advantages of coming tokens and so much
        more!
      </div>
      <div className="flex justify-between items-start flex-col md:flex-row">
        <div className="w-full flex flex-col gap-6 bg-[#13141D] rounded-lg p-4 md:p-8">
          <div className="text-[#E8E9EE] text-[18px] font-medium">
            Your locking
          </div>

          <div className="flex flex-col gap-6">
            <div></div>
          </div>
        </div>
        <div className="flex flex-col w-full md:max-w-[490px]">
          <div className="w-full flex flex-col border border-[#1A1C28] bg-[#13141D] rounded-lg p-3 md:p-8 mt-4 md:mt-0 md:ml-4">
            <div className="text-[18px] text-[#E8E9EE] font-medium mb-4 md:mb-6">
              Let's stake now
            </div>
            <div>
              <div className="uppercase text-[#84869A] text-[12px] font-medium mb-3">
                Stake amount
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
                      className="flex-1 cursor-pointer rounded border-[1px] border-[#30344A] bg-[#080A14] px-2 py-1 text-center text-[12px] font-medium text-[#9192A0] hover:brightness-125"
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

              <div
                ref={refAgent}
                className="relative cursor-pointer mt-3"
                onClick={() => {
                  setSelectedGroup(!selectGroup);
                }}
              >
                <div className="flex items-center justify-between w-full px-3 border border-[#585A6B] rounded h-12">
                  <div className="flex items-center text-[#E8E9EE] text-[14px] font-medium">
                    {selectedLockTime.label}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19.2071 8.24992C18.8166 7.8594 18.1834 7.8594 17.7929 8.24992L12 14.0428L6.20711 8.24992C5.81658 7.8594 5.18342 7.8594 4.79289 8.24992C4.40237 8.64044 4.40237 9.27361 4.79289 9.66413L10.5858 15.457C11.3668 16.2381 12.6332 16.2381 13.4142 15.457L19.2071 9.66414C19.5976 9.27361 19.5976 8.64045 19.2071 8.24992Z"
                      fill="#9192A0"
                    />
                  </svg>
                </div>
                {selectGroup && (
                  <div className="pt-2 absolute top-full w-full">
                    <div className="bg-[#1A1C28] shadow shadow-[rgba(0,_0,_0,_0.10)] p-3 text-[12px] text-[#F7F7F7] rounded-lg flex flex-col gap-2 overflow-y-auto max-h-52 h-100%">
                      {LOCK_TIME_OPTIONS.map((e, ind) => {
                        return (
                          <div
                            className={twMerge(
                              "flex items-center justify-between rounded-lg hover:bg-[#13141D] p-3",
                              e.value === selectedLockTime.value &&
                                "bg-[#13141D] cursor-not-allowed"
                            )}
                            key={`agent-item-${ind}`}
                            onClick={() => setSelectedLockTime(e)}
                          >
                            <div className="flex items-center text-[#E8E9EE] text-[14px] font-medium">
                              {e.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="my-4 md:my-6 flex justify-between items-center">
              <div className="text-[#84869A]">Unlock on</div>
              <div>
                {dayjs(Date.now())
                  .add(selectedLockTime.value, "day")
                  .format("MMM DD YYYY HH:MM")}
              </div>
            </div>

            <button
              disabled={isLoading}
              onClick={() => {
                console.log("Stake!!");
              }}
              className="mt-4 disabled:opacity-75 disabled:cursor-not-allowed uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
            >
              <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14]">
                Stake
              </div>
            </button>
          </div>
          <div className="w-full flex justify-between gap-2 border border-[#1A1C28] bg-[#13141D] rounded-lg p-3 md:p-8 mt-4 md:ml-4">
            <div>
              <div className="text-[#585A6B]">Total MAX staked</div>
              <div className="text-[#FCFCFC] font-medium text-[20px] mt-2">
                {formatNumberKMB(12345678, false)} MAX
              </div>
            </div>
            <div>
              <div className="text-[#585A6B]">Unique stakers</div>
              <div className="text-[#FCFCFC] font-medium text-[20px] mt-2 text-right">
                {numberWithCommas(120)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const LOCK_TIME_OPTIONS = [
  {
    label: "3 months",
    value: 3,
  },
  {
    label: "2 months",
    value: 2,
  },
  {
    label: "1 months",
    value: 1,
  },
];
