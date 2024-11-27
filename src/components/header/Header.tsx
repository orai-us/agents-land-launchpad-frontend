"use client";

import { PROGRAM_ID_IDL } from "@/program/cli/programId";
import { AgentsLandListener } from "@/program/logListeners/AgentsLandListener";
import { connection } from "@/program/web3";
import { coinInfo, SwapInfo } from "@/utils/types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { ConnectButton } from "../buttons/ConnectButton";
import Banner from "./Banner";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";
import LogoFullIcon from "@/assets/icons/logo.svg";

const Header: FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleToRouter = (id: string) => {
    router.push(id);
  };

  const [latestCreatedToken, setLatestCreatedToken] =
    useState<coinInfo>(undefined);
  const [latestSwapInfo, setLatestSwapInfo] = useState<SwapInfo>(undefined);

  useEffect(() => {
    const listener = new AgentsLandListener(connection);
    listener.setProgramLogsCallback("Launch", (basicTokenInfo: any) => {
      const newCoinInfo: coinInfo = {
        creator: basicTokenInfo.creator,
        name: basicTokenInfo.metadata.name,
        url: basicTokenInfo.metadata.json.image ?? basicTokenInfo.metadata.uri,
        ticker: basicTokenInfo.metadata.symbol,
        reserveOne: 0,
        reserveTwo: 0,
        token: basicTokenInfo.mintAddress,
        commit: "",
      };
      console.log("new coin info: ", newCoinInfo);
      setLatestCreatedToken(newCoinInfo);
    });
    listener.setProgramLogsCallback("Swap", (swapInfo: SwapInfo) => {
      setLatestSwapInfo(swapInfo);
    });

    const subId = listener.subscribeProgramLogs(PROGRAM_ID_IDL.toBase58());

    return () => {
      connection.removeOnLogsListener(subId);
    };
  }, []);

  return (
    <>
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
              },
              {
                link: "/how-it-work",
                text: "How it works?",
              },
            ].map((item, key) => {
              return (
                <Link
                  href={item.link}
                  key={`${item.link}-${key}`}
                  className="flex items-center px-4 h-12 font-medium text-base text-[#E8E9EE] brightness-75 hover:brightness-125 ml-6"
                >
                  {item.text}
                </Link>
              );
            })}

            {latestSwapInfo && (
              <div>
                <Link
                  className="bg-green-600 w-[200px] h-[50px] font-medium rounded-md "
                  href={`/trading/${latestSwapInfo.mintAddress}`}
                >
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <span>{`${latestSwapInfo.creator} ${
                      latestSwapInfo.direction
                    } ${(
                      latestSwapInfo.solAmountInLamports / LAMPORTS_PER_SOL
                    ).toFixed(9)} SOL of ${latestSwapInfo.mintSymbol}`}</span>
                    <Image
                      alt="latestImageTokenTrade"
                      src={latestSwapInfo.mintUri}
                      style={{
                        width: "30px",
                        height: "30px",
                        marginRight: "10px",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                </Link>
              </div>
            )}
            {latestCreatedToken && (
              <div>
                <Link
                  className="bg-green-600 w-[200px] h-[50px] font-medium rounded-md "
                  href={`/trading/${latestCreatedToken.token}`}
                >
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <span>{`${latestCreatedToken.creator} created `}</span>
                    <Image
                      alt="latestImageTokenCreated"
                      src={latestCreatedToken.url}
                      style={{
                        width: "30px",
                        height: "30px",
                        marginRight: "10px",
                        borderRadius: "50%",
                      }}
                    />
                    <span>{`${
                      latestCreatedToken.name
                    } on ${new Date().toDateString()}`}</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
          <ConnectButton />
        </div>
      </header>
      {pathname === "/" && <Banner />}
    </>
  );
};
export default Header;
