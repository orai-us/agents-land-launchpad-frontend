"use client"
import { FC, useContext, useMemo } from "react";
import { ConnectButton } from "../buttons/ConnectButton";
import { useRouter } from "next/navigation";
import { PiLightning } from "react-icons/pi";

interface HeaderProps {
  staked: number;
}
const Header: FC = () => {
  const router = useRouter()

  const handleToRouter = (id: string) => {
    router.push(id)
  }
  return (
    <div className="w-full h-[100px] flex flex-col justify-center items-center">
      <div className="container">
        <div className="w-full h-full flex flex-row justify-between items-center px-5">
          <div onClick={() => handleToRouter('/')} className="p-2 text-xl text-white flex flex-col justify-center items-center border-[1px] border-white rounded-full cursor-pointer">
            <PiLightning />
          </div>
          <div className="flex flex-col">
            <ConnectButton></ConnectButton>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
