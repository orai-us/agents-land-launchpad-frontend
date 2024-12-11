import oraidexIcon from "@/assets/icons/oraidex_ic.svg";
import raydiumIcon from "@/assets/icons/raydium_ic.svg";
import defaultUserImg from "@/assets/images/userAgentDefault.svg";
import { Chatting } from "@/components/trading/Chatting";
import { TradeForm } from "@/components/trading/TradeForm";
import { TradingChart } from "@/components/TVChart/TradingChart";
import { BONDING_CURVE_LIMIT } from "@/config";
import UserContext from "@/context/UserContext";
import {
  formatLargeNumber,
  formatNumberKMB,
  numberWithCommas,
} from "@/utils/format";
import { coinInfo } from "@/utils/types";
import { fromBig, getCoinInfo, reduceString, sleep } from "@/utils/util";
import { BN } from "@coral-xyz/anchor";
import BigNumber from "bignumber.js";

import LoadingImg from "@/assets/icons/loading-button.svg";
import { SOL_DECIMAL } from "@/config";
import { Web3SolanaProgramInteraction } from "@/program/web3";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useContext, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useLocation } from "wouter";
import TokenDistribution from "../others/TokenDistribution";
import { DexToolsChart } from "../TVChart/DexToolsChart";
import useListenEventSwapChart from "./hooks/useListenEventSwapChart";

const SLEEP_TIMEOUT = 1500;

