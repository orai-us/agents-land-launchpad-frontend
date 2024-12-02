"use client";

import { RawChart } from "./../../utils/types";

import { io, Socket } from "socket.io-client";
import type {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from "@/libraries/charting_library";

import { queryClient } from "../../provider/providers";
import { CandlePrice, Chart } from "@/utils/types";

let socket: Socket | undefined = undefined;
let initialTimeStamp: number = new Date().getTime();
let lastUpdated = 0;

if (typeof window !== "undefined") {
  socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!);
}

type SubscriptionItem = {
  subscriberUID: string;
  resolution: ResolutionString;
  lastBar: Bar;
  handlers: {
    id: string;
    callback: SubscribeBarsCallback;
  }[];
  pairIndex: string;
};

const channelToSubscription = new Map<string, SubscriptionItem>();

if (socket) {
  socket.on("connect", () => {
    console.log("[socket] Connected", socket!.id);
    initialTimeStamp = new Date().getTime();
  });

  socket.on("disconnect", (reason) => {
    console.log("[socket] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    if (socket!.active) {
      // temporary failure, the socket will automatically try to reconnect
    } else {
      // the connection was denied by the server
      // in that case, `socket.connect()` must be manually called in order to reconnect
      console.log("[socket] Error:", error.message);
    }
  });

  socket.on("updateChart", (tokenId: string, priceUpdates: RawChart) => {
    try {
    } catch (error) {}
    const tradeTime = priceUpdates.ts * 1000;

    const state = queryClient.getQueryState<RawChart[]>([
      "chartTable",
      tokenId,
    ]);

    console.log("SOCKET :>> state-chart :>>", state.data, priceUpdates);

    if (!state || !state.data || !priceUpdates) {
      return;
    }
    console.log("SOCKET :>> tokenId, priceUpdates", tokenId, priceUpdates);

    const priceHistory = [...state.data, priceUpdates];
    const subscriptionItem = channelToSubscription.get(tokenId);

    // const lastBar = subscriptionItem.lastBar;
    // const resolution = subscriptionItem.resolution;
    // const nextBarTime = getNextBarTime(lastBar.time, +resolution);
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
    console.log("bar", bar, lastBar);

    if (!bar) return;
    // if (tradeTime >= nextBarTime) {
    //   bar = {
    //     ...bar,
    //     time: nextBarTime,
    //   };
    //   console.log("[socket] Generate new bar", bar);
    // } else {
    //   bar = {
    //     ...lastBar,
    //     high: Math.max(lastBar.high, bar.close),
    //     low: Math.min(lastBar.low, bar.low),
    //     close: bar.close,
    //   };
    // }
    subscriptionItem.lastBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));

    queryClient.setQueryData(["chartTable", tokenId], (oldData: RawChart[]) => {
      return [...(oldData || []), priceUpdates];
    });
  });

  //   socket.on("currentPrices", (priceUpdates) => {
  //     const tradeTime = new Date().getTime();

  //     const state = queryClient.getQueryState<Chart>(["charts"]);

  //     console.log("state-chart :>>", state);

  //     if (!state || !state.data || !priceUpdates) {
  //       return;
  //     }

  //     for (let i = 0; i < priceUpdates.length; i += 2) {
  //       const index = priceUpdates[i];
  //       const price = priceUpdates[i + 1];

  //       if (state.data.closes.length < index) {
  //         while (state.data.closes.length < index) state.data.closes.push(0);
  //       }

  //       state.data.closes[index] = price;
  //     }

  //     for (const pairIndex of channelToSubscription.keys()) {
  //       const subscriptionItem = channelToSubscription.get(pairIndex);

  //       if (!subscriptionItem) {
  //         continue;
  //       }

  //       const lastBar = subscriptionItem.lastBar;
  //       const resolution = subscriptionItem.resolution;
  //       const nextBarTime = getNextBarTime(lastBar.time, +resolution);

  //       let bar: Bar;

  //       if (tradeTime >= nextBarTime) {
  //         bar = {
  //           time: nextBarTime,
  //           open: state.data.closes[pairIndex],
  //           high: state.data.closes[pairIndex],
  //           low: state.data.closes[pairIndex],
  //           close: state.data.closes[pairIndex],
  //         };
  //         console.log("[socket] Generate new bar", bar);
  //       } else {
  //         bar = {
  //           ...lastBar,
  //           high: Math.max(lastBar.high, state.data.closes[pairIndex]),
  //           low: Math.min(lastBar.low, state.data.closes[pairIndex]),
  //           close: state.data.closes[pairIndex],
  //         };
  //       }
  //       subscriptionItem.lastBar = bar;

  //       // Send data to every subscriber of that symbol
  //       subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
  //     }

  //     queryClient.setQueryData<Chart | undefined>(["charts"], (oldData) => {
  //       if (!oldData) {
  //         return oldData;
  //       }

  //       const priceData: Chart = {
  //         ...oldData,
  //         time: tradeTime,
  //       };

  //       for (let i = 0; i < priceUpdates.length; i += 2) {
  //         const index = priceUpdates[i];
  //         const price = priceUpdates[i + 1];

  //         if (priceData.closes.length < index) {
  //           while (priceData.closes.length < index) priceData.closes.push(0);
  //         }

  //         priceData.closes[index] = price;
  //       }

  //       return priceData;
  //     });
  //   });
}

