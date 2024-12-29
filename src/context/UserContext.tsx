import { Spinner } from '@/components/loadings/Spinner';
import { errorAlert, successAlert } from '@/components/others/ToastGroup';
import { RPC_MAPS } from '@/config';
import { msgInfo, userInfo } from '@/utils/types';
import { AnchorProvider, setProvider } from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Keypair } from '@solana/web3.js';
import { createContext, ReactNode, useEffect, useState } from 'react';
import Loading from 'react-loading';

export const UserContext = createContext<UserContextValue | undefined>({
  user: {} as userInfo,
  setUser: (value: userInfo) => {},
  login: false,
  setLogin: (value: boolean) => {},
  isLoading: false,
  setIsLoading: (value: boolean) => {},
  imageUrl: '/*.png',
  setImageUrl: (value: string) => {},
  isCreated: false,
  setIsCreated: (value: boolean) => {},
  messages: [] as msgInfo[],
  setMessages: (value: msgInfo[]) => {},
  coinId: '',
  setCoinId: (value: string) => {},
  newMsg: {} as msgInfo,
  setNewMsg: (value: msgInfo) => {},
  solPrice: 0,
  setSolPrice: (value: number) => {},
  profileEditModal: false,
  setProfileEditModal: (value: boolean) => {},
  postReplyModal: false,
  setPostReplyModal: (value: boolean) => {},
  rpcUrl: import.meta.env.VITE_SOLANA_RPC,
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
  const [providerApp, setProviderApp] = useState(null);

  const { rpcUrl } = value;
  const wallet = useWallet();
  useEffect(() => {
    const setAnchorProvider = async () => {
      try {
        const connection = new Connection(value.rpcUrl, 'confirmed');
        // await connection.getEpochInfo();

        if (wallet.publicKey) {
          const provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            // maxRetries: 1,
          });
          setProvider(provider);
          setProviderApp(provider);
          if (value.rpcUrl !== RPC_MAPS.Agents) {
            successAlert('Switch RPC successfully');
          }
        } else {
          const wallet = new NodeWallet(Keypair.generate());
          const provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
          });
          setProvider(provider);
          setProviderApp(provider);
        }
      } catch (e) {
        errorAlert('Failed to connect to the network');
      }
    };

    setAnchorProvider();
  }, [rpcUrl, wallet]);

  if (!providerApp) {
    return <Spinner />;
  }

  return (
    <UserContext.Provider value={value}> {children} </UserContext.Provider>
  );
}

export default UserContext;
