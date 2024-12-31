import { coinInfo } from '@/utils/types';

import { useEffect, useState } from 'react';

interface TradingChartProps {
  param: coinInfo;
}

export const CoinGeckoChart: React.FC<TradingChartProps> = ({ param }) => {
  const [poolId, setPoolId] = useState<string>('');

  useEffect(() => {
    getInfo();
    console.log('Coin parameters have changed:', param);
  }, [param]);

  const getInfo = async () => {
    try {
      setPoolId(param.raydiumPoolAddr);
      console.log('poolId--->', param.raydiumPoolAddr);
    } catch (error) {
      console.log('error: Not found poolId');
      setPoolId('');
    }
  };
  return (
    <>
      <iframe
        height="500px"
        width="100%"
        id="geckoterminal-embed"
        title="GeckoTerminal Embed"
        src={`https://www.geckoterminal.com/solana/pools/${poolId}?embed=1&info=0&swaps=0&grayscale=1&light_chart=0`}
        style={{ border: 'none' }}
        allow="clipboard-write"
        allowFullScreen
      ></iframe>
    </>
  );
};
