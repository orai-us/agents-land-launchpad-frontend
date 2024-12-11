import successIcon from "@/assets/icons/success_circle.svg";
import React from "react";

import { launchDataInfo } from "@/utils/types";
import { PublicKey } from "@solana/web3.js";
import { twMerge } from "tailwind-merge";
import { useLocation } from "wouter";

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  coin: launchDataInfo & { token: PublicKey; result: any };
}

const CreateTokenSuccess: React.FC<ModalProps> = ({ isOpen, coin }) => {
  const [, setLocation] = useLocation();
  const { token = "", symbol = "" } = coin || { token: "", symbol: "" };

  return (
    <div
      className={twMerge(
        "fixed w-screen inset-0 flex items-center justify-center z-50 backdrop-blur-md",
        !isOpen && "hidden"
      )}
    >
      <div className="flex w-full max-w-[480px] flex-col p-6 rounded-lg gap-3 bg-[#13141D] relative justify-center items-center">
        <img
          src={successIcon}
          alt="successIcon"
          className="w-10 h-10 rounded-full mt-2"
        />
        <div className="mt-6 text-[18px] text-[#E8E9EE]">
          New Token Created!
        </div>
        <div className="uppercase mt-2 mb-8 text-[14px] text-[#9192A0]">
          ${symbol || "--"}
        </div>

        <button
          onClick={() =>
            setLocation(!token ? "/" : `/trading/${token.toString()}`)
          }
          className="disabled:opacity-75 w-full disabled:cursor-not-allowed uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
        >
          <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14]">
            View
          </div>
        </button>
      </div>
    </div>
  );
};

export default CreateTokenSuccess;
