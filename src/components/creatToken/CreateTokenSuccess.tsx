import successIcon from "@/assets/icons/success_circle.svg";
import React from "react";

import { launchDataInfo } from "@/utils/types";
import { PublicKey } from "@solana/web3.js";
import { twMerge } from "tailwind-merge";
import { useLocation } from "wouter";

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  coin: launchDataInfo & { token: PublicKey; result: any } & { jsonData: any };
}

const CreateTokenSuccess: React.FC<ModalProps> = ({
  isOpen,
  coin,
  closeModal,
}) => {
  const [, setLocation] = useLocation();
  const {
    token = "",
    symbol = "",
    jsonData = {},
  } = coin || { token: "", symbol: "", jsonData: {} };

  return (
    <div
      className={twMerge(
        "fixed w-screen inset-0 flex items-center justify-center z-50 backdrop-blur-md",
        !isOpen && "hidden"
      )}
    >
      <div className="flex w-full max-w-[480px] flex-col p-6 rounded-lg gap-3 bg-[#13141D] relative justify-center items-center">
        <button
          onClick={() => closeModal()}
          className="absolute top-6 right-6 text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <img
          src={successIcon}
          alt="successIcon"
          className="w-10 h-10 rounded-full mt-2"
        />
        <div className="mt-6 text-[18px] text-[#E8E9EE]">
          New Token Created!
        </div>
        <div className="flex items-center justify-center w-full gap-2 flex-wrap mt-2 mb-8">
          <img
            src={jsonData.image || ""}
            alt="coinImg"
            className="w-14 h-14 rounded-full"
          />
          <span className="uppercase text-[#9192A0] text-[18px] font-semibold">
            ${symbol || "--"}
          </span>
        </div>

        <a
          href={!token ? "/" : `/trading/${token.toString()}`}
          target="_blank"
          className="disabled:opacity-75 w-full disabled:cursor-not-allowed uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
        >
          <div className="text-center uppercase rounded bg-white px-6 py-2 text-[#080A14]">
            View
          </div>
        </a>
      </div>
    </div>
  );
};

export default CreateTokenSuccess;
