import { useEffect, useState } from 'react';

import { ChartingLibraryWidgetOptions, PeriodParams, ResolutionString } from '@/libraries/charting_library/charting_library';
import { Chart, coinInfo, RawChart } from '@/utils/types';
import { queryClient } from '@/provider/providers';
import { TVChartContainer } from './TVChartContainer';

interface TradingChartProps {
  param: coinInfo;
}

// const TVChartContainer = () => import('@/components/TVChart/TVChartContainer').then((mod) => mod.TVChartContainer);

export const TradingChart: React.FC<TradingChartProps> = ({ param }) => {
  const state = queryClient.getQueryState<RawChart[]>(['chartTable', param.token]);

  console.log('state-chart :>>', state);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [period, setPeriod] = useState<PeriodParams>({} as PeriodParams);
  useEffect(() => {
    if (param.date !== undefined) {
      const newPeriod: PeriodParams = {
        from: Math.floor(new Date(param.date).getTime() / 1000),
        to: Math.floor(new Date().getTime() / 1000),
        // to: new Date().getTime(),
        firstDataRequest: true,
        countBack: 2
      };
      setPeriod(newPeriod);
    }
  }, [param]);

  return (
    <>
      {/* <head>
        <title>Sample Demo TradingView with NextJS</title>
      </head> */}
      {/* <Script
        src="/libraries/charting_library/charting_library.standalone.js"
        strategy="lazyOnload"
      /> */}
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
