import { PeriodParams } from "@/charting_library";
import { coinInfo } from "@/utils/types";
import { useEffect, useState } from "react";
import { TVChartContainer } from "./TVChartContainer";

interface TradingChartProps {
  param: coinInfo;
}

export const TradingChart: React.FC<TradingChartProps> = ({ param }) => {
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
      {param && (
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
