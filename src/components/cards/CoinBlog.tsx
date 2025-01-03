import { coinInfo, userInfo } from "@/utils/types";
import { fromBig } from "@/utils/util";
import { FC, useContext, useEffect, useState } from "react";
import UserContext from "@/context/UserContext";
import { HiOutlinePuzzle } from "react-icons/hi";
import { TbWorld } from "react-icons/tb";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { Link, useLocation } from "wouter";

interface CoinBlogProps {
  coin: coinInfo;
  componentKey: string;
}

export const CoinBlog: React.FC<CoinBlogProps> = ({ coin, componentKey }) => {
  const { solPrice } = useContext(UserContext);
  const [marketCapValue, setMarketCapValue] = useState<number>(0);
  // const router = useRouter()
  const [, setLocation] = useLocation();

  const handleToProfile = (address: string) => {
    setLocation(`/profile/${address}`);
  };

  const getMarketCapData = async (coin: coinInfo) => {
    const prog =
      (fromBig(coin.lamportReserves, 9) * 1000000 * solPrice) /
      (fromBig(coin.tokenReserves, coin.decimals) * coin.marketcap);
    setMarketCapValue(prog > 1 ? 100 : Math.round(prog * 100000) / 1000);
  };

  useEffect(() => {
    getMarketCapData(coin);
  }, [coin]);

  return (
    <div className="flex flex-col h-full items-center justify-between border-[#143F72] border-[1px] hover:bg-custom-gradient rounded-lg text-white gap-2">
      <div className="flex flex-row w-full">
        <img
          src={coin?.url}
          alt="image"
          className="w-28 h-28 object-cover overflow-hidden rounded-tl-md"
        />
        <div className="flex flex-col px-2 gap-1 pt-3">
          <div className="w-full text-xl text-white font-bold">
            {coin?.name}
          </div>
          <div className="flex flex-row gap-2">
            <div className="flex flex-row gap-1 items-center">
              Created by
              <HiOutlinePuzzle className="text-2xl" />
            </div>
            <div>
              <Link
                href={`/profile/${(coin?.creator as userInfo)?.wallet}`}
                className="text-white px-1 normal-case"
              >
                {(coin?.creator as userInfo)?.name}
              </Link>
            </div>
          </div>
          {/* <div>replies: {coin?.replies}</div> */}
          <div>
            {coin?.name} [ticker: {coin?.ticker}]
          </div>

          {componentKey === "coin" ? (
            coin?.description && <div>{coin?.description}</div>
          ) : (
            <></>
          )}
          <div className="w-full flex flex-row gap-1 items-center text-white text-xl">
            <FaXTwitter />
            <TbWorld />
            <FaTelegramPlane />
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-1 p-3">
        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex flex-row gap-1 items-center">
            Market Cap
            <div className="text-gradient font-bold">
              {coin.marketcap || 0}
              {/* {marketCapValue !== 100 && "K"} */}
            </div>
            {`(${marketCapValue}%)`}
          </div>
          <div className="text-gradient font-bold">53K</div>
        </div>
        <div className="w-full h-2 rounded-full bg-white relative flex">
          <div
            className="justify-start h-2 rounded-full absolute top-0 left-0 bg-blue-700"
            style={{ width: `${marketCapValue}%` }} // Fix: Corrected percentage calculation
          />
        </div>
      </div>
    </div>
  );
};
