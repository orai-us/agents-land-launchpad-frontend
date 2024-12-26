import { coinInfo } from '@/utils/types';
import React, { FC } from 'react';
import nodataImg from '@/assets/icons/nodata.svg';
import ReactLoading from 'react-loading';
import useGetStakedByUser from './hooks/useGetStakeByUser';
import { toBN, toPublicKey } from '@/utils/util';
import LockingItem from './LockingItem';
import { formatNumberKMB } from '@/utils/format';
import { SPL_DECIMAL } from '@/config';
import {
  useCoinActions,
  useGetCoinInfoState,
} from '@/zustand-store/coin/selector';

const ListFungibleStake: FC<{}> = () => {
  const coin = useGetCoinInfoState('coin');
  const refreshCheck = useGetCoinInfoState('refreshStakeCheck');
  const { handleSetRefreshCheck, handleSetStakeMintBalance } = useCoinActions();
  const {
    loading: loadingList,
    stakeInfo,
    totalLocked,
  } = useGetStakedByUser(coin.token, refreshCheck);

  const isShowLocked =
    stakeInfo && toBN(stakeInfo['stakeAmount'] || 0).isGreaterThan(0);

  const Loading = () => (
    <div className="flex h-[120px] items-start justify-center bg-tizz-background">
      <ReactLoading height={20} width={50} type={'bars'} color={'#36d7b7'} />
    </div>
  );

  return (
    <div className="w-full flex flex-col my-6 mb-10">
      <div className="text-[#E8E9EE] text-[18px] font-medium mb-4 md:mb-6">
        Your locked
      </div>
      {loadingList ? (
        <Loading />
      ) : !isShowLocked ? (
        <div className="flex h-screen max-h-[212px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#30344A] bg-[#13141D] p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded border border-[#1A1C28] bg-[#080A14]">
            <img src={nodataImg} alt="nodata" />
          </div>
          <p className="mt-4 text-[16px] font-medium uppercase text-[#E8E9EE]">
            No locked
          </p>
          <p className="mt-2 text-[14px] font-medium text-[#585A6B]">
            Your locked history will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="scrollable-table-container border border-[#1A1C28] rounded-lg !max-h-[440px]">
            <table className="w-full h-full scroll-table">
              <thead className="w-full text-white">
                <tr className="text-lg">
                  <th className="pl-4 py-2 md:pl-6 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase text-left">
                    MAX locked
                  </th>
                  <th className="px-1 py-2 md:px-2 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase">
                    STATE
                  </th>
                  <th className="px-1 py-2 md:px-2 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase">
                    duration
                  </th>
                  <th className="px-1 py-2 md:px-2 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase">
                    Unlock date
                  </th>
                  <th className="pr-4 py-2 md:pr-6 md:py-4 bg-[#13141d] text-[#9192A0] text-[10px] md:text-[12px] uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="min-w-[320px]">
                <LockingItem
                  item={stakeInfo}
                  onSuccess={() => {
                    handleSetRefreshCheck(!refreshCheck);
                  }}
                ></LockingItem>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="w-full flex justify-between gap-2 border border-[#1A1C28] bg-[#13141D] rounded-lg p-3 md:p-8 mt-4">
        <div>
          <div className="text-[#585A6B]">Total MAX locked</div>
          <div className="text-[#FCFCFC] font-medium text-[20px] mt-2">
            {formatNumberKMB(
              toBN(totalLocked)
                .div(10 ** SPL_DECIMAL)
                .toNumber(),
              false
            )}{' '}
            MAX
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default ListFungibleStake;
