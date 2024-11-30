import { coinInfo, recordInfo, tradeInfo } from "@/utils/types";
import { MessageForm } from "../MessageForm";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { Trade } from "./Trade";
import {
  calculateTokenPrice,
  getCoinTrade,
  getMessageByCoin,
  getSolPriceInUSD,
  getUser,
  getUserByWalletAddress,
} from "@/utils/util";
import UserContext from "@/context/UserContext";
import ReplyModal from "../modals/ReplyModal";
import { BiSort } from "react-icons/bi";
import { twMerge } from "tailwind-merge";
import ThreadSection from "../modals/Thread";
import { PROGRAM_ID } from "@/config";
import { AgentsLandEventListener } from "@/program/logListeners/AgentsLandEventListener";
import { ResultType } from "@/program/logListeners/types";
import { endpoint, commitmentLevel } from "@/program/web3";
import { Connection, PublicKey } from "@solana/web3.js";
import _ from "lodash";

interface ChattingProps {
  param: string | null;
  coin: coinInfo;
}

export const Chatting: React.FC<ChattingProps> = ({ param, coin }) => {
  const {
    messages,
    setMessages,
    newMsg,
    coinId,
    postReplyModal,
    setPostReplyModal,
    solPrice,
  } = useContext(UserContext);
  const [trades, setTrades] = useState<tradeInfo>({} as tradeInfo);
  const [isTrades, setIsTrades] = useState<Boolean>(true);
  const tempNewMsg = useMemo(() => newMsg, [newMsg]);

  // subscribe to real-time swap txs on trade
  useEffect(() => {
    if (_.isEmpty(trades) || _.isEmpty(coin)) return;
    const connection = new Connection(endpoint, {
      commitment: commitmentLevel,
      wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS,
    });
    const listener = new AgentsLandEventListener(connection);
    listener.setProgramEventCallback(
      "swapEvent",
      async (result: ResultType) => {
        // const solPrice = await getSolPriceInUSD();
        const userInfo = await getUserByWalletAddress({ wallet: result.user });
        const tx = await connection.getTransaction(result.tx, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });
        const newRecordInfo: recordInfo = {
          holder: userInfo,
          lamportAmount: result.lamportAmount,
          tokenAmount: result.tokenAmount,
          time: new Date(tx.blockTime),
          tx: result.tx,
          price: calculateTokenPrice(
            result.tokenReserves,
            result.lamportReserves,
            coin.decimals,
            solPrice
          ),
          swapDirection: result.swapDirection as any,
        };

        const newTradeRecords = [newRecordInfo, ...trades.record];
        setTrades({ ...trades, record: newTradeRecords });
      },
      []
    );

    const { program, listenerIds } = listener.listenProgramEvents(
      new PublicKey(PROGRAM_ID).toBase58()
    );

    return () => {
      if (!program) return;
      console.log("ready to remove listeners");
      Promise.all(listenerIds.map((id) => program.removeEventListener(id)));
    };
  }, [trades, coin]);

  useEffect(() => {
    const fetchData = async () => {
      if (param) {
        if (isTrades) {
          const data = await getMessageByCoin(param);
          setMessages(data);
        } else {
          const coinAddress = coin.token;
          const data = await getCoinTrade(coinAddress);
          setTrades(data);
        }
      }
    };
    fetchData();
  }, [isTrades, param]);

  useEffect(() => {
    if (coinId == coin._id) {
      setMessages([...messages, tempNewMsg]);
    }
  }, [tempNewMsg]);

  console.log("trades", trades);

  return (
    <div className="pt-8">
      <div className="hidden sm2:flex flex-row items-center text-white font-semibold">
        <div
          onClick={() => setIsTrades(true)}
          className={twMerge(
            "cursor-pointer hover:brightness-125 uppercase mr-4 px-4 py-[6px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]",
            isTrades && "bg-[#585A6B] text-[#E8E9EE]"
          )}
        >
          Thread
        </div>
        <div
          onClick={() => setIsTrades(false)}
          className={twMerge(
            "cursor-pointer hover:brightness-125 uppercase mr-4 px-4 py-[6px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]",
            !isTrades && "bg-[#585A6B] text-[#E8E9EE]"
          )}
        >
          Trades
        </div>
      </div>

      <div>
        {isTrades ? (
          coin && (
            // <div>
            // {messages &&
            //   messages.map((message, index) => (
            //     <MessageForm key={index} msg={message}></MessageForm>
            //   ))}
            //   <div
            //     onClick={() => setPostReplyModal(true)}
            //     className="w-[200px] flex flex-col justify-center text-center font-semibold bg-custom-gradient rounded-full px-8 py-2 text-xl cursor-pointer text-white mx-auto"
            //   >
            //     Post Reply
            //   </div>
            // </div>
            <div>
              <ThreadSection data={coin}></ThreadSection>

              <div className="mt-4 mb-12 h-screen max-h-[450px] overflow-y-auto">
                {messages &&
                  messages
                    .sort(
                      (a, b) =>
                        new Date(b.time).getTime() - new Date(a.time).getTime()
                    )
                    .map((message, index) => (
                      <MessageForm key={index} msg={message}></MessageForm>
                    ))}
              </div>
            </div>
          )
        ) : (
          <div className="w-full h-full py-4 px-4 border-[#1A1C28] border rounded-lg mt-4 mb-12">
            <table className="w-full h-full scroll-table">
              <thead className="w-full text-white">
                <tr className="text-lg">
                  <th className="py-2 text-[#585A6B] text-[12px] uppercase text-left">
                    Account
                  </th>
                  <th className="py-2 text-[#585A6B] text-[12px] uppercase">
                    Type
                  </th>
                  <th className="text-right py-2 text-[#585A6B] text-[12px] uppercase">
                    SOL AMOUNT
                    {/* <BiSort style={{ color: "#30344A" }} /> */}
                  </th>
                  <th className="text-right py-2 text-[#585A6B] text-[12px] uppercase">
                    TOKEN AMOUNT
                    {/* <BiSort style={{ color: "#30344A" }} /> */}
                  </th>
                  <th className="text-right py-2 text-[#585A6B] text-[12px] uppercase">
                    Date
                  </th>
                  <th className="text-right py-2 text-[#585A6B] text-[12px] uppercase">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="">
                {trades.record &&
                  trades.record
                    .filter(
                      (trans) =>
                        trans.tokenAmount?.toNumber() &&
                        trans.lamportAmount?.toNumber()
                    )
                    .map((trade, index) => (
                      <Trade key={index} trade={trade}></Trade>
                    ))}
              </tbody>
            </table>
          </div>
        )}
        {postReplyModal && <ReplyModal data={coin} />}
      </div>
    </div>
  );
};
