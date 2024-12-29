import { RPC_MAPS } from '@/config';
import UserContext, { UserProvider } from '@/context/UserContext';
import { ModalProvider } from '@/contexts/ModalProvider';
import { PageProvider } from '@/contexts/PageContext';
import { SolanaWalletProvider } from '@/contexts/SolanaWalletProvider';
import { msgInfo, userInfo } from '@/utils/types';
import { useWallet } from '@solana/wallet-adapter-react';
import 'dotenv/config.js';
import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';

export const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<userInfo>({} as userInfo);
  const [login, setLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('/*.png');
  const [isCreated, setIsCreated] = useState(false);
  const [messages, setMessages] = useState<msgInfo[]>([]);
  const [coinId, setCoinId] = useState<string>('');
  const [newMsg, setNewMsg] = useState<msgInfo>({} as msgInfo);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [profileEditModal, setProfileEditModal] = useState<boolean>(false);
  const [postReplyModal, setPostReplyModal] = useState<boolean>(false);
  // const [rpcUrl, setRpcUrl] = useState<string>(import.meta.env.VITE_SOLANA_RPC);
  const [rpcUrl, setRpcUrl] = useState<string>(RPC_MAPS.Agents);
  useEffect(() => {
    console.log('Providers::rpcUrl', rpcUrl);
  }, [rpcUrl]);

  return (
    <SolanaWalletProvider>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <PageProvider>
            <UserProvider
              value={{
                solPrice,
                setSolPrice,
                newMsg,
                setNewMsg,
                coinId,
                setCoinId,
                messages,
                setMessages,
                isCreated,
                setIsCreated,
                imageUrl,
                setImageUrl,
                user,
                setUser,
                login,
                setLogin,
                isLoading,
                setIsLoading,
                profileEditModal,
                setProfileEditModal,
                postReplyModal,
                setPostReplyModal,
                rpcUrl,
                setRpcUrl,
              }}
            >
              {children}
              <ToastContainer pauseOnFocusLoss={false} theme="colored" />
            </UserProvider>
          </PageProvider>
        </ModalProvider>
      </QueryClientProvider>
    </SolanaWalletProvider>
  );
}
