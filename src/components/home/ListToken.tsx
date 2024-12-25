import nodataImg from '@/assets/icons/nodata.svg';
import oraidexIcon from '@/assets/icons/oraidex_ic.svg';
import raydiumIcon from '@/assets/icons/raydium_ic.svg';
import cloudIslandImg from '@/assets/images/islandCloud.png';
import rockIslandImg from '@/assets/images/upcoming.png';
import oraidexIsland from '@/assets/images/oraidex_island.png';
import raydiumIsland from '@/assets/images/raydium_island.png';
import { ALL_CONFIGS } from '@/config';
import { formatNumberKMB } from '@/utils/format';
import { coinInfo } from '@/utils/types';
import { reduceString } from '@/utils/util';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import { FC } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReactLoading from 'react-loading';
import { Link, useLocation } from 'wouter';
import {
  formatCountdownTime,
  useCountdown,
} from '../trading/hooks/useCountdown';
// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Custom locale configuration
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1m', // 1 minute
    mm: '%dm', // 2-59 minutes
    h: '1h', // 1 hour
    hh: '%dh', // 2-23 hours
    d: '1d', // 1 day
    dd: '%dd', // 2-30 days
    M: '1mo', // 1 month
    MM: '%dmo', // 2-12 months
    y: '1y', // 1 year
    yy: '%dy', // 2+ years
  },
});

export enum STATUS_TOKEN {
  UPCOMING = 'UPCOMING',
  LUNCH = 'Live Launch',
  LISTED = 'Listed',
}

export const KeyByStatus = {
  [STATUS_TOKEN.LUNCH]: 'live',
  [STATUS_TOKEN.UPCOMING]: 'upcoming',
  [STATUS_TOKEN.LISTED]: 'listed',
};

const NoToken = () => (
  <div className="w-full mt-4 rounded-lg bg-[#13141D] border border-dashed border-[#30344A] py-12 px-8 flex flex-col justify-center items-center">
    <img src={nodataImg} alt="nodata" />
    <p className="mt-4 text-[#E8E9EE] text-[16px]">No Token</p>
    <p className="mt-2 text-[#585A6B] text-[14px]">No Token listed</p>
  </div>
);

const Loading = () => (
  <div className="flex h-screen items-start justify-center bg-tizz-background">
    <ReactLoading height={20} width={50} type={'bars'} color={'#36d7b7'} />
  </div>
);

const ListToken: FC<{
  type: string;
  data: coinInfo[];
  handleLoadMore;
  totalData;
  isDataFromRpc;
}> = ({ type, data, handleLoadMore, totalData, isDataFromRpc }) => {
  if (isDataFromRpc) {
    return <ListTokenFromRpc data={data} />;
  }
  return (
    <>
      {type === KeyByStatus[STATUS_TOKEN.LISTED] && (
        <ListListedToken
          data={data}
          handleLoadMore={handleLoadMore}
          totalData={totalData}
          isDataFromRpc={isDataFromRpc}
        />
      )}
      {type === KeyByStatus[STATUS_TOKEN.UPCOMING] && (
        <ListLaunchToken
          data={data}
          handleLoadMore={handleLoadMore}
          totalData={totalData}
          isUpcoming={true}
          isDataFromRpc={isDataFromRpc}
        />
      )}
      {type === KeyByStatus[STATUS_TOKEN.LUNCH] && (
        <ListLaunchToken
          data={data}
          handleLoadMore={handleLoadMore}
          totalData={totalData}
          isUpcoming={false}
          isDataFromRpc={isDataFromRpc}
        />
      )}
    </>
  );
};

export default ListToken;

