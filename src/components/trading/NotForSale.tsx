import React from "react";
import Countdown from "./Countdown";
import dayjs from "dayjs";
import islandLunch from "@/assets/images/islandLunch.png";

const NotForSale = ({ coin, onEnd }) => {
  return (
    <div className="relative w-full md:max-w-[384px] bg-[#13141D] border border-[#E8E9EE] rounded-xl p-6 h-fit">
      <img
        src={islandLunch}
        alt="islandLunch"
        className="absolute top-6 right-6"
      />
      <div className="text-[18px] font-semibold text-[#E8E9EE] mb-2">
        The launch is coming!
      </div>
      <div className="text-[14px] font-medium text-[#9192A0] mb-6">
        Please wait until the launch starts.
      </div>
      <Countdown onEnd={onEnd} coin={coin} />
      {coin.date && (
        <div className="text-[14px] font-medium text-[#585A6B] mt-4">
          {dayjs(coin.date).format("DD-MM-YYYY HH:MM Z")}
        </div>
      )}
    </div>
  );
};

export default NotForSale;
