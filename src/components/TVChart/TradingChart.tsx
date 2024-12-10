"use client";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Script from "next/script";

import {
  ChartingLibraryWidgetOptions,
  PeriodParams,
  ResolutionString,
} from "@/libraries/charting_library/charting_library";
import { Chart, coinInfo, RawChart } from "@/utils/types";
import { queryClient } from "@/provider/providers";
// import { TVChartContainer } from "@/components/TVChartContainer";

interface TradingChartProps {
  param: coinInfo;
}

const TVChartContainer = dynamic(
  () =>
    import("@/components/TVChart/TVChartContainer").then(
      (mod) => mod.TVChartContainer
    ),
  { ssr: false }
);

export const TradingChart: React.FC<TradingChartProps> = ({ param }) => {
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [period, setPeriod] = useState<PeriodParams>({} as PeriodParams);
  useEffect(() => {
    if (param.date !== undefined) {
      const newPeriod: PeriodParams = {
        from: Math.floor(new Date(param.date).getTime() / 1000),
        to: Math.floor(new Date().getTime() / 1000),
        // to: new Date().getTime(),
        firstDataRequest: true,
        countBack: 2,
      };
      setPeriod(newPeriod);
    }
  }, [param]);

  return (
    <>
      {/* <Script
        src="/libraries/charting_library/charting_library.standalone.js"
        strategy="lazyOnload"
      /> */}
      <Script
        src="/libraries/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />
      {isScriptReady && param && (
        <TVChartContainer
          name={param.ticker || param.name}
          pairIndex={1704} // FIXME: PAIR INDEX HARDCODE
          token={param.token}
          customPeriodParams={period}
        />
      )}
    </>
  );
};
