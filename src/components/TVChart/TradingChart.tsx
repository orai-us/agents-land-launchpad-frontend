import { useEffect, useState } from "react";

import { PeriodParams } from "@/libraries/charting_library/charting_library";
import { coinInfo } from "@/utils/types";
import { TVChartContainer } from "./TVChartContainer";

interface TradingChartProps {
  param: coinInfo;
}

// const TVChartContainer = () => import('@/components/TVChart/TVChartContainer').then((mod) => mod.TVChartContainer);

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
