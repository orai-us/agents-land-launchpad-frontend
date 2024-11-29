import oraidexIcon from "@/assets/icons/oraidex_ic.svg";
import raydiumIcon from "@/assets/icons/raydium_ic.svg";
import cloudIslandImg from "@/assets/images/islandCloud.png";
import oraidexIsland from "@/assets/images/oraidex_island.png";
import raydiumIsland from "@/assets/images/raydium_island.png";
import logoCoinImg from "@/assets/images/richoldman.png";
import nodataImg from "@/assets/icons/nodata.svg";
import { coinInfo } from "@/utils/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { twMerge } from "tailwind-merge";
import { reduceString } from "@/utils/util";
import { formatNumberKMB } from "@/utils/format";
import BigNumber from "bignumber.js";
import { BONDING_CURVE_LIMIT } from "@/config";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import dayjs from "dayjs";
// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Custom locale configuration
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "1m", // 1 minute
    mm: "%dm", // 2-59 minutes
    h: "1h", // 1 hour
    hh: "%dh", // 2-23 hours
    d: "1d", // 1 day
    dd: "%dd", // 2-30 days
    M: "1mo", // 1 month
    MM: "%dmo", // 2-12 months
    y: "1y", // 1 year
    yy: "%dy", // 2+ years
  },
});

export enum STATUS_TOKEN {
  LUNCH = "Live Lunch",
  LISTED = "Listed",
}

const ListToken: FC<{ type: STATUS_TOKEN; data: coinInfo[] }> = ({
  type,
  data,
}) => {
  return type === STATUS_TOKEN.LISTED ? (
    <ListListedToken data={data} />
  ) : (
    <ListLaunchToken data={data} />
  );
};

export default ListToken;

