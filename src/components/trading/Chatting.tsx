import { ALL_CONFIGS, PROGRAM_ID } from '@/config';
import UserContext from '@/context/UserContext';
import { AgentsLandEventListener } from '@/program/logListeners/AgentsLandEventListener';
import { ResultType } from '@/program/logListeners/types';
import { commitmentLevel, endpoint } from '@/program/web3';
import { coinInfo, recordInfo, tradeInfo } from '@/utils/types';
import {
  calculateTokenPrice,
  getCoinTrade,
  getMessageByCoin,
} from '@/utils/util';
import { Connection, PublicKey } from '@solana/web3.js';
import _ from 'lodash';
import { useContext, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TOKENOMICS_LIST } from '../creatToken';
import ListFungibleStake from '../launchingLock/ListFungibleStake';
import ReplyModal from '../modals/ReplyModal';
import { Trade } from './Trade';

interface ChattingProps {
  param: string | null;
  coin: coinInfo;
}

enum CHAT_TAB {
  LOCK,
  TRADE,
  TOKENOMICS,
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
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isTrades, setIsTrades] = useState<CHAT_TAB>(CHAT_TAB.LOCK);
  const tempNewMsg = useMemo(() => newMsg, [newMsg]);

  const ENDDATE =
    new Date(coin.date).getTime() +
    ALL_CONFIGS.TIMER.DAY_TO_SECONDS * ALL_CONFIGS.TIMER.MILLISECOND;
  const tradingTime = coin?.tradingTime
    ? new Date(coin?.tradingTime).getTime()
    : ENDDATE;
  const isNotForSale = tradingTime > Date.now();

  // subscribe to real-time swap txs on trade
  useEffect(() => {
    if (_.isEmpty(trades) || _.isEmpty(coin)) return;
    const connection = new Connection(endpoint, {
      commitment: commitmentLevel,
      wsEndpoint: import.meta.env.VITE_SOLANA_WS,
    });
    const listener = new AgentsLandEventListener(connection);
    listener.setProgramEventCallback(
      'swapEvent',
      async (result: ResultType) => {
        const tx = await connection.getTransaction(result.tx, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        });
        const newRecordInfo: recordInfo = {
          holder: { wallet: result.user } as any,
          lamportAmount: result.lamportAmount,
          tokenAmount: result.tokenAmount,
          time: new Date(tx.blockTime * ALL_CONFIGS.TIMER.MILLISECONDS),
          tx: result.tx,
          price: calculateTokenPrice(
            result.tokenReserves,
            result.lamportReserves,
            coin.decimals,
            solPrice
          ),
          swapDirection: result.swapDirection as any,
        };

        setTrades((trades) => {
          const newTradeRecords = [newRecordInfo, ...trades.record];
          return { ...trades, record: newTradeRecords };
        });
      },
      []
    );

    const { program, listenerIds } = listener.listenProgramEvents(
      new PublicKey(PROGRAM_ID).toBase58()
    );

    return () => {
      if (!program) return;
      console.log('Trading---ready to remove listeners');
      Promise.all(listenerIds.map((id) => program.removeEventListener(id)));
    };
  }, [coin?._id, loaded]);

  useEffect(() => {
    const fetchData = async () => {
      if (param) {
        if (isTrades === CHAT_TAB.LOCK) {
          // const data = await getMessageByCoin(param);
          // setMessages(data);
        } else if (coin?.token && isTrades === CHAT_TAB.TRADE) {
          const coinAddress = coin.token;
          const data = await getCoinTrade(coinAddress);
          setTrades(data);
          setLoaded(true);
        }
      }
    };
    fetchData();
  }, [isTrades, param, coin?._id]);

  useEffect(() => {
    if (coinId == coin._id) {
      setMessages([...messages, tempNewMsg]);
    }
  }, [tempNewMsg]);

  return (
    <div className={twMerge('pt-8')}>
      {!isNotForSale && (
        <div className="flex flex-row items-center text-white font-semibold">
          <div
            onClick={() => setIsTrades(CHAT_TAB.LOCK)}
            className={twMerge(
              'uppercase cursor-pointer mr-2 md:mr-4 px-2 md:px-4 py-[6px] text-[12px] md:text-[14px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]',
              isTrades === CHAT_TAB.LOCK && 'bg-[#585A6B] text-[#E8E9EE]'
            )}
          >
            {coin.ticker} Launching Vaults
          </div>
          <div
            onClick={() => setIsTrades(CHAT_TAB.TRADE)}
            className={twMerge(
              'uppercase cursor-pointer mr-2 md:mr-4 px-2 md:px-4 py-[6px] text-[12px] md:text-[14px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]',
              isTrades === CHAT_TAB.TRADE && 'bg-[#585A6B] text-[#E8E9EE]'
            )}
          >
            Trades
          </div>
          <div
            onClick={() => setIsTrades(CHAT_TAB.TOKENOMICS)}
            className={twMerge(
              'uppercase cursor-pointer mr-2 md:mr-4 px-2 md:px-4 py-[6px] text-[12px] md:text-[14px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]',
              isTrades === CHAT_TAB.TOKENOMICS && 'bg-[#585A6B] text-[#E8E9EE]'
            )}
          >
            Tokenomics
          </div>
        </div>
      )}

      <div>
        {isTrades === CHAT_TAB.LOCK && coin && (
          <div>
            <ListFungibleStake />
            {/* <ThreadSection data={coin}></ThreadSection>

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
            </div> */}
          </div>
        )}

        {isTrades === CHAT_TAB.TRADE && (
          <div className="w-full h-full py-4 px-4 border-[#1A1C28] border rounded-lg mt-4 mb-12">
            <div className="scrollable-table-container">
              <table className="w-full h-full scroll-table">
                <thead className="w-full text-white">
                  <tr className="text-lg">
                    <th className="py-2 text-[#585A6B] text-[10px] md:text-[12px] uppercase text-left">
                      Account
                    </th>
                    <th className="py-2 text-[#585A6B] text-[10px] md:text-[12px] uppercase">
                      Type
                    </th>
                    <th className="text-right py-2 text-[#585A6B] text-[10px] md:text-[12px] uppercase">
                      SOL AMOUNT
                      {/* <BiSort style={{ color: "#30344A" }} /> */}
                    </th>
                    <th className="text-right py-2 text-[#585A6B] text-[10px] md:text-[12px] uppercase">
                      TOKEN AMOUNT
                      {/* <BiSort style={{ color: "#30344A" }} /> */}
                    </th>
                    <th className="text-right py-2 text-[#585A6B] text-[10px] md:text-[12px] uppercase">
                      Date
                    </th>
                    <th className="text-right py-2 text-[#585A6B] text-[10px] md:text-[12px] uppercase">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="min-w-[320px]">
                  {trades?.record &&
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
          </div>
        )}

        {isTrades === CHAT_TAB.TOKENOMICS && (
          <div className="w-full border border-[#1A1C28] rounded p-3 md:p-6 mt-4 mb-12">
            {TOKENOMICS_LIST.map((e, idx) => {
              return (
                <div
                  key={`key-${idx}-tokenomic-${e.text}-${e.color}`}
                  className="flex items-center mb-4"
                >
                  <div
                    className={twMerge(
                      `w-3 h-3 rounded-[2px] mr-2 bg-[${e.color}]`
                    )}
                    style={{
                      backgroundColor: e.color,
                    }}
                  ></div>
                  <div className="text-[14px] text-[#E8E9EE] font-medium">
                    {e.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {postReplyModal && <ReplyModal data={coin} />}
      </div>
    </div>
  );
};
