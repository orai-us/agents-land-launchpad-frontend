'use client';
import nodataImg from '@/assets/icons/noagentdata.svg';
import MountainImg from '@/assets/images/mount_guide.png';
import AgentImg from '@/assets/images/userAgentDefault.svg';
import { Spinner } from '@/components/loadings/Spinner';
import { errorAlert } from '@/components/others/ToastGroup';
import { useSocket } from '@/contexts/SocketContext';
import { Web3SolanaProgramInteraction } from '@/program/web3';
import { uploadImage, uploadMetadata } from '@/utils/fileUpload';
import {
  coinInfo,
  createCoinInfo,
  launchDataInfo,
  metadataInfo,
} from '@/utils/types';
import {
  getAgentsData,
  getAgentsDataByUser,
  getCoinsInfoBy,
  getUserByWalletAddress,
  reduceString,
} from '@/utils/util';
import { useWallet } from '@solana/wallet-adapter-react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Link, useLocation } from 'wouter';
import DropzoneFile from '../uploadFile/DropzoneFile';
import CreateTokenSuccess from './CreateTokenSuccess';
import PreSaleModal from './Presale';
import { Circles } from 'react-loader-spinner';
import ZappingText from '../zapping';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { ALL_CONFIGS } from '@/config';

export enum STEP_TOKEN {
  INFO,
  BEHAVIOR,
}