// barTime is millisec, resolution is mins
function getNextBarTime(barTime: number, resolution: number) {
  const previousSegment = Math.floor(barTime / 1000 / 60 / resolution);
  return (previousSegment + 1) * 1000 * 60 * resolution;
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastBar: Bar,
  pairIndex: string
) {
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };
  //   let subscriptionItem = channelToSubscription.get(pairIndex);
  let subscriptionItem = channelToSubscription.get(pairIndex);
  if (subscriptionItem) {
    // Already subscribed to the channel, use the existing subscription
    subscriptionItem.handlers.push(handler);
    return;
  }

  subscriptionItem = {
    subscriberUID,
    resolution,
    lastBar,
    handlers: [handler],
    pairIndex,
  } as SubscriptionItem;
  channelToSubscription.set(pairIndex, subscriptionItem);

  console.log(
    "[subscribeBars]: Subscribe to streaming. Channel:",
    pairIndex,
    subscriptionItem
  );
}

export function unsubscribeFromStream(subscriberUID: string) {
  // Find a subscription with id === subscriberUID
  for (const pairIndex of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(pairIndex);

    if (!subscriptionItem) {
      continue;
    }

    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1) {
      // Remove from handlers
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        // Unsubscribe from the channel if it was the last handler
        console.log(
          "[unsubscribeBars]: Unsubscribe from streaming. Channel:",
          pairIndex
        );
        // socket.emit("SubRemove", { subs: [channelString] });
        channelToSubscription.delete(pairIndex);
        break;
      }
    }
  }
}

export const genOhlcData = ({
  priceHistory,
  range,
  countBack = 300,
}: {
  priceHistory: {
    price: number;
    ts: number;
  }[];
  range: number;
  countBack?: number;
}) => {
  let candlePeriod = 60; // 1 min  default
  switch (range) {
    case 1:
      // default candle period
      break;
    case 5:
      candlePeriod = 300; // 5 mins
      break;
    case 15:
      candlePeriod = 1_800; // 30 mins
      break;
    case 60:
      candlePeriod = 3_600; // 1 hr
      break;
    case 120:
      candlePeriod = 7_200; // 2 hrs
      break;
  }

  // convert price feed to candle price data
  let cdStart = Math.floor(priceHistory[0].ts / candlePeriod) * candlePeriod;
  let cdEnd =
    Math.floor(priceHistory[priceHistory.length - 1].ts / candlePeriod) *
    candlePeriod;
  // let cdStart = start;
  // let cdEnd = end;

  let cdFeeds: CandlePrice[] = [];
  let pIndex = 0;
  for (
    let curCdStart = cdStart;
    curCdStart <= cdEnd;
    curCdStart += candlePeriod
  ) {
    let st = priceHistory[pIndex].price;
    let hi = priceHistory[pIndex].price;
    let lo = priceHistory[pIndex].price;
    let en = priceHistory[pIndex].price;
    let prevIndex = pIndex;
    for (; pIndex < priceHistory.length; ) {
      if (hi < priceHistory[pIndex].price) hi = priceHistory[pIndex].price;
      if (lo > priceHistory[pIndex].price) lo = priceHistory[pIndex].price;
      en = priceHistory[pIndex].price;

      // break new candle data starts
      if (priceHistory[pIndex].ts >= curCdStart + candlePeriod) break;
      pIndex++;
    }

    if (prevIndex !== pIndex)
      cdFeeds.push({
        open: st,
        high: hi,
        low: lo,
        close: en,
        time: curCdStart,
      });
  }
  const extraCandlesNeeded = countBack - cdFeeds.length;
  if (extraCandlesNeeded > 0) {
    console.log(
      `[getCandleData]: Generating ${extraCandlesNeeded} extra candle(s)`
    );
    const lastCandle = cdFeeds[0];
    const extraCandles = generateExtraCandles(
      lastCandle,
      extraCandlesNeeded,
      candlePeriod
    );
    cdFeeds = [...extraCandles, ...cdFeeds];
  }
  return cdFeeds;
};

const generateExtraCandles = (
  lastCandle: CandlePrice,
  numberOfCandles: number,
  candlePeriod: number
) => {
  const extraCandles = [];
  for (let i = 1; i <= numberOfCandles; i++) {
    const newTime = lastCandle.time - i * candlePeriod;
    extraCandles.unshift({
      open: lastCandle.low,
      high: lastCandle.low,
      low: lastCandle.low,
      close: lastCandle.low,
      isExtra: true,
      time: newTime,
    });
  }
  return extraCandles;
};
