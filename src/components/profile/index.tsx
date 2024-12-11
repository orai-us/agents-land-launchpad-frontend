import nodataImg from "@/assets/icons/nodata.svg";
import defaultUserImg from "@/assets/images/user-avatar.png";
import Modal from "@/components/modals/Modal";
import { errorAlert, successAlert } from "@/components/others/ToastGroup";
import { ProfileMenuList } from "@/config/TextData";
import UserContext from "@/context/UserContext";
import { Web3SolanaProgramInteraction } from "@/program/web3";
import { formatNumberKMB, numberWithCommas } from "@/utils/format";
import { coinInfo, userInfo } from "@/utils/types";
import { getCoinsInfoBy, getUser, reduceString } from "@/utils/util";
import { useWallet } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const { user, setProfileEditModal, profileEditModal } =
    useContext(UserContext);
  const [param, setParam] = useState<string | null>(null);
  const [userData, setUserData] = useState<userInfo>({} as userInfo);
  const [option, setOption] = useState<number>(1);
  const [ownedToken, setOwnedToken] = useState<{
    uniqueTokenCount: number;
    tokenDetails: any;
  }>({ uniqueTokenCount: 0, tokenDetails: [] });
  const [coins, setCoins] = useState<coinInfo[]>([]);
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [pathname, setLocation] = useLocation();
  const { publicKey } = useWallet();

  console.log("location", location);

  useEffect(() => {
    if (!publicKey) {
      return;
    }
    (async () => {
      const { uniqueTokenCount, tokenDetails } =
        await new Web3SolanaProgramInteraction().getNumberOfOwnedToken(
          publicKey
        );

      setOwnedToken({ uniqueTokenCount, tokenDetails });
    })();
  }, [publicKey]);

  const handleToRouter = (id: string) => {
    if (id.startsWith("http")) {
      window.location.href = id; // For external links
    } else {
      setLocation(id); // For internal routing
    }
  };

  const fetchUserData = async (id: string) => {
    try {
      const response = await getUser({ id });
      setUserData(response);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchCoinsData = async (userId: string) => {
    try {
      const coinsBy = await getCoinsInfoBy(userId);

      setCoins(coinsBy);
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  };

  useEffect(() => {
    const segments = pathname.split("/");
    const id = segments[segments.length - 1];
    if (id && id !== param) {
      setParam(id);
      fetchUserData(id);
    }
  }, [pathname]);

  useEffect(() => {
    if (option === 2 && param) {
      fetchCoinsData(param);
    }
  }, [option, param]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess("Copied!");
      successAlert("Copied to clipboard!");
    } catch (err) {
      setCopySuccess("Failed to copy!");
      errorAlert("Failed to copy!");
    }
  };

  return (
    <div className="w-full h-full flex items-start gap-8 mt-8 md:mt-16 flex-col md:flex-row mb-10">
      <div className="w-full md:max-w-[350px] bg-[#13141D] p-6 rounded-lg">
        <div className="flex flex-col gap-6">
          <img
            src={userData.avatar || defaultUserImg}
            alt="Avatar"
            className="object-cover w-16 h-16 rounded-lg"
          />
          <div className="w-full flex flex-col text-white font-medium gap-2">
            <div className="text-[24px] text-[#E8E9EE]">
              @{userData.name}
              {/* <LuFileEdit
                onClick={() => setProfileEditModal(true)}
                className="cursor-pointer text-2xl hover:text-[#143F72] text-white"
              /> */}
            </div>
            {/* <div
              className="flex flex-col w-[165px] text-lg cursor-pointer border-b-[1px] hover:text-[#143F72] text-white hover:border-b-[#143F72] border-b-white px-2 justify-center xs:justify-start"
              onClick={() =>
                handleToRouter(`https://solscan.io/account/${userData.wallet}`)
              }
            >
              View on Solscan
            </div> */}
            <div className="flex items-center">
              <p className="mr-2 text-[14px] text-[#9192A0]">
                {reduceString(userData?.wallet || "", 4, 4)}
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="cursor-pointer hover:brightness-125"
                onClick={() => copyToClipboard(userData?.wallet)}
              >
                <path
                  d="M14.1665 14.6676H5.99988C5.86727 14.6676 5.74009 14.615 5.64632 14.5212C5.55256 14.4274 5.49988 14.3003 5.49988 14.1676V6.00098C5.49988 5.86837 5.55256 5.74119 5.64632 5.64742C5.74009 5.55365 5.86727 5.50098 5.99988 5.50098H14.1665C14.2992 5.50098 14.4263 5.55365 14.5201 5.64742C14.6139 5.74119 14.6665 5.86837 14.6665 6.00098V14.1676C14.6665 14.3003 14.6139 14.4274 14.5201 14.5212C14.4263 14.615 14.2992 14.6676 14.1665 14.6676Z"
                  stroke="#585A6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.4999 5.50065V1.83398C10.4999 1.70138 10.4472 1.5742 10.3535 1.48043C10.2597 1.38666 10.1325 1.33398 9.99992 1.33398H1.83325C1.70064 1.33398 1.57347 1.38666 1.4797 1.48043C1.38593 1.5742 1.33325 1.70138 1.33325 1.83398V10.0006C1.33325 10.1333 1.38593 10.2604 1.4797 10.3542C1.57347 10.448 1.70064 10.5007 1.83325 10.5007H5.49992"
                  stroke="#585A6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-row pt-6 items-center justify-between">
          <div className="w-fit flex flex-col justify-center gap-1 text-center">
            <div className="text-[12px] text-[#9192A0] uppercase">
              TOKEN HELD
            </div>
            <div className="text-[16px] text-white font-medium">
              {ownedToken.uniqueTokenCount || 0}
            </div>
          </div>
          <div className="w-fit flex flex-col justify-center gap-1 text-center">
            <div className="text-[12px] text-[#9192A0] uppercase">
              followers
            </div>
            <div className="text-[16px] text-white font-medium">--</div>
          </div>
          <div className="w-fit flex flex-col justify-center gap-1 text-center">
            <div className="text-[12px] text-[#9192A0] uppercase">
              Following
            </div>
            <div className="text-[16px] text-white font-medium">--</div>
          </div>
        </div>
        <div
          className="cursor-pointer bg-[#1A1C28] rounded-lg h-12 flex items-center justify-center mt-6"
          onClick={() => setProfileEditModal(true)}
        >
          EDIT PROFILE
        </div>
      </div>
      <div className="w-full">
        <div className="flex">
          {ProfileMenuList.map((item) => (
            <div
              key={item.id}
              onClick={() => setOption(item.id)}
              className={twMerge(
                "text-[12px] md:text-[14px] cursor-pointer uppercase mr-4 px-4 py-[6px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]",
                option === item.id && "bg-[#585A6B] text-[#E8E9EE]"
              )}
            >
              {item.text}
            </div>
          ))}
        </div>
        <div className="w-full">
          {option === 2 && (
            <div className="flex flex-wrap">
              {!coins.length ? (
                <div className="w-full mt-4 rounded-lg bg-[#13141D] border border-dashed border-[#30344A] py-12 px-8 flex flex-col justify-center items-center">
                  <img src={nodataImg} alt="nodata" />
                  <p className="mt-4 text-[#E8E9EE] text-[16px]">No Token</p>
                  <p className="mt-2 text-[#585A6B] text-[14px]">
                    No Token Held
                  </p>
                </div>
              ) : (
                <div className="w-full h-full py-4 px-4 border-[#1A1C28] border rounded-lg mt-4">
                  <table className="w-full h-full scroll-table">
                    <thead className="w-full text-white border-b-[1px] border-b-[#1A1C28]">
                      <tr className="text-lg">
                        <th className="py-2 text-[#585A6B] text-[12px] uppercase text-left">
                          Token
                        </th>
                        {/* <th className="py-2 text-[#585A6B] text-[12px] uppercase text-right">
                        Price
                      </th> */}
                        <th className="py-2 text-[#585A6B] text-[12px] uppercase text-right">
                          Marketcap
                        </th>
                        {/* <th className="py-2 text-[#585A6B] text-[12px] uppercase text-right">
                      CHANGE
                      </th> */}
                        <th className="py-2 text-[#585A6B] text-[12px] uppercase text-right pr-4">
                          Date Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {coins.map((coin, index) => (
                        <tr
                          key={`${index}-tk-details`}
                          className="w-full border-b-[1px] border-b-[#1A1C28] text-[#E8E9EE]"
                        >
                          <td className="flex flex-row gap-2 items-center py-4">
                            <div className="text-lg flex items-center">
                              <img
                                src={coin.url}
                                alt="coinUrl"
                                className="rounded-full w-6 h-6 border border-[#E8E9EE]"
                              />
                              &nbsp;
                              {coin.ticker}
                            </div>
                          </td>
                          {/* <td className="py-2 text-right">
                            {numberWithCommas(coin.balance || 0)}
                          </td> */}
                          <td className="py-2 text-right">
                            {" "}
                            {formatNumberKMB(Number(coin.marketcap || 0))}
                          </td>
                          {/* <td className="py-2 text-right">
                            {numberWithCommas(coin.balance || 0)}
                          </td> */}
                          <td className="py-2 text-right">
                            {dayjs(coin.date || Date.now()).format(
                              "DD/MM/YYYY"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                // coins.map((coin) => (
                //   <div
                //     key={coin.token}
                //     onClick={() => handleToRouter(`/trading/${coin.token}`)}
                //     className="cursor-pointer"
                //   >
                //     <CoinBlog coin={coin} componentKey="coin" />
                //   </div>
                // ))
              )}
            </div>
          )}
          {option === 1 && (
            <div className="">
              {!ownedToken.tokenDetails.length ? (
                <div className="w-full mt-4 rounded-lg bg-[#13141D] border border-dashed border-[#30344A] py-12 px-8 flex flex-col justify-center items-center">
                  <img src={nodataImg} alt="nodata" />
                  <p className="mt-4 text-[#E8E9EE] text-[16px]">No Token</p>
                  <p className="mt-2 text-[#585A6B] text-[14px]">
                    No Token Held
                  </p>
                </div>
              ) : (
                <div className="w-full h-full py-4 px-4 border-[#1A1C28] border rounded-lg mt-4">
                  <table className="w-full h-full scroll-table">
                    <thead className="w-full text-white border-b-[1px] border-b-[#1A1C28]">
                      <tr className="text-lg">
                        <th className="py-2 text-[#585A6B] text-[12px] uppercase text-left">
                          Token Address
                        </th>
                        <th className="py-2 text-[#585A6B] text-[12px] uppercase text-right pr-4">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {ownedToken.tokenDetails
                        .filter((tk) => tk.balance)
                        .sort((a, b) => b.balance - a.balance)
                        .map((tk, index) => (
                          <tr
                            key={`${index}-tk-details`}
                            className="w-full border-b-[1px] border-b-[#1A1C28] text-[#E8E9EE]"
                          >
                            <td className="flex flex-row gap-2 items-center py-4">
                              <a
                                href={`https://solscan.io/account/${tk.mint}`}
                                target="_blank"
                                className="text-lg underline hover:cursor-pointer"
                              >
                                {reduceString(tk.mint || "", 4, 4)}
                              </a>
                            </td>
                            <td className="py-2 text-right">
                              {numberWithCommas(tk.balance || 0)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        {profileEditModal && <Modal data={userData} />}
      </div>
    </div>
  );
}
