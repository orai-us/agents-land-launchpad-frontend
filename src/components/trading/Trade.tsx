import { formatLargeNumber } from "@/utils/format";
import { recordInfo } from "@/utils/types";
import { fromBig, reduceString } from "@/utils/util";
import { BN } from "@coral-xyz/anchor";
import dayjs from "dayjs";
import React from "react";
import { twMerge } from "tailwind-merge";
import { useLocation } from "wouter";
interface TradePropsInfo {
  trade: recordInfo;
}

export const Trade: React.FC<TradePropsInfo> = ({ trade }) => {
  const [, setLocation] = useLocation();

  const handleToRouter = (id: string) => {
    setLocation(id);
  };

  return (
    <tr className="w-full border-b-[1px] border-b-[#1A1C28] text-[#E8E9EE]">
      <td className="text-[10px] break-keep md:text-[12px] flex flex-row gap-2 items-center py-4">
        {/* <img
          src={trade.holder?.avatar || ""}
          alt="Token IMG"
          className="rounded-full"
          width={40}
          height={40}
        /> */}
        <div className="">{reduceString(trade.holder?.wallet || "", 4, 4)}</div>
      </td>
      <td
        className={twMerge(
          "text-[10px] break-keep md:text-[12px] text-center py-2 text-[#E75787]",
          trade.swapDirection == 0 && "text-[#9FF4CF]"
        )}
      >
        {trade.swapDirection == 0 ? "BUY" : "SELL"}
      </td>
      <td className="text-[10px] break-keep md:text-[12px] py-2 text-right">
        {formatLargeNumber(fromBig(trade.lamportAmount || new BN(0), 9))}
      </td>
      <td className="text-[10px] break-keep md:text-[12px] py-2 text-right">
        {formatLargeNumber(fromBig(trade.tokenAmount || new BN(0), 6))}
      </td>
      <td className="text-[10px] break-keep md:text-[12px] py-2 text-right">
        {dayjs(trade.time || Date.now()).format("YYYY-MM-DD")}
        <br />
        {dayjs(trade.time || Date.now()).format("HH:mm:ss")}
      </td>
      <td className="text-[10px] break-keep md:text-[12px] py-2 text-right">
        <a
          target="_blank"
          href={`https://solscan.io/tx/${trade.tx}`}
          className="leading-10 hover:cursor-pointer hover:text-white underline"
        >
          {trade.tx?.slice(0, 4)}...{trade.tx?.slice(-3)}
        </a>
      </td>
    </tr>
  );
};
