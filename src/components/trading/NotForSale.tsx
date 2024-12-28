import islandLunch from '@/assets/images/islandLunch.png';
import { ALL_CONFIGS } from '@/config';
import dayjs from 'dayjs';
import LaunchingLock from '../launchingLock';
import Countdown from './Countdown';
import { toBN } from '@/utils/util';

const NotForSale = ({ coin, onEnd, partyStart, publicStart }) => {
  const startTime = Math.ceil(new Date(coin.date || Date.now()).getTime());
  const endTime = toBN(partyStart).toNumber();

  return (
    <div className="flex flex-col w-full md:max-w-[384px] md:mb-10">
      {(!!partyStart || !!publicStart) && (
        <div className="relative w-full md:max-w-[384px] bg-[#13141D] rounded-xl p-6 h-fit mb-4">
          <img
            src={islandLunch}
            alt="islandLunch"
            className="absolute top-6 right-6"
          />
          <div className="text-[18px] font-semibold text-[#E8E9EE] mb-2">
            The Party Round is coming!
          </div>
          <div className="text-[14px] font-medium text-[#9192A0] mb-6">
            Please wait until the Party Round starts.
          </div>
          <Countdown
            onEnd={() => {
              onEnd();
            }}
            coin={coin}
            endTime={endTime}
          />
          {coin.date && (
            <div className="text-[14px] font-medium text-[#585A6B] mt-4">
              {dayjs(endTime * ALL_CONFIGS.TIMER.MILLISECONDS).format(
                'DD-MM-YYYY HH:mm Z'
              )}
            </div>
          )}
        </div>
      )}
      <div className="">
        <LaunchingLock />
      </div>
    </div>
  );
};

export default NotForSale;