export const ListTokenFromRpc = ({ data }) => {
  // waiting for data to be ready
  if (!data) return <Loading />;
  // no data
  if (!data.length) return <NoToken />;

  return (
    <div className="mt-8 mb-14 pb-2 grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 w-full overflow-hidden">
      {data.map((coinItem: coinInfo, ind) => {
        const bondingCurveValue = new BigNumber(
          (coinItem.lamportReserves || 0).toString()
        )
          .minus(ALL_CONFIGS.INIT_SOL_BONDING_CURVE)
          .toNumber();

        const bondingCurvePercent = new BigNumber(bondingCurveValue)
          .multipliedBy(new BigNumber(100))
          .div(
            new BigNumber(ALL_CONFIGS.BONDING_CURVE_LIMIT).minus(
              ALL_CONFIGS.INIT_SOL_BONDING_CURVE
            )
          )
          .toNumber();

        const shownPercent =
          bondingCurvePercent < 0
            ? 0
            : bondingCurvePercent > 100
            ? 100
            : bondingCurvePercent;

        return (
          <Link
            className="relative border border-[#1A1C28] bg-[#080a14] rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)] flex flex-col"
            key={`item-token-${ind}-${coinItem.token}`}
            href={`/trading/${coinItem.token}`}
          >
            <div className="relative h-[216px] pt-4 flex flex-col justify-center items-center bg-[#080a14] rounded-t-lg">
              <div className="relative w-full h-full flex items-start justify-center">
                <div className="w-[112px] h-[112px]">
                  <img
                    src={coinItem.metadata?.image || coinItem.url}
                    alt="logoCoinImg"
                    width={112}
                    height={112}
                    className="border-4 border-[#E8E9EE] rounded-full w-[112px] h-[112px] object-cover"
                  />
                </div>
              </div>
              <div className="absolute bottom-0">
                <img src={cloudIslandImg} alt="cloudIslandImg" />
              </div>
            </div>
            <div className="bg-[#13141d] rounded-lg p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <div className="uppercase text-[#84869A] text-[12px] font-medium">
                    created by{' '}
                    <Link
                      className="text-[#E4775D] underline normal-case"
                      href={`/profile/${coinItem.creator}`}
                    >
                      {reduceString(coinItem.creator as string, 4, 4)}
                    </Link>
                  </div>
                  <span className="uppercase text-[12px] text-[#84869A] text-right">
                    {dayjs(coinItem.date || Date.now()).fromNow()}
                  </span>
                </div>
                <div className="my-3 text-[#E8E9EE] text-[18px] font-medium">
                  {coinItem.name} (${coinItem.ticker})
                </div>
                <div className="line-clamp-3 font-medium text-[#84869A] text-[14px] mb-6">
                  {coinItem.description || ''}
                </div>
              </div>
              <div>
                <div className="text-[#84869A] text-[12px] font-medium uppercase mb-4">
                  Marketcap{' '}
                  <span className="text-[#E8E9EE]">
                    {formatNumberKMB(Number(coinItem.marketcap || 0))}(
                    {shownPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="w-full mt-4 px-[2px] py-[1px] rounded-[28px] bg-[#1A1C28] border border-solid border-[#30344A]">
                  <div
                    className="rounded-[999px] h-2 bg-barrie"
                    style={{ width: `${shownPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export const ListLaunchToken = ({
  data,
  handleLoadMore,
  totalData,
  isUpcoming,
  isDataFromRpc,
}) => {
  // waiting for data to be ready
  if (!data) return <Loading />;
  // no data
  if (!data.length) return <NoToken />;

  return (
    <InfiniteScroll
      next={handleLoadMore}
      className="mt-8 mb-14 pb-2 grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 w-full overflow-hidden"
      hasMore={!isDataFromRpc || data.length < totalData}
      dataLength={data.length}
      scrollThreshold="80%"
      loader={
        <div className="animate-pulse brightness-125 relative border border-[#1A1C28] bg-[#080a14] p-4 rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)]">
          <div className="bg-[#13141d] rounded-lg w-full h-[216px]"></div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="bg-[#13141d] rounded-lg h-3 w-full"></div>
            <div className="bg-[#13141d] rounded-lg h-3 w-[80%]"></div>
            <div className="bg-[#13141d] rounded-lg h-3 w-[50%]"></div>
            <div className="bg-[#13141d] rounded-lg h-3 w-full mt-3"></div>
          </div>
        </div>
      }
    >
      {data.map((coinItem: coinInfo, ind) => {
        const bondingCurveValue = new BigNumber(
          (coinItem.lamportReserves || 0).toString()
        )
          .minus(ALL_CONFIGS.INIT_SOL_BONDING_CURVE)
          .toNumber();

        const bondingCurvePercent = new BigNumber(bondingCurveValue)
          .multipliedBy(new BigNumber(100))
          .div(
            new BigNumber(ALL_CONFIGS.BONDING_CURVE_LIMIT).minus(
              ALL_CONFIGS.INIT_SOL_BONDING_CURVE
            )
          )
          .toNumber();

        const shownPercent =
          bondingCurvePercent < 0
            ? 0
            : bondingCurvePercent > 100
            ? 100
            : bondingCurvePercent;

        return (
          <Link
            className="relative border border-[#1A1C28] bg-[#080a14] rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)] flex flex-col"
            key={`item-token-${ind}-${coinItem.token}`}
            href={`/trading/${coinItem.token}`}
          >
            <div className="relative h-[216px] pt-4 flex flex-col justify-center items-center bg-[#080a14] rounded-t-lg">
              <div className="relative w-full h-full flex items-start justify-center">
                <div className="w-[112px] h-[112px]">
                  <img
                    src={coinItem.metadata?.image || coinItem.url}
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
                {isUpcoming ? (
                  <img src={rockIslandImg} alt="rockIslandImg" />
                ) : (
                  <img src={cloudIslandImg} alt="cloudIslandImg" />
                )}
              </div>
            </div>
            <div className="bg-[#13141d] rounded-lg p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <div className="uppercase text-[#84869A] text-[12px] font-medium">
                    created by{' '}
                    <Link
                      className="text-[#E4775D] underline normal-case"
                      href={`/profile/${coinItem.creator?.['wallet']}`}
                    >
                      {coinItem.creator?.['wallet']
                        ? reduceString(coinItem.creator?.['wallet'] || '', 4, 4)
                        : coinItem.creator.toString()}
                    </Link>
                  </div>
                  <span className="uppercase text-[12px] text-[#84869A] text-right">
                    {dayjs(coinItem.date || Date.now()).fromNow()}
                  </span>
                </div>
                <div className="my-3 text-[#E8E9EE] text-[18px] font-medium">
                  {coinItem.name} (${coinItem.ticker})
                </div>
                <div className="line-clamp-3 font-medium text-[#84869A] text-[14px] mb-6">
                  {coinItem.description || ''}
                </div>
              </div>
              {isUpcoming ? (
                <CountdownItem coin={coinItem} />
              ) : (
                <div>
                  <div className="text-[#84869A] text-[12px] font-medium uppercase mb-4">
                    Marketcap{' '}
                    <span className="text-[#E8E9EE]">
                      {formatNumberKMB(Number(coinItem.marketcap || 0))}(
                      {shownPercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="w-full mt-4 px-[2px] py-[1px] rounded-[28px] bg-[#1A1C28] border border-solid border-[#30344A]">
                    <div
                      className="rounded-[999px] h-2 bg-barrie"
                      style={{ width: `${shownPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </InfiniteScroll>
  );
};

const CountdownItem = ({ coin }) => {
  const startTime = Math.ceil(
    new Date(coin.date || Date.now()).getTime() / ALL_CONFIGS.TIMER.MILLISECOND
  );
  const endTime = Math.floor(
    new Date(coin.tradingTime || Date.now()).getTime() /
      ALL_CONFIGS.TIMER.MILLISECOND
  );

  const { timeRemaining } = useCountdown({
    startTime,
    endTime,
    onStart: () => {},
    onEnd: () => {},
  });

  const { days, hours, minutes, seconds } = formatCountdownTime(timeRemaining);

  return (
    <div className="rounded-lg">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6ZM6 3C6.27614 3 6.5 3.22386 6.5 3.5V5.79289L7.35355 6.64645C7.54882 6.84171 7.54882 7.15829 7.35355 7.35355C7.15829 7.54882 6.84171 7.54882 6.64645 7.35355L5.64645 6.35355C5.55268 6.25979 5.5 6.13261 5.5 6V3.5C5.5 3.22386 5.72386 3 6 3Z"
            fill="#9192A0"
          />
        </svg>
        <span className="text-[#9192A0] text-[12px] ml-1">Phase start at</span>
      </div>

      <div className="flex mt-1">
        <div className="text-[20px] text-[#6392E9] font-semibold">{hours}h</div>
        <div className="text-[20px] text-[#6392E9] font-semibold">
          {minutes}m
        </div>
        <div className="text-[20px] text-[#6392E9] font-semibold">
          {seconds}s
        </div>
      </div>
    </div>
  );
};

export const ListListedToken = ({
  data,
  handleLoadMore,
  totalData,
  isDataFromRpc,
}) => {
  // waiting for data to be ready
  if (!data) return <Loading />;
  // no data
  if (!data.length) return <NoToken />;

  return (
    <InfiniteScroll
      next={handleLoadMore}
      className="mt-8 mb-14 pb-2 grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 w-full overflow-hidden"
      hasMore={isDataFromRpc || data.length < totalData}
      dataLength={data.length}
      scrollThreshold="80%"
      loader={
        <div className="animate-pulse brightness-125 relative border border-[#1A1C28] bg-[#080a14] p-4 rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)]">
          <div className="bg-[#13141d] rounded-lg w-full h-[216px]"></div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="bg-[#13141d] rounded-lg h-3 w-full"></div>
            <div className="bg-[#13141d] rounded-lg h-3 w-[80%]"></div>
            <div className="bg-[#13141d] rounded-lg h-3 w-[50%]"></div>
            <div className="bg-[#13141d] rounded-lg h-3 w-full mt-3"></div>
          </div>
        </div>
      }
    >
      {data.map((coinItem, ind) => {
        // [...new Array(10)]
        const isRaydiumListed = coinItem.raydiumPoolAddr;
        const isOraidexListed =
          coinItem.oraidexPoolAddr && !coinItem.raydiumPoolAddr;
        return (
          <Link
            className="relative border border-[#1A1C28] bg-[#080a14] rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)] flex flex-col"
            key={`item-token-${ind}-${coinItem.token}-listed`}
            href={`/trading/${coinItem.token}`}
          >
            <div className="relative h-[216px] pt-4 flex flex-col justify-center items-center bg-[#080a14] rounded-t-lg">
              <div className="relative w-full h-full flex items-start justify-center">
                <div className="w-[112px] h-[112px]">
                  <img
                    src={coinItem.metadata?.image || coinItem.url}
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
                <img
                  src={isRaydiumListed ? raydiumIsland : oraidexIsland}
                  alt={
                    isRaydiumListed ? 'raydiumIslandImg' : 'oraidexIslandImg'
                  }
                />
              </div>
            </div>
            <div className="bg-[#13141d] rounded-lg p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <div className="uppercase text-[#84869A] text-[12px] font-medium">
                    created by{' '}
                    <Link
                      className="text-[#E4775D] underline normal-case"
                      href={`/profile/${coinItem.creator}`}
                      // onClick={() => handleToProfile(ind as any)}
                    >
                      {coinItem.creator
                        ? reduceString(coinItem.creator || '', 4, 4)
                        : coinItem.creator.toString()}
                    </Link>
                  </div>

                  <span className="uppercase text-[12px] text-[#84869A] text-right">
                    {dayjs(coinItem.date || Date.now()).fromNow()}
                  </span>
                </div>
                <div className="my-3 text-[#E8E9EE] text-[18px] font-medium">
                  {coinItem.name} (${coinItem.ticker})
                </div>
                <div className="line-clamp-3 font-medium text-[#84869A] text-[14px] mb-6">
                  {coinItem.description || ''}
                </div>
              </div>
              <div>
                {isRaydiumListed ? (
                  <div className="text-[#080A14] rounded-full flex items-center uppercase text-[12px] font-medium bg-[linear-gradient(48deg,_#9945FF_0.56%,_#7962E7_20.34%,_#00D18C_99.44%)] p-1">
                    <img
                      src={raydiumIcon}
                      alt="icon_dex"
                      className="mr-1"
                      width={16}
                      height={16}
                    />
                    <span>LISTED oN RAYDIUM</span>
                  </div>
                ) : (
                  <div className="text-[#080A14] rounded-full flex items-center uppercase text-[12px] font-medium bg-[#AEE67F] p-1">
                    <img
                      src={oraidexIcon}
                      alt="icon_dex"
                      className="mr-1"
                      width={16}
                      height={16}
                    />
                    <span>LISTED oN ORAIDEX</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </InfiniteScroll>
  );
};

export const TokenTab = {
  [STATUS_TOKEN.UPCOMING]: {
    label: STATUS_TOKEN.UPCOMING,
    value: KeyByStatus[STATUS_TOKEN.UPCOMING],
    link: `/?tab=${KeyByStatus[STATUS_TOKEN.UPCOMING]}`,
    content: ListLaunchToken,
  },
  [STATUS_TOKEN.LUNCH]: {
    label: STATUS_TOKEN.LUNCH,
    value: KeyByStatus[STATUS_TOKEN.LUNCH],
    link: `/?tab=${KeyByStatus[STATUS_TOKEN.LUNCH]}`,
    content: ListLaunchToken,
  },
  [STATUS_TOKEN.LISTED]: {
    label: STATUS_TOKEN.LISTED,
    value: KeyByStatus[STATUS_TOKEN.LISTED],
    link: `/?tab=${KeyByStatus[STATUS_TOKEN.LISTED]}`,
    content: ListListedToken,
  },
};
