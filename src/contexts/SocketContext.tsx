/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect, useContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { errorAlert, successAlert } from '@/components/others/ToastGroup';
import { msgInfo, RawChart } from '@/utils/types';
import UserContext from '@/context/UserContext';
import { useLocation } from 'wouter';
import { queryClient } from '@/provider/providers';
import { EVENT_CHART_SOCKET } from '@/components/TVChart/config';
import {
  channelToSubscription,
  genOhlcData,
} from '@/components/TVChart/streaming';
import { Bar } from '@/charting_library';

interface Context {
  socket?: Socket;
  counter?: number;
  randValue?: number;
  setRandValue?: Function;
  userArr?: any[];
  setUserArr?: Function;
  playerNumber?: number;
  setPlayerNumber?: Function;
  isLoading?: boolean;
  setIsLoading?: Function;
  isShowModal?: string;
  setIsShowModal?: Function;
  currentDepositAmount?: number;
  setCurrentDepositAmount?: Function;
  numberDecimals?: number;
  alertState?: AlertState;
  setAlertState?: Function;
}

const context = createContext<Context>({});

export const useSocket = () => useContext(context);

const SocketProvider = (props: { children: any }) => {
  const { coinId, setCoinId, newMsg, setNewMsg } = useContext(UserContext);
  const [socket, setSocket] = useState<Socket>();
  const [counter, setCounter] = useState<number>(1);
  const [randValue, setRandValue] = useState<number>(0);
  const [userArr, setUserArr] = useState<any[]>();
  const [playerNumber, setPlayerNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState('');
  const [currentDepositAmount, setCurrentDepositAmount] = useState(0);
  const [numberDecimals, setNumberDecimals] = useState(3);
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  const [, setLocation] = useLocation();
  // wallet Info
  const wallet = useWallet();
  const { connection } = useConnection();

  const connectionUpdatedHandler = (data: number) => {
    setCounter(data);
  };

  const createSuccessHandler = (name: string, mint: string) => {
    console.log('Successfully Create Token Name:', name);
    setAlertState({
      open: true,
      message: 'Success',
      severity: 'success',
    });
    successAlert(`Successfully Created token: ${name} \n ${mint}`);
    setIsLoading(false);
  };

  const createFailedHandler = (name: string, mint: string) => {
    console.log('Failed Create Token Name:', name);
    setAlertState({
      open: true,
      message: 'Failed',
      severity: 'error',
    });
    errorAlert(`Failed Create token: ${name} \n ${mint}`);
    setIsLoading(false);
  };

  const createMessageHandler = (updateCoinId: string, updateMsg: msgInfo) => {
    console.log('Updated Message', updateCoinId, updateMsg);
    setCoinId(updateCoinId);
    setNewMsg(updateMsg);
  };

  const listenChartSocket = (tokenId: string, priceUpdates: RawChart) => {
    try {
    } catch (error) {}
    const tradeTime = priceUpdates.ts * 1000;

    const state = queryClient.getQueryState<RawChart[]>([
      'chartTable',
      tokenId,
    ]);

    if (!state || !state.data || !priceUpdates) {
      return;
    }
    console.log('SOCKET :>> state-chart :>>', tokenId, priceUpdates);

    const priceHistory = [...state.data, priceUpdates];
    const subscriptionItem = channelToSubscription.get(tokenId);

    const dataChartTable = genOhlcData({
      priceHistory,
      range: Number(subscriptionItem?.resolution),
    });

    const bars = dataChartTable.map((bar) => ({
      ...bar,
      time: bar.time * 1000, // Convert from seconds to milliseconds
    }));

    const lastBar = bars[bars.length - 1];
    let bar: Bar =
      lastBar.close === lastBar.open && lastBar.high === lastBar.low
        ? bars[bars.length - 2]
        : lastBar;

    if (!bar) return;
    subscriptionItem.lastBar = bar;

    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));

    queryClient.setQueryData(['chartTable', tokenId], (oldData: RawChart[]) => {
      return [...(oldData || []), priceUpdates];
    });
  };
  // Listen for the "connectionUpdated" event and update the state
  // const transFailHandler = (address: string, txt: string, walletAddr: string) => {
  //     console.log(walletAddr, 'addressPubkey');
  //     if (walletAddr == address) {
  //         setAlertState({
  //             open: true,
  //             message: 'Failed!',
  //             severity: 'error',
  //         });
  //         setIsLoading(false);
  //         setIsShowModal('');
  //     }
  // };

  // const transSuccessHandler = (address: string, amount: number, walletAddr: string) => {
  //     console.log(walletAddr, 'addressPubkey');
  //     if (walletAddr == address) {
  //         setCurrentDepositAmount(Math.floor(amount) / Math.pow(10, numberDecimals));
  //         setIsLoading(false);
  //         setAlertState({
  //             open: true,
  //             message: 'Success',
  //             severity: 'success',
  //         });
  //         setIsShowModal('');
  //     }
  // }
  // init socket client object
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL!, {
      transports: ['websocket'],
    });
    socket.on('connect', async () => {
      console.log(' --@ connected to backend', socket.id);
    });
    socket.on('disconnect', () => {
      console.log(' --@ disconnected from backend', socket.id);
    });
    socket.on('connect_error', (error) => {
      if (socket!.active) {
        // temporary failure, the socket will automatically try to reconnect
      } else {
        // the connection was denied by the server
        // in that case, `socket.connect()` must be manually called in order to reconnect
        console.log('[socket] Error:', error.message);
      }
    });
    setSocket(socket);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      setSocket(undefined);
      // socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket?.on('connectionUpdated', async (counter: number) => {
      // console.log("--------@ Connection Updated: ", counter);

      connectionUpdatedHandler(counter);
    });

    socket?.on('Creation', () => {
      console.log('--------@ Token Creation: ');
    });
    socket?.on('TokenCreated', async (name: string, mint: string) => {
      console.log('--------@ Token Created!: ', name);

      createSuccessHandler(name, mint);
    });

    socket?.on('TokenNotCreated', async (name: string, mint: string) => {
      console.log('--------@ Token Not Created: ', name);

      createFailedHandler(name, mint);
    });

    socket?.on(
      'MessageUpdated',
      async (updateCoinId: string, newMessage: msgInfo) => {
        if (updateCoinId && newMessage) {
          console.log('--------@ Message Updated:', updateCoinId, newMessage);

          createMessageHandler(updateCoinId, newMessage);
        }
      }
    );

    socket?.on(EVENT_CHART_SOCKET, listenChartSocket);

    return () => {
      socket?.off('Creation', createSuccessHandler);
      socket?.off('TokenCreated', createSuccessHandler);
      socket?.off('TokenNotCreated', createFailedHandler);
      socket?.off('MessageUpdated', createMessageHandler);
      socket?.off(EVENT_CHART_SOCKET, listenChartSocket);

      socket?.disconnect();
    };
  }, [socket]);

  return (
    <context.Provider
      value={{
        socket,
        counter,
        randValue,
        setRandValue,
        userArr,
        setUserArr,
        playerNumber,
        setPlayerNumber,
        isLoading,
        setIsLoading,
        isShowModal,
        setIsShowModal,
        currentDepositAmount,
        setCurrentDepositAmount,
        numberDecimals,
        alertState,
        setAlertState,
      }}
    >
      {props.children}
    </context.Provider>
  );
};

export interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error' | undefined;
}

export default SocketProvider;
