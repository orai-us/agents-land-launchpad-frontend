"use client";
import { Chatting } from "@/components/trading/Chatting";
import { TradeForm } from "@/components/trading/TradeForm";
import { TradingChart } from "@/components/TVChart/TradingChart";
import UserContext from "@/context/UserContext";
import { coinInfo } from "@/utils/types";
import {
  getCoinInfo,
  getCoinTrade,
  getCoinsInfoBy,
  getSolPriceInUSD,
} from "@/utils/util";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import SocialList from "../others/socialList";
import TokenData from "../others/TokenData";
import TokenDistribution from "../others/TokenDistribution";
import BigNumber from "bignumber.js";
import { BONDING_CURVE_LIMIT } from "@/config";

export default function TradingPage() {
  const { coinId, setCoinId } = useContext(UserContext);
  const pathname = usePathname();
  const [param, setParam] = useState<string>("");
  const [progress, setProgress] = useState<Number>(60);
  const [coin, setCoin] = useState<coinInfo>({} as coinInfo);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // Split the pathname and extract the last segment
      const segments = pathname.split("/");
      const parameter = segments[segments.length - 1];
      setParam(parameter);
      setCoinId(parameter);
      const data = await getCoinInfo(parameter);

      const bondingCurvePercent = new BigNumber(data.lamportReserves || 0)
        .multipliedBy(100)
        .div(BONDING_CURVE_LIMIT)
        .toNumber();

      console.log("bondingCurvePercent", bondingCurvePercent);
      // const solPrice = await getSolPriceInUSD();
      // const prog =
      //   (data.lamportReserves * 1000000 * solPrice) /
      //   (data.tokenReserves * data.marketcap);
      setProgress(bondingCurvePercent > 100 ? 100 : bondingCurvePercent);
      setCoin(data);
    };
    fetchData();
  }, [pathname]);

  return (
    <div className="w-full flex flex-col px-3 mx-auto gap-5">
      <div className="text-center">
        <div onClick={() => router.push("/")}>
          <div className="cursor-pointer text-white text-2xl flex flex-row items-center gap-2 pb-2">
            <IoMdArrowRoundBack />
            Back
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col xs:flex-row gap-4">
        {/* trading view chart  */}
        <div className="w-full px-2">
          <TradingChart param={coin}></TradingChart>
          <Chatting param={param} coin={coin}></Chatting>
        </div>
        <div className="w-full max-w-[300px] xs:max-w-[420px] px-2">
          <TradeForm coin={coin} progress={progress}></TradeForm>
          <SocialList />
          <TokenData coinData={coin} />
          <div className="flex flex-col gap-3">
            <div className="w-full flex flex-col gap-2 px-3 py-2 border-[1px] border-[#2b7ee2] rounded-lg">
              <p className="text-white text-xl">
                Bonding curve progress : {progress.toFixed(2)}%
              </p>
              <div className="bg-white rounded-full h-2 relative">
                <div
                  className="bg-[#2b7ee2] rounded-full h-2"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-white px-2">
              when the market cap reaches $65,534 all the liquidity from the
              bonding curve will be deposited into Raydium and burned.
              progression increases as the price goes up.
            </p>
            <p className="text-sm text-white px-2">
              there are {coin.tokenReserves?.toNumber() || 0} tokens still
              available for sale in the bonding curve and there is{" "}
              {(coin.lamportReserves?.toNumber() || 0) / 1000_000_000 - 30} SOL
              in the bonding curve.
            </p>
          </div>
          <TokenDistribution data={coin} />
        </div>
      </div>
    </div>
  );
}
