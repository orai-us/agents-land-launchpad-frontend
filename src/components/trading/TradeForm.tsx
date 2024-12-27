import UserContext from '@/context/UserContext';
import { coinInfo } from '@/utils/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { errorAlert, successAlert } from '../others/ToastGroup';
import { Web3SolanaProgramInteraction } from '@/program/web3';
import { numberWithCommas } from '@/utils/format';
import solIcon from '@/assets/icons/sol_ic.svg';
import LoadingImg from '@/assets/icons/loading-button.svg';

import { debounce } from 'lodash';
import BigNumber from 'bignumber.js';
import { ALL_CONFIGS, SOL_DECIMAL, SPL_DECIMAL } from '@/config';
import Slippage from '../modals/Slippage';
import { toBN } from '@/utils/util';
import NumberFormat from 'react-number-format';
import { useGetCoinInfoState } from '@/zustand-store/coin/selector';
import CountdownPublic from './CountdownPublic';
import { web3FungibleStake } from '@/program/web3FungStake';
import { useGetConfigState } from '@/zustand-store/config/selector';
import { BN } from '@coral-xyz/anchor';
interface TradingFormProps {
  coin: coinInfo;
  progress: Number;
  curveLimit: number;
  isFromRpc: boolean;
}

const web3Solana = new Web3SolanaProgramInteraction();
const web3Stake = new web3FungibleStake();

