"use client";

import LoadingImg from "@/assets/icons/loading-button.svg";
import { coinInfo } from "@/utils/types";
import { useEffect, useState } from "react";

interface TradingChartProps {
  param: coinInfo;
}

export const DexToolsChart: React.FC<TradingChartProps> = ({ param }) => {
  const [poolId, setPoolId] = useState<string>("");

  const [srcIndex, setSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(false);

  const iframeUrls = [
    `https://www.dextools.io/widget-chart/en/solana/pe-light/${poolId}?chartResolution=1&drawingToolbars=false&chartInUsd=true&chainId=solana`,
    `https://www.geckoterminal.com/solana/pools/${poolId}?embed=1&info=0&swaps=0&grayscale=1&light_chart=0`,
  ];

  // useEffect(() => {
  //   if (loading) {
  //     const timeout = setTimeout(() => {
  //       // If still loading after 5 seconds, treat as an error
  //       if (loading) handleIframeError();
  //     }, 1000);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [loading]);

  const handleIframeLoad = () => {
    setLoading(true);
  };

  const handleIframeError = () => {
    if (srcIndex < iframeUrls.length - 1) {
      setSrcIndex((prev) => prev + 1);
      setLoading(false); // Retry next URL
    } else {
      setHasError(true); // All URLs failed
    }
  };

  useEffect(() => {
    getInfo();
    // console.log("Coin parameters have changed:", param);
  }, [param]);

  const getInfo = async () => {
    try {
      //   setPoolId(param.raydiumPoolAddr);
      setPoolId("B4Jag7SokpCb5MwVZEVck7WqWSqwbB7GibV5F1NMsMgM");
      console.log("poolId--->", param.raydiumPoolAddr);
    } catch (error) {
      console.log("error: Not found poolId");
      setPoolId("APyQX9Q3FwHkxNvSa7vT8iB4AGm38iaMkiAcpSNbVyZY");
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black rounded-b">
          <img src={LoadingImg} width={40} height={40} />
        </div>
      )}
      <iframe
        id="dextools-widget"
        title="DEXTools Trading Chart"
        height="500px"
        width="100%"
        src={iframeUrls[srcIndex]}
        // onError={handleIframeLoad}
        // src={`https://www.dextools.io/widget-chart/en/solana/pe-light/4Qgn7AixnZJBwfFL5XmRDBVyzzq9tC6JdDToaKVhPJvz?chartResolution=1&drawingToolbars=false`}
        allowFullScreen
        className="border-none rounded-b"
      ></iframe>
    </div>
  );
};
