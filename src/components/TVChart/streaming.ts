import type {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from "@/charting_library";
import { SOL_PRICE_KEY, SPL_DECIMAL } from "@/config";
import { AgentsLandEventListener } from "@/program/logListeners/AgentsLandEventListener";
import { ResultType } from "@/program/logListeners/types";
import { commitmentLevel, endpoint } from "@/program/web3";
import { CandlePrice } from "@/utils/types";
import { calculateTokenPrice } from "@/utils/util";
import { Connection } from "@solana/web3.js";
import { io, Socket } from "socket.io-client";
import { queryClient } from "../../provider/providers";
import { RawChart } from "./../../utils/types";

let socket: Socket | undefined = undefined;
let initialTimeStamp: number = new Date().getTime();
let lastUpdated = 0;

if (typeof window !== "undefined") {
  socket = io(import.meta.env.VITE_BACKEND_URL!);
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

export const channelToSubscription = new Map<string, SubscriptionItem>();

const connection = new Connection(endpoint, {
  commitment: commitmentLevel,
  wsEndpoint: import.meta.env.VITE_SOLANA_WS,
});

const listener = new AgentsLandEventListener(connection);

const solPrice = localStorage.getItem(SOL_PRICE_KEY);

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