export const TradeForm: React.FC<TradingFormProps> = ({
  coin,
  progress,
  curveLimit,
  isFromRpc,
}) => {
  const curveConfig = useGetConfigState('bondingCurveConfig');
  const stakeInfo = useGetCoinInfoState('stakeInfo');
  const curveInfo = useGetCoinInfoState('curveInfo');
  const [openSlippage, setOpenSlippage] = useState<boolean>(false);
  const [slippage, setSlippage] = useState<string>('0.3');
  const [loading, setLoading] = useState<boolean>(false);
  const [sol, setSol] = useState<string>('');
  const [simulateReceive, setSimulateReceive] = useState<string>('');
  const [isBuy, setIsBuy] = useState<number>(0);
  const [loadingEst, setLoadingEst] = useState<boolean>(false);
  const [tokenBal, setTokenBal] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);
  const { user } = useContext(UserContext);
  const [showCountdown, setShowCountdown] = useState<Boolean>(true);
  const [rewardAmt, setRewardAmt] = useState(0);
  const wallet = useWallet();
  const SolList = [
    { id: '', price: 'Reset' },
    { id: '0.1', price: '0.1 SOL' },
    { id: '0.5', price: '0.5 SOL' },
    { id: '1', price: '1 SOL' },
  ];
  const isCanBuyOnRaydium = isFromRpc && coin.listed;
  const isListedOnRay = !!coin.raydiumPoolAddr || isCanBuyOnRaydium; // Number(progress) >= 100 && ||
  const isDisableSwapOnAgent =
    Number(progress) >= 100 &&
    !coin.raydiumPoolAddr &&
    !coin.oraidexPoolAddr &&
    !coin.listed;

  const isShowLocked =
    stakeInfo && (stakeInfo['stakeAmount'] || new BN(0)).gtn(0);
  const partyStart = curveInfo?.partyStart?.toNumber();
  const publicStart = curveInfo?.publicStart?.toNumber();
  const isPartyStart =
    partyStart && partyStart * ALL_CONFIGS.TIMER.MILLISECONDS <= Date.now();
  const isPublicStart =
    publicStart && publicStart * ALL_CONFIGS.TIMER.MILLISECONDS <= Date.now();

  const showPublicCountdown = showCountdown && isPartyStart;

  const hasParty = isPartyStart && !isPublicStart && isShowLocked;

  const isOnParty = !isPublicStart && isPartyStart;

  const disableBuyOnParty = isBuy === 0 && isOnParty && !isShowLocked;
  const disableSellOnParty = isBuy === 1 && isOnParty;

  const fetchMaxBuy = async () => {
    if (coin.token) {
      console.log('=== Update Limit Buy ===');

      const isCreator = !wallet.publicKey
        ? false
        : wallet.publicKey.toBase58() ===
          (coin.creator['wallet'] || coin.creator);
      const boughtTokenAmount = toBN(tokenBal).minus(isCreator ? 10 ** 7 : 0);
      const rw = await web3Stake.getReward(wallet, ALL_CONFIGS.STAKE_CURRENCY_MINT, coin.token);
      const rwNumber = toBN(rw || 0)
        .div(10 ** coin.decimals || SPL_DECIMAL)
        .toNumber();
      const maxTokenBuyInParty = toBN(
        curveConfig.maxTokenBuyInParty?.toNumber() || 0
      )
        .div(10 ** coin.decimals || SPL_DECIMAL)
        .toNumber();
      const initRw =
        rwNumber < maxTokenBuyInParty ? rwNumber : maxTokenBuyInParty;

      const rwAmount = toBN(initRw)
        .minus(boughtTokenAmount.isLessThan(0) ? 0 : boughtTokenAmount)
        .toNumber();

      setRewardAmt(rwAmount);
    }
  };

  useEffect(() => {
    fetchMaxBuy();
  }, [partyStart, coin, tokenBal]);

  const fmtCurve = new BigNumber(
    new BigNumber(curveLimit).div(10 ** 9).toFixed(3, 1)
  )
    .plus(0.001)
    .toString();

  const isInsufficientFund =
    isBuy === 0
      ? new BigNumber(sol).isGreaterThan(solBalance)
      : new BigNumber(sol).isGreaterThan(tokenBal);

  const isNegativeAmount = new BigNumber(sol || 0).isLessThanOrEqualTo(0);
  const isExceedCurveLimit = new BigNumber(sol).isGreaterThan(fmtCurve);
  const canSimulate = (isBuy === 0 && !isExceedCurveLimit) || isBuy !== 0;

  const handleInputChange = (value: number) => {
    if (value || value === 0) {
      setSol(value.toString());
    } else {
      setSimulateReceive('');
      setSol(''); // Allow empty string to clear the input
    }
  };

  useEffect(() => {
    const isSimulateWhenExceedCurve =
      isBuy === 0 && toBN(sol).isGreaterThanOrEqualTo(fmtCurve);
    if (sol && !isNegativeAmount && coin.token) {
      (async () => {
        try {
          setLoadingEst(true);
          const amountWithDecimal = new BigNumber(sol)
            .multipliedBy(
              new BigNumber(10).pow(isBuy ? coin.decimals : SOL_DECIMAL)
            )
            .toFixed(0, 1);
          const mint = new PublicKey(coin.token);

          let receive = '';
          if (!isListedOnRay) {
            let amt = amountWithDecimal;
            if (isSimulateWhenExceedCurve) {
              amt = new BigNumber(fmtCurve)
                .multipliedBy(
                  new BigNumber(10).pow(isBuy ? coin.decimals : SOL_DECIMAL)
                )
                .toFixed(0, 1);
            }
            receive = await web3Solana.simulateSwapTx(mint, wallet, amt, isBuy);
          } else {
            const { numerator, denominator } =
              await web3Solana.simulateRaydiumSwapTx(
                mint,
                wallet,
                amountWithDecimal,
                isBuy,
                coin.raydiumPoolAddr
              );

            receive = (numerator || 0).toString();

            console.log('receive', receive);
          }

          setSimulateReceive(() =>
            new BigNumber(receive)
              .div(new BigNumber(10).pow(!isBuy ? coin.decimals : SOL_DECIMAL))
              .toString()
          );
        } catch (error) {
          console.log('simulate failed', error);
        } finally {
          setLoadingEst(false);
        }
      })();
    } else {
      setSimulateReceive(() => '');
    }
  }, [sol, coin]); // curveLimit

  const getBalance = async () => {
    if (!wallet.publicKey) {
      setTokenBal(0);
      setSolBalance(0);
      return;
    }

    if (!coin.token) {
      return;
    }

    try {
      const [tokenBal, solBal] = await Promise.all([
        web3Solana.getTokenBalance(wallet.publicKey.toString(), coin.token),
        web3Solana.getSolanaBalance(wallet.publicKey),
      ]);

      setTokenBal(tokenBal ? tokenBal : 0);
      setSolBalance(solBal ? solBal : 0);
    } catch (error) {
      console.log('error', error);
      // setTokenBal(0);
      // setSolBalance(0);
    }
  };

  useEffect(() => {
    getBalance();
  }, [coin?.token, wallet.publicKey]);

  const handlTrade = async () => {
    try {
      setLoading(true);
      const mint = new PublicKey(coin.token);
      let res;
      if (!isListedOnRay) {
        res = await web3Solana.swapTx(
          mint,
          wallet,
          sol,
          isBuy,
          simulateReceive,
          slippage,
          hasParty
        );
      } else {
        res = await web3Solana.raydiumSwapTx(
          mint,
          wallet,
          sol,
          isBuy,
          coin.raydiumPoolAddr,
          slippage
        );
      }

      if (res) {
        console.log('res', res);
        successAlert('Submit successfully!');
        await getBalance();
        // await fetchMaxBuy();
      } else {
        errorAlert('Transaction Failed!');
      }

      return res;
    } catch (error) {
      console.log('error trade', error);
      errorAlert('Transaction Failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-6 rounded-b-lg md:rounded-lg bg-[#13141D] text-[#9192A0] w-full">
      {isListedOnRay && (
        <div className="animate-pulse animate-infinite pb-4 text-[#E8E9EE] text-center">
          Trade via Raydium
        </div>
      )}

      {showPublicCountdown && (
        <div className="mb-2">
          <CountdownPublic
            endTime={publicStart}
            onEnd={() => {
              console.log('Party round end');
              setShowCountdown(false);
            }}
          />
        </div>
      )}

      <div className="flex flex-row justify-center items-center w-full gap-2 text-[#E8E9EE] uppercase text-[14px]">
        <button
          className={`uppercase rounded py-2 h-12 w-full ${
            isBuy === 0
              ? 'bg-[#9FF4CF] text-[#080A14]'
              : 'bg-[#1A1C28] hover:brightness-125'
          }`}
          onClick={() => {
            setIsBuy(0);
            setSol('');
          }}
        >
          {' '}
          Buy
        </button>
        <button
          className={`uppercase rounded py-2 h-12 w-full ${
            isBuy === 1
              ? 'bg-[#E75787] text-[#080A14]'
              : 'bg-[#1A1C28] hover:brightness-125'
          }`}
          onClick={() => {
            setIsBuy(1);
            setSol('');
          }}
        >
          Sell
        </button>
      </div>
      <div className="flex flex-col relative">
        <div className="flex justify-between items-center mt-3 mb-3">
          {/* <label
            htmlFor="name"
            className="rounded bg-transparent text-ml font-medium text-[#9192A0] md:text-[12px] flex"
          >
            Switch to {coin.ticker} &nbsp;
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.3949 2.16715C10.1721 1.94431 9.81088 1.94428 9.58805 2.16707C9.36521 2.38986 9.36518 2.75111 9.58797 2.97394L12.0523 5.4388H2.57054C2.25544 5.4388 2 5.69424 2 6.00935C2 6.32445 2.25544 6.57989 2.57054 6.57989L13.1993 6.57989C13.2389 6.57989 13.2775 6.57586 13.3148 6.5682C13.4962 6.60522 13.6921 6.55339 13.8328 6.4127C14.0557 6.18991 14.0557 5.82866 13.8329 5.60583L10.3949 2.16715ZM13.4294 10.1294C13.7445 10.1294 14 9.87393 14 9.55882C14 9.24372 13.7445 8.98828 13.4294 8.98828L2.80064 8.98828C2.76223 8.98828 2.72471 8.99208 2.68843 8.99931C2.50617 8.96105 2.30881 9.01267 2.16729 9.15417C1.94446 9.37696 1.94442 9.7382 2.16721 9.96104L5.60522 13.3997C5.82801 13.6226 6.18926 13.6226 6.41209 13.3998C6.63492 13.177 6.63496 12.8158 6.41217 12.5929L3.94909 10.1294H13.4294Z"
                fill="#9192A0"
              />
            </svg>
          </label> */}
          <div>
            {!isListedOnRay && isBuy === 0 && !!curveLimit && (
              <button
                disabled={!curveLimit}
                onClick={() => setSol(fmtCurve)}
                className="underline text-center disabled:cursor-not-allowed text-[10px] text-[#9192A0] md:text-[12px] font-medium hover:brightness-150 cursor-pointer"
              >
                Max Bonding Curve Limit:{' '}
                {numberWithCommas(new BigNumber(fmtCurve).toNumber())} SOL
              </button>
            )}
          </div>
          <div>
            {openSlippage && (
              <Slippage
                isOpen={openSlippage}
                setSlippage={(value) => setSlippage(value)}
                closeModal={() => setOpenSlippage(false)}
                slippage={slippage}
              />
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="cursor-pointer"
              onClick={() => setOpenSlippage(true)}
            >
              <path
                d="M16.2617 10C16.2617 9.17969 16.7734 8.48047 17.5 8.19922C17.3086 7.39844 16.9922 6.64844 16.5742 5.96875C16.3242 6.07812 16.0586 6.13672 15.7891 6.13672C15.2969 6.13672 14.8047 5.94922 14.4258 5.57422C13.8438 4.99219 13.7148 4.13672 14.0273 3.42578C13.3516 3.00781 12.5977 2.69141 11.8008 2.5C11.5234 3.22266 10.8203 3.73828 10 3.73828C9.17969 3.73828 8.47656 3.22266 8.19922 2.5C7.39844 2.69141 6.64844 3.00781 5.96875 3.42578C6.28516 4.13281 6.15234 4.99219 5.57031 5.57422C5.19531 5.94922 4.69922 6.13672 4.20703 6.13672C3.9375 6.13672 3.67188 6.08203 3.42187 5.96875C3.00781 6.65234 2.69141 7.40234 2.5 8.20312C3.22266 8.48047 3.73828 9.17969 3.73828 10.0039C3.73828 10.8242 3.22656 11.5234 2.50391 11.8047C2.69531 12.6055 3.01172 13.3555 3.42969 14.0352C3.67969 13.9258 3.94531 13.8711 4.21094 13.8711C4.70313 13.8711 5.19531 14.0586 5.57422 14.4336C6.15234 15.0117 6.28516 15.8711 5.97266 16.5781C6.65234 16.9961 7.40625 17.3125 8.20312 17.5039C8.48047 16.7812 9.17969 16.2695 10 16.2695C10.8203 16.2695 11.5195 16.7812 11.7969 17.5039C12.5977 17.3125 13.3477 16.9961 14.0273 16.5781C13.7148 15.8711 13.8477 15.0156 14.4258 14.4336C14.8008 14.0586 15.293 13.8711 15.7891 13.8711C16.0547 13.8711 16.3242 13.9258 16.5703 14.0352C16.9883 13.3555 17.3047 12.6016 17.4961 11.8047C16.7773 11.5234 16.2617 10.8242 16.2617 10ZM10.0352 13.1211C8.30469 13.1211 6.91016 11.7188 6.91016 9.99609C6.91016 8.27344 8.30469 6.87109 10.0352 6.87109C11.7656 6.87109 13.1602 8.27344 13.1602 9.99609C13.1602 11.7188 11.7656 13.1211 10.0352 13.1211Z"
                fill="#9192A0"
              />
            </svg>
          </div>
        </div>

        <div className="px-4 w-full flex flex-row items-center bg-transparent border-[1px] border-[#30344A] rounded">
          <div className="py-2">
            {/* <input
              type="number"
              id="setTrade"
              value={sol}
              onChange={handleInputChange}
              pattern="\d*"
              className="w-full outline-none capitalize bg-transparent text-[#E8E9EE] placeholder:text-[#585A6B] text-[24px]"
              placeholder="0.0"
              required
            /> */}
            <NumberFormat
              placeholder={`0.0`}
              thousandSeparator
              className="w-full outline-none capitalize bg-transparent text-[#E8E9EE] placeholder:text-[#585A6B] text-[24px]"
              decimalScale={SPL_DECIMAL}
              type="text"
              value={sol}
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
              {isBuy !== 0
                ? numberWithCommas(tokenBal, undefined, {
                    maximumFractionDigits: 6,
                  })
                : numberWithCommas(solBalance, undefined, {
                    maximumFractionDigits: 6,
                  })}{' '}
              {isBuy === 0 ? 'SOL' : coin.ticker}
            </span>
          </div>

          {isBuy === 0 ? (
            <div className="flex w-fit text-[#E8E9EE] text-[14px] rounded-[32px] bg-[#080A14] py-1 px-4 justify-center items-center h-8">
              SOL
              <img
                src={solIcon}
                alt="solIcon"
                width={20}
                height={20}
                className="ml-1 w-5 h-5 rounded-full border border-[#30344A] object-cover"
              />
            </div>
          ) : (
            <div className="flex w-fit text-[#E8E9EE] text-[14px] rounded-[32px] bg-[#080A14] py-1 px-4 justify-center items-center h-8">
              {coin.ticker}
              {coin.url && (
                <img
                  src={coin.url}
                  alt="coinIcon"
                  width={20}
                  height={20}
                  className="ml-1 w-5 h-5 rounded-full border border-[#30344A] object-cover"
                />
              )}
            </div>
          )}
        </div>
        {isBuy === 0 ? (
          <div className="flex flex-row py-2 gap-3">
            {SolList.map((item: any, index: any) => {
              return (
                <div
                  key={`list-sol-${index}`}
                  className="text-center flex-1 text-[10px] border-[#30344A] bg-[#080A14] rounded px-2 py-1 text-[#9192A0] md:text-[12px] font-medium border-[1px] hover:brightness-125 cursor-pointer"
                  onClick={() => setSol(item.id)}
                >
                  {item.price}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-row py-2 gap-3">
            <div
              className="text-center flex-1 text-[10px] border-[#30344A] bg-[#080A14] rounded px-2 py-1 text-[#9192A0] md:text-[12px] font-medium border-[1px] hover:brightness-125 cursor-pointer"
              onClick={() => setSol('')}
            >
              Reset
            </div>
            <div
              className="text-center flex-1 text-[10px] border-[#30344A] bg-[#080A14] rounded px-2 py-1 text-[#9192A0] md:text-[12px] font-medium border-[1px] hover:brightness-125 cursor-pointer"
              onClick={() => setSol(toBN(tokenBal).div(10).toFixed(6, 1))}
            >
              10%
            </div>
            <div
              className="text-center flex-1 text-[10px] border-[#30344A] bg-[#080A14] rounded px-2 py-1 text-[#9192A0] md:text-[12px] font-medium border-[1px] hover:brightness-125 cursor-pointer"
              onClick={() => setSol(toBN(tokenBal).div(4).toFixed(6, 1))}
            >
              25%
            </div>
            <div
              className="text-center flex-1 text-[10px] border-[#30344A] bg-[#080A14] rounded px-2 py-1 text-[#9192A0] md:text-[12px] font-medium border-[1px] hover:brightness-125 cursor-pointer"
              onClick={() => setSol(toBN(tokenBal).div(2).toFixed(6, 1))}
            >
              50%
            </div>
            <div
              className="text-center flex-1 text-[10px] border-[#30344A] bg-[#080A14] rounded px-2 py-1 text-[#9192A0] md:text-[12px] font-medium border-[1px] hover:brightness-125 cursor-pointer"
              onClick={() => setSol(toBN(tokenBal).toFixed(6, 1))}
            >
              100%
            </div>
          </div>
        )}

        {/* {progress === 100 ? (
          <div className="text-[10px] border-[1px] border-[#143F72] cursor-not-allowed w-full text-center rounded-lg hover:bg-slate-500 py-2">
            Trade
          </div>
        ) : ( */}

        <div className="mt-2 flex items-center gap-1">
          Receive: ≈{' '}
          {isInsufficientFund ? (
            '--'
          ) : !loadingEst ? (
            simulateReceive ? (
              numberWithCommas(
                new BigNumber(simulateReceive || 0).toNumber(),
                undefined,
                { maximumFractionDigits: 6 }
              )
            ) : (
              '--'
            )
          ) : (
            <img src={LoadingImg} />
          )}{' '}
          {!isBuy ? coin.ticker : 'SOL'}
        </div>
        {isBuy === 0 && isShowLocked && !isPublicStart && (
          <div className="mt-2 flex items-center gap-1">
            Max buy amounts: {numberWithCommas(rewardAmt)} {coin.ticker}
          </div>
        )}
        {isBuy === 1 && disableSellOnParty && (
          <div className="mt-2 flex items-center gap-1 text-[12px]">
            * You are not allow to sell token in party round
          </div>
        )}

        <button
          disabled={
            !sol ||
            !wallet.publicKey ||
            loading ||
            isInsufficientFund ||
            isDisableSwapOnAgent ||
            isNegativeAmount ||
            disableBuyOnParty ||
            disableSellOnParty
          }
          onClick={handlTrade}
          className="disabled:cursor-not-allowed mt-4 disabled:opacity-75 uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
        >
          <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14] flex items-center justify-center">
            {loading && <img src={LoadingImg} />}&nbsp;Trade
          </div>
        </button>
        {/* )} */}
      </div>
    </div>
  );
};
