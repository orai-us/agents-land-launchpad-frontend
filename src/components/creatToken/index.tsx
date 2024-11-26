"use client";
import {
  ChangeEvent,
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
      marketcap: !newCoin.marketcap || newCoin.marketcap < 5000 || newCoin.marketcap > 10000,
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

  const validateForm = () => {
    const validationErrors = {
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      marketcap: !newCoin.marketcap || newCoin.marketcap < 5000 || newCoin.marketcap > 10000,
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
    <div className="w-full max-w-[500px] m-auto px-3">
      <div onClick={() => handleToRouter("/")}>
        <div className="cursor-pointer text-white text-2xl flex flex-row items-center gap-2 pb-2">
          <IoMdArrowRoundBack />
          Back
        </div>
      </div>
      {isLoading && Spinner()}
      <div className="w-full flex flex-col gap-4 py-5">
        <h2 className="text-center text-2xl xs:text-4xl font-bold text-white">
          Solana Token Creator
        </h2>
        <div className="w-full text-center text-sm text-white max-w-lg">
          Lorem ipsum dolor sit amet consectetur. Rhoncus nunc blandit mattis mattis arcu posuere cursus.
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <div>
            <label htmlFor="name" className="text-lg font-semibold text-white">
              Token Name (Max 30) <span className="text-red-700">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={newCoin.name || ""}
              onChange={handleChange}
              className={`block w-full p-2.5 ${errors.name ? "border-red-700" : "border-gray-300"} rounded-lg bg-gray-800 text-white`}
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
              className={`block w-full p-2.5 ${errors.ticker ? "border-red-700" : "border-gray-300"} rounded-lg bg-gray-800 text-white`}
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
              className={`block w-full p-2.5 ${errors.marketcap ? "border-red-700" : "border-gray-300"
                } rounded-lg bg-gray-800 text-white`}
            />
          </div>

          <div>
            <label htmlFor="presale" className="text-lg font-semibold text-white">
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
          className={`mt-4 p-2 rounded-lg bg-blue-700 text-white ${!formValid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
        >
          {isLoading ? "Creating..." : "Create Coin"}
        </button>
      </div>
    </div>

  );
}
