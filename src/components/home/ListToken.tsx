import InfiniteScroll from 'react-infinite-scroll-component';
import oraidexIcon from '@/assets/icons/oraidex_ic.svg';
import raydiumIcon from '@/assets/icons/raydium_ic.svg';
import cloudIslandImg from '@/assets/images/islandCloud.png';
import oraidexIsland from '@/assets/images/oraidex_island.png';
import raydiumIsland from '@/assets/images/raydium_island.png';
import logoCoinImg from '@/assets/images/richoldman.png';
import loadingImg from '@/assets/icons/loading-button.svg';
import nodataImg from '@/assets/icons/nodata.svg';
import { coinInfo } from '@/utils/types';
//
import { useLocation } from 'wouter';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { reduceString } from '@/utils/util';
import { formatNumberKMB } from '@/utils/format';
import BigNumber from 'bignumber.js';
import { BONDING_CURVE_LIMIT } from '@/config';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import dayjs from 'dayjs';
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
    yy: '%dy' // 2+ years
  }
});

export enum STATUS_TOKEN {
  LUNCH = 'Live Launch',
  LISTED = 'Listed'
}

const ListToken: FC<{
  type: STATUS_TOKEN;
  data: coinInfo[];
  handleLoadMore;
  totalData;
}> = ({ type, data, handleLoadMore, totalData }) => {
  return type === STATUS_TOKEN.LISTED ? <ListListedToken data={data} handleLoadMore={handleLoadMore} totalData={totalData} /> : <ListLaunchToken data={data} handleLoadMore={handleLoadMore} totalData={totalData} />;
};

export default ListToken;