export const ListLaunchToken = ({ data }) => {
  const router = useRouter();
  const handleToProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };
  const handleToRouter = (id: string) => {
    router.push(id);
  };
  return !data?.length ? (
    <div className="w-full mt-4 rounded-lg bg-[#13141D] border border-dashed border-[#30344A] py-12 px-8 flex flex-col justify-center items-center">
      <Image src={nodataImg} alt="nodata" />
      <p className="mt-4 text-[#E8E9EE] text-[16px]">No Token</p>
      <p className="mt-2 text-[#585A6B] text-[14px]">No Token listed</p>
    </div>
  ) : (
    <div className="mt-8 mb-14 grid grid-cols-4 gap-x-4 gap-y-8 w-full">
      {data.map((coinItem: coinInfo, ind) => {
        const bondingCurvePercentOrg = new BigNumber(
          (coinItem.lamportReserves || 0).toString() || 0
        )
          .multipliedBy(100)
          .div(BONDING_CURVE_LIMIT);

        const bondingCurvePercent =
          bondingCurvePercentOrg.isGreaterThanOrEqualTo(100)
            ? 100
            : bondingCurvePercentOrg.toFixed(2, 1);

        return (
          <div
            className="relative border border-[#1A1C28] bg-[#080a14] rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)] hover:scale-105"
            key={`item-token-${ind}`}
            onClick={() => handleToRouter(`/trading/${coinItem.token}`)}
          >
            <div className="relative h-[216px] pt-4 flex flex-col justify-center items-center bg-[#080a14] rounded-t-lg">
              <div className="relative w-full h-full flex items-start justify-center">
                <div className="w-[112px] h-[112px]">
                  <img
                    src={coinItem.url}
                    alt="logoCoinImg"
                    width={112}
                    height={112}
                    className="border-4 border-[#E8E9EE] rounded-full w-[112px] h-[112px] object-cover"
                  />
                </div>
                {/* <div
                  className={twMerge(
                    "px-[6px] py-[3px] flex items-center justify-center absolute top-0 right-4 rounded-sm bg-[#9FF4CF] text-[#052E1C]",
                    ind % 2 && "bg-[#E75787] text-[#2A0411]"
                  )}
                >
                  {ind % 2 ? "" : "-"}1.12%
                </div> */}
              </div>
              <div className="absolute bottom-0">
                <Image src={cloudIslandImg} alt="cloudIslandImg" />
              </div>
            </div>
            <div className="bg-[#13141d] rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div className="uppercase text-[#84869A] text-[12px] font-medium">
                  create by{" "}
                  <span
                    className="text-[#E4775D] underline"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleToProfile(ind as any);
                    }}
                  >
                    {coinItem.creator?.["wallet"]
                      ? reduceString(coinItem.creator?.["wallet"] || "", 4, 4)
                      : coinItem.creator.toString()}
                  </span>
                </div>
                <span className="uppercase text-[12px] text-[#84869A] text-right">
                  {dayjs(coinItem.date || Date.now()).fromNow()}
                </span>
              </div>
              <div className="my-3 text-[#E8E9EE] text-[18px] font-medium">
                {coinItem.name} (${coinItem.ticker})
              </div>
              <div className="line-clamp-3 font-medium text-[#84869A] text-[14px] mb-6 h-20">
                {coinItem.description || ""}
              </div>
              <div className="text-[#84869A] text-[12px] font-medium uppercase mb-4">
                Marketcap{" "}
                <span className="text-[#E8E9EE]">
                  {formatNumberKMB(Number(coinItem.marketcap || 0))}(
                  {bondingCurvePercent}%)
                </span>
              </div>
              <div className="w-full mt-4 px-[2px] py-[1px] rounded-[28px] bg-[#1A1C28] border border-solid border-[#30344A]">
                <div
                  className="rounded-[999px] h-2 bg-barrie"
                  style={{ width: `${bondingCurvePercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ListListedToken = ({ data }) => {
  const router = useRouter();
  const handleToProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };
  const handleToRouter = (id: string) => {
    router.push(id);
  };

  return (
    <div className="mt-8 mb-14 grid grid-cols-4 gap-x-4 gap-y-8">
      {[...new Array(10)].map((e, ind) => {
        return (
          <div
            className="relative border border-[#1A1C28] bg-[#080a14] rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)] hover:scale-105"
            key={`item-token-${ind}`}
            onClick={() => handleToRouter(`/trading/${e}`)}
          >
            <div className="relative h-[216px] pt-4 flex flex-col justify-center items-center bg-[#080a14] rounded-t-lg">
              <div className="relative w-full h-full flex items-start justify-center">
                <div className="w-[112px] h-[112px]">
                  <Image
                    src={logoCoinImg}
                    alt="logoCoinImg"
                    width={112}
                    height={112}
                    className="border-4 border-[#E8E9EE] rounded-full w-[112px] h-[112px] object-cover"
                  />
                </div>
                {/* <div
                  className={twMerge(
                    "px-[6px] py-[3px] flex items-center justify-center absolute top-0 right-4 rounded-sm bg-[#9FF4CF] text-[#052E1C]",
                    ind % 2 && "bg-[#E75787] text-[#2A0411]"
                  )}
                >
                  {ind % 2 ? "" : "-"}1.12%
                </div> */}
              </div>
              <div className="absolute bottom-0">
                <Image
                  src={ind % 2 ? oraidexIsland : raydiumIsland}
                  alt={ind % 2 ? "oraidexIslandImg" : "raydiumIslandImg"}
                />
              </div>
            </div>
            <div className="bg-[#13141d] rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div className="uppercase text-[#84869A] text-[12px] font-medium">
                  create by{" "}
                  <span
                    className="text-[#E4775D] underline"
                    onClick={() => handleToProfile(ind as any)}
                  >
                    TBxw...i6rF
                  </span>
                </div>

                <span className="uppercase text-[12px] text-[#84869A] text-right">
                  {dayjs(Date.now()).fromNow()}
                </span>
              </div>
              <div className="my-3 text-[#E8E9EE] text-[18px] font-medium">
                MAX ($MX)
              </div>
              <div className="line-clamp-3 font-medium text-[#84869A] text-[14px] mb-6">
                the AI Bitcoin Maxi spreading the true power of $BTC. With sharp
                insights and fierce conviction, she. the AI Bitcoin Maxi
                spreading the true power of $BTC. With sharp insights and fierce
                conviction, she
              </div>
              {ind % 2 ? (
                <div className="text-[#080A14] rounded-full flex items-center uppercase text-[12px] font-medium bg-[#AEE67F] p-1">
                  <Image
                    src={oraidexIcon}
                    alt="icon_dex"
                    className="mr-1"
                    width={16}
                    height={16}
                  />
                  <span>LISTED oN ORAIDEX</span>
                </div>
              ) : (
                <div className="text-[#080A14] rounded-full flex items-center uppercase text-[12px] font-medium bg-[linear-gradient(48deg,_#9945FF_0.56%,_#7962E7_20.34%,_#00D18C_99.44%)] p-1">
                  <Image
                    src={raydiumIcon}
                    alt="icon_dex"
                    className="mr-1"
                    width={16}
                    height={16}
                  />
                  <span>LISTED oN RAYDIUM</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const TokenTab = {
  [STATUS_TOKEN.LUNCH]: {
    label: STATUS_TOKEN.LUNCH,
    value: STATUS_TOKEN.LUNCH,
    link: "/?tab=live",
    content: ListLaunchToken,
  },
  [STATUS_TOKEN.LISTED]: {
    label: STATUS_TOKEN.LISTED,
    value: STATUS_TOKEN.LISTED,
    link: "/?tab=listed",
    content: ListListedToken,
  },
};
