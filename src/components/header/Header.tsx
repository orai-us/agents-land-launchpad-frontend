import LogoFullIcon from '@/assets/icons/logo.svg';
import { ALL_CONFIGS, SOL_PRICE_KEY } from '@/config';
import UserContext from '@/context/UserContext';
import { Web3SolanaProgramInteraction } from '@/program/web3';
import { web3FungibleStake } from '@/program/web3FungStake';
import { SimpleSnapshotContractQueryClient as AgentsLandSnapshotContractQueryClient } from '@/sdk/oraiAgentSdk';
import { getSolPriceInUSD } from '@/utils/util';
import { useCoinActions } from '@/zustand-store/coin/selector';
import {
  useConfigActions,
  useGetConfigState,
} from '@/zustand-store/config/selector';
import { getProvider } from '@coral-xyz/anchor';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { PublicKey } from '@solana/web3.js';
import { FC, useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ConnectButton } from '../buttons/ConnectButton';
import HowItWorkModal from '../modals/HowItWork';
import SettingModal from '../modals/Setting';
import Banner from './Banner';
import MarqueeToken from './MarqueeToken';

const web3Solana = new Web3SolanaProgramInteraction();
const web3FungStake = new web3FungibleStake();

const Header: FC = () => {
  const {
    handleSetBondingCurveConfig,
    handleSetStakeConfig,
    handleSetSnapshotConfig,
  } = useConfigActions();
  const { handleSetStakeConfig: handleStrongboxConfig } = useCoinActions();
  const bondingCurveConfig = useGetConfigState('bondingCurveConfig');
  const stakeConfig = useGetConfigState('stakeConfig');
  const configSnapshot = useGetConfigState('configSnapshot');
  const [pathname] = useLocation();
  const { solPrice, setSolPrice, setRpcUrl, rpcUrl } = useContext(UserContext);
  const [isOpenMobileMenu, setOpenMobileMenu] = useState(false);
  const [showStepWork, setShowStepWork] = useState(false);
  const [isOpenSetting, setIsOpenSetting] = useState(false);

  // useEffect(() => {
  //   if (configSnapshot.length > 0) {
  //     return;
  //   }

  //   (async () => {
  //     try {
  //       const oraiEndpoint = 'https://rpc.orai.io';
  //       const whitelistContractAddress =
  //         'orai14z64p3yp8rv99ewvycpeef7h4jlyqwmpyt63m86wyyh0dhjxhqescyclm0';

  //       const cwClient = await CosmWasmClient.connect(oraiEndpoint);
  //       const contract = new AgentsLandSnapshotContractQueryClient(
  //         cwClient,
  //         whitelistContractAddress,
  //       );
  //       const dataSnap = await contract.tokensMetadata();

  //       const res = (dataSnap || []).map((e) => {
  //         return {
  //           ...e,
  //           metadata: JSON.parse(Buffer.from(e.metadata, 'base64').toString()),
  //         };
  //       });

  //       handleSetSnapshotConfig(res);
  //     } catch (error) {
  //       console.log('error get snapshot', error);
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    (async () => {
      if (!bondingCurveConfig) {
        const config = await web3Solana.getConfigCurve();
        if (config) {
          console.log('config', {
            config,
            curveLimit: config.curveLimit.toNumber(),
          });
          handleSetBondingCurveConfig(config);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!stakeConfig) {
        const configStake = await web3FungStake.getStakeConfig(
          new PublicKey(ALL_CONFIGS.STAKE_CURRENCY_MINT),
        );

        if (configStake) {
          handleSetStakeConfig(configStake);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const price = await getSolPriceInUSD();
        setSolPrice(price);
        localStorage.setItem(SOL_PRICE_KEY, price);
      } catch (error) {
        console.log('error sol price', error);
      }
    };

    if (!solPrice) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (pathname && isOpenMobileMenu) {
      setOpenMobileMenu(false);
    }
  }, [pathname]);

  const menu = [
    {
      text: 'Launch',
      link: '/create-coin',
    },
    {
      text: 'How it works?',
      onClick: () => setShowStepWork(true),
    },
    {
      text: 'Strongbox Vaults',
      link: '/vaults',
    },
    {
      onClick: () => {
        window.open('https://docs.agents.land');
      },
      text: 'Docs',
    },
  ];

  return (
    <>
      <SettingModal
        isOpen={isOpenSetting}
        closeModal={() => setIsOpenSetting(false)}
      />
      <HowItWorkModal
        isOpen={showStepWork}
        closeModal={() => setShowStepWork(false)}
      />
      {/* <MarqueeToken /> */}
      <header className="relative z-10 w-full h-[72px] md:h-[96px] bg-[#13141D] m-auto flex justify-center items-center border-b border-solid border-[rgba(88,90,107,0.24)]">
        <div className="py-6 px-2 flex justify-between items-center max-w-[1216px] w-full h-full">
          <div className="flex gap-2 items-center">
            <Link href="/">
              <img src={LogoFullIcon} alt="LogoFullIcon" />
            </Link>
            <div className="hidden md:flex">
              {menu.map((item, key) => {
                return item.onClick ? (
                  <button
                    onClick={item.onClick}
                    key={key}
                    className="flex items-center h-12 font-medium text-base text-[#E8E9EE] brightness-75 hover:brightness-125 ml-6"
                  >
                    {item.text}
                  </button>
                ) : (
                  <Link
                    href={item.link}
                    key={key}
                    className="flex items-center h-12 font-medium text-base text-[#E8E9EE] brightness-75 hover:brightness-125 ml-6"
                  >
                    {item.text}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <ConnectButton setSettingModal={setIsOpenSetting} />

            <button
              onClick={() => {
                setIsOpenSetting(true);
              }}
              className="w-full px-2 py-3 rounded bg-[#1A1C28] shadow-btn-inner text-[#E8E9EE] tracking-[0.32px] group relative cursor-pointer flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
              >
                <circle cx="4" cy="4" r="4" fill="#9FF4CF" />
              </svg>
              <span>RPC</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M5.99997 6.99121L1.9195 3.07246C1.81872 2.97402 1.65232 2.97637 1.54919 3.07715L0.832005 3.77793C0.72888 3.87871 0.726536 4.04277 0.827317 4.14121L5.81013 8.92715C5.86169 8.97871 5.932 9.00215 5.99997 8.99746C6.07029 8.9998 6.13826 8.97637 6.18982 8.92715L11.175 4.14121C11.2758 4.04277 11.2734 3.87871 11.1703 3.77793L10.4531 3.07715C10.35 2.97637 10.1836 2.97402 10.0828 3.07246L5.99997 6.99121Z"
                  fill="#585A6B"
                />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 items-center justify-center md:hidden cursor-pointer ">
            <button
              onClick={() => {
                setIsOpenSetting(true);
              }}
              className="w-full px-2 py-3 rounded bg-[#1A1C28] shadow-btn-inner text-[#E8E9EE] tracking-[0.32px] group relative cursor-pointer flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
              >
                <circle cx="4" cy="4" r="4" fill="#9FF4CF" />
              </svg>
              <span>RPC</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M5.99997 6.99121L1.9195 3.07246C1.81872 2.97402 1.65232 2.97637 1.54919 3.07715L0.832005 3.77793C0.72888 3.87871 0.726536 4.04277 0.827317 4.14121L5.81013 8.92715C5.86169 8.97871 5.932 9.00215 5.99997 8.99746C6.07029 8.9998 6.13826 8.97637 6.18982 8.92715L11.175 4.14121C11.2758 4.04277 11.2734 3.87871 11.1703 3.77793L10.4531 3.07715C10.35 2.97637 10.1836 2.97402 10.0828 3.07246L5.99997 6.99121Z"
                  fill="#585A6B"
                />
              </svg>
            </button>
            <div onClick={() => setOpenMobileMenu(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20.25 8.25H3.75C3.3375 8.25 3 7.9125 3 7.5C3 7.0875 3.3375 6.75 3.75 6.75H20.25C20.6625 6.75 21 7.0875 21 7.5C21 7.9125 20.6625 8.25 20.25 8.25Z"
                  fill="#9192A0"
                />
                <path
                  d="M20.25 12.75H3.75C3.3375 12.75 3 12.4125 3 12C3 11.5875 3.3375 11.25 3.75 11.25H20.25C20.6625 11.25 21 11.5875 21 12C21 12.4125 20.6625 12.75 20.25 12.75Z"
                  fill="#9192A0"
                />
                <path
                  d="M20.25 17.25H3.75C3.3375 17.25 3 16.9125 3 16.5C3 16.0875 3.3375 15.75 3.75 15.75H20.25C20.6625 15.75 21 16.0875 21 16.5C21 16.9125 20.6625 17.25 20.25 17.25Z"
                  fill="#9192A0"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div
        className={
          'fixed inset-0 z-50 flex flex-col bg-[#13141D] transition-all w-screen pb-5' +
          ` ${isOpenMobileMenu ? '' : 'translate-x-[-100%]'}`
        }
      >
        <div className="flex h-[72px] items-center justify-between border-b border-[#1A1C28] px-2">
          <Link href="/">
            <img src={LogoFullIcon} alt="LogoFullIcon" />
          </Link>

          <div
            className="cursor-pointer"
            onClick={() => setOpenMobileMenu(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M13.5909 12.5L18.0441 8.04687C18.2554 7.8359 18.3743 7.54962 18.3745 7.25099C18.3748 6.95237 18.2564 6.66587 18.0455 6.45453C17.8345 6.24319 17.5482 6.12431 17.2496 6.12404C16.951 6.12378 16.6645 6.24215 16.4531 6.45312L12 10.9062L7.54687 6.45312C7.33553 6.24178 7.04888 6.12305 6.75 6.12305C6.45111 6.12305 6.16447 6.24178 5.95312 6.45312C5.74178 6.66447 5.62305 6.95111 5.62305 7.25C5.62305 7.54888 5.74178 7.83553 5.95312 8.04687L10.4062 12.5L5.95312 16.9531C5.74178 17.1645 5.62305 17.4511 5.62305 17.75C5.62305 18.0489 5.74178 18.3355 5.95312 18.5469C6.16447 18.7582 6.45111 18.8769 6.75 18.8769C7.04888 18.8769 7.33553 18.7582 7.54687 18.5469L12 14.0937L16.4531 18.5469C16.6645 18.7582 16.9511 18.8769 17.25 18.8769C17.5489 18.8769 17.8355 18.7582 18.0469 18.5469C18.2582 18.3355 18.3769 18.0489 18.3769 17.75C18.3769 17.4511 18.2582 17.1645 18.0469 16.9531L13.5909 12.5Z"
                fill="#9192A0"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1 px-[24px]">
          {menu?.map((item, i) =>
            item.onClick ? (
              <button
                onClick={() => {
                  item.onClick();
                  setOpenMobileMenu(false);
                }}
                key={i}
                className="flex items-center h-12 font-medium text-base text-[#E8E9EE] brightness-75 hover:brightness-125"
              >
                {item.text}
              </button>
            ) : (
              <Link
                href={item.link}
                key={i}
                className="flex items-center h-12 font-medium text-base text-[#E8E9EE] brightness-75 hover:brightness-125"
              >
                {item.text}
              </Link>
            ),
          )}
        </div>
        <div className="w-full">
          <ConnectButton
            setSettingModal={(val) => {
              setIsOpenSetting(val);
              setOpenMobileMenu(false);
            }}
          />
        </div>
      </div>
      {pathname === '/' && <Banner />}
    </>
  );
};
export default Header;
