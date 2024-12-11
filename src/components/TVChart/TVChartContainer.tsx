import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from "@/charting_library";
import UserContext from "@/context/UserContext";
import {
  chartOverrides,
  disabledFeatures,
  enabledFeatures,
} from "@/utils/constants";
import { PeriodParamsInfo } from "@/utils/types";
import { useContext, useEffect, useRef } from "react";
import ReactLoading from "react-loading";
import { twMerge } from "tailwind-merge";
import { getDataFeed } from "./datafeed";

export type TVChartContainerProps = {
  name: string;
  pairIndex: number;
  token: string;
  customPeriodParams: PeriodParamsInfo;
  classNames?: {
    container: string;
  };
};

export const TVChartContainer = ({
  name,
  pairIndex,
  token,
  customPeriodParams,
}: TVChartContainerProps) => {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
  const { isLoading, setIsLoading } = useContext(UserContext);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return () => {};
    }
    if (tvWidgetRef.current) {
      tvWidgetRef.current.remove();
    }
    const elem = chartContainerRef.current;
    if (name) {
      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: name,
        debug: false,
        datafeed: getDataFeed({ pairIndex, name, token, customPeriodParams }),
        theme: "dark",
        locale: "en",
        container: elem,
        library_path: `${location.protocol}//${location.host}/libraries/charting_library/`,
        loading_screen: {
          backgroundColor: "#161a25",
          foregroundColor: "#161a25",
        },
        enabled_features: enabledFeatures,
        disabled_features: disabledFeatures,
        client_id: "tradingview.com",
        user_id: "public_user_id",
        fullscreen: false,
        autosize: true,
        custom_css_url: "/tradingview-chart.css",
        overrides: chartOverrides,
        interval: "1D" as ResolutionString,
      };

      tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
      tvWidgetRef.current.onChartReady(function () {
        setIsLoading(false);
        // const priceScale = tvWidgetRef.current
        //   ?.activeChart()
        //   .getPanes()[0]
        //   .getMainSourcePriceScale();
        // priceScale?.setAutoScale(true);
      });

      return () => {
        if (tvWidgetRef.current) {
          tvWidgetRef.current.remove();
        }
      };
    }
  }, [name, pairIndex]);

  return (
    <div className="relative mb-[1px] h-[500px] w-full ">
      {isLoading ? (
        <div className="z-9999 absolute left-0 top-0 flex h-full w-full items-center justify-center bg-tizz-background">
          <ReactLoading
            height={20}
            width={50}
            type={"bars"}
            color={"#36d7b7"}
          />
        </div>
      ) : null}
      <div ref={chartContainerRef} className={twMerge("h-full w-full")} />
    </div>
  );
};