export default function CreateToken() {
  const [imageUrl, setIamgeUrl] = useState<string>('');
  const { isLoading, setIsLoading } = useSocket();
  const [agentPersonality, setAgentPersonality] = useState<string>(
    AGENT_PERSONALITY[0].value
  );
  const [agentStyle, setAgentStyle] = useState<string>(AGENT_STYLE[0].value);
  const [showOptional, setShowOptional] = useState<boolean>(false);
  const [showModalPreSale, setShowModalPreSale] = useState<boolean>(false);
  const [showModalSuccess, setShowModalSuccess] = useState<boolean>(false);
  const [coinCreatedData, setCoinCreatedData] = useState(null);
  const [newCoin, setNewCoin] = useState<createCoinInfo>({} as createCoinInfo);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [getAmt, setGetAmt] = useState<number>(0);
  const [step, setStep] = useState<STEP_TOKEN>(STEP_TOKEN.INFO);
  const [agentList, setAgentList] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectGroup, setSelectedGroup] = useState(false);
  const refAgent = useRef();
  const [errors, setErrors] = useState({
    name: false,
    ticker: false,
    description: false,
    image: false,
  });
  const wallet = useWallet();
  const [unCreatableToken, setUnCreatableToken] = useState<coinInfo[]>([]);

  const fetchCountdownCoin = async (userAddress: string) => {
    try {
      const response = await getUserByWalletAddress({ wallet: userAddress });
      const userId = response?._id;

      if (!userId) return;
      const coinsBy = await getCoinsInfoBy(userId);
      if (coinsBy) {
        setUnCreatableToken(coinsBy);
        return coinsBy;
      }
    } catch (error) {
      console.log('Error fetching coins:', error);
    }
  };
  useEffect(() => {
    if (wallet.publicKey) {
      fetchCountdownCoin(wallet.publicKey.toBase58());
    }
  }, [wallet.publicKey]);

  useOnClickOutside(refAgent, () => {
    setSelectedGroup(false);
  });

  useEffect(() => {
    // Clear errors when newCoin changes
    setErrors({
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      description: !newCoin.description,
      image: !imageUrl,
    });
  }, [newCoin, imageUrl]);

  useEffect(() => {
    if (wallet.publicKey) {
      (async () => {
        const res = await getAgentsDataByUser({ user: wallet.publicKey });

        if (res) {
          setAgentList(res['items']);
          // setSelectedAgent(res['items'][0]); // TODO: dont auto select
        }
      })();
    }
  }, [wallet.publicKey]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCoin({ ...newCoin, [e.target.id]: e.target.value });
  };

  const handlePresaleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = e.target.value;

    // Validate input
    const numericValue = parseFloat(value);
    if (numericValue > 1.5 || numericValue < 0) {
      errorAlert('Presale amount must be between 0 and 1.5 SOL');
      return;
    }
    // Set the input value regardless of validation
    setNewCoin((prevState) => ({ ...prevState, [e.target.id]: value }));

    const getAmount =
      1_000_000_000 - (30 * 1_000_000_000) / (30 + (numericValue * 99) / 100);

    setGetAmt(getAmount);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('file--->', file);
    if (file) {
      setSelectedFileName(file.name);
      setImagePreview(URL.createObjectURL(file));
      setIamgeUrl(URL.createObjectURL(file));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Accepted files:', acceptedFiles);
    const file = acceptedFiles?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIamgeUrl(URL.createObjectURL(file));
    }
  }, []);

  const validateForm = () => {
    const validationErrors = {
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      description: !newCoin.description,
      image: !imageUrl,
      // tokenSupply: !newCoin.tokenSupply,
      // virtualReserves: !newCoin.virtualReserves,
      // preSale: !newCoin.presale,
    };
    setErrors(validationErrors);
    return !Object.values(validationErrors).includes(true);
  };

  const createCoin = async () => {
    console.log('imageUrl--->', imageUrl, imagePreview);
    if (!validateForm()) {
      errorAlert('Please fix the errors before submitting.');
      return;
    }

    try {
      setIsLoading(true);

      const unCreatableToken = await fetchCountdownCoin(
        wallet.publicKey?.toBase58()
      );

      if (unCreatableToken) {
        const isSelectedAgentHasCoin = unCreatableToken.find(
          (tk) =>
            tk.metadata?.agentAddress === selectedAgent?.botWallet?.solAddr
        );

        if (isSelectedAgentHasCoin) {
          errorAlert(
            'Your agent has been tokenized! Please select another agent!'
          );
          return;
        }
      }

      // Process image upload
      const uploadedImageUrl = await uploadImage(imageUrl);
      if (!uploadedImageUrl) {
        errorAlert('Image upload failed.');
        setIsLoading(false);
        return;
      }
      const jsonData: metadataInfo = {
        name: newCoin.name,
        symbol: newCoin.ticker,
        image: uploadedImageUrl,
        description: newCoin.description,
        agentPersonality: agentPersonality || undefined,
        agentStyle: agentStyle || undefined,
        createdOn: 'https://agent.land',
        twitter: newCoin.twitter || undefined, // Only assign if it exists
        website: newCoin.website || undefined, // Only assign if it exists
        telegram: newCoin.telegram || undefined, // Only assign if it exists
        discord: newCoin.discord || undefined, // Only assign if it exists
        agentId: selectedAgent?.id,
        agentAddress: selectedAgent?.botWallet?.solAddr,
      };
      // Process metadata upload
      const uploadMetadataUrl = await uploadMetadata(jsonData);
      if (!uploadMetadataUrl) {
        errorAlert('Metadata upload failed.');
        setIsLoading(false);
        return;
      }

      console.log('uploadMetadataUrl', uploadedImageUrl, uploadMetadataUrl);
      const coinData: launchDataInfo = {
        name: newCoin.name,
        symbol: newCoin.ticker,
        uri: uploadMetadataUrl,
        presale: newCoin.presale,
        metadata: jsonData,
        decimals: 6,
      };
      console.log('coinData--->', coinData);

      const web3Solana = new Web3SolanaProgramInteraction();
      const res = await web3Solana.createToken(wallet, coinData);
      if (res === 'WalletError' || !res) {
        errorAlert('Payment failed or was rejected.');
        setIsLoading(false);
        return;
      }
      // setLocation("/");
      setShowModalSuccess(true);
      setSelectedAgent(null);
      setCoinCreatedData({ ...res, jsonData });
    } catch (error) {
      errorAlert('An unexpected error occurred.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // newCoin.presale &&
  // newCoin.virtualReserves &&
  // newCoin.tokenSupply &&

  const formValid =
    newCoin.name &&
    newCoin.ticker &&
    newCoin.description &&
    imageUrl &&
    selectedAgent;

  const isSelectedAgentHasCoin = unCreatableToken.find(
    (tk) => tk.metadata?.agentAddress === selectedAgent?.botWallet?.solAddr
  );

  return (
    <div className="w-full m-auto my-24 mt-4 md:mt-10">
      <PreSaleModal
        isOpen={showModalPreSale}
        closeModal={() => setShowModalPreSale(false)}
        onConfirm={createCoin}
        quantity={newCoin.presale}
        setQuantity={handlePresaleChange}
      />
      <CreateTokenSuccess
        isOpen={showModalSuccess}
        coin={coinCreatedData}
        closeModal={() => setShowModalSuccess(false)}
      />
      <Link href="/" className="w-fit">
        <div className="w-fit uppercase cursor-pointer text-[#FCFCFC] text-2xl flex flex-row items-center gap-2 pb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
          >
            <path
              d="M10.5171 11.9999L18.3546 3.83901C18.5515 3.63745 18.5468 3.30464 18.3452 3.09839L16.9437 1.66401C16.7421 1.45776 16.414 1.45307 16.2171 1.65464L6.64521 11.6203C6.54209 11.7234 6.49521 11.864 6.50459 11.9999C6.4999 12.1406 6.54678 12.2765 6.64521 12.3796L16.2171 22.3499C16.414 22.5515 16.7421 22.5468 16.9437 22.3406L18.3452 20.9062C18.5468 20.6999 18.5515 20.3671 18.3546 20.1656L10.5171 11.9999Z"
              fill="#FCFCFC"
            />
          </svg>
          tokenized agent
        </div>
      </Link>

      {isLoading && (
        <div className="w-full h-full fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-lg z-50">
          <div className="w-[350px] h-[220px] flex flex-col justify-center items-center relative p-6  bg-[#13141D] rounded-lg shadow-lg">
            <button
              onClick={() => setIsLoading(!isLoading)}
              className="absolute top-6 right-6  hover:brightness-125 text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="w-[350px] h-[200px] flex flex-col gap-4 justify-center items-center">
              <Circles
                height="80"
                width="80"
                color="#E4775D"
                ariaLabel="circles-loading"
                visible={true}
              />

              <div className="right-6 text-1xl p-2">
                <ZappingText text={'Transaction processing'} dot={5} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full text-[14px] text-[#9192A0] mb-4 mt-4">
        {/* Input the details as you go about your project and after 2 steps, your
        Agent is set to go live. */}
      </div>
      <div className="flex justify-between items-start flex-col md:flex-row">
        <div className="w-full flex flex-col gap-6 bg-[#13141D] rounded-lg p-4 md:p-8">
          <div className="text-[#E8E9EE] text-[18px] font-medium">
            {step === STEP_TOKEN.INFO ? 'Project info' : 'Agent Behaviors'}
          </div>
          {step === STEP_TOKEN.INFO && (
            <div className="flex flex-col gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="text-[12px] font-medium text-[#84869A] flex items-center cursor-pointer"
                >
                  AGENT&nbsp;<span className="text-red-700">*</span>
                  <div className="group relative cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="ml-1"
                    >
                      <path
                        d="M6 1.3125C3.41531 1.3125 1.3125 3.41531 1.3125 6C1.3125 8.58469 3.41531 10.6875 6 10.6875C8.58469 10.6875 10.6875 8.58469 10.6875 6C10.6875 3.41531 8.58469 1.3125 6 1.3125ZM6 3.23438C6.12052 3.23438 6.23834 3.27011 6.33855 3.33707C6.43876 3.40403 6.51687 3.4992 6.56299 3.61055C6.60911 3.7219 6.62118 3.84443 6.59767 3.96263C6.57415 4.08084 6.51612 4.18942 6.43089 4.27464C6.34567 4.35987 6.23709 4.4179 6.11888 4.44142C6.00068 4.46493 5.87815 4.45286 5.7668 4.40674C5.65545 4.36062 5.56028 4.28251 5.49332 4.1823C5.42636 4.08209 5.39062 3.96427 5.39062 3.84375C5.39062 3.68213 5.45483 3.52714 5.56911 3.41286C5.68339 3.29858 5.83838 3.23438 6 3.23438ZM7.125 8.53125H5.0625C4.96304 8.53125 4.86766 8.49174 4.79734 8.42142C4.72701 8.35109 4.6875 8.25571 4.6875 8.15625C4.6875 8.05679 4.72701 7.96141 4.79734 7.89108C4.86766 7.82076 4.96304 7.78125 5.0625 7.78125H5.71875V5.71875H5.34375C5.24429 5.71875 5.14891 5.67924 5.07859 5.60891C5.00826 5.53859 4.96875 5.44321 4.96875 5.34375C4.96875 5.24429 5.00826 5.14891 5.07859 5.07859C5.14891 5.00826 5.24429 4.96875 5.34375 4.96875H6.09375C6.19321 4.96875 6.28859 5.00826 6.35892 5.07859C6.42924 5.14891 6.46875 5.24429 6.46875 5.34375V7.78125H7.125C7.22446 7.78125 7.31984 7.82076 7.39017 7.89108C7.46049 7.96141 7.5 8.05679 7.5 8.15625C7.5 8.25571 7.46049 8.35109 7.39017 8.42142C7.31984 8.49174 7.22446 8.53125 7.125 8.53125Z"
                        fill="#585A6B"
                      />
                    </svg>

                    <div className="pb-2 invisible group-hover:visible absolute bottom-full w-screen max-w-[210px]">
                      <div className="bg-[#30344A] shadow shadow-[rgba(0,_0,_0,_0.10)] p-3 text-[12px] text-[#F7F7F7] rounded-lg">
                        Private intellegent created from mesh.distilled.ai
                      </div>
                    </div>
                  </div>
                </label>

                <div
                  ref={refAgent}
                  className="relative cursor-pointer mt-3"
                  onClick={() => {
                    setSelectedGroup(!selectGroup);
                  }}
                >
                  <div className="flex items-center justify-between w-full px-3 border border-[#585A6B] rounded h-12">
                    <div className="flex items-center">
                      {selectedAgent?.avatar ? (
                        <img
                          src={selectedAgent?.avatar}
                          alt="agentImg"
                          width={32}
                          height={32}
                          className="border-[1.5px] w-8 h-8 object-cover border-[#ADADAD] rounded-full"
                        />
                      ) : (
                        <img
                          src={AgentImg}
                          alt="agentImg"
                          width={32}
                          height={32}
                          className="border-[1.5px] w-8 h-8 object-cover border-[#ADADAD] rounded-full"
                        />
                      )}

                      <div className="text-[#E8E9EE] text-[14px] font-medium ml-[10px]">
                        {selectedAgent?.username || '--'}
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.2071 8.24992C18.8166 7.8594 18.1834 7.8594 17.7929 8.24992L12 14.0428L6.20711 8.24992C5.81658 7.8594 5.18342 7.8594 4.79289 8.24992C4.40237 8.64044 4.40237 9.27361 4.79289 9.66413L10.5858 15.457C11.3668 16.2381 12.6332 16.2381 13.4142 15.457L19.2071 9.66414C19.5976 9.27361 19.5976 8.64045 19.2071 8.24992Z"
                        fill="#9192A0"
                      />
                    </svg>
                  </div>
                  {selectGroup && (
                    <div className="pt-2 absolute top-full w-full">
                      <div className="bg-[#1A1C28] shadow shadow-[rgba(0,_0,_0,_0.10)] p-3 text-[12px] text-[#F7F7F7] rounded-lg flex flex-col gap-2 overflow-y-auto max-h-52 h-100%">
                        {agentList.length <= 0 ? (
                          <div className="w-full mt-4 rounded-lg bg-[#13141D] border border-dashed border-[#30344A] py-4 px-8 flex flex-col justify-center items-center">
                            <img src={nodataImg} alt="nodata" />
                            <p className="mt-4 text-[#E8E9EE] text-[16px] uppercase">
                              No Agent
                            </p>
                            <a
                              href="https://mesh.distilled.ai"
                              target="_blank"
                              className="mt-2 text-[#585A6B] text-[14px] hover:underline"
                            >
                              mesh.distilled.ai
                            </a>
                          </div>
                        ) : (
                          agentList.map((e, ind) => {
                            const agentHasCoin = unCreatableToken.find(
                              (tk) =>
                                tk.metadata?.agentAddress ===
                                e?.botWallet?.solAddr
                            );
                            return (
                              <button
                                disabled={!!agentHasCoin}
                                className={twMerge(
                                  'flex items-center justify-between rounded-lg hover:bg-[#13141D] p-3 disabled:cursor-not-allowed',
                                  e?.botWallet?.solAddr ===
                                    selectedAgent?.botWallet?.solAddr &&
                                    'bg-[#13141D] cursor-not-allowed',
                                  agentHasCoin && 'hover:bg-transparent'
                                )}
                                key={`agent-item-${ind}`}
                                onClick={() => setSelectedAgent(e)}
                              >
                                <div className="flex items-center">
                                  {typeof e.img === 'string' ? (
                                    <img
                                      src={e.avatar as any}
                                      alt="agentImg"
                                      width={32}
                                      height={32}
                                      className="border-[1.5px] w-8 h-8 object-cover border-[#ADADAD] rounded-full"
                                    />
                                  ) : (
                                    <img
                                      src={e.avatar as any}
                                      alt="agentImg"
                                      width={32}
                                      height={32}
                                      className="border-[1.5px] w-8 h-8 object-cover border-[#ADADAD] rounded-full"
                                    />
                                  )}
                                  <div className="text-[#E8E9EE] text-left text-[14px] font-medium ml-[10px]">
                                    <p>{e.username}</p>
                                    <p className="text-[#585A6B] text-[12px] font-medium text-left">
                                      {reduceString(
                                        e?.botWallet?.solAddr,
                                        4,
                                        4
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <>
                                  {agentHasCoin && (
                                    <div className="flex items-center text-[#585A6B] text-[12px] font-medium ">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                      >
                                        <path
                                          d="M9.75 3L4.5 9L2.25 6.75"
                                          stroke="#9192A0"
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                        />
                                      </svg>
                                      <span className="ml-1">Tokenized</span>
                                    </div>
                                  )}
                                </>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center w-full gap-4 flex-col md:flex-row">
                <div className="flex-1 w-full">
                  <label
                    htmlFor="name"
                    className="text-[12px] font-medium text-[#84869A]"
                  >
                    TOKEN NAME <span className="text-red-700">*</span>
                  </label>
                  <input
                    role="presentation"
                    autoComplete="off"
                    id="name"
                    type="text"
                    value={newCoin.name || ''}
                    onChange={handleChange}
                    className={twMerge(
                      `outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded h-12 text-[#E8E9EE] bg-transparent`
                      // errors.name && "border-red-700"
                    )}
                  />
                </div>

                <div className="flex-1 w-full">
                  <label
                    htmlFor="ticker"
                    className="text-[12px] font-medium text-[#84869A]"
                  >
                    TOKEN SYMBOL <span className="text-red-700">*</span>
                  </label>{' '}
                  <input
                    role="presentation"
                    autoComplete="off"
                    id="ticker"
                    type="text"
                    value={newCoin.ticker || ''}
                    onChange={handleChange}
                    className={twMerge(
                      `outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded h-12 text-[#E8E9EE] bg-transparent`
                      // errors.ticker && "border-red-700"
                    )}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="text-[12px] font-medium text-[#84869A]"
                >
                  TOKEN DESCRIPTION <span className="text-red-700">*</span>
                </label>
                <textarea
                  id="description"
                  value={newCoin.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className={twMerge(
                    `outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded text-[#E8E9EE] bg-transparent`
                    // errors.description && "border-red-700"
                  )}
                />
              </div>

              {/* <div>
                <label
                  htmlFor="description"
                  className="text-[12px] font-medium text-[#84869A]"
                >
                  PRESALE (0 ~ 1.5 SOL)
                </label>
                <input
                  role="presentation"
                  autoComplete="off"
                  id="presale"
                  type="number"
                  value={newCoin.presale || ""}
                  onChange={handlePresaleChange}
                  className="outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded h-12 text-[#E8E9EE] bg-transparent"
                />
              </div> */}

              <div className="w-full flex flex-col justify-between gap-3">
                <div className="w-full justify-between flex flex-col xs:flex-row items-start xs:items-center gap-2">
                  <label
                    htmlFor="fileUpload"
                    className="block text-[12px] font-medium text-[#84869A]"
                  >
                    Upload Image: <span className="text-red-700">*</span>
                  </label>
                </div>
                <DropzoneFile
                  onDrop={onDrop}
                  file={imageFile}
                  setFile={(file: File) => {
                    setSelectedFileName(file?.name);
                    setImageFile(file);
                    setImagePreview(!file ? '' : URL.createObjectURL(file));
                    setIamgeUrl(!file ? '' : URL.createObjectURL(file));
                  }}
                />
              </div>

              <div
                className="flex cursor-pointer"
                onClick={() => setShowOptional(!showOptional)}
              >
                More optional{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.2071 8.24992C18.8166 7.8594 18.1834 7.8594 17.7929 8.24992L12 14.0428L6.20711 8.24992C5.81658 7.8594 5.18342 7.8594 4.79289 8.24992C4.40237 8.64044 4.40237 9.27361 4.79289 9.66413L10.5858 15.457C11.3668 16.2381 12.6332 16.2381 13.4142 15.457L19.2071 9.66414C19.5976 9.27361 19.5976 8.64045 19.2071 8.24992Z"
                    fill="#9192A0"
                  />
                </svg>
              </div>

              {showOptional && (
                <div>
                  <div className="flex justify-between items-center w-full gap-4 flex-col md:flex-row">
                    <div className="flex-1 w-full">
                      <label
                        htmlFor="name"
                        className="text-[12px] font-medium text-[#84869A]"
                      >
                        TWITTER
                      </label>
                      <input
                        role="presentation"
                        autoComplete="off"
                        id="twitter"
                        type="text"
                        value={newCoin.twitter || ''}
                        onChange={handleChange}
                        className={twMerge(
                          `outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded h-12 text-[#E8E9EE] bg-transparent`
                          // errors.name && "border-red-700"
                        )}
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <label
                        htmlFor="ticker"
                        className="text-[12px] font-medium text-[#84869A]"
                      >
                        TELEGRAM
                      </label>{' '}
                      <input
                        role="presentation"
                        autoComplete="off"
                        id="telegram"
                        type="text"
                        value={newCoin.telegram || ''}
                        onChange={handleChange}
                        className={twMerge(
                          `outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded h-12 text-[#E8E9EE] bg-transparent`
                          // errors.ticker && "border-red-700"
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center w-full mt-4 gap-4 flex-col md:flex-row">
                    <div className="flex-1 w-full">
                      <label
                        htmlFor="name"
                        className="text-[12px] font-medium text-[#84869A]"
                      >
                        DISCORD
                      </label>
                      <input
                        role="presentation"
                        autoComplete="off"
                        id="discord"
                        type="text"
                        value={newCoin.discord || ''}
                        onChange={handleChange}
                        className={twMerge(
                          `outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded h-12 text-[#E8E9EE] bg-transparent`
                          // errors.name && "border-red-700"
                        )}
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <label
                        htmlFor="ticker"
                        className="text-[12px] font-medium text-[#84869A]"
                      >
                        WEBSITE
                      </label>{' '}
                      <input
                        role="presentation"
                        autoComplete="off"
                        id="website"
                        type="text"
                        value={newCoin.website || ''}
                        onChange={handleChange}
                        className={twMerge(
                          `outline-none focus:outline-none w-full px-3 border border-[#585A6B] mt-3 rounded h-12 text-[#E8E9EE] bg-transparent`
                          // errors.ticker && "border-red-700"
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {step === STEP_TOKEN.BEHAVIOR && (
            <div className="flex flex-col gap-6">
              <div>
                <label
                  htmlFor="description"
                  className="text-[12px] font-medium text-[#84869A] uppercase"
                >
                  Your Agent’s Personality
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AGENT_PERSONALITY.map((e, idx) => {
                    return (
                      <div
                        onClick={() => {
                          setAgentPersonality(e.value);
                        }}
                        key={`${idx}-personality`}
                        className={twMerge(
                          'text-[#E8E9EE] flex items-center rounded-lg md:p-4 p-2 md:text-[14px] text-[12px] bg-[#080A14] border border-[#30344A] cursor-pointer',
                          e.value === agentPersonality &&
                            'border-2 border-[#E4775D]'
                        )}
                      >
                        {e.label}

                        <span className="ml-2">
                          {e.value === agentPersonality && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 12L10 17L20 7"
                                stroke="#E4775D"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="text-[12px] font-medium text-[#84869A] uppercase"
                >
                  Communication Style
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AGENT_STYLE.map((e, idx) => {
                    return (
                      <div
                        onClick={() => {
                          setAgentStyle(e.value);
                        }}
                        key={`${idx}-styles-agent`}
                        className={twMerge(
                          'text-[#E8E9EE] flex items-center rounded-lg md:p-4 p-2 md:text-[14px] text-[12px] bg-[#080A14] border border-[#30344A] cursor-pointer',
                          e.value === agentStyle && 'border-2 border-[#E4775D]'
                        )}
                      >
                        {e.label}

                        <span className="ml-2">
                          {e.value === agentStyle && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 12L10 17L20 7"
                                stroke="#E4775D"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* {step === STEP_TOKEN.INFO ? (
            <button
              onClick={() => setStep(STEP_TOKEN.BEHAVIOR)}
              // disabled={!formValid || isLoading}
              className="disabled:opacity-75 disabled:cursor-not-allowed uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
            >
              <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14]">
                Next
              </div>
            </button>
          ) : ( */}
          <button
            disabled={
              !formValid ||
              isLoading ||
              !wallet.publicKey ||
              !!isSelectedAgentHasCoin
            }
            onClick={createCoin}
            // onClick={() => setShowModalPreSale(true)}
            className="disabled:opacity-75 disabled:cursor-not-allowed uppercase p-1 rounded border-[2px] border-solid border-[rgba(255,255,255,0.25)] cursor-pointer hover:border-[rgba(255,255,255)] transition-all ease-in duration-150"
          >
            <div className="uppercase rounded bg-white px-6 py-2 text-[#080A14]">
              Launch
            </div>
          </button>
          {/* )} */}
        </div>
        {/* <div className="w-full md:max-w-[490px] flex justify-end">
          <div className="hidden md:block">
            <div className="flex">
              <div className="relative translate-y-[0%]">
                <div
                  onClick={() => setStep(STEP_TOKEN.INFO)}
                  className="cursor-pointer relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#E4775D] text-[#080A14] font-semibold text-[14px]"
                >
                  1
                </div>
                <div className="border-[1px] border-[#585A6B] border-dashed h-full absolute top-0 left-1/2 -translate-x-1/2"></div>
              </div>
              <div className="ml-4 pb-5">
                <div className="text-[#E8E9EE] font-medium text-[18px]">
                  Agent info
                </div>
                <span className="mt-8 text-[14px] text-[#9192A0] w-screen max-w-[300px]">
                  Information to help the community identify you.
                </span>
              </div>
            </div>
            <div className="flex">
              <div className="relative translate-y-[0%] flex flex-col justify-end">
                <div className="border-[1px] border-[#585A6B] border-dashed h-full absolute bottom-0 left-1/2 -translate-x-1/2"></div>
                <div
                  onClick={() => setStep(STEP_TOKEN.BEHAVIOR)}
                  className={twMerge(
                    "relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1C28] text-[#E8E9EE] font-semibold text-[14px]",
                    step === STEP_TOKEN.BEHAVIOR &&
                      " bg-[#E4775D] text-[#080A14]"
                  )}
                >
                  2
                </div>
              </div>
              <div className="ml-4">
                <div className="text-[#E8E9EE] font-medium text-[18px]">
                  Agent Behaviors
                </div>
                <span className="mt-8 text-[14px] text-[#9192A0] w-screen max-w-[300px]">
                  Set unique behaviors your agent
                </span>
              </div>
            </div>
            <div className="mt-[72px] hidden md:block">
              <img src={MountainImg} alt="MountainImg" />
            </div>
          </div>
          <div className="block md:hidden w-full mb-6">
            <div className="flex w-full items-center justify-between">
              <div
                onClick={() => setStep(STEP_TOKEN.INFO)}
                className="cursor-pointer relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#E4775D] text-[#080A14] font-semibold text-[14px]"
              >
                1
              </div>
              <div className="border-b border-dashed border-[#585A6B] flex-1"></div>
              <div
                onClick={() => setStep(STEP_TOKEN.BEHAVIOR)}
                className={twMerge(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1C28] text-[#E8E9EE] font-semibold text-[14px]",
                  step === STEP_TOKEN.BEHAVIOR && " bg-[#E4775D] text-[#080A14]"
                )}
              >
                2
              </div>
            </div>
            <div>
              {step === STEP_TOKEN.INFO ? (
                <div className="mt-2">
                  <div className="text-[#E8E9EE] font-medium text-[18px]">
                    Agent info
                  </div>
                  <span className="mt-8 text-[14px] text-[#9192A0] w-screen max-w-[300px]">
                    Information to help the community identify you.
                  </span>
                </div>
              ) : (
                <div className="text-right mt-2">
                  <div className="text-[#E8E9EE] font-medium text-[18px]">
                    Agent Behaviors
                  </div>
                  <span className="mt-8 text-[14px] text-[#9192A0] w-screen max-w-[300px]">
                    Set unique behaviors your agent
                  </span>
                </div>
              )}
            </div>
          </div>
        </div> */}
        <div className="flex justify-end w-full md:max-w-[490px] border border-[#1A1C28] rounded p-3 md:p-6 mt-4 md:mt-0 md:ml-8 lg:ml-16 xl:ml-28">
          <div className="w-full">
            <div className="text-[18px] text-[#E8E9EE] font-medium mb-4 md:mb-6">
              Tokenomics
            </div>
            <div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export const TOKENOMICS_LIST = [
  {
    text: '1% for creator',
    color: `#f9b48f`,
  },
  {
    text: '1% for Distilled AI Treasury',
    color: `#f9dd8f`,
  },
  {
    text: '1% for AI Agent wallet',
    color: `#C2F98F`,
  },
  {
    text: '2% for Strongbox Vaults',
    color: `#9EEEDB`,
  },
  {
    text: '95% for fairlaunch (bonding curve)',
    color: `#7e9af9`,
  },
];

export const AGENT_PERSONALITY = [
  {
    label: '😊 Friendly',
    value: 'Friendly',
  },
  {
    label: '💼 Professional',
    value: 'Professional',
  },
  {
    label: '🤡 Humorous',
    value: 'Humorous',
  },
  {
    label: '🛟 Supportive',
    value: 'Supportive',
  },
  {
    label: '🥰 Empathetic',
    value: 'Empathetic',
  },
  {
    label: '🤓 Informative',
    value: 'Informative',
  },
  {
    label: '🤠 Adventurous',
    value: 'Adventurous',
  },
  {
    label: '⭐️ Custom',
    value: 'Custom',
  },
];

export const AGENT_STYLE = [
  {
    label: '👔 Formal',
    value: 'Formal',
  },
  {
    label: '🧢 Casual',
    value: 'Casual',
  },
  {
    label: '🔥 Enthusiastic',
    value: 'Enthusiastic',
  },
  {
    label: '🍃 Calm',
    value: 'Calm',
  },
  {
    label: '👀 Direct',
    value: 'Direct',
  },
  {
    label: '📝 Storytelling',
    value: 'Informative',
  },
  {
    label: '⭐️ Custom',
    value: 'Custom',
  },
];

const MOCK_AGENTS = [
  {
    img: AgentImg,
    name: 'Jordan’s Investor Coach',
    address: '0x9DF2912059AC0d8Ddbf345B96EF4C4f59902E38b',
  },
  {
    img: AgentImg,
    name: 'Max',
    address: '2RExGFDFexUfHmog3cAb8VqWM6rcbNeGcFSnYim3Wgpt',
  },
  {
    img: AgentImg,
    name: 'Max2',
    address: '0x9DF2912059AC0d8Ddbf345B96EF4C4f59902E38b',
  },
  {
    img: AgentImg,
    name: 'Max2',
    address: '0x9DF2912059AC0d8Ddbf345B96EF4C4f59902E38b',
  },
  {
    img: AgentImg,
    name: 'Max2',
    address: '0x9DF2912059AC0d8Ddbf345B96EF4C4f59902E38b',
  },
  {
    img: AgentImg,
    name: 'Max2',
    address: '0x9DF2912059AC0d8Ddbf345B96EF4C4f59902E38b',
  },
];
