import { errorAlert, successAlert } from '@/components/others/ToastGroup';
import UserContext from '@/context/UserContext';
import { userInfo } from '@/utils/types';
import { confirmWallet, walletConnect } from '@/utils/util';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import base58 from 'bs58';
import { FC, useContext, useEffect, useMemo } from 'react';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { VscDebugDisconnect, VscSettings } from 'react-icons/vsc';

import { Link, useLocation } from 'wouter';

export type ConnectButtonProps = {
  setSettingModal: (isOpen: boolean) => void;
};

export const ConnectButton: FC<ConnectButtonProps> = ({
  setSettingModal,
}: ConnectButtonProps) => {
  const [, setLocation] = useLocation();

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
        `Sign in to Agent.land: ${connection.nonce}`,
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
      successAlert('Message signed.');
    } catch (error) {
      // errorAlert("Sign-in failed.");
      console.log('error', error);
    }
  };

  const logOut = async () => {
    if (typeof disconnect === 'function') {
      await disconnect();
      // setLocation("/");
    }
    // Initialize `user` state to default value
    setUser({} as userInfo);
    setLogin(false);
    localStorage.clear();
  };

  const { adapter: { icon = '', name = '' } = {} } = wallet || {};

  return (
    <div className="px-5 md:px-0">
      <button className="w-full md:w-fit mb-1 md:mb-0 md:ml-2 px-6 py-3 rounded bg-[#1A1C28] shadow-btn-inner text-[#E8E9EE] tracking-[0.32px] group relative cursor-pointer">
        {login && publicKey ? (
          <>
            <div className="flex mr-0 md:mr-3 items-center justify-center text-[16px] lg:text-md">
              {icon && (
                <img
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
            <div className="hidden md:block w-[200px] absolute right-0 top-12 pt-2 invisible group-hover:visible">
              <ul className="border border-[rgba(88,90,107,0.24)] rounded bg-[#1A1C28] p-2 ">
                {tempUser.wallet && (
                  <li>
                    <Link
                      className="p-2 flex gap-2 items-center mb-1 text-primary-100 text-md tracking-[-0.32px] brightness-75 hover:brightness-125"
                      href={`/profile/${tempUser.wallet}`}
                    >
                      <RiExchangeDollarLine />
                      View Profile
                    </Link>
                  </li>
                )}
                {/* <li>
                  <div
                    className="p-2 flex gap-2 items-center text-primary-100 text-md tracking-[-0.32px] brightness-75 hover:brightness-125"
                    onClick={() => setSettingModal(true)}
                  >
                    <VscSettings />
                    Settings
                  </div>
                </li> */}
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
            className="flex text-nowrap whitespace-nowrap break-keep items-center justify-center gap-1 text-md uppercase cursor-pointer"
            onClick={() => setVisible(true)}
          >
            Connect wallet
          </div>
        )}
      </button>
      {login && tempUser.wallet && (
        <div className="flex md:hidden justify-between items-center rounded bg-[#1A1C28] p-1">
          {user?.wallet && (
            <Link
              className="p-2  border-r border-[#4d4f58] text-[12px] flex-1 flex gap-2 items-center justify-center mb-1 text-primary-100 text-md tracking-[-0.32px] brightness-75 hover:brightness-125"
              href={`/profile/${tempUser.wallet}`}
            >
              <RiExchangeDollarLine />
              View Profile
            </Link>
          )}
          {/* <div
            className="p-2 border-r flex-1  justify-center border-[#4d4f58] text-[12px] flex gap-2 items-center text-primary-100 text-md tracking-[-0.32px] brightness-75 hover:brightness-125"
            onClick={() => {
              setSettingModal(true);
            }}
          >
            <VscSettings />
            Settings
          </div> */}
          <div
            className="p-2 text-[12px] flex flex-1 gap-2 items-center justify-center text-primary-100 text-md tracking-[-0.32px] brightness-75 hover:brightness-125 text-[#E75787]"
            onClick={logOut}
          >
            <VscDebugDisconnect />
            Disconnect
          </div>
        </div>
      )}
    </div>
  );
};
