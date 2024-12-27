import LoadingImg from '@/assets/icons/loading-button.svg';
import MaxImg from '@/assets/images/richoldman.png';
import { ALL_CONFIGS, SPL_DECIMAL } from '@/config';
import { Web3SolanaProgramInteraction } from '@/program/web3';
import { web3FungibleStake } from '@/program/web3FungStake';
import { numberWithCommas } from '@/utils/format';
import { formatTimePeriod, toBN, toPublicKey } from '@/utils/util';
import {
  useCoinActions,
  useGetCoinInfoState,
} from '@/zustand-store/coin/selector';
import { useWallet } from '@solana/wallet-adapter-react';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import NumberFormat from 'react-number-format';
import { errorAlert, successAlert } from '../others/ToastGroup';
import { LOCK_TIME_OPTIONS } from './constants';

dayjs.extend(utc);
dayjs.extend(tz);

export enum STEP_TOKEN {
  INFO,
  BEHAVIOR,
}

const web3Solana = new Web3SolanaProgramInteraction();

const web3Stake = new web3FungibleStake();

export default function LaunchingLock() {
  const coin = useGetCoinInfoState('coin');
  const stakeConfig = useGetCoinInfoState('stakeConfig');
  const stakeEndTime = useGetCoinInfoState('stakeEndTime');
  const refreshCheck = useGetCoinInfoState('refreshStakeCheck');
  const { handleSetRefreshCheck, handleSetStakeMintBalance } = useCoinActions();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLockTime, setSelectedLockTime] = useState(
    LOCK_TIME_OPTIONS[0]
  );
  const wallet = useWallet();
  const [tokenBal, setTokenBal] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>('');

  const AMOUNT_LIST = [
    {
      label: '25%',
      value: tokenBal / 4,
    },
    {
      label: '50%',
      value: tokenBal / 2,
    },
    {
      label: '75%',
      value: (tokenBal / 4) * 3,
    },
    {
      label: '100%',
      value: tokenBal,
    },
  ];

  const isInsufficient = toBN(stakeAmount).isGreaterThan(tokenBal);
  const isNegative = toBN(stakeAmount || 0).isLessThanOrEqualTo(0);
  const isEndStake =
    stakeEndTime && stakeEndTime * ALL_CONFIGS.TIMER.MILLISECONDS < Date.now();

  // console.log('stakeEndTime', stakeEndTime);

  const genMsgTextBtn = () => {
    if (!stakeAmount || !Number(stakeAmount)) {
      return 'Lock amount required';
    }
    if (isInsufficient) {
      return 'Insufficient amount';
    }

    return 'Lock';
  };

  const getBalance = async () => {
    if (!wallet.publicKey) {
      return setTokenBal(0);
    }

    try {
      const [tokenBal] = await Promise.all([
        web3Solana.getTokenBalance(
          wallet.publicKey.toString(),
          ALL_CONFIGS.STAKE_CURRENCY_MINT
        ),
        // web3Solana.getSolanaBalance(wallet.publicKey),
      ]);

      setTokenBal(tokenBal ? tokenBal : 0);
      // setSolBalance(solBal ? solBal : 0);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    getBalance();
  }, [wallet.publicKey, refreshCheck]);

  const handleInputChange = (value: number) => {
    if (value || value === 0) {
      setStakeAmount(value.toString());
    } else {
      setStakeAmount(''); // Allow empty string to clear the input
    }
  };

  if (isEndStake) {
    return;
  }

  return (
    <div className="w-full m-auto">
      <div className="w-full flex flex-col border border-[#1A1C28] bg-[#13141D] rounded-lg p-3 md:p-6 mt-4 md:mt-0">
        <div className="text-[18px] text-[#E8E9EE] font-medium mb-4 md:mb-6">
          Launching Vault
          <p className="text-[12px] md:text-[14px] text-[#9192A0]">
            Lock MAX to get early access to the buy token
          </p>
        </div>
        <div className="w-full">
          <div className="uppercase text-[#84869A] text-[12px] font-medium mb-3">
            Lock amount
          </div>
          <div className="px-4 w-full flex flex-row items-center bg-transparent border-[1px] border-[#30344A] rounded">
            <div className="py-2 flex-1">
              <NumberFormat
                placeholder={`0.0`}
                thousandSeparator
                className="w-full outline-none capitalize bg-transparent text-[#E8E9EE] placeholder:text-[#585A6B] text-[24px]"
                decimalScale={SPL_DECIMAL}
                type="text"
                value={stakeAmount}
                onChange={() => {}}
                isAllowed={(values) => {
                  const { floatValue } = values;
                  // allow !floatValue to let user can clear their input
                  return !floatValue || (floatValue >= 0 && floatValue <= 1e14);
                }}
                onValueChange={({ floatValue }) => {
                  handleInputChange(floatValue);
                }}
              />

              <span className="text-[10px] text-[#E8E9EE] font-medium">
                Balance:{' '}
                {numberWithCommas(Number(tokenBal), undefined, {
                  maximumFractionDigits: SPL_DECIMAL,
                })}{' '}
                MAX
              </span>
            </div>

            <div className="flex w-fit text-[#E8E9EE] text-[14px] rounded-[32px] bg-[#080A14] py-1 px-4 justify-center items-center h-8">
              MAX
              <img
                src={MaxImg}
                alt="coinIcon"
                className="ml-1 w-5 h-5 rounded-full border border-[#30344A] object-cover"
              />
            </div>
          </div>
          <div className="flex w-full flex-row gap-3 py-2">
            {AMOUNT_LIST.map((amount: any, idx: number) => {
              return (
                <div
                  key={`amount-list-percent-${idx}---`}
                  className="cursor-pointer rounded border-[1px] border-[#30344A] bg-[#080A14] px-2 py-1 text-center text-[12px] font-medium text-[#9192A0] hover:brightness-125"
                  onClick={() => setStakeAmount(amount.value.toString())}
                >
                  {amount.label}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 md:mt-6 flex justify-between items-center">
          <div className="text-[#84869A]">Locking duration</div>
          <div className="text-right">
            {stakeConfig && formatTimePeriod(stakeConfig.lockPeriod)}
          </div>
        </div>
        <div className="mt-2 mb-4 md:mt-3 md:mb-6 flex justify-between items-center">
          <div className="text-[#84869A]">Unlock on</div>
          <div>
            {dayjs(
              Date.now() +
                (stakeConfig?.lockPeriod || ALL_CONFIGS.LOCK_FUNGIBLE_STAKE) *
                  1000
            ).format('MMM DD YYYY HH:mm')}
          </div>
        </div>

        <button
          disabled={
            isLoading ||
            !stakeAmount ||
            !Number(stakeAmount) ||
            isInsufficient ||
            isNegative
          }
          onClick={async () => {
            console.log('Stake!!');
            try {
              setIsLoading(true);
              console.log('coin decimals: ', coin.decimals);
              const duration =
                selectedLockTime.value * ALL_CONFIGS.TIMER.MONTH_TO_SECONDS;
              const amount = toBN(
                toBN(stakeAmount || 0)
                  .multipliedBy(10 ** coin.decimals || SPL_DECIMAL)
                  .toFixed(0, 1)
              ).toNumber();
              const res = await web3Stake.stake(
                ALL_CONFIGS.STAKE_CURRENCY_MINT,
                coin.token,
                amount,
                wallet
              );
              if (res) {
                successAlert('Lock successfully!');
                handleSetRefreshCheck(!refreshCheck);
              } else {
                errorAlert('Lock failed!');
              }
            } catch (error) {
              console.log('error lock', error);
              errorAlert('Lock failed!');
            } finally {
              setIsLoading(false);
            }
          }}
          className="mt-4 disabled:opacity-75 disabled:cursor-not-allowed uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
        >
          <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14] flex items-center justify-center">
            {isLoading && <img src={LoadingImg} />}&nbsp;Lock
            {/* {genMsgTextBtn()} */}
          </div>
        </button>
      </div>
    </div>
  );
}
