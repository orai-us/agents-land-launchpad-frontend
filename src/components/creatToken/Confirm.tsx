import solIcon from '@/assets/icons/sol_ic.svg';
import React, { ChangeEvent } from 'react';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  quantity: number;
  setQuantity: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onConfirm: () => Promise<void>;
}

const ConfirmModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  quantity,
  setQuantity,
  onConfirm,
}) => {
  return (
    <div
      className={twMerge(
        'fixed w-full inset-0 flex items-center justify-center z-50 backdrop-blur-md',
        !isOpen && 'hidden',
      )}
    >
      <div className="flex w-full max-w-[480px] sm:max-w-xl flex-col p-6 rounded-lg gap-3 bg-[#13141D] relative">
        <div className="">
          <h2 className="text-[18px] font-medium">
            Select quantity of Token (Optional)
          </h2>
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
          <div className="w-full bg-[#080A14] border border-[#1A1C28] rounded-lg p-4 text-[14px] font-medium mt-8">
            <span className="text-[#FCFCFC]">Tip:</span>&nbsp;
            <span className="text-[#9192A0]">
              its optional but buying a small amount of tokens helps protect
              your coin from snipers
            </span>
          </div>
          <div className="mt-6">
            <label
              htmlFor="presale"
              className="uppercase text-[12px] font-medium text-[#9192A0]"
            >
              quantity (Optional: 0 ~ 1.5 SOL)
            </label>
            <div className="flex relative h-[56px] justify-between items-center border px-3 border-[#30344A] rounded mt-3">
              <input
                role="presentation"
                autoComplete="off"
                id="presale"
                type="number"
                placeholder="0.0"
                value={quantity || ''}
                onChange={setQuantity}
                className="outline-none focus:outline-none w-full rounded text-[#E8E9EE] placeholder:text-[#585A6B] bg-transparent text-[24px]"
              />
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
            </div>
          </div>
          <button
            onClick={onConfirm}
            // disabled={!formValid || isLoading}
            className="disabled:opacity-75 mt-8 w-full disabled:cursor-not-allowed uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
          >
            <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14]">
              CREATE TOKEN
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