export const ListLaunchToken = ({ data, handleLoadMore, totalData }) => {
  const [, setLocation] = useLocation();
  const handleToProfile = (id: string) => {
    setLocation(`/profile/${id}`);
  };
  const handleToRouter = (id: string) => {
    setLocation(id);
  };

  return !data?.length ? (
    <div className="w-full mt-4 rounded-lg bg-[#13141D] border border-dashed border-[#30344A] py-12 px-8 flex flex-col justify-center items-center">
      <img src={nodataImg} alt="nodata" />
      <p className="mt-4 text-[#E8E9EE] text-[16px]">No Token</p>
      <p className="mt-2 text-[#585A6B] text-[14px]">No Token listed</p>
    </div>
  ) : (
    <InfiniteScroll
      next={handleLoadMore}
      className="mt-8 mb-14 pb-2 grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 w-full overflow-hidden"
      hasMore={data.length < totalData}
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
        const bondingCurvePercentOrg = new BigNumber((coinItem.lamportReserves || 0).toString() || 0).multipliedBy(100).div(BONDING_CURVE_LIMIT);

        const bondingCurvePercent = bondingCurvePercentOrg.isGreaterThanOrEqualTo(100) ? 100 : bondingCurvePercentOrg.toFixed(2, 1);

        return (
          <div
            className="relative border border-[#1A1C28] bg-[#080a14] rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)] flex flex-col"
            key={`item-token-${ind}-${coinItem.token}`}
            onClick={() => handleToRouter(`/trading/${coinItem.token}`)}
          >
            <div className="relative h-[216px] pt-4 flex flex-col justify-center items-center bg-[#080a14] rounded-t-lg">
              <div className="relative w-full h-full flex items-start justify-center">
                <div className="w-[112px] h-[112px]">
                  <img src={coinItem.metadata?.image || coinItem.url} alt="logoCoinImg" width={112} height={112} className="border-4 border-[#E8E9EE] rounded-full w-[112px] h-[112px] object-cover" />
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
                <img src={cloudIslandImg} alt="cloudIslandImg" />
              </div>
            </div>
            <div className="bg-[#13141d] rounded-lg p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <div className="uppercase text-[#84869A] text-[12px] font-medium">
                    create by{' '}
                    <span
                      className="text-[#E4775D] underline"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleToProfile(ind as any);
                      }}
                    >
                      {coinItem.creator?.['wallet'] ? reduceString(coinItem.creator?.['wallet'] || '', 4, 4) : coinItem.creator.toString()}
                    </span>
                  </div>
                  <span className="uppercase text-[12px] text-[#84869A] text-right">{dayjs(coinItem.date || Date.now()).fromNow()}</span>
                </div>
                <div className="my-3 text-[#E8E9EE] text-[18px] font-medium">
                  {coinItem.name} (${coinItem.ticker})
                </div>
                <div className="line-clamp-3 font-medium text-[#84869A] text-[14px] mb-6">{coinItem.description || ''}</div>
              </div>
              <div>
                <div className="text-[#84869A] text-[12px] font-medium uppercase mb-4">
                  Marketcap{' '}
                  <span className="text-[#E8E9EE]">
                    {formatNumberKMB(Number(coinItem.marketcap || 0))}({bondingCurvePercent}%)
                  </span>
                </div>
                <div className="w-full mt-4 px-[2px] py-[1px] rounded-[28px] bg-[#1A1C28] border border-solid border-[#30344A]">
                  <div className="rounded-[999px] h-2 bg-barrie" style={{ width: `${bondingCurvePercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </InfiniteScroll>
  );
};

export const ListListedToken = ({ data, handleLoadMore, totalData }) => {
  const [, setLocation] = useLocation();
  const handleToProfile = (id: string) => {
    setLocation(`/profile/${id}`);
  };
  const handleToRouter = (id: string) => {
    setLocation(id);
  };

  return !data?.length ? (
    <div className="w-full mt-4 rounded-lg bg-[#13141D] border border-dashed border-[#30344A] py-12 px-8 flex flex-col justify-center items-center">
      <img src={nodataImg} alt="nodata" />
      <p className="mt-4 text-[#E8E9EE] text-[16px]">No Token</p>
      <p className="mt-2 text-[#585A6B] text-[14px]">No Token listed</p>
    </div>
  ) : (
    <InfiniteScroll
      next={handleLoadMore}
      className="mt-8 mb-14 pb-2 grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 w-full overflow-hidden"
      hasMore={data.length < totalData}
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
        const isOraidexListed = coinItem.oraidexPoolAddr && !coinItem.raydiumPoolAddr;
        return (
          <div
            className="relative border border-[#1A1C28] bg-[#080a14] rounded-lg cursor-pointer transition-all ease-in hover:shadow-md hover:shadow-[rgba(255,_255,_255,_0.24)] flex flex-col"
            key={`item-token-${ind}-${coinItem.token}-listed`}
            onClick={() => handleToRouter(`/trading/${coinItem.token}`)}
          >
            <div className="relative h-[216px] pt-4 flex flex-col justify-center items-center bg-[#080a14] rounded-t-lg">
              <div className="relative w-full h-full flex items-start justify-center">
                <div className="w-[112px] h-[112px]">
                  <img src={coinItem.metadata?.image || coinItem.url} alt="logoCoinImg" width={112} height={112} className="border-4 border-[#E8E9EE] rounded-full w-[112px] h-[112px] object-cover" />
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
                <img src={isRaydiumListed ? raydiumIsland : oraidexIsland} alt={isRaydiumListed ? 'raydiumIslandImg' : 'oraidexIslandImg'} />
              </div>
            </div>
            <div className="bg-[#13141d] rounded-lg p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <div className="uppercase text-[#84869A] text-[12px] font-medium">
                    create by{' '}
                    <span className="text-[#E4775D] underline" onClick={() => handleToProfile(ind as any)}>
                      {coinItem.creator?.['wallet'] ? reduceString(coinItem.creator?.['wallet'] || '', 4, 4) : coinItem.creator.toString()}
                    </span>
                  </div>

                  <span className="uppercase text-[12px] text-[#84869A] text-right">{dayjs(coinItem.date || Date.now()).fromNow()}</span>
                </div>
                <div className="my-3 text-[#E8E9EE] text-[18px] font-medium">
                  {coinItem.name} (${coinItem.ticker})
                </div>
                <div className="line-clamp-3 font-medium text-[#84869A] text-[14px] mb-6">{coinItem.description || ''}</div>
              </div>
              <div>
                {isRaydiumListed ? (
                  <div className="text-[#080A14] rounded-full flex items-center uppercase text-[12px] font-medium bg-[linear-gradient(48deg,_#9945FF_0.56%,_#7962E7_20.34%,_#00D18C_99.44%)] p-1">
                    <img src={raydiumIcon} alt="icon_dex" className="mr-1" width={16} height={16} />
                    <span>LISTED oN RAYDIUM</span>
                  </div>
                ) : (
                  <div className="text-[#080A14] rounded-full flex items-center uppercase text-[12px] font-medium bg-[#AEE67F] p-1">
                    <img src={oraidexIcon} alt="icon_dex" className="mr-1" width={16} height={16} />
                    <span>LISTED oN ORAIDEX</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </InfiniteScroll>
  );
};

export const TokenTab = {
  [STATUS_TOKEN.LUNCH]: {
    label: STATUS_TOKEN.LUNCH,
    value: STATUS_TOKEN.LUNCH,
    link: '/?tab=live',
    content: ListLaunchToken
  },
  [STATUS_TOKEN.LISTED]: {
    label: STATUS_TOKEN.LISTED,
    value: STATUS_TOKEN.LISTED,
    link: '/?tab=listed',
    content: ListListedToken
  }
};
