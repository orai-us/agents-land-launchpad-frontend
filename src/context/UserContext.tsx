"use client";
import { errorAlert, successAlert } from "@/components/others/ToastGroup";
import { msgInfo, userInfo } from "@/utils/types";
import { AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { createContext, ReactNode, useEffect } from "react";

export const UserContext = createContext<UserContextValue | undefined>({
  user: {} as userInfo,
  setUser: (value: userInfo) => {},
  login: false,
  setLogin: (value: boolean) => {},
  isLoading: false,
  setIsLoading: (value: boolean) => {},
  imageUrl: "/*.png",
  setImageUrl: (value: string) => {},
  isCreated: false,
  setIsCreated: (value: boolean) => {},
  messages: [] as msgInfo[],
  setMessages: (value: msgInfo[]) => {},
  coinId: "",
  setCoinId: (value: string) => {},
  newMsg: {} as msgInfo,
  setNewMsg: (value: msgInfo) => {},
  solPrice: 0,
  setSolPrice: (value: number) => {},
  profileEditModal: false,
  setProfileEditModal: (value: boolean) => {},
  postReplyModal: false,
  setPostReplyModal: (value: boolean) => {},
  rpcUrl:
    "https://mainnet.helius-rpc.com/?api-key=3b28a0fc-0ef6-48ef-b55c-c55ae74cb6a6",
  setRpcUrl: (value: string) => {},
});

export interface UserContextValue {
  user: userInfo;
  setUser: (value: userInfo) => void;
  login: boolean;
  setLogin: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  isCreated: boolean;
  setIsCreated: (value: boolean) => void;
  messages: msgInfo[];
  setMessages: (value: msgInfo[]) => void;
  coinId: string;
  setCoinId: (value: string) => void;
  newMsg: msgInfo;
  setNewMsg: (value: msgInfo) => void;
  solPrice: number;
  setSolPrice: (value: number) => void;
  profileEditModal: boolean;
  setProfileEditModal: (value: boolean) => void;
  postReplyModal: boolean;
  setPostReplyModal: (value: boolean) => void;
  rpcUrl: string;
  setRpcUrl: (value: string) => void;
}

export function UserProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: UserContextValue;
}) {
  const { rpcUrl } = value;
  const wallet = useWallet();
  useEffect(() => {
    const setAnchorProvider = async () => {
      try {
        const connection = new Connection(value.rpcUrl, "confirmed");
        await connection.getEpochInfo();
        const provider = new AnchorProvider(connection, wallet, {
          commitment: "confirmed",
          preflightCommitment: "confirmed",
        });
        setProvider(provider);
        successAlert("Switch RPC successfully");
      } catch (e) {
        errorAlert("Failed to connect to the network");
      }
    };
    setAnchorProvider();
  }, [rpcUrl]);
  return (
    <UserContext.Provider value={value}> {children} </UserContext.Provider>
  );
}

export default UserContext;
