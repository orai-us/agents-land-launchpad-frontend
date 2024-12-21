import React from "react";

import { twMerge } from "tailwind-merge";
import NumberFormat from "react-number-format";
import { SPL_DECIMAL } from "@/config";

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  setSlippage: (value) => void;
  slippage: string;
}

const Slippage: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  slippage,
  setSlippage,
}) => {
  return (
    <div
      className={twMerge(
        "fixed w-full inset-0 flex items-center justify-center z-50 backdrop-blur-md",
        !isOpen && "hidden"
      )}
    >
      <div className="flex w-full max-w-[400px] sm:max-w-xl flex-col p-6 rounded-lg gap-3 bg-[#13141D] relative">
        <div className="">
          <h2 className="text-[18px] font-medium text-[#fcfcfc]">
            Set Slippage
          </h2>
          <button
            onClick={() => {
              if (!slippage || !Number(slippage)) {
                setSlippage("0.3");
              }
              closeModal();
            }}
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
          <div className="mt-4 mb-8 text-[14px] text-[#9192A0]">
            Set your maximum price slippage. If the price changes beyond this,
            your transaction may not be successful.
          </div>

          <div className="flex relative mt-6">
            <NumberFormat
              placeholder={`Slippage . . .`}
              thousandSeparator
              className={
                "bg-transparent px-3 py-2 border border-[#9192A0] rounded w-full text-[#fcfcfc] focus:outline-none"
              }
              decimalScale={SPL_DECIMAL}
              type="text"
              value={slippage}
              onChange={() => {}}
              isAllowed={(values) => {
                const { floatValue } = values;
                // allow !floatValue to let user can clear their input
                return !floatValue || (floatValue >= 0 && floatValue <= 100);
              }}
              suffix="%"
              onValueChange={({ floatValue }) => {
                // if (floatValue) {
                setSlippage(floatValue);
                // } else {
                //   setSlippage("0.3");
                // }
              }}
            />
          </div>

          {/* <button
            disabled={!slippage
            }
            onClick={set}
            className="disabled:cursor-not-allowed mt-4 disabled:opacity-75 uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
          >
            <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14] flex items-center justify-center">
              {loading && <img src={LoadingImg} />}&nbsp;Trade
            </div>
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Slippage;
