"use client";
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/loadings/Spinner";
import { errorAlert, infoAlert } from "@/components/others/ToastGroup";
import UserContext from "@/context/UserContext";
import { useSocket } from "@/contexts/SocketContext";
import { creatFeePay } from "@/program/web3";
import { coinInfo } from "@/utils/types";
import { createNewCoin, uploadTokenImage } from "@/utils/util";
import { useWallet } from "@solana/wallet-adapter-react";
import { IoMdArrowRoundBack } from "react-icons/io";
import ImgIcon from "@/../public/assets/images/imce-logo.jpg";
import MountainImg from "@/assets/images/mount_guide.png";
import DropzoneFile from "../uploadFile/DropzoneFile";

export default function CreateToken() {
  const { user, isCreated, setIsCreated } = useContext(UserContext);
  const { isLoading, setIsLoading } = useSocket();
  const [newCoin, setNewCoin] = useState<coinInfo>({} as coinInfo);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [getAmt, setGetAmt] = useState<number>(0);
  const [errors, setErrors] = useState({
    name: false,
    ticker: false,
    marketcap: false,
    image: false,
  });

  const wallet = useWallet();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Clear errors when newCoin changes
    setErrors({
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      marketcap:
        !newCoin.marketcap ||
        newCoin.marketcap < 5000 ||
        newCoin.marketcap > 10000,
      image: !imageFile,
    });
  }, [newCoin, imageFile]);

  const handleToRouter = (path: string) => {
    router.push(path);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCoin({ ...newCoin, [e.target.id]: e.target.value });
  };

  const handlePresaleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = Number(e.target.value);
    if (isNaN(value) || value > 1.5) {
      errorAlert("Presale amount must be between 0 and 1.5 SOL");
      return;
    }
    const getAmount =
      1_000_000_000 - (30 * 1_000_000_000) / (30 + (value * 99) / 100);
    setGetAmt(getAmount);
    setNewCoin({ ...newCoin, [e.target.id]: value });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Accepted files:", acceptedFiles);
    const file = acceptedFiles?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const validateForm = () => {
    const validationErrors = {
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      marketcap:
        !newCoin.marketcap ||
        newCoin.marketcap < 5000 ||
        newCoin.marketcap > 10000,
      image: !imageFile,
    };
    setErrors(validationErrors);
    return !Object.values(validationErrors).includes(true);
  };

  const createCoin = async () => {
    if (!validateForm()) {
      errorAlert("Please fix the errors before submitting.");
      return;
    }

    try {
      setIsLoading(true);

      // Process image upload
      const uploadedImageUrl = await uploadTokenImage(imageFile!);
      if (!uploadedImageUrl) {
        errorAlert("Image upload failed.");
        setIsLoading(false);
        return;
      }

      const res = await creatFeePay(wallet, newCoin.presale || 0);
      if (res === "WalletError" || !res) {
        errorAlert("Payment failed or was rejected.");
        setIsLoading(false);
        return;
      }

      const coin: coinInfo = {
        ...newCoin,
        creator: user._id.toString(),
        url: uploadedImageUrl,
      };

      const created = await createNewCoin(coin);
      if (created) {
        infoAlert("Token created successfully!");
        setIsCreated(true);
        setNewCoin({} as coinInfo);
        setImageFile(null);
        setImagePreview(null);
        setSelectedFileName("");
      } else {
        errorAlert("Failed to create token.");
      }
    } catch (error) {
      errorAlert("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formValid =
    newCoin.name &&
    newCoin.ticker &&
    newCoin.marketcap &&
    newCoin.marketcap >= 5000 &&
    newCoin.marketcap <= 10000 &&
    imageFile;

  return (
    <div className="w-full m-auto px-3 my-24">
      <div onClick={() => handleToRouter("/")}>
        <div className="uppercase cursor-pointer text-white text-2xl flex flex-row items-center gap-2 pb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
          >
            <path
              d="M10.5171 11.9999L18.3546 3.83901C18.5515 3.63745 18.5468 3.30464 18.3452 3.09839L16.9437 1.66401C16.7421 1.45776 16.414 1.45307 16.2171 1.65464L6.64521 11.6203C6.54209 11.7234 6.49521 11.864 6.50459 11.9999C6.4999 12.1406 6.54678 12.2765 6.64521 12.3796L16.2171 22.3499C16.414 22.5515 16.7421 22.5468 16.9437 22.3406L18.3452 20.9062C18.5468 20.6999 18.5515 20.3671 18.3546 20.1656L10.5171 11.9999Z"
              fill="#585A6B"
            />
          </svg>
          tokenize agent
        </div>
      </div>
      {isLoading && Spinner()}
      <div className="w-full text-[14px] text-[#9192A0] mb-[72px] mt-4">
        Input the details as you go about your project and after 2 steps, your
        Agent is set to go live.
      </div>
      <div className="flex justify-between items-start">
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="name"
                className="text-lg font-semibold text-white"
              >
                Token Name (Max 30) <span className="text-red-700">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={newCoin.name || ""}
                onChange={handleChange}
                className={`block w-full p-2.5 ${
                  errors.name ? "border-red-700" : "border-gray-300"
                } rounded-lg bg-gray-800 text-white`}
              />
            </div>

            <div>
              <label
                htmlFor="ticker"
                className="text-lg font-semibold text-white"
              >
                Ticker (Max 5) <span className="text-red-700">*</span>
              </label>
              <input
                id="ticker"
                type="text"
                value={newCoin.ticker || ""}
                onChange={handleChange}
                className={`block w-full p-2.5 ${
                  errors.ticker ? "border-red-700" : "border-gray-300"
                } rounded-lg bg-gray-800 text-white`}
              />
            </div>

            <div>
              <label
                htmlFor="marketcap"
                className="text-lg font-semibold text-white"
              >
                Marketcap (5K ~ 10K) <span className="text-red-700">*</span>
              </label>
              <input
                id="marketcap"
                type="number"
                value={newCoin.marketcap || ""}
                onChange={handleChange}
                className={`block w-full p-2.5 ${
                  errors.marketcap ? "border-red-700" : "border-gray-300"
                } rounded-lg bg-gray-800 text-white`}
              />
            </div>

            <div>
              <label
                htmlFor="presale"
                className="text-lg font-semibold text-white"
              >
                Presale (0 ~ 1.5 SOL) <span className="text-red-700">*</span>
              </label>
              <input
                id="presale"
                type="number"
                value={newCoin.presale || ""}
                onChange={handlePresaleChange}
                className="block w-full p-2.5 rounded-lg bg-gray-800 text-white"
              />
            </div>

            <div className="w-full flex flex-col justify-between gap-6">
              <div className="w-full justify-between flex flex-col xs:flex-row items-start xs:items-center gap-2">
                <label
                  htmlFor="fileUpload"
                  className="block text-lg font-semibold text-white"
                >
                  Upload Image: <span className="text-red-700">*</span>
                </label>
              </div>
              <DropzoneFile onDrop={onDrop} />
            </div>

            <div className="w-full flex flex-col justify-between gap-6">
              <div className="w-full justify-between flex flex-col xs:flex-row items-start xs:items-center gap-2">
                <label
                  htmlFor="fileUpload"
                  className="block text-lg font-semibold text-white"
                >
                  Upload Image: <span className="text-red-700">*</span>
                </label>
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  className="py-2 px-4 bg-gray-700 text-white rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFileName || "Choose Image"}
                </button>
              </div>

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full border rounded-lg overflow-hidden mx-auto"
                />
              ) : (
                <div className="w-full border rounded-lg overflow-hidden">
                  <Image
                    src={ImgIcon}
                    alt="Default Avatar"
                    className="flex object-cover w-full h-full mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={createCoin}
            disabled={!formValid || isLoading}
            className={`mt-4 p-2 rounded-lg bg-blue-700 text-white ${
              !formValid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Creating..." : "Create Coin"}
          </button>
        </div>
        <div className="w-full max-w-[490px] flex justify-end">
          <div className="">
            <div className="flex">
              <div className="relative translate-y-[0%]">
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#E4775D] text-[#080A14] font-semibold text-[14px]">
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
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1C28] text-[#E8E9EE] font-semibold text-[14px]">
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
            <div className="mt-[72px]">
              <Image src={MountainImg} alt="MountainImg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