const web3Solana = new Web3SolanaProgramInteraction();
export default function TradingPage() {
  const { solPrice } = useContext(UserContext);
  const { coinId, setCoinId } = useContext(UserContext);

  const [param, setParam] = useState<string>("");
  const [progress, setProgress] = useState<Number>(0);
  const [coin, setCoin] = useState<coinInfo>({} as coinInfo);
  const [pathname, setLocation] = useLocation();
  const [loadingEst, setLoadingEst] = useState<boolean>(true);
  const wallet = useWallet();
  const [simulatePrice, setSimulatePrice] = useState<string>("");
  const [isAgentChart, setIsAgentChart] = useState<Boolean>(true);

  const imgSrc = coin.metadata?.image || coin.url || defaultUserImg;
  // FIXME: need to integrate agent

  useEffect(() => {
    const fetchData = async () => {
      // Split the pathname and extract the last segment
      const segments = pathname.split("/");
      const parameter = segments[segments.length - 1];
      setParam(parameter);
      setCoinId(parameter);

      let data = await getCoinInfo(parameter);

      if (!data) {
        let retry = 1;
        while (retry < 3 && !data) {
          console.log("Retry LoadToken", retry);
          await sleep(SLEEP_TIMEOUT);
          ++retry;
          data = await getCoinInfo(parameter);
        }
      }

      const bondingCurvePercent = (data.lamportReserves || new BN(0))
        .mul(new BN(100))
        .div(new BN(BONDING_CURVE_LIMIT))
        .toNumber();

      const showCurrentChart =
        bondingCurvePercent >= 100 && data.raydiumPoolAddr;

      setIsAgentChart(!showCurrentChart);
      setProgress(bondingCurvePercent > 100 ? 100 : bondingCurvePercent);
      setCoin(data);
    };
    fetchData();
  }, [pathname]);

  useEffect(() => {
    if (coin) {
      (async () => {
        try {
          setLoadingEst(true);
          const amountWithDecimal = new BigNumber(1)
            .multipliedBy(new BigNumber(10).pow(coin.decimals))
            .toFixed(0, 1);
          const mint = new PublicKey(coin.token);

          const { numerator, denominator } =
            await web3Solana.simulateRaydiumSwapTx(
              mint,
              wallet,
              amountWithDecimal,
              1,
              coin.raydiumPoolAddr
            );

          setSimulatePrice(
            new BigNumber((numerator || 0).toString())
              .div(new BigNumber(10).pow(SOL_DECIMAL))
              .toString()
          );
        } catch (error) {
          console.log("simulate failed", error);
        } finally {
          setLoadingEst(false);
        }
      })();
    }
  }, [coin]);

  const { curPrice } = useListenEventSwapChart({ coin });

  const isListedOnRay = Number(progress) >= 100 && !!coin.raydiumPoolAddr;
  const tokenPrice = isListedOnRay ? simulatePrice : curPrice;
  const priceUsd = new BigNumber(isNaN(Number(tokenPrice)) ? 0 : tokenPrice)
    .multipliedBy(solPrice)
    .toFixed(6);

  const isRaydiumListed = coin["raydiumPoolAddr"];
  const isListed = coin["listed"];

  return (
    <div className="w-full flex flex-col mx-auto gap-5">
      <div className="text-center">
        <div
          className="mt-0 md:mt-12"
          // onClick={() => setLocation("/")}
        >
          <div className="cursor-pointer text-white text-2xl flex flex-row items-center gap-2 pb-2">
            {/* <IoMdArrowRoundBack />
            Back */}
          </div>
        </div>
      </div>
      {Number(progress) >= 100 && !isListed && (
        <div className="animate-pulse animate-infinite rounded px-3 py-3 mb-4 bg-[#9FF4CF] text-[#080A14] flex items-center justify-center">
          Token is listing on Oraidex and Raydium. Please wait a minutes!
        </div>
      )}

      <div className="w-full flex flex-col gap-4 md:flex-row md:gap-10">
        <div className="flex-1">
          <div className="flex">
            {isListed &&
              (isRaydiumListed ? (
                <a
                  // liquidity/increase/?mode=add&pool_id=${coin.raydiumPoolAddr}
                  href={`https://raydium.io`}
                  target="_blank"
                  className="mb-6 animate-pulse animate-duration-200 animate-infinite text-[#080A14] rounded flex items-center uppercase text-[12px] font-medium bg-[linear-gradient(48deg,_#B170FF_0.56%,_#B3A7F1_20.34%,_#1FFFB5_99.44%)] p-1"
                >
                  <img
                    src={raydiumIcon}
                    alt="icon_dex"
                    className="mr-1"
                    width={16}
                    height={16}
                  />
                  <span>LISTED oN RAYDIUM</span>
                </a>
              ) : (
                <a
                  href={`https://app.oraidex.io`}
                  target="_blank"
                  className="mb-6 animate-pulse animate-duration-200 animate-infinite text-[#080A14] rounded flex items-center uppercase text-[12px] font-medium bg-[#AEE67F] p-1"
                >
                  <img
                    src={oraidexIcon}
                    alt="icon_dex"
                    className="mr-1"
                    width={16}
                    height={16}
                  />
                  <span>LISTED oN ORAIDEX</span>
                </a>
              ))}
          </div>

          {/* trading view chart  */}
          <div className="w-full">
            <div className="bg-[#1A1C28] rounded-t p-6">
              <div className="mb-4 flex justify-between items-start flex-wrap gap-4">
                <div className="flex gap-2 items-start md:items-center">
                  {typeof imgSrc === "string" ? (
                    <img
                      src={imgSrc}
                      alt="agentAvt"
                      className="w-[60px] h-[60px] rounded-full border border-[#E8E9EE]"
                    />
                  ) : (
                    <img
                      src={imgSrc}
                      alt="agentAvt"
                      className="w-[60px] h-[60px] rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-[#E8E9EE] text-[24px] font-medium">
                      {/* {"Jordan’s Investor Coach"}&nbsp;(${coin.ticker}) */}
                      {coin.name || "--"}&nbsp;(${coin.ticker || "--"})
                    </p>
                    <p className="text-[#84869A] text-[10px] md:text-[12px] mt-2 font-medium uppercase break-all">
                      CONTRACT: {coin.token}
                    </p>
                  </div>
                </div>
                {/* <div className="flex gap-2 flex-wrap justify-between items-center w-full md:w-fit">
                  <div className="block md:hidden">
                    <p className="text-[#E8E9EE] text-[14px] md:text-[24px] font-medium flex items-center gap-1">
                      {!loadingEst ? (
                        numberWithCommas(
                          isNaN(Number(tokenPrice)) ? 0 : Number(tokenPrice),
                          undefined,
                          {
                            maximumFractionDigits: 9,
                          }
                        )
                      ) : (
                        <img src={LoadingImg} />
                      )}{" "}
                      SOL
                    </p>
                    <p
                      className={twMerge(
                        "mt-1 font-medium text-[14px] text-[#84869A]"
                      )}
                    >
                      ≈ ${isNaN(Number(priceUsd)) ? "--" : priceUsd}
                    </p>
                  </div>
                </div> */}

                <div className="flex flex-col justify-between md:items-end items-start h-full">
                  <div className="text-[12px] text-[#84869A] font-medium uppercase">
                    CREATED BY{" "}
                    <span className="text-[12px] text-[#E4775D] underline cursor-pointer">
                      {reduceString(coin.creator?.["wallet"] || "", 4, 4)}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    {/* AGENT info url */}
                    {coin.metadata?.website && (
                      <a href={coin.metadata?.website} target="_blank">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <rect width="20" height="20" rx="10" fill="#585A6B" />
                          <path
                            d="M15.1411 8.4986C14.4888 8.4986 13.875 8.87645 13.5394 9.4841C13.1931 10.1122 12.5654 10.4915 11.8951 10.4915C11.8372 10.4915 11.7787 10.4885 11.7199 10.4826C10.9967 10.4113 10.3741 9.90631 10.1126 9.18002C10.108 9.16856 10.1043 9.15709 10.0997 9.14513C9.63563 7.79076 8.51702 6.8252 7.21808 6.60736C7.21669 6.60736 7.21483 6.60736 7.21344 6.60736C7.17126 6.60038 7.12954 6.5944 7.08689 6.58892C7.06371 6.58593 7.04007 6.58344 7.01642 6.58094C6.99325 6.57795 6.9696 6.57596 6.94642 6.57396C6.92232 6.57247 6.89914 6.57048 6.87503 6.56898C6.85974 6.56798 6.84444 6.56748 6.82868 6.56599C6.80967 6.56499 6.7902 6.56449 6.77119 6.5635C6.76331 6.5635 6.75589 6.5635 6.74801 6.5635C6.71927 6.5635 6.69007 6.5625 6.66132 6.5625C6.50371 6.5625 6.34795 6.57347 6.19497 6.5939C6.13424 6.60238 6.07397 6.61285 6.01417 6.62431C5.98404 6.6293 5.95344 6.63578 5.92331 6.64276C5.86397 6.65671 5.80556 6.67067 5.74762 6.68662H5.74669C5.68828 6.70307 5.63079 6.72102 5.57424 6.73996H5.57331C5.43007 6.78781 5.29053 6.84514 5.15517 6.91094C5.08748 6.94384 5.02166 6.97973 4.95629 7.01612C4.92338 7.03456 4.89093 7.05301 4.85848 7.07344C4.12232 7.52407 3.54424 8.24138 3.23828 9.10176C3.21185 9.17653 3.18728 9.2528 3.16503 9.32957C3.16503 9.32957 3.16503 9.32957 3.16503 9.33056C3.14742 9.39188 3.13119 9.45319 3.11543 9.516V9.517C3.1006 9.57931 3.08715 9.64211 3.07464 9.70592C3.06815 9.73832 3.06305 9.77122 3.05748 9.80362C3.04682 9.86743 3.03709 9.93273 3.02921 9.99803C3.0102 10.1625 3 10.33 3 10.4995C3 10.669 3.0102 10.8365 3.02921 11.001C3.03709 11.0663 3.04682 11.1311 3.05748 11.1954C3.06258 11.2278 3.06815 11.2607 3.07464 11.2931C3.09179 11.3808 3.11079 11.4685 3.13305 11.5543C3.1553 11.64 3.18033 11.7248 3.20722 11.8075C3.57762 12.9326 4.40881 13.8244 5.45556 14.2182C5.4945 14.2331 5.53344 14.2466 5.57285 14.26C5.57285 14.26 5.57285 14.2605 5.57378 14.26C5.6308 14.279 5.68781 14.2964 5.74623 14.3134H5.74715C5.8051 14.3293 5.86351 14.3438 5.92285 14.3572C5.95298 14.3642 5.98358 14.3702 6.01371 14.3757C6.07305 14.3872 6.13377 14.3976 6.1945 14.4061C6.34748 14.4265 6.50325 14.4375 6.66086 14.4375C6.6896 14.4375 6.71881 14.437 6.74755 14.4365C6.75543 14.4365 6.76285 14.436 6.77073 14.436C6.78974 14.4355 6.80921 14.435 6.82821 14.4335C6.84351 14.433 6.85881 14.432 6.87457 14.4305C6.89868 14.429 6.92185 14.427 6.94596 14.4255C6.96914 14.424 6.99278 14.4215 7.01596 14.4186C7.04007 14.4161 7.06324 14.4136 7.08642 14.4106C7.13046 14.4051 7.17404 14.3986 7.21715 14.3916C8.47437 14.1813 9.56331 13.2706 10.0528 11.9845C10.0686 11.9411 10.0848 11.8982 10.0997 11.8544C10.1038 11.8439 10.1071 11.8334 10.1108 11.823C10.3723 11.0952 10.9953 10.5877 11.7194 10.5164C11.7783 10.511 11.8367 10.508 11.8946 10.508C12.565 10.508 13.1926 10.8873 13.5389 11.5154C13.8746 12.1231 14.4883 12.5004 15.1406 12.5004C16.166 12.5004 17 11.6036 17 10.501C17 9.39836 16.166 8.50159 15.1406 8.50159V8.4996L15.1411 8.4986ZM10.3226 10.5264C9.9949 10.5997 9.6894 10.6819 9.41219 10.7846C8.88788 10.9775 8.4651 11.2437 8.18232 11.6585C8.17258 11.6734 8.16285 11.6884 8.15219 11.7023C7.81238 12.1889 7.27046 12.5039 6.66179 12.5039C5.63311 12.5039 4.79636 11.6041 4.79636 10.498C4.79636 9.39188 5.63311 8.49212 6.66179 8.49212C7.27 8.49212 7.81146 8.80666 8.15219 9.29318C8.16656 9.31511 8.18046 9.33655 8.1953 9.35698C8.47808 9.76075 8.89669 10.022 9.41265 10.2124C9.68987 10.3146 9.99536 10.3968 10.3231 10.4701C10.3658 10.4796 10.4089 10.489 10.452 10.498C10.4084 10.507 10.3653 10.5169 10.3231 10.5259H10.3226V10.5264Z"
                            fill="#080A14"
                          />
                        </svg>
                      </a>
                    )}
                    {coin.metadata?.twitter && (
                      <a href={coin.metadata?.twitter} target="_blank">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_95_2878)">
                            <path
                              d="M15.2718 1.58691H18.0831L11.9413 8.60649L19.1666 18.1586H13.5093L9.07828 12.3653L4.00821 18.1586H1.19528L7.76445 10.6503L0.833252 1.58691H6.63418L10.6394 6.88219L15.2718 1.58691ZM14.2852 16.4759H15.8429L5.78775 3.18119H4.11614L14.2852 16.4759Z"
                              fill="#585A6B"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_95_2878">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>
                    )}
                    {coin.metadata?.telegram && (
                      <a href={coin.metadata?.telegram} target="_blank">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_78_3207)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM10.3584 7.38244C9.38571 7.787 7.44178 8.62433 4.52658 9.89443C4.05319 10.0827 3.80521 10.2668 3.78264 10.4469C3.74449 10.7512 4.12559 10.8711 4.64456 11.0343C4.71515 11.0565 4.78829 11.0795 4.86328 11.1038C5.37386 11.2698 6.06069 11.464 6.41774 11.4717C6.74162 11.4787 7.10311 11.3452 7.5022 11.0711C10.226 9.2325 11.632 8.30317 11.7203 8.28314C11.7825 8.269 11.8688 8.25123 11.9273 8.3032C11.9858 8.35518 11.98 8.4536 11.9738 8.48C11.9361 8.64095 10.4401 10.0317 9.66593 10.7515C9.42459 10.9759 9.25339 11.135 9.2184 11.1714C9.14 11.2528 9.06011 11.3298 8.98332 11.4038C8.50897 11.8611 8.15326 12.204 9.00301 12.764C9.41137 13.0331 9.73814 13.2556 10.0641 13.4776C10.4201 13.7201 10.7752 13.9619 11.2347 14.2631C11.3517 14.3398 11.4635 14.4195 11.5724 14.4971C11.9867 14.7925 12.359 15.0578 12.8188 15.0155C13.086 14.9909 13.3621 14.7397 13.5022 13.9903C13.8335 12.2193 14.4847 8.38205 14.6352 6.80081C14.6484 6.66227 14.6318 6.48497 14.6185 6.40714C14.6051 6.32931 14.5773 6.21842 14.4761 6.13633C14.3563 6.03911 14.1714 6.01861 14.0886 6.02007C13.7125 6.02669 13.1355 6.22735 10.3584 7.38244Z"
                              fill="#585A6B"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_78_3207">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>
                    )}
                    {coin.metadata?.discord && (
                      <a href={coin.metadata?.discord} target="_blank">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M16.9308 3.4629C15.6561 2.87799 14.2892 2.44707 12.8599 2.20025C12.8339 2.19549 12.8079 2.20739 12.7945 2.2312C12.6187 2.54388 12.4239 2.9518 12.2876 3.27242C10.7503 3.04228 9.22099 3.04228 7.71527 3.27242C7.57887 2.94467 7.37707 2.54388 7.20048 2.2312C7.18707 2.20819 7.16107 2.19629 7.13504 2.20025C5.70659 2.44628 4.33963 2.87721 3.06411 3.4629C3.05307 3.46766 3.04361 3.4756 3.03732 3.48591C0.444493 7.35954 -0.265792 11.138 0.0826501 14.8695C0.0842267 14.8878 0.0944749 14.9053 0.108665 14.9164C1.81934 16.1726 3.47642 16.9353 5.10273 17.4408C5.12876 17.4488 5.15634 17.4393 5.1729 17.4178C5.55761 16.8925 5.90053 16.3385 6.19456 15.756C6.21192 15.7219 6.19535 15.6814 6.15989 15.6679C5.61594 15.4616 5.098 15.21 4.59977 14.9243C4.56037 14.9013 4.55721 14.8449 4.59346 14.8179C4.69831 14.7394 4.80318 14.6576 4.9033 14.5751C4.92141 14.56 4.94665 14.5568 4.96794 14.5664C8.24107 16.0608 11.7846 16.0608 15.0191 14.5664C15.0404 14.5561 15.0657 14.5592 15.0846 14.5743C15.1847 14.6568 15.2895 14.7394 15.3952 14.8179C15.4314 14.8449 15.4291 14.9013 15.3897 14.9243C14.8914 15.2155 14.3735 15.4616 13.8288 15.6671C13.7933 15.6806 13.7775 15.7219 13.7949 15.756C14.0952 16.3377 14.4381 16.8917 14.8157 17.417C14.8315 17.4393 14.8599 17.4488 14.8859 17.4408C16.5201 16.9353 18.1772 16.1726 19.8879 14.9164C19.9028 14.9053 19.9123 14.8886 19.9139 14.8703C20.3309 10.5562 19.2154 6.80878 16.9568 3.4867C16.9513 3.4756 16.9419 3.46766 16.9308 3.4629ZM6.68335 12.5974C5.69792 12.5974 4.88594 11.6927 4.88594 10.5816C4.88594 9.47056 5.68217 8.56585 6.68335 8.56585C7.69239 8.56585 8.49651 9.4785 8.48073 10.5816C8.48073 11.6927 7.68451 12.5974 6.68335 12.5974ZM13.329 12.5974C12.3435 12.5974 11.5316 11.6927 11.5316 10.5816C11.5316 9.47056 12.3278 8.56585 13.329 8.56585C14.338 8.56585 15.1421 9.4785 15.1264 10.5816C15.1264 11.6927 14.338 12.5974 13.329 12.5974Z"
                            fill="#585A6B"
                          />
                        </svg>
                      </a>
                    )}
                    {coin.metadata?.website && (
                      <a href={coin.metadata?.website} target="_blank">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.45513 1.35549C5.71534 1.86156 4.16862 2.88057 3.01701 4.27943C1.86541 5.67828 1.16246 7.39193 1 9.19654H5.11401C5.35251 6.4505 6.14869 3.78199 7.45385 1.35421L7.45513 1.35549ZM5.11401 10.8036H1C1.16212 12.6082 1.86477 14.3221 3.01615 15.7211C4.16753 17.1202 5.71411 18.1395 7.45385 18.6459C6.14869 16.2181 5.35251 13.5496 5.11401 10.8036ZM9.516 18.9892C7.95627 16.5175 7.00054 13.7133 6.72618 10.8036H13.1993C12.925 13.7133 11.9692 16.5175 10.4095 18.9892C10.1118 19.0036 9.81366 19.0036 9.516 18.9892ZM12.4729 18.6446C14.2125 18.1383 15.7589 17.1192 16.9103 15.7204C18.0617 14.3215 18.7644 12.608 18.9268 10.8036H14.8128C14.5743 13.5496 13.7781 16.2181 12.4729 18.6459V18.6446ZM14.8128 9.19654H18.9268C18.7647 7.39187 18.062 5.67805 16.9106 4.27896C15.7593 2.87988 14.2127 1.86057 12.4729 1.35421C13.7781 3.78198 14.5743 6.4505 14.8128 9.19654ZM9.516 1.01095C9.81408 0.996351 10.1127 0.996351 10.4108 1.01095C11.9701 3.48271 12.9254 6.28692 13.1993 9.19654H6.72747C7.00645 6.26916 7.96424 3.46264 9.516 1.01095Z"
                            fill="#585A6B"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="">
                <p className="text-[#E8E9EE] text-[14px] md:text-[24px] font-medium flex items-center gap-1">
                  {!loadingEst ? (
                    numberWithCommas(
                      isNaN(Number(tokenPrice)) ? 0 : Number(tokenPrice),
                      undefined,
                      {
                        maximumFractionDigits: 9,
                      }
                    )
                  ) : (
                    <img src={LoadingImg} />
                  )}{" "}
                  SOL
                  {/* FIXME: update price simulate */}
                </p>
                <p
                  className={twMerge(
                    "mt-1 font-medium text-[14px] text-[#84869A]"
                  )}
                >
                  ≈ ${isNaN(Number(priceUsd)) ? "--" : priceUsd}
                </p>
              </div>
            </div>

            <div className="flex md:hidden w-full">
              <TradeForm coin={coin} progress={progress}></TradeForm>
            </div>

            <div className="hidden md:block">
              {isListedOnRay && (
                <div className="p-2 pt-0 bg-[#1a1c28] flex-row items-center text-white font-semibold text-[12px] flex">
                  <div
                    onClick={() => setIsAgentChart(true)}
                    className={twMerge(
                      "cursor-pointer hover:brightness-125 uppercase mr-4 px-2 py-[4px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]",
                      isAgentChart && "bg-[#585A6B] text-[#E8E9EE]"
                    )}
                  >
                    Agent Land Chart
                  </div>
                  <div
                    onClick={() => setIsAgentChart(false)}
                    className={twMerge(
                      "cursor-pointer hover:brightness-125 uppercase mr-4 px-2 py-[4px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]",
                      !isAgentChart && "bg-[#585A6B] text-[#E8E9EE]"
                    )}
                  >
                    Current Chart
                  </div>
                </div>
              )}

              {isAgentChart ? (
                <div className="bg-[#101827] pb-6 rounded-b">
                  <TradingChart param={coin}></TradingChart>
                </div>
              ) : (
                <div className="bg-[#111114] rounded-b">
                  {/* <CoinGeckoChart param={coin}></CoinGeckoChart> */}
                  <DexToolsChart param={coin}></DexToolsChart>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex flex-col gap-4 mt-12 ">
              <p className="text-[14px] text-[#9192A0]">{coin?.description}</p>
            </div>
            <Chatting param={param} coin={coin}></Chatting>
          </div>
        </div>
        <div className="w-full md:max-w-[384px]">
          <div className="hidden md:flex">
            <TradeForm coin={coin} progress={progress}></TradeForm>
          </div>
          <div className="flex flex-col gap-3 border border-[#1A1C28] rounded-lg p-6 mt-4">
            <div className="w-full flex flex-col gap-2">
              <p className="text-[#E8E9EE] text-[16px] uppercase">
                Bonding curve ({progress.toFixed(2)}%)
              </p>
              <div className="w-full mt-2 px-[2px] py-[1px] rounded-[28px] bg-[#1A1C28] border border-solid border-[#30344A]">
                <div
                  className="rounded-[999px] h-2 bg-barrie"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-[14px] text-[#585A6B]">
              There are{" "}
              <span className="text-[#E8E9EE]">
                {formatLargeNumber(fromBig(coin.tokenReserves, coin.decimals))}
              </span>{" "}
              tokens still available for sale in the bonding curve and there is{" "}
              <span className="text-[#E8E9EE]">
                {formatLargeNumber(fromBig(coin.lamportReserves, 9))}
              </span>{" "}
              SOL in the bonding curve.
            </p>
            <p className="text-[14px] text-[#585A6B]">
              When the market cap reaches{" "}
              <span className="text-[#E8E9EE]">
                {formatNumberKMB(
                  new BigNumber(BONDING_CURVE_LIMIT)
                    .multipliedBy(solPrice)
                    .div(LAMPORTS_PER_SOL)
                    .toNumber()
                )}
              </span>
              &nbsp; all the liquidity from the bonding curve will be deposited
              into Raydium and burned. progression increases as the price goes
              up.
            </p>
          </div>
          <TokenDistribution data={coin} />
        </div>

        <div className="block md:hidden">
          <div className="flex flex-col gap-4 mt-12 ">
            <p className="text-[14px] text-[#9192A0]">{coin?.description}</p>
          </div>
          <Chatting param={param} coin={coin}></Chatting>
        </div>
      </div>
    </div>
  );
}
