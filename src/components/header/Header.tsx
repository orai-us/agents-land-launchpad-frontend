"use client"
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { ConnectButton } from "../buttons/ConnectButton";
import { useRouter } from "next/navigation";
import { PiLightning } from "react-icons/pi";
import { PROGRAM_ID_IDL } from "@/program/cli/programId";
import { AgentsLandListener } from "@/program/logListeners/AgentsLandListener";
import { connection } from "@/program/web3";
import { coinInfo } from "@/utils/types";
import Link from "next/link";
import { CreatedTokenProgramLogsHandler } from "@/program/logListeners/CreatedTokenHandler";

const Header: FC = () => {
  const router = useRouter()

  const handleToRouter = (id: string) => {
    router.push(id)
  }

  const [latestCreatedToken, setLatestCreatedToken] = useState<coinInfo>(undefined);

  useEffect(() => {
    const listener = new AgentsLandListener(connection);
    listener.setProgramLogsCallback('Launch', (basicTokenInfo: any) => {
      const newCoinInfo:coinInfo = {
        creator: basicTokenInfo.creator,
        name: basicTokenInfo.metadata.name,
        url: basicTokenInfo.metadata.json.image ?? basicTokenInfo.metadata.uri,
        ticker: basicTokenInfo.metadata.symbol,
        reserveOne: 0,
        reserveTwo: 0,
        token: basicTokenInfo.mintAddress,
        commit: '',
      };
      console.log("new coin info: ", newCoinInfo)
      setLatestCreatedToken(newCoinInfo);
    });
    const subId = listener.subscribeProgramLogs(PROGRAM_ID_IDL.toBase58());

    return () => {
      connection.removeOnLogsListener(subId);
    }
  }, []);

  return (
    <div className="w-full h-[100px] flex flex-col justify-center items-center">
      <div className="container">
        <div className="w-full h-full flex flex-row justify-between items-center px-5">
          <div onClick={() => handleToRouter('/')} className="p-2 text-xl text-white flex flex-col justify-center items-center border-[1px] border-white rounded-full cursor-pointer">
            <PiLightning />
          </div>
          {latestCreatedToken && 
          <div>
            <Link className="bg-green-600 w-[200px] h-[50px] font-medium rounded-md " href={`/trading/${latestCreatedToken.token}`}>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <span>{`${latestCreatedToken.creator} created `}</span>
                <img src={latestCreatedToken.url} style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }}/>
                <span>{`${latestCreatedToken.name} on ${new Date().toDateString()}`}</span>
              </div>
            </Link>
          </div>
          }
          <div className="flex flex-col">
            <ConnectButton></ConnectButton>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
