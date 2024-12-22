import { FC, useContext } from 'react';

import { Link, useLocation } from 'wouter';
import UserContext from '@/context/UserContext';
import TestTokenImg from '@/assets/images/test-token-bg.png';

const TopToken: FC = () => {
  return (
    <div className="w-full h-full px-2">
      <div className="w-full justify-between flex flex-col xs:flex-row items-start gap-6">
        <div className="w-full h-full">
          <img
            src={TestTokenImg}
            alt="TestTokenImg"
            className="h-[160px] xs:h-[250px] rounded-lg mx-auto"
          />
        </div>
        <div className="w-full max-w-[450px] h-full flex flex-col gap-6 justify-between items-start text-white">
          <div className="w-full text-2xl xs:text-4xl text-center xs:text-start font-bold">
            Start Launch Your Next 1000X Meme
          </div>
          <div className="w-full text-md xs:text-xl text-center xs:text-start">
            Ready to Become a Crypto Millionaire?
            <br />
            Fairlaunch Now in 10 Seconds
          </div>
          <Link
            href="/create-coin"
            className="px-14 py-2 bg-custom-gradient rounded-lg cursor-pointer mx-auto xs:mx-0"
          >
            Create a Token
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopToken;
