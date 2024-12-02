import Image from "next/image";
import richManImg from "@/assets/images/richoldman.png";
import badgeImg from "@/assets/images/badge.png";
import badgeKothImg from "@/assets/images/peak_evolution.svg";
import crownImg from "@/assets/icons/crown.svg";
import MarqueeToken from "./MarqueeToken";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getKoth, reduceString } from "@/utils/util";
import BigNumber from "bignumber.js";
import { BONDING_CURVE_LIMIT } from "@/config";
import { formatNumberKMB } from "@/utils/format";

const Banner = () => {
  const [kothCoin, setKothCoin] = useState(null);
  const router = useRouter();

  const handleToRouter = (id: string) => {
    router.push(id);
  };

  useEffect(() => {
    const fetchData = async () => {
      const kingCoin = await getKoth();
      console.log("kingCoin", kingCoin);
      if (kingCoin) {
        setKothCoin(kingCoin);
      }
    };
    fetchData();
  }, []);

  const bondingCurvePercentOrg = new BigNumber(
    (kothCoin?.lamportReserves || 0).toString() || 0
  )
    .multipliedBy(100)
    .div(BONDING_CURVE_LIMIT);

  const bondingCurvePercent = bondingCurvePercentOrg.isGreaterThanOrEqualTo(100)
    ? 100
    : bondingCurvePercentOrg.toFixed(2, 1);

  return (
    <>
      <div className="w-full h-[450px] relative bg-banner flex items-center justify-center">
        <div className="h-full flex justify-between items-center w-full max-w-[1216px]">
          <div className="flex flex-col items-start">
            <div className="text-[56px] text-[#E8E9EE] leading-[64px] uppercase font-medium">
              Take your agent
              <br />
              to the promise land
            </div>
            <div className="mt-6 mb-14 text-base font-medium text-[#E8E9EE]">
              The First AI Agent Launch Platform
            </div>
            <div
              onClick={() => handleToRouter("/create-coin")}
              className="uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
            >
              <div className="rounded bg-white px-6 py-2 text-[#080A14]">
                Launch your AGENT
              </div>
            </div>
          </div>
          {kothCoin && (
            // <div className="bg-[linear-gradient(180deg,_#E4775D_0%,_#292D46_100%)] rounded-xl p-0.5">
            <div
              className="relative bg-[#E4775D] rounded-xl p-0.5 min-w-[310px] cursor-pointer"
              onClick={() => handleToRouter(`/trading/${kothCoin.token}`)}
            >
              <Image
                src={badgeKothImg}
                alt="badgeKothImg"
                className="absolute bottom-0 left-[6px] translate-y-1/2"
              />
              <Image
                src={crownImg}
                alt="crownImg"
                className="absolute top-0 right-[6px] -translate-y-1/2 translate-x-1/2"
              />
              <div className="bg-[linear-gradient(180deg,_#080A14_0%,_#292D46_100%)] rounded-xl flex items-center gap-3 px-6 py-4">
                <div className="">
                  <img
                    src={kothCoin.url}
                    alt="richolman"
                    className="border-[3px] solid rounded-full border-[#E8E9EE] w-[78px] h-[78px]"
                  />
                  {/* <div className="relative flex justify-center items-center -mt-3">
                    <span className="relative z-10 text-[10px] font-semibold leading-[13px] uppercase text-[#312A05]">
                      KOTH
                    </span>
                    <Image
                      src={badgeImg}
                      alt="badge"
                      className="absolute -top-1/2 left-1/2 -translate-x-1/2"
                    />
                  </div> */}
                </div>
                <div className="flex flex-col text-[#E8E9EE]">
                  <div className="text-[#84869A] uppercase text-[12px]">
                    create by&nbsp;
                    <span className="text-[#E4775D] underline ">
                      {reduceString(kothCoin.creator?.wallet || "", 4, 4)}
                    </span>
                  </div>
                  <div className="text-[16px] font-medium leading-6 mt-2">
                    {/* Vanga the prophet (${kothCoin.ticker}) */}
                    {kothCoin.name} (${kothCoin.ticker})
                  </div>
                  <div className="text-[#9192A0] text-[12px] uppercase mt-4 ">
                    Marketcap&nbsp;&nbsp;
                    <span className="text-[#E8E9EE]">
                      {formatNumberKMB(Number(kothCoin.marketcap || 0))}(
                      {bondingCurvePercent}%)
                    </span>
                  </div>
                  <div className="w-full max-w-[235px] mt-2 px-[2px] py-[1px] rounded-[28px] bg-[#1A1C28] border border-solid border-[#30344A]">
                    <div
                      className="rounded-[999px] h-2 bg-barrie"
                      style={{ width: `${bondingCurvePercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* <Image
        src={BannerImg}
        alt="banner"
        className="absolute left-1/2 -translate-x-1/2"
      /> */}
      </div>
      <MarqueeToken />
    </>
  );
};

export default Banner;
