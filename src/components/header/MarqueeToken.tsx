import Image from "next/image";
import React, { FC, useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import coinImg from "@/assets/images/richoldman.png";
import { twMerge } from "tailwind-merge";
import { coinInfo, SwapInfo } from "@/utils/types";
import { AgentsLandListener } from "@/program/logListeners/AgentsLandListener";
import { commitmentLevel, endpoint } from "@/program/web3";
import dayjs from "dayjs";
import { reduceString } from "@/utils/util";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "@/config";
import { BN } from "bn.js";

export enum ACTION_TYPE {
  Bought = "Bought",
  Sold = "Sold",
  Created = "Created",
}

export type RecentTokenAction = {
  address: string;
  type: ACTION_TYPE;
  amount: string;
  token: {
    name: string;
    img: any;
  };
  time: number;
};

const RecentToken: FC<Partial<RecentTokenAction>> = ({
  address,
  type,
  amount,
  token,
  time,
}) => {
  return type === ACTION_TYPE.Created ? (
    <RecentTokenCreated
      address={address}
      type={type}
      token={token}
      time={time}
    />
  ) : (
    <RecentTokenSwap
      address={address}
      type={type}
      token={token}
      amount={amount}
    />
  );
};

const RecentTokenCreated: FC<
  Pick<RecentTokenAction, "address" | "type" | "time" | "token">
> = ({ address, type, token, time }) => {
  return (
    <div className="flex px-6 border-r border-[#30344A] text-[#9192A0] text-nowrap">
      <span className="text-[#9192A0]">{address}</span>&nbsp;
      <span className={twMerge("text-[#AEE67F]")}>{type}</span>
      &nbsp;
      {token.name}
      {typeof token.img === "string" ? (
        <img
          src={token.img}
          alt="tokenIMG"
          className="w-5 h-5 rounded-full ml-2 mr-4"
        />
      ) : (
        <Image
          src={token.img}
          alt="tokenIMG"
          className="w-5 h-5 rounded-full ml-2 mr-4"
        />
      )}{" "}
      &nbsp;on <span className="mr-4">{dayjs(time).format("DD/MM/YYYY")}</span>
    </div>
  );
};

const RecentTokenSwap: FC<
  Pick<RecentTokenAction, "address" | "type" | "amount" | "token">
> = ({ address, type, amount, token }) => {
  return (
    <div className="flex px-6 border-r border-[#30344A] text-[#9192A0] text-nowrap">
      <span className="text-[#9192A0]">{address}</span>&nbsp;
      <span
        className={twMerge(
          "text-[#9FF4CF]",
          type === ACTION_TYPE.Sold && "text-[#E75787]"
        )}
      >
        {type}
      </span>{" "}
      &nbsp;
      {amount} SOL of {token.name}
      {typeof token.img === "string" ? (
        <img
          src={token.img}
          alt="tokenIMG"
          className="w-5 h-5 rounded-full ml-2 mr-4"
        />
      ) : (
        <Image
          src={token.img}
          alt="tokenIMG"
          className="w-5 h-5 rounded-full ml-2 mr-4"
        />
      )}
    </div>
  );
};

const MarqueeToken = () => {
  const [notificationList, setListNotifications] = useState([]);
  // const [latestCreatedToken, setLatestCreatedToken] =
  //   useState<coinInfo>(undefined);
  // const [latestSwapInfo, setLatestSwapInfo] = useState<SwapInfo>(undefined);

  useEffect(() => {
    const connection = new Connection(endpoint, {
      commitment: commitmentLevel,
      wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS,
    });
    const listener = new AgentsLandListener(connection);
    listener.setProgramLogsCallback("Launch", (basicTokenInfo: any) => {
      const newCoinInfo: coinInfo = {
        creator: basicTokenInfo.creator,
        name: basicTokenInfo.metadata.name,
        url: basicTokenInfo.metadata.json.image ?? basicTokenInfo.metadata.uri,
        ticker: basicTokenInfo.metadata.symbol,
        tokenReserves: new BN(0),
        lamportReserves: new BN(0),
        token: basicTokenInfo.mintAddress,
        commit: "",
        decimals: 6,
        bondingCurveLimit: new BN(0),
      };
      console.log("new coin info: ", newCoinInfo);
      // setLatestCreatedToken(newCoinInfo);
      setListNotifications((prevList) => [
        {
          address:
            newCoinInfo.creator["name"] ||
            reduceString(newCoinInfo.creator as string, 4, 4),
          type: ACTION_TYPE.Created,
          token: {
            name: newCoinInfo.name,
            img: newCoinInfo.url,
          },
        } as any,
        ...prevList.slice(0, -1),
      ]);
    });
    listener.setProgramLogsCallback("Swap", (swapInfo: SwapInfo) => {
      // setLatestSwapInfo(swapInfo);
      setListNotifications((prevList) => [
        {
          address: reduceString(swapInfo.creator, 4, 4),
          type: swapInfo.direction,
          amount: (
            (swapInfo.solAmountInLamports || new BN(0)).toNumber() /
            LAMPORTS_PER_SOL
          ).toFixed(9),
          token: {
            name: swapInfo.mintSymbol,
            img: swapInfo.mintUri,
          },
        } as any,
        ...prevList.slice(0, -1),
      ]);
    });

    const subId = listener.subscribeProgramLogs(
      new PublicKey(PROGRAM_ID).toBase58()
    );

    return () => {
      connection.removeOnLogsListener(subId);
    };
  }, []);

  if (!notificationList?.length) return null;

  return (
    <div className="flex items-center justify-center w-full bg-[#1A1C28] p-4">
      <div className="flex items-center justify-center max-w-[1216px]">
        <div className="mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M15.8333 6.66667V11.6667C17.25 11.6667 18.3333 10.5833 18.3333 9.16667C18.3333 7.75 17.25 6.66667 15.8333 6.66667ZM9.16662 5.83333H3.33329C2.41663 5.83333 1.66663 6.58333 1.66663 7.5V10.8333C1.66663 11.75 2.41663 12.5 3.33329 12.5H4.16663V15C4.16663 15.9167 4.91663 16.6667 5.83329 16.6667H7.49996V12.5H9.16662L12.5 15.8333H14.1666V2.5H12.5L9.16662 5.83333Z"
              fill="#E4775D"
            />
          </svg>
        </div>
        <Marquee
          pauseOnClick
          pauseOnHover
          gradient
          gradientColor="#1A1C28"
          gradientWidth={50}
        >
          {/* <div className="w-full flex items-center overflow-x-auto no-scrollbar"> */}
          {notificationList.map((item, idx) => {
            return (
              <div
                key={`id-noti-${item.address}-${idx}-${item.token.name}`}
                className="flex cursor-pointer"
              >
                <RecentToken {...item} />
              </div>
            );
          })}
          {/* </div> */}
        </Marquee>
      </div>
    </div>
  );
};

export default MarqueeToken;

const MOCK_DATA = [
  {
    address: "THZu...HKcR",
    type: ACTION_TYPE.Bought,
    amount: "0.4",
    token: {
      name: "RIC",
      img: coinImg,
    },
  },
  {
    address: "THZu...HKcR",
    type: ACTION_TYPE.Sold,
    amount: "0.01",
    token: {
      name: "MAX",
      img: coinImg,
    },
  },
  {
    address: "THZu...HKcR",
    type: ACTION_TYPE.Sold,
    amount: "0.34",
    token: {
      name: "MAX",
      img: coinImg,
    },
  },
  {
    address: "THZu...HKcR",
    type: ACTION_TYPE.Sold,
    amount: "0.22",
    token: {
      name: "MAX",
      img: coinImg,
    },
  },
];
