import { PROGRAM_ID } from '@/config';
import UserContext from '@/context/UserContext';
import { AgentsLandEventListener } from '@/program/logListeners/AgentsLandEventListener';
import { ResultType } from '@/program/logListeners/types';
import { commitmentLevel, endpoint } from '@/program/web3';
import { recordInfo } from '@/utils/types';
import { calculateTokenPrice, getSolPriceInUSD, getUserByWalletAddress } from '@/utils/util';
import { Connection, PublicKey } from '@solana/web3.js';
import { isEmpty } from 'lodash';
import { useContext, useEffect, useState } from 'react';

const useListenEventSwapChart = ({ coin }) => {
  const [newSwapDatas, setNewSwapDatas] = useState([]);
  const [curPrice, setCurPrice] = useState(0);

  useEffect(() => {
    if (!coin) {
      return;
    }

    (async () => {
      //   const solPrice = await getSolPriceInUSD();
      const currentPrice = calculateTokenPrice(
        coin.tokenReserves,
        coin.lamportReserves,
        coin.decimals
        // solPrice
      );

      console.log('currentPrice', currentPrice);
      setCurPrice(currentPrice);
    })();
  }, [coin]);

  // subscribe to real-time swap txs on trade
  useEffect(() => {
    if (isEmpty(coin)) return;

    const connection = new Connection(endpoint, {
      commitment: commitmentLevel,
      wsEndpoint: import.meta.env.VITE_SOLANA_WS
    });

    const listener = new AgentsLandEventListener(connection);
    listener.setProgramEventCallback(
      'swapEvent',
      async (result: ResultType) => {
        // const solPrice = await getSolPriceInUSD();
        const userInfo = await getUserByWalletAddress({ wallet: result.user });
        const tx = await connection.getTransaction(result.tx, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });

        const newPrice = calculateTokenPrice(
          result.tokenReserves,
          result.lamportReserves,
          coin.decimals
          //   solPrice
        );
        const newRecordInfo: recordInfo = {
          holder: userInfo,
          lamportAmount: result.lamportAmount,
          tokenAmount: result.tokenAmount,
          time: new Date(tx.blockTime),
          tx: result.tx,
          price: newPrice,
          swapDirection: result.swapDirection as any
        };

        setCurPrice(newPrice);
        setNewSwapDatas([...newSwapDatas, newRecordInfo]);

        // const newTradeRecords = [newRecordInfo, ...trades.record];
        // setTrades({ ...trades, record: newTradeRecords });
      },
      []
    );

    const { program, listenerIds } = listener.listenProgramEvents(new PublicKey(PROGRAM_ID).toBase58());

    return () => {
      if (!program) return;
      console.log('ready to remove listeners');
      Promise.all(listenerIds.map((id) => program.removeEventListener(id)));
    };
  }, [coin]);

  return {
    curPrice,
    newSwapDatas
  };
};

export default useListenEventSwapChart;
