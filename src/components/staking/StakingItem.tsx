import LoadingImg from '@/assets/icons/loading-button.svg';
import MAXImg from '@/assets/images/richoldman.png';
import { ALL_CONFIGS, SPL_DECIMAL } from '@/config';
import { Vault } from '@/program/locking/locking';
import { Web3SolanaLockingToken } from '@/program/web3Locking';
import { numberWithCommas } from '@/utils/format';
import { useGetCoinInfoState } from '@/zustand-store/coin/selector';
import { IdlAccounts } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { successAlert } from '../others/ToastGroup';
const web3Locking = new Web3SolanaLockingToken();

const StakingItem: FC<{
  item: IdlAccounts<Vault>['stakeDetail'];
  keyId: number;
  onSuccess: () => void;
}> = ({ item, keyId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { stakeAmount, unstakedAtTime, lockPeriod, lockPeriodFormat } = (item ||
    {}) as any;
  const wallet = useWallet();
  const claimable =
    unstakedAtTime.toNumber() <=
    Math.floor(Date.now() / ALL_CONFIGS.TIMER.MILLISECONDS);
  const stakeConfig = useGetCoinInfoState('stakeConfig');
  const coin = useGetCoinInfoState('coin');

  return (
    <tr
      key={`tr-locking-item-id-${item.id?.toString()}-${keyId}`}
      className="w-full border-b-[1px] border-b-[#1A1C28] text-[#E8E9EE] py-4 h-[72px]"
    >
      <td className="text-[14px] font-semibold">
        <div className="flex items-center">
          <img
            src={MAXImg}
            alt="MAX IMG"
            className="rounded-full"
            width={20}
            height={20}
          />
          <span className="ml-2">
            {numberWithCommas(
              stakeAmount.divn(10 ** SPL_DECIMAL).toNumber(),
              undefined,
              { maximumFractionDigits: SPL_DECIMAL }
            )}
          </span>
        </div>
      </td>
      <td
        className={twMerge(
          'text-[10px] break-keep md:text-[12px] text-center py-2 text-[#9FF4CF]',
          !claimable && 'text-[#F79009]'
        )}
      >
        <div className="flex items-center">
          {!claimable ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="12"
              viewBox="0 0 13 12"
              fill="none"
            >
              <path
                d="M9.0625 4.50001H8.5V3.40548C8.5 2.17032 7.51562 1.14376 6.28047 1.12501C5.02891 1.10861 4 2.12814 4 3.37501V4.50001H3.4375C2.92188 4.50001 2.5 4.92189 2.5 5.43751V9.93751C2.5 10.4531 2.92188 10.875 3.4375 10.875H9.0625C9.57812 10.875 10 10.4531 10 9.93751V5.43751C10 4.92189 9.57812 4.50001 9.0625 4.50001ZM6.57812 7.42501V9.03751C6.57812 9.21329 6.44219 9.36564 6.26641 9.37501C6.07891 9.38439 5.92188 9.23439 5.92188 9.04689V7.42501C5.65234 7.29376 5.47422 7.00782 5.50234 6.68204C5.53516 6.31876 5.83281 6.02814 6.19609 6.00236C6.63438 5.97189 7 6.31876 7 6.75001C7 7.04767 6.82891 7.30314 6.57812 7.42501ZM7.84375 4.50001H4.65625V3.37501C4.65625 2.95079 4.82266 2.55236 5.125 2.25001C5.42734 1.94767 5.82578 1.78126 6.25 1.78126C6.67422 1.78126 7.07266 1.94767 7.375 2.25001C7.67734 2.55236 7.84375 2.95079 7.84375 3.37501V4.50001Z"
                fill="#F79009"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="12"
              viewBox="0 0 13 12"
              fill="none"
            >
              <path
                d="M10 3L4.75 9L2.5 6.75"
                stroke="#9FF4CF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className="ml-1">{!claimable ? 'Locked' : 'Complete'}</span>
        </div>
      </td>
      <td className="text-[10px] break-keep md:text-[12px] py-2">
        {/* {stakeConfig && formatTimePeriod(stakeConfig.lockPeriod)} */}
        {lockPeriodFormat}
      </td>
      <td className="text-[10px] break-keep md:text-[12px] py-2">
        {dayjs(
          unstakedAtTime.muln(ALL_CONFIGS.TIMER.MILLISECONDS).toNumber() ||
            Date.now()
        ).format('MMM DD YYYY HH:mm')}
      </td>
      <td className="text-[10px] break-keep md:text-[12px] py-2">
        <button
          disabled={isLoading || !claimable}
          onClick={async () => {
            try {
              setIsLoading(true);

              const res = await web3Locking.unStake(
                lockPeriod,
                item.id.toNumber(),
                stakeAmount.toNumber(),
                wallet
              );

              if (res) {
                successAlert('Claim successfully!');
                onSuccess();
              }
            } catch (error) {
              console.log('claim error', error);
            } finally {
              setIsLoading(false);
            }
          }}
          className={twMerge(
            'rounded-lg bg-[#FCFCFC] h-6 px-2 flex items-center justify-center hover:brightness-150 disabled:brightness-75 disabled:cursor-not-allowed uppercase text-[#080A14] font-medium',
            !claimable && 'text-[#30344A] rounded bg-[#13141D]'
          )}
        >
          {isLoading && <img width={18} height={18} src={LoadingImg} />}
          &nbsp;Claim
        </button>
      </td>
    </tr>
  );
};

export default StakingItem;
