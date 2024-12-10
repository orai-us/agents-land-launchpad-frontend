import { coinInfo } from '@/utils/types';

import { FC, useContext, useState } from 'react';

interface TokenDataProps {
  coinData: coinInfo;
}

const TokenData: FC<TokenDataProps> = ({ coinData }) => {
  return (
    <div className="flex flex-col gap-3 px-2 mt-4">
      <img src={coinData.url} className="rounded-lg w-full" alt="Token IMG" width={200} height={300} />
      <div className="text-white flex flex-col gap-2 py-2">
        <p className="text-2xl font-semibold">Ticker: {coinData?.ticker}</p>
        <p className="text-lg">{coinData?.description}</p>
      </div>
    </div>
  );
};

export default TokenData;
