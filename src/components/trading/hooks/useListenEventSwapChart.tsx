import { Bar } from '@/charting_library';
import {
  channelToSubscription,
  genOhlcData,
} from '@/components/TVChart/streaming';
import { PROGRAM_ID, SPL_DECIMAL } from '@/config';
import UserContext from '@/context/UserContext';
import { AgentsLandEventListener } from '@/program/logListeners/AgentsLandEventListener';
import { ResultType } from '@/program/logListeners/types';
import { commitmentLevel, endpoint } from '@/program/web3';
import { queryClient } from '@/provider/providers';
import { RawChart, recordInfo } from '@/utils/types';
import { calculateTokenPrice, getUserByWalletAddress } from '@/utils/util';
import { Connection, PublicKey } from '@solana/web3.js';
import { isEmpty } from 'lodash';
import { useContext, useEffect, useState } from 'react';

const useListenEventSwapChart = ({ coin }) => {
  const { solPrice } = useContext(UserContext);
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

      setCurPrice(currentPrice);
    })();
  }, [coin?._id]);

  // subscribe to real-time swap txs on trade
  // useEffect(() => {
  //   if (isEmpty(coin)) return;

  //   const connection = new Connection(endpoint, {
  //     commitment: commitmentLevel,
  //     wsEndpoint: import.meta.env.VITE_SOLANA_WS,
  //   });

  //   // // const listener = new AgentsLandEventListener(connection);
  //   // // listener.setProgramEventCallback(
  //   // //   "swapEvent",
  //   // //   (result: ResultType) => {
  //   // //     if (coin.token !== result.mint) {
  //   // //       return;
  //   // //     }

  //   // //     const newPrice = calculateTokenPrice(
  //   // //       result.tokenReserves,
  //   // //       result.lamportReserves,
  //   // //       coin.decimals
  //   // //       //   solPrice
  //   // //     );
  //   // //     setCurPrice(newPrice);

  //   // //     // socketChart
  //   // //     console.log("======listen socket chart=====>>>", result);
  //   // //     const newPriceUsd = calculateTokenPrice(
  //   // //       result.tokenReserves,
  //   // //       result.lamportReserves,
  //   // //       SPL_DECIMAL,
  //   // //       Number(solPrice)
  //   // //     );

  //   // //     const tradeTime = new Date().getTime() / 1000;
  //   // //     const priceUpdates = {
  //   // //       price: newPriceUsd,
  //   // //       ts: tradeTime,
  //   // //     };
  //   // //     const tokenId = result.mint;

  //   // //     const state = queryClient.getQueryState<RawChart[]>([
  //   // //       "chartTable",
  //   // //       result.mint,
  //   // //     ]);

  //   // //     if (!state || !state.data || !newPriceUsd) {
  //   // //       return;
  //   // //     }
  //   // //     // console.log(
  //   // //     //   "SOCKET :>> tokenId, priceUpdates",
  //   // //     //   result.mint,
  //   // //     //   newPriceUsd
  //   // //     // );

  //   // //     const priceHistory = [...state.data, priceUpdates];
  //   // //     const subscriptionItem = channelToSubscription.get(result.mint);
  //   // //     if (!subscriptionItem) {
  //   // //       return;
  //   // //     }

  //   // //     const dataChartTable = genOhlcData({
  //   // //       priceHistory,
  //   // //       range: Number(subscriptionItem?.resolution),
  //   // //     });

  //   // //     const bars = dataChartTable.map((bar) => ({
  //   // //       ...bar,
  //   // //       time: bar.time * 1000, // Convert from seconds to milliseconds
  //   // //     }));

  //   // //     const lastBar = bars[bars.length - 1];
  //   // //     let bar: Bar =
  //   // //       lastBar.close === lastBar.open && lastBar.high === lastBar.low
  //   // //         ? bars[bars.length - 2]
  //   // //         : lastBar;
  //   // //     // console.log("bar", bar, lastBar);

  //   // //     if (!bar) return;
  //   // //     subscriptionItem.lastBar = bar;

  //   // //     // Send data to every subscriber of that symbol
  //   // //     subscriptionItem.handlers.forEach((handler) => handler.callback(bar));

  //   // //     queryClient.setQueryData(
  //   // //       ["chartTable", tokenId],
  //   // //       (oldData: RawChart[]) => {
  //   // //         return [...(oldData || []), priceUpdates];
  //   // //       }
  //   // //     );
  //   // //   },
  //   // //   []
  //   // // );

  //   // const { program, listenerIds } = listener.listenProgramEvents(
  //   //   new PublicKey(PROGRAM_ID).toBase58()
  //   // );

  //   // return () => {
  //   //   if (!program) return;
  //   //   console.log("socket-chart---ready to remove listeners");
  //   //   Promise.all(listenerIds.map((id) => program.removeEventListener(id)));
  //   // };
  // }, [coin?._id]);

  return {
    curPrice,
    newSwapDatas,
  };
};

export default useListenEventSwapChart;
