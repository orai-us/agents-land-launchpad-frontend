"use client";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  successAlert,
  errorAlert,
  infoAlert,
} from "@/components/others/ToastGroup";
import base58 from "bs58";
import UserContext from "@/context/UserContext";
import { confirmWallet, walletConnect } from "@/utils/util";
import { userInfo } from "@/utils/types";
import { useRouter } from "next/navigation";
import { RiExchangeDollarLine } from "react-icons/ri";
import { VscDebugDisconnect } from "react-icons/vsc";
import { TbMoodEdit } from "react-icons/tb";
import Link from "next/link";
import Image from "next/image";

export const ConnectButton: FC = () => {
  const router = useRouter();
  const { user, setUser, login, setLogin, isLoading, setIsLoading } =
    useContext(UserContext);
  const {
    publicKey,
    disconnect,
    connect,
    signMessage,
    connecting,
    wallet,
    wallets,
    select,
  } = useWallet();
  const { visible, setVisible } = useWalletModal();

  const tempUser = useMemo(() => user, [user]);

  console.log("user", user);

  useEffect(() => {
    const handleClick = async () => {
      if (publicKey && !login) {
        const updatedUser: userInfo = {
          name: publicKey.toBase58().slice(0, 6),
          wallet: publicKey.toBase58(),
          isLedger: false,
        };
        await sign(updatedUser);
      }
    };
    handleClick();
  }, [publicKey, login]); // Removed `connect`, `wallet`, and `disconnect` to prevent unnecessary calls

  const sign = async (updatedUser: userInfo) => {
    try {
      const connection = await walletConnect({ data: updatedUser });
      if (!connection) return;
      if (connection.nonce === undefined) {
        const newUser = {
          name: connection.name,
          wallet: connection.wallet,
          _id: connection._id,
          avatar: connection.avatar,
        };
        setUser(newUser as userInfo);
        setLogin(true);
        return;
      }

      const msg = new TextEncoder().encode(
        `Nonce to confirm: ${connection.nonce}`
      );

      const sig = await signMessage?.(msg);
      const res = base58.encode(sig as Uint8Array);
      const signedWallet = { ...connection, signature: res };
      const confirm = await confirmWallet({ data: signedWallet });

      if (confirm) {
        setUser(confirm);
        setLogin(true);
        setIsLoading(false);
      }
      successAlert("Message signed.");
    } catch (error) {
      errorAlert("Sign-in failed.");
    }
  };

  const logOut = async () => {
    if (typeof disconnect === "function") {
      await disconnect();
    }
    // Initialize `user` state to default value
    setUser({} as userInfo);
    setLogin(false);
    localStorage.clear();
  };

  const { adapter: { icon = "", name = "" } = {} } = wallet || {};

  const handleToProfile = (id: string) => {
    router.push(id);
  };

  return (
    <div>
      <button className="px-6 py-3 rounded bg-[#1A1C28] shadow-btn-inner text-[#E8E9EE] tracking-[0.32px] group relative cursor-pointer">
        {login && publicKey ? (
          <>
            <div className="flex mr-3 items-center justify-center text-[16px] lg:text-md">
              {/* {user.avatar !== undefined && (
                <img
                  src={user.avatar}
                  alt="Token IMG"
                  className="rounded p-1"
                  width={35}
                  height={35}
                />
              )} */}
              {icon && (
                <Image
                  src={icon}
                  alt="Token IMG"
                  className="rounded-full"
                  width={24}
                  height={24}
                />
              )}
              <div className="ml-3">
                {publicKey.toBase58().slice(0, 4)}....
                {publicKey.toBase58().slice(-4)}
              </div>
            </div>
            <div className="w-[200px] absolute right-0 top-12 pt-2 invisible group-hover:visible">
              <ul className="border border-[rgba(88,90,107,0.24)] rounded bg-[#1A1C28] p-2 ">
                <li>
                  <div
                    className="p-2 flex gap-2 items-center mb-1 text-primary-100 text-md tracking-[-0.32px] brightness-75 hover:brightness-125"
                    onClick={() => setVisible(true)}
                  >
                    <RiExchangeDollarLine />
                    Change Wallet
                  </div>
                </li>
                <li>
                  <div
                    className="p-2 flex gap-2 items-center text-primary-100 text-md tracking-[-0.32px] brightness-75 hover:brightness-125 text-[#E75787]"
                    onClick={logOut}
                  >
                    <VscDebugDisconnect />
                    Disconnect
                  </div>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div
            className="flex items-center justify-center gap-1 text-md uppercase cursor-pointer"
            onClick={() => setVisible(true)}
          >
            Connect wallet
          </div>
        )}
      </button>
      {/* <div>
        {login && tempUser.wallet && (
          <Link rel="stylesheet" href={`/profile/${tempUser._id}`}>
            <div className="text-center py-1 text-md text-white cursor-pointer hover:bg-slate-800 hover:rounded-md active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">
              [View Profile]
            </div>
          </Link>
        )}
      </div> */}
    </div>
  );
};
