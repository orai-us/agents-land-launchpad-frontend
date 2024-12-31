import UserContext from '@/context/UserContext';
import React, { ChangeEvent, useContext, useState } from 'react';

import { RPC_MAPS } from '@/config';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const SettingModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { rpcUrl, setRpcUrl } = useContext(UserContext);
  const [inputRpcType, setInputRpcType] = useState<string>('Agents');
  const [customUrl, setCustomUrl] = useState<string>(RPC_MAPS['Custom']);
  const [tab, setTab] = useState<string>(RPC_MAPS.Agents);
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setCustomUrl(e.target.value);
  };

  const handleSetRpcType = (rpcType: string) => {
    setTab(RPC_MAPS[rpcType]);
    setInputRpcType(rpcType);
    if (rpcType !== 'Custom') {
      setRpcUrl(RPC_MAPS[rpcType]);
    }
  };

  return (
    <div
      className={twMerge(
        'fixed w-full inset-0 flex items-center justify-center z-50 backdrop-blur-md',
        !isOpen && 'hidden',
      )}
    >
      <div className="flex w-full max-w-[580px] sm:max-w-xl flex-col p-6 rounded-lg gap-3 bg-[#13141D] relative">
        <div className="">
          <h2 className="text-[18px] font-medium">Settings</h2>
          <button
            onClick={() => closeModal()}
            className="absolute top-6 right-6 text-gray-600"
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
          </button>
          <div className="mt-4 mb-8 text-[14px] text-[#9192A0]">RPC URL</div>
          <div className="w-full flex justify-start flex-wrap gap-2 items-center rounded-lg">
            {Object.entries(RPC_MAPS)
              .filter(([k, v]) => !!v)
              .map(([rpcType, rpcUrl], i) => {
                return (
                  <div id={rpcType} key={i}>
                    <button
                      className={twMerge(
                        'uppercase cursor-pointer px-2 md:px-4 py-[6px] text-[12px] md:text-[14px] rounded border border-[#30344A] bg-[#080A14] text-[#9192A0]',
                        tab === rpcUrl && 'border-[#E8E9EE] text-[#E8E9EE]',
                      )}
                      onClick={() => handleSetRpcType(rpcType)}
                    >
                      {rpcType}
                    </button>
                  </div>
                );
              })}
          </div>
          <input
            autoComplete="off"
            disabled={inputRpcType !== 'Custom'}
            id="ticker"
            type="text"
            value={
              inputRpcType === 'Custom' ? customUrl : RPC_MAPS[inputRpcType]
            }
            onChange={handleChange}
            onBlur={() => {
              setRpcUrl(customUrl);
            }}
            className={twMerge(
              `outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded h-12 text-[#E8E9EE] bg-transparent`,
              inputRpcType !== 'Custom' && 'opacity-50',
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingModal;
