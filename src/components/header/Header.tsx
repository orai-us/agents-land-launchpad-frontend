"use client";

import LogoFullIcon from "@/assets/icons/logo.svg";
import { PROGRAM_ID } from "@/config";
import { AgentsLandListener } from "@/program/logListeners/AgentsLandListener";
import { commitmentLevel, endpoint } from "@/program/web3";
import { coinInfo, SwapInfo } from "@/utils/types";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FC, useContext, useEffect, useState } from "react";
import { ConnectButton } from "../buttons/ConnectButton";
import Banner from "./Banner";
import { fromBig, getSolPriceInUSD, reduceString } from "@/utils/util";
import { twMerge } from "tailwind-merge";
import MarqueeToken, { ACTION_TYPE } from "./MarqueeToken";
import dayjs from "dayjs";
import { BN } from "@coral-xyz/anchor";
import { formatLargeNumber } from "@/utils/format";
import UserContext from "@/context/UserContext";
import HowItWorkModal from "../modals/HowItWork";

const Header: FC = () => {
  const { solPrice, setSolPrice } = useContext(UserContext);
  const pathname = usePathname();
  const router = useRouter();
  const [showStepWork, setShowStepWork] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const price = await getSolPriceInUSD();
        setSolPrice(price);
      } catch (error) {
        console.log("error sol price", error);
      }
    };

    fetchData();
  }, []);

  const handleToRouter = (id: string) => {
    router.push(id);
  };

  const [latestCreatedToken, setLatestCreatedToken] =
    useState<coinInfo>(undefined);
  const [latestSwapInfo, setLatestSwapInfo] = useState<SwapInfo>(undefined);

  // useEffect(() => {
  //   const connection = new Connection(endpoint, {
  //     commitment: commitmentLevel,
  //     wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS,
  //   });
  //   const listener = new AgentsLandListener(connection);
  //   listener.setProgramLogsCallback("Launch", (basicTokenInfo: any) => {
  //     const newCoinInfo: coinInfo = {
  //       creator: basicTokenInfo.creator,
  //       name: basicTokenInfo.metadata.name,
  //       url: basicTokenInfo.metadata.json?.image ?? basicTokenInfo.metadata.uri,
  //       ticker: basicTokenInfo.metadata.symbol,
  //       tokenReserves: new BN(0),
  //       lamportReserves: new BN(0),
  //       token: basicTokenInfo.mintAddress,
  //       commit: "",
  //       decimals: 6,
  //       bondingCurveLimit: new BN(0),
  //       listed: false,
  //     };
  //     console.log("new coin info: ", newCoinInfo);
  //     setLatestCreatedToken(newCoinInfo);
  //   });
  //   listener.setProgramLogsCallback("Swap", (swapInfo: SwapInfo) => {
  //     setLatestSwapInfo(swapInfo);
  //   });

  //   const subId = listener.subscribeProgramLogs(
  //     new PublicKey(PROGRAM_ID).toBase58()
  //   );

  //   return () => {
  //     connection.removeOnLogsListener(subId);
  //   };
  // }, []);

  console.log("latestCreatedToken", { latestCreatedToken });
  console.log("latestSwapInfo", { latestSwapInfo });

  return (
    <>
      <MarqueeToken />
      <header className="relative z-10 w-full h-[96px] bg-[#13141D] m-auto flex justify-center items-center border-b border-solid border-[rgba(88,90,107,0.24)]">
        <div className="py-6 flex justify-between items-center max-w-[1216px] w-full h-full">
          <div className="flex gap-2 items-center">
            <Link href="/">
              <Image src={LogoFullIcon} alt="LogoFullIcon" />
            </Link>
            {[
              {
                link: "/create-coin",
                text: "Launch",
                onclick: () => handleToRouter("/create-coin"),
              },
              {
                link: "/how-it-work",
                text: "How it works?",
                onclick: () => setShowStepWork(true),
              },
            ].map((item, key) => {
              return (
                <button
                  // href={item.link}
                  onClick={item.onclick}
                  key={`${item.link}-${key}`}
                  className="flex items-center h-12 font-medium text-base text-[#E8E9EE] brightness-75 hover:brightness-125 ml-6"
                >
                  {item.text}
                </button>
              );
            })}
            <HowItWorkModal
              isOpen={showStepWork}
              closeModal={() => setShowStepWork(false)}
            />
          </div>
          {/* <div className="flex justify-center items-center gap-2">
            {latestSwapInfo && (
              <div>
                <Link
                  className=""
                  href={`/trading/${latestSwapInfo.mintAddress}`}
                >
                  <div
                    style={{ display: "flex", flexDirection: "row" }}
                    className="text-[13px] animate-bounce animate-infinite flex p-2 rounded bg-[#30344A] text-[#9192A0] text-nowrap items-center justify-center"
                  >
                    <span>
                      {reduceString(latestSwapInfo.creator, 4, 4)}&nbsp;
                    </span>
                    <span
                      className={twMerge(
                        "text-[#9FF4CF]",
                        latestSwapInfo.direction === ACTION_TYPE.Sold &&
                          "text-[#E75787]"
                      )}
                    >
                      {latestSwapInfo.direction}&nbsp;
                    </span>
                    <span>
                      {formatLargeNumber(
                        fromBig(latestSwapInfo.solAmountInLamports, 9)
                      )}
                      &nbsp;SOL of ${latestSwapInfo.mintSymbol}
                    </span>
                    {typeof latestSwapInfo.mintUri === "string" ? (
                      <img
                        src={latestSwapInfo.mintUri}
                        alt="tokenIMG"
                        className="w-5 h-5 rounded-full ml-2"
                      />
                    ) : (
                      <Image
                        src={latestSwapInfo.mintUri}
                        alt="tokenIMG"
                        className="w-5 h-5 rounded-full ml-2"
                      />
                    )}
                  </div>
                </Link>
              </div>
            )}
            {latestCreatedToken && (
              <div>
                <Link href={`/trading/${latestCreatedToken.token}`}>
                  <div className="text-[13px] animate-bounce animate-infinite flex p-2 rounded bg-[#30344A] text-[#9192A0] text-nowrap items-center justify-center">
                    <span className="text-[#9192A0]">
                      {reduceString(
                        new PublicKey(
                          latestCreatedToken.creator as any
                        ).toString(),
                        4,
                        4
                      )}
                    </span>
                    &nbsp;
                    <span className={twMerge("text-[#AEE67F]")}>Created</span>
                    &nbsp;
                    {latestCreatedToken.ticker}
                    {typeof latestCreatedToken.url === "string" ? (
                      <img
                        src={latestCreatedToken.url}
                        alt="tokenIMG"
                        className="w-5 h-5 rounded-full ml-2"
                      />
                    ) : (
                      <Image
                        src={latestCreatedToken.url}
                        alt="tokenIMG"
                        className="w-5 h-5 rounded-full ml-2"
                      />
                    )}
                    &nbsp;on&nbsp;
                    <span className="mr-4">
                      {dayjs(new Date()).format("DD/MM/YYYY")}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div> */}
          <ConnectButton />
        </div>
      </header>
      {pathname === "/" && <Banner />}
    </>
  );
};
export default Header;
