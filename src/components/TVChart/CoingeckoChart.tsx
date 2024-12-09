"use client";

import { commitmentLevel, endpoint } from "@/program/web3";
import { coinInfo } from "@/utils/types";
import { Connection } from "@solana/web3.js";
import Head from "next/head";
import { useEffect, useState } from "react";

interface TradingChartProps {
  param: coinInfo;
}

export const CoinGeckoChart: React.FC<TradingChartProps> = ({ param }) => {
  const [poolId, setPoolId] = useState<string>("");
  const connection = new Connection(endpoint, {
    commitment: commitmentLevel,
    wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS,
  });
  useEffect(() => {
    getInfo();
    console.log("Coin parameters have changed:", param);
  }, [param]);

  const getInfo = async () => {
    try {
      // const poolKeys = await PoolKeys.fetchPoolKeyInfo(connection, new PublicKey(param.token), NATIVE_MINT)
      //   setPoolId(param.raydiumPoolAddr);
      setPoolId("B4Jag7SokpCb5MwVZEVck7WqWSqwbB7GibV5F1NMsMgM");
      console.log("poolId--->", param.raydiumPoolAddr);
    } catch (error) {
      console.log("error: Not found poolId");
      setPoolId("APyQX9Q3FwHkxNvSa7vT8iB4AGm38iaMkiAcpSNbVyZY");
    }
  };
  return (
    <>
      <Head>
        <title>Sample Demo TradingView with NextJS</title>
      </Head>
      <iframe
        height="500px"
        width="100%"
        id="geckoterminal-embed"
        title="GeckoTerminal Embed"
        src="https://www.geckoterminal.com/solana/pools/Gba9Nhz42yH94U63xJkLiwt9GuWgxyssarBnf91r1Jri?embed=1&info=0&swaps=0&grayscale=1&light_chart=0"
        style={{ border: "none" }}
        allow="clipboard-write"
        allowFullScreen
      ></iframe>
    </>
  );
};
